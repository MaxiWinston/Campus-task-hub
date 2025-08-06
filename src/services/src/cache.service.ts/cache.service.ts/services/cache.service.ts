// src/services/cache.service.ts
class CacheService {
    private cache: Map<string, { data: any; expiresAt: number }> = new Map();
    private static instance: CacheService;
  
    private constructor() {}
  
    static getInstance(): CacheService {
      if (!CacheService.instance) {
        CacheService.instance = new CacheService();
      }
      return CacheService.instance;
    }
  
    get<T>(key: string): T | null {
      const cached = this.cache.get(key);
      if (!cached) return null;
      
      if (Date.now() > cached.expiresAt) {
        this.cache.delete(key);
        return null;
      }
      
      return cached.data;
    }
  
    set(key: string, data: any, ttl: number): void {
      this.cache.set(key, {
        data,
        expiresAt: Date.now() + ttl
      });
    }
  
    delete(key: string): void {
      this.cache.delete(key);
    }
  
    clear(): void {
      this.cache.clear();
    }
  }
  
  export const cacheService = CacheService.getInstance();