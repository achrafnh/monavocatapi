export interface LawyerDocument {
  id: string;
  fullName: string;
  specialization: string;
  yearsOfExperience: number;
  hourlyRate: number;
  rating: number;
  location: {
    lat: number;
    lon: number;
  };
  address: string;
  languages: string[];
  availability: boolean;
  description: string;
  education: string[];
  certifications: string[];
}

export interface SearchResponse<T> {
  hits: {
    total: {
      value: number;
      relation: 'eq' | 'gte';
    };
    hits: Array<{
      _id: string;
      _source: T;
      sort?: unknown[];
    }>;
  };
  aggregations?: {
    [key: string]: any;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface GeoLocation {
  lat: number;
  lon: number;
}
