import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import logger from '../config/logger.js';

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

export const lawyerSignup = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      licenseNumber,
      specialization,
      yearsOfExperience,
      phoneNumber
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, Number(BCRYPT_ROUNDS));
    const lawyerId = uuidv4();

    await pool.execute(
      `INSERT INTO lawyers (
        id, email, password, full_name, license_number,
        specialization, years_of_experience, phone_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lawyerId, email, hashedPassword, fullName, licenseNumber,
       specialization, yearsOfExperience, phoneNumber]
    );

    const { accessToken, refreshToken } = generateTokens(lawyerId, email);

    await pool.execute(
      'UPDATE lawyers SET refresh_token = ? WHERE id = ?',
      [refreshToken, lawyerId]
    );

    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('Lawyer signup error:', error);
    res.status(400).json({ error: 'Email or license number already exists' });
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
    const { refreshToken, userType } = req.body;
    const table = userType === 'lawyer' ? 'lawyers' : 'users';

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    
    const [rows] = await pool.execute(
      `SELECT * FROM ${table} WHERE id = ? AND refresh_token = ?`,
      [decoded.id, refreshToken]
    );
    const user = (rows as any[])[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      generateTokens(user.id, user.email);

    await pool.execute(
      `UPDATE ${table} SET refresh_token = ? WHERE id = ?`,
      [newRefreshToken, user.id]
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
};