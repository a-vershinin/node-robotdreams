import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: unknown, ttl: number = 10 * 1000) {
    await this.cacheManager.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T> {
    return await this.cacheManager.get<T>(key);
  }

  async del(key: string) {
    await this.cacheManager.del(key);
  }
}
