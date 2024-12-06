import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TokensService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) { }

  async saveToken(
    userId: number,
    accessToken: string,
  ): Promise<void> {
    await this.pool.query(
      'INSERT INTO tokens (user_id, access_token) VALUES ($1, $2)',
      [userId, accessToken],
    );
  }

  async findAccessToken(accessToken: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM tokens WHERE access_token = $1',
      [accessToken],
    );
    return result.rows[0];
  }

  async deleteAccessToken(accessToken: string): Promise<void> {
    await this.pool.query('DELETE FROM tokens WHERE access_token = $1', [
      accessToken,
    ]);
  }

  async findTokenByUserId(userId: number): Promise<{
    id: number;
    user_id: number;
    access_token: string;
    created_at: string
  } | null> {
    const result = await this.pool.query(
      'SELECT * FROM tokens WHERE user_id = $1',
      [userId],
    );
    return result.rows.length ? result.rows[0] : null;
  }

  async deleteTokensByUserId(userId: number): Promise<void> {
    await this.pool.query('DELETE FROM tokens WHERE user_id = $1', [userId]);
  }
}
