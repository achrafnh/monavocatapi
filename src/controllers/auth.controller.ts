import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../config/logger.js';
import { RegisterData, LoginCredentials } from '../types/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phoneNumber }: RegisterData = req.body;
    const hashedPassword = await hashPassword(password);

    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name, phone_number) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, phoneNumber]
    );

    const token = generateToken({ 
      id: (result as any).insertId,
      email,
      role: 'user'
    });

    res.status(201).json({ token });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginCredentials = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = (rows as any[])[0];

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user'
    });

    res.json({ token });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};