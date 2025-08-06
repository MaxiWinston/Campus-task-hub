// src/types/services.types.ts
import { Database } from './database.types';

export type ServiceResponse<T = any> = {
  data: T | null;
  error: Error | null;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};