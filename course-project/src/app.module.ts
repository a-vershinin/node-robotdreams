import { Module } from "@nestjs/common";
// import { ConfigModule } from "./core/config/config.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./core/database/database.module";
import { CacheModule } from "./core/cache/cache.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PostModule } from "./modules//post/post.module";

@Module({
  imports: [
    // ConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    CacheModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostModule,
  ],
})
export class AppModule {}
