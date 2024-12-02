import { Request, Response } from 'express';
import { esClient } from '../elasticsearch/client.js';
import { logger } from '../config/logger.js';

interface SearchQuery {
  q?: string;
  specialization?: string;
  minExperience?: number;
  maxRate?: number;
  languages?: string;
  location?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export const searchLawyers = async (req: Request, res: Response) => {
  try {
    const {
      q,
      specialization,
      minExperience,
      maxRate,
      languages,
      location,
      minRating = 0,
      page = 1,
      limit = 10
    }: SearchQuery = req.query;

    const must: any[] = [{ range: { rating: { gte: minRating } } }];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['fullName^2', 'specialization', 'officeAddress']
        }
      });
    }

    if (specialization) {
      must.push({
        match: { 'specialization.keyword': specialization }
      });
    }

    if (minExperience) {
      must.push({
        range: { yearsOfExperience: { gte: minExperience } }
      });
    }

    if (maxRate) {
      must.push({
        range: { hourlyRate: { lte: maxRate } }
      });
    }

    if (languages) {
      must.push({
        match: { languagesSpoken: languages }
      });
    }

    if (location) {
      must.push({
        match: { officeAddress: location }
      });
    }

    const { hits } = await esClient.search({
      index: 'lawyers',
      body: {
        query: { bool: { must } },
        sort: [
          { rating: { order: 'desc' } },
          { yearsOfExperience: { order: 'desc' } }
        ],
        from: (page - 1) * limit,
        size: limit
      }
    });

    res.json({
      total: hits.total,
      lawyers: hits.hits.map((hit: any) => ({
        id: hit._source.id,
        fullName: hit._source.fullName,
        specialization: hit._source.specialization,
        yearsOfExperience: hit._source.yearsOfExperience,
        officeAddress: hit._source.officeAddress,
        languagesSpoken: hit._source.languagesSpoken,
        hourlyRate: hit._source.hourlyRate,
        rating: hit._source.rating
      }))
    });
  } catch (error) {
    logger.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
