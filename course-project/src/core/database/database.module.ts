import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

@Global()
@Module({
  providers: [
    {
      provide: "DATABASE_POOL",
      inject: [ConfigService],
      useFactory: (_configService: ConfigService) => {
        const dbHost = _configService.get<string>("DB_HOST");
        const dbPort = _configService.get<string>("DB_PORT");
        const dbUser = _configService.get<string>("DB_USER");
        const dbPassword = _configService.get<string>("DB_PASSWORD");
        const dbName = _configService.get<string>("DB_NAME");

        return new Pool({
          host: dbHost || "localhost",
          port: parseInt(dbPort, 10) || 5412,
          user: dbUser || "postgres",
          password: dbPassword || "postgres",
          database: dbName || "db-name",
        });
      },
    },
  ],
  exports: ["DATABASE_POOL"],
})
export class DatabaseModule {}
