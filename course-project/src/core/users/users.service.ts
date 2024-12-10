import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import { StoredUser } from "./users.types";

@Injectable()
export class UsersService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async getAllUsers(): Promise<{ id: number; username: string }[]> {
    const queryResult = await this.pool.query<StoredUser>(
      "SELECT users.id, users.username FROM users",
      [],
    );
    const list = queryResult.rows;
    const result = list.map((item) => {
      return {
        id: item.id,
        username: item.username,
      };
    });
    return result;
  }

  async findOneById(userId: number): Promise<StoredUser> {
    const user = await this.findUserTokens(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async createUser(username: string, password: string): Promise<{ id: number; username: string }> {
    const user = await this.findPasswordUsername(username);
    if (user) {
      return { id: user.id, username: user.username };
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await this.pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);

    const storageResult = await this.pool.query<StoredUser>(
      "SELECT users.id, users.username FROM users WHERE username = $1",
      [username],
    );
    const storedUser = storageResult.rows[0];
    return storedUser;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.pool.query("DELETE FROM users WHERE id = $1", [userId]);
  }

  async findPasswordUsername(
    username: string,
  ): Promise<{ id: number; username: string; password: string } | null> {
    const storageResult = await this.pool.query<{
      id: number;
      username: string;
      password: string;
    }>("SELECT users.id, users.username, users.password FROM users WHERE username = $1", [
      username,
    ]);
    if (storageResult.rowCount === 0) {
      return null;
    }
    return storageResult.rows[0];
  }

  async findUserTokens(userId: number): Promise<StoredUser | null> {
    const storageResult = await this.pool.query<StoredUser>(
      "SELECT users.id, users.username, tokens.access_token, tokens.refresh_token \n" +
        "FROM users INNER JOIN tokens ON users.id = tokens.user_id WHERE users.id = $1",
      [userId],
    );
    const storedUser = storageResult.rows[0];
    if (storageResult.rowCount === 0) {
      return null;
    }
    return storedUser;
  }
}
