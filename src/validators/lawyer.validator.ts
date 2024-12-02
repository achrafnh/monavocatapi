import { query } from 'express-validator';

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'rating', 'experience']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

export const searchValidation = [
  query('name').optional().isString(),
  query('specialization').optional().isString(),
  query('location').optional().isString(),
  query('minRating').optional().isFloat({ min: 1, max: 5 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('yearsOfExperience').optional().isInt({ min: 0 }),
  query('languages').optional().isString(),
  query('availability').optional().isBoolean(),
  ...paginationValidation
];

export const nearbyValidation = [
  query('latitude').isFloat({ min: -90, max: 90 }),
  query('longitude').isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 1, max: 100 }),
  query('specialization').optional().isString()
];
