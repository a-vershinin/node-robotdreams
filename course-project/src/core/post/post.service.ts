import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Pool } from "pg";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

type StoredPost = { id: number; content: string; user_id: number };

@Injectable()
export class PostService {
  constructor(
    @Inject("DATABASE_POOL") private readonly pool: Pool,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async getAllPosts(): Promise<StoredPost[]> {
    const cacheKey = "user_posts:all";
    const cachedData = await this.cacheService.get<StoredPost[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const storageResult = await this.pool.query<StoredPost>("SELECT * FROM posts");
    if (storageResult.rowCount === 0) {
      throw new InternalServerErrorException(`PostService.findPostById has some error`);
    }

    await this.cacheService.set(cacheKey, storageResult.rows, 2 * 60);
    return storageResult.rows;
  }

  async findPostById(id: number): Promise<StoredPost> {
    const cacheKey = `user_posts:${id}`;

    const cachedData = await this.cacheService.get<StoredPost>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const storageResult = await this.pool.query<StoredPost>("SELECT * FROM posts WHERE id = $1", [
      id,
    ]);

    const rowPost = storageResult.rows[0];
    if (!rowPost) {
      throw new NotFoundException("Post not found");
    }
    await this.cacheService.set(cacheKey, rowPost, 5 * 1000);
    return rowPost;
  }

  async createPost(userId: number, content: string): Promise<StoredPost> {
    const storageResult = await this.pool.query<StoredPost>(
      "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
      [userId, content],
    );
    if (storageResult.rowCount === 0) {
      throw new InternalServerErrorException(`PostService.createPost has some error`);
    }

    const rowPost = storageResult.rows[0];
    const cacheKey = `user_posts:${rowPost.id}`;
    await this.cacheService.set(cacheKey, rowPost, 2 * 60);
    return rowPost;
  }

  async updatePost(id: number, content: string): Promise<StoredPost> {
    await this.findPostById(id);

    const storageResult = await this.pool.query<StoredPost>(
      "UPDATE posts SET content = $1 WHERE id = $2 RETURNING *",
      [content, id],
    );
    if (storageResult.rowCount === 0) {
      throw new InternalServerErrorException(`PostService.updatePost has some error`);
    }
    const rowPost = storageResult.rows[0];

    const cacheKey = `user_posts:${rowPost.id}`;
    await this.cacheService.set(cacheKey, rowPost, 2 * 60);
    return rowPost;
  }

  async deletePost(id: number): Promise<{ message: string }> {
    await this.findPostById(id);

    const storageResult = await this.pool.query("DELETE FROM posts WHERE id = $1", [id]);
    if (storageResult.rowCount === 0) {
      throw new InternalServerErrorException(`PostService.deletePost has some error`);
    }

    const cacheKey = `user_posts:${id}`;
    await this.cacheService.del(cacheKey);
    return { message: `Post with id ${id} deleted successfully` };
  }
}
