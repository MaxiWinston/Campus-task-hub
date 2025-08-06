// src/services/base.service.ts
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database.types';
import { cacheService } from './cache.service';
import { handleError } from '@/lib/error-handler';

export abstract class BaseService<T extends keyof Database['public']['Tables']> {
  protected tableName: T;
  protected cacheTtl: number = 5 * 60 * 1000; // 5 minutes default

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  // ... (existing methods)

  // Add the new methods from previous response
  // (findById, findOne, findMany, create, update, delete, etc.)
}

// Add transaction support as a static method
export const withTransaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  // ... transaction implementation
};