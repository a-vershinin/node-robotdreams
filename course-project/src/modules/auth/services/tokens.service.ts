import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class TokensService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async saveTokens(userId: number, accessToken: string, refreshToken: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO tokens (user_id, access_token, refresh_token) VALUES ($1, $2, $3)",
      [userId, accessToken, refreshToken],
    );
  }

  async findAccessToken(accessToken: string): Promise<{ access_token: string } | null> {
    const storageResult = await this.pool.query(
      "SELECT tokens.access_token FROM tokens WHERE access_token = $1",
      [accessToken],
    );
    return storageResult.rows.length ? storageResult.rows[0] : null;
  }

  async deleteAccessToken(accessToken: string): Promise<void> {
    await this.pool.query("DELETE FROM tokens WHERE access_token = $1", [accessToken]);
  }

  async findRefreshToken(refreshToken: string): Promise<{ refresh_token: string } | null> {
    const storageResult = await this.pool.query(
      "SELECT tokens.refresh_token FROM tokens WHERE refresh_token = $1",
      [refreshToken],
    );
    return storageResult.rows.length ? storageResult.rows[0] : null;
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await this.pool.query("DELETE FROM tokens WHERE refresh_token = $1", [refreshToken]);
  }
}
