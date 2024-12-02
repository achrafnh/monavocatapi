import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { searchLawyers } from '../controllers/searchController.js';

export const router = Router();

router.get(
  '/lawyers',
  [
    query('q').optional().isString(),
    query('specialization').optional().isString(),
    query('minExperience').optional().isInt({ min: 0 }),
    query('maxRate').optional().isFloat({ min: 0 }),
    query('languages').optional().isString(),
    query('location').optional().isString(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  searchLawyers
);
