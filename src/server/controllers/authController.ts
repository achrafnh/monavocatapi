import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import { logger } from '../config/logger.js';
import { esClient } from '../elasticsearch/client.js';

const {
  JWT_SECRET = 'your-secret-key',
  JWT_EXPIRY = '15m',
  REFRESH_TOKEN_EXPIRY = '7d',
  BCRYPT_ROUNDS = '10'
} = process.env;

const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
  
  const refreshToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });

  return { accessToken, refreshToken };
};

const indexLawyer = async (lawyer: any) => {
  try {
    await esClient.index({
      index: 'lawyers',
      id: lawyer.id,
      document: {
        id: lawyer.id,
        fullName: lawyer.full_name,
        specialization: lawyer.specialization,
        yearsOfExperience: lawyer.years_of_experience,
        officeAddress: lawyer.office_address,
        languagesSpoken: lawyer.languages_spoken,
        hourlyRate: lawyer.hourly_rate,
        rating: 0 // Initial rating for new lawyers
      }
    });
    logger.info(`Lawyer ${lawyer.id} indexed in Elasticsearch`);
  } catch (error) {
    logger.error('Failed to index lawyer in Elasticsearch:', error);
    throw error;
  }
};

export const userSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, Number(BCRYPT_ROUNDS));
    const userId = uuidv4();

    await pool.execute(
      'INSERT INTO users (id, email, password, full_name, phone_number) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, fullName, phoneNumber]
    );

    const { accessToken, refreshToken } = generateTokens(userId, email);

    await pool.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    );

    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('User signup error:', error);
    res.status(400).json({ error: 'Email already exists' });
  }
};

export const lawyerSignup = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      email,
      password,
      fullName,
      licenseNumber,
      specialization,
      yearsOfExperience,
      phoneNumber,
      officeAddress,
      languagesSpoken,
      hourlyRate,
      bio
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, Number(BCRYPT_ROUNDS));
    const lawyerId = uuidv4();

    // Insert into MySQL
    await connection.execute(
      `INSERT INTO lawyers (
        id, email, password, full_name, license_number,
        specialization, years_of_experience, phone_number,
        office_address, languages_spoken, hourly_rate, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lawyerId, email, hashedPassword, fullName, licenseNumber,
       specialization, yearsOfExperience, phoneNumber,
       officeAddress, languagesSpoken, hourlyRate, bio]
    );

    const { accessToken, refreshToken } = generateTokens(lawyerId, email);

    await connection.execute(
      'UPDATE lawyers SET refresh_token = ? WHERE id = ?',
      [refreshToken, lawyerId]
    );

    // Index in Elasticsearch
    await indexLawyer({
      id: lawyerId,
      full_name: fullName,
      specialization,
      years_of_experience: yearsOfExperience,
      office_address: officeAddress,
      languages_spoken: languagesSpoken,
      hourly_rate: hourlyRate
    });

    await connection.commit();
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    await connection.rollback();
    logger.error('Lawyer signup error:', error);
    res.status(400).json({ error: 'Registration failed. Email or license number may already exist.' });
  } finally {
    connection.release();
  }
};

export const userSignin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    );
    const user = (rows as any[])[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, email);

    await pool.execute(
      'UPDATE users SET refresh_token = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [refreshToken, user.id]
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('User signin error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const lawyerSignin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM lawyers WHERE email = ? AND status = "active"',
      [email]
    );
    const lawyer = (rows as any[])[0];

    if (!lawyer || !(await bcrypt.compare(password, lawyer.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(lawyer.id, email);

    await pool.execute(
      'UPDATE lawyers SET refresh_token = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [refreshToken, lawyer.id]
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('Lawyer signin error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const userSignout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    await pool.execute(
      'UPDATE users SET refresh_token = NULL WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Successfully signed out' });
  } catch (error) {
    logger.error('User signout error:', error);
    res.status(500).json({ error: 'Signout failed' });
  }
};

export const lawyerSignout = async (req: Request, res: Response) => {
  try {
    const { lawyerId } = req.body;

    await pool.execute(
      'UPDATE lawyers SET refresh_token = NULL WHERE id = ?',
      [lawyerId]
    );

    res.json({ message: 'Successfully signed out' });
  } catch (error) {
    logger.error('Lawyer signout error:', error);
    res.status(500).json({ error: 'Signout failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: oldRefreshToken, userType } = req.body;
    const table = userType === 'lawyer' ? 'lawyers' : 'users';

    const decoded = jwt.verify(oldRefreshToken, JWT_SECRET) as { id: string };
    
    const [rows] = await pool.execute(
      `SELECT * FROM ${table} WHERE id = ? AND refresh_token = ?`,
      [decoded.id, oldRefreshToken]
    );
    const user = (rows as any[])[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    await pool.execute(
      `UPDATE ${table} SET refresh_token = ? WHERE id = ?`,
      [refreshToken, user.id]
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
};
