import { esClient } from '../config/elasticsearch.js';
import { pool } from '../config/database.js';
import { SearchParams, Lawyer, PaginationParams } from '../types/lawyer.js';
import { logger } from '../utils/logger.js';

export class LawyerService {
  async getLawyers({ page, limit, sortBy, sortOrder }: PaginationParams) {
    const offset = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      pool.execute(
        `SELECT * FROM lawyers ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
        [limit, offset]
      ),
      pool.execute('SELECT COUNT(*) as total FROM lawyers')
    ]);

    return {
      lawyers: rows[0],
      pagination: {
        page,
        limit,
        total: (total[0] as any)[0].total
      }
    };
  }

  async searchLawyers(params: SearchParams) {
    const must: any[] = [];

    if (params.name) {
      must.push({
        multi_match: {
          query: params.name,
          fields: ['fullName^2', 'description']
        }
      });
    }

    if (params.specialization) {
      must.push({
        match: { specialization: params.specialization }
      });
    }

    if (params.minRating) {
      must.push({
        range: { rating: { gte: params.minRating } }
      });
    }

    const { body } = await esClient.search({
      index: 'lawyers',
      body: {
        query: { bool: { must } },
        from: (params.page - 1) * params.limit,
        size: params.limit
      }
    });

    return {
      lawyers: body.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source
      })),
      total: body.hits.total.value
    };
  }

  async getLawyerById(id: string): Promise<Lawyer | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM lawyers WHERE id = ?',
      [id]
    );
    return (rows as any[])[0] || null;
  }

  async getSpecializations() {
    const [rows] = await pool.execute('SELECT DISTINCT specialization FROM lawyers');
    return rows;
  }

  async getNearbyLawyers({ latitude, longitude, radius, specialization }: {
    latitude: number;
    longitude: number;
    radius: number;
    specialization?: string;
  }) {
    const must: any[] = [
      {
        geo_distance: {
          distance: `${radius}km`,
          location: {
            lat: latitude,
            lon: longitude
          }
        }
      }
    ];

    if (specialization) {
      must.push({
        match: { specialization }
      });
    }

    const { body } = await esClient.search({
      index: 'lawyers',
      body: {
        query: {
          bool: { must }
        },
        sort: [
          {
            _geo_distance: {
              location: {
                lat: latitude,
                lon: longitude
              },
              order: 'asc',
              unit: 'km'
            }
          }
        ]
      }
    });

    return body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      distance: hit.sort[0]
    }));
  }

  async getTopRatedLawyers(limit: number, specialization?: string) {
    const query = specialization
      ? 'SELECT * FROM lawyers WHERE specialization = ? ORDER BY rating DESC LIMIT ?'
      : 'SELECT * FROM lawyers ORDER BY rating DESC LIMIT ?';
    
    const params = specialization ? [specialization, limit] : [limit];
    const [rows] = await pool.execute(query, params);
    return rows;
  }
}
