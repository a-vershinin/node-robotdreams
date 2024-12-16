import { Module, Global } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ".env",
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().default("secret"),
        DB_HOST: Joi.string().default("localhost"),
        DB_PORT: Joi.number().port().default(5412),
        DB_USER: Joi.string().default("postgres"),
        DB_PASSWORD: Joi.string().default("postgres"),
        DB_NAME: Joi.string().default("db-name"),
        REDIS_HOST: Joi.string().default("localhost"),
        REDIS_PORT: Joi.number().port().default(6379),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
