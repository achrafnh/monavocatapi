import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
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

const router = Router();

router.get('/lawyers', auth, paginationValidation, validate, getLawyers);
router.get('/lawyers/search', auth, searchValidation, validate, searchLawyers);
router.get('/lawyers/:id', auth, getLawyerById);
router.get('/lawyers/specializations', auth, getSpecializations);
router.get('/lawyers/nearby', auth, nearbyValidation, validate, getNearbyLawyers);
router.get('/lawyers/top-rated', auth, paginationValidation, validate, getTopRatedLawyers);

export default router;
