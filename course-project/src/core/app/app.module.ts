import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { PostModule } from "../post/post.module";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60,
      store: redisStore,
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostModule,
  ],
})
export class AppModule {}
