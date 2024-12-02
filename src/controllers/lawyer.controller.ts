import { Request, Response } from 'express';
import { LawyerService } from '../services/lawyer.service.js';
import { SearchParams } from '../types/lawyer.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const lawyerService = new LawyerService();

export const getLawyers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'name';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'asc';

    const result = await lawyerService.getLawyers({ page, limit, sortBy, sortOrder });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching lawyers:', error);
    throw new AppError(500, 'Failed to fetch lawyers');
  }
};

export const searchLawyers = async (req: Request, res: Response) => {
  try {
    const searchParams: SearchParams = {
      name: req.query.name as string,
      specialization: req.query.specialization as string,
      location: req.query.location as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      yearsOfExperience: req.query.yearsOfExperience ? parseInt(req.query.yearsOfExperience as string) : undefined,
      languages: req.query.languages ? (req.query.languages as string).split(',') : undefined,
      availability: req.query.availability === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    };

    const results = await lawyerService.searchLawyers(searchParams);
    res.json(results);
  } catch (error) {
    logger.error('Error searching lawyers:', error);
    throw new AppError(500, 'Failed to search lawyers');
  }
};

export const getLawyerById = async (req: Request, res: Response) => {
  try {
    const lawyer = await lawyerService.getLawyerById(req.params.id);
    if (!lawyer) {
      throw new AppError(404, 'Lawyer not found');
    }
    res.json(lawyer);
  } catch (error) {
    logger.error('Error fetching lawyer:', error);
    throw new AppError(500, 'Failed to fetch lawyer details');
  }
};

export const getSpecializations = async (_req: Request, res: Response) => {
  try {
    const specializations = await lawyerService.getSpecializations();
    res.json(specializations);
  } catch (error) {
    logger.error('Error fetching specializations:', error);
    throw new AppError(500, 'Failed to fetch specializations');
  }
};

export const getNearbyLawyers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10, specialization } = req.query;
    const lawyers = await lawyerService.getNearbyLawyers({
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
      radius: parseInt(radius as string),
      specialization: specialization as string
    });
    res.json(lawyers);
  } catch (error) {
    logger.error('Error fetching nearby lawyers:', error);
    throw new AppError(500, 'Failed to fetch nearby lawyers');
  }
};

export const getTopRatedLawyers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const specialization = req.query.specialization as string;
    const lawyers = await lawyerService.getTopRatedLawyers(limit, specialization);
    res.json(lawyers);
  } catch (error) {
    logger.error('Error fetching top rated lawyers:', error);
    throw new AppError(500, 'Failed to fetch top rated lawyers');
  }
};
