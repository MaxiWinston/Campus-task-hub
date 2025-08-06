// src/services/extensions/query-builder.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export class QueryBuilder<T extends keyof Database['public']['Tables']> {
  constructor(
    private supabase: SupabaseClient<Database>,
    private tableName: T
  ) {}

  select<K extends keyof Database['public']['Tables'][T]['Row']>(...columns: K[]) {
    return this.supabase
      .from(this.tableName)
      .select(columns.join(',')) as any; // Type assertion for simplicity
  }

  // Add more query builder methods as needed
}