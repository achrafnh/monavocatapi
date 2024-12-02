export interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number;
  rating: number;
  hourlyRate: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  languages: string[];
  availability: boolean;
  description: string;
  education: string[];
  certifications: string[];
}

export interface SearchParams {
  query?: string;
  specialization?: string;
  location?: string;
  minRating?: number;
  maxPrice?: number;
  yearsOfExperience?: number;
  languages?: string[];
  availability?: boolean;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
