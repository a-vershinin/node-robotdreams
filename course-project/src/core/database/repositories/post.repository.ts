import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

type StoredPost = { id: number; content: string; user_id: number };

@Injectable()
export class PostRepository {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async findAllPosts(_values?: { userId?: number }): Promise<StoredPost[]> {
    const storageResult = await this.pool.query<StoredPost>(
      "SELECT posts.id, posts.content, posts.user_id FROM posts",
    );
    const storedPosts = storageResult.rows;
    return storedPosts;
  }

  async createPost(values: { userId: number; content: string }): Promise<StoredPost> {
    const { userId, content } = values;
    const storageResult = await this.pool.query<StoredPost>(
      "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
      [userId, content],
    );
    const rowPost = storageResult.rows[0];
    return rowPost;
  }

  async findPostById(id: number): Promise<StoredPost | null> {
    const storageResult = await this.pool.query<StoredPost>(
      "SELECT posts.id, posts.content, posts.user_id FROM posts WHERE id = $1",
      [id],
    );
    const rowPost = storageResult.rows[0];
    return rowPost || null;
  }

  async updatePost(id: number, values: { content: string }): Promise<StoredPost> {
    const storageResult = await this.pool.query<StoredPost>(
      "UPDATE posts SET content = $1 WHERE id = $2 RETURNING *",
      [values.content, id],
    );
    const rowPost = storageResult.rows[0];
    return rowPost;
  }

  async deletePost(id: number): Promise<void> {
    await this.pool.query("DELETE FROM posts WHERE id = $1", [id]);
  }
}
