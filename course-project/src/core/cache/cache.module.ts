import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule, CacheOptions } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<CacheOptions> => {
        const host = configService.get("REDIS_HOST");
        const port = configService.get("REDIS_PORT");

        return {
          store: redisStore,
          host: host,
          port: port,
          max: 1000,
          ttl: 3600,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
