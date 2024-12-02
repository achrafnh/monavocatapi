import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  getLawyers,
  searchLawyers,
  getLawyerById,
  getSpecializations,
  getNearbyLawyers,
  getTopRatedLawyers
} from '../controllers/lawyer.controller.js';
import {
  searchValidation,
  nearbyValidation,
  paginationValidation
} from '../validators/lawyer.validator.js';

export const router = Router();

router.get('/lawyers', authenticate, paginationValidation, validate, getLawyers);
router.get('/lawyers/search', authenticate, searchValidation, validate, searchLawyers);
router.get('/lawyers/:id', authenticate, getLawyerById);
router.get('/lawyers/specializations', authenticate, getSpecializations);
router.get('/lawyers/nearby', authenticate, nearbyValidation, validate, getNearbyLawyers);
router.get('/lawyers/top-rated', authenticate, paginationValidation, validate, getTopRatedLawyers);
