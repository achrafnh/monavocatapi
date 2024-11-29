import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  userSignup,
  userSignin,
  userSignout,
  lawyerSignup,
  lawyerSignin,
  lawyerSignout,
  refreshToken
} from '../controllers/authController.js';

const router = Router();

// User routes
router.post(
  '/users/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    body('fullName').trim().notEmpty(),
    body('phoneNumber').optional().isMobilePhone('any'),
    validate
  ],
  userSignup
);

router.post(
  '/users/signin',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  userSignin
);

router.post('/users/signout', userSignout);

// Lawyer routes
router.post(
  '/lawyers/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    body('fullName').trim().notEmpty(),
    body('licenseNumber').trim().notEmpty(),
    body('specialization').trim().notEmpty(),
    body('yearsOfExperience').isInt({ min: 0 }),
    body('phoneNumber').optional().isMobilePhone('any'),
    validate
  ],
  lawyerSignup
);

router.post(
  '/lawyers/signin',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  lawyerSignin
);

router.post('/lawyers/signout', lawyerSignout);

// Refresh token route
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty(),
    body('userType').isIn(['user', 'lawyer']),
    validate
  ],
  refreshToken
);

export default router;