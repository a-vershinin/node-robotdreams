import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { CacheService } from "../../core/cache/cache.service";
import { PostRepository } from "../../core/database/repositories/post.repository";

type StoredPost = { id: number; content: string; user_id: number };

@Injectable()
export class PostService {
  constructor(
    @Inject(PostRepository) private readonly postRepository: PostRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAllPosts(_values?: { userId?: number }): Promise<StoredPost[]> {
    const cacheKey = "user_posts:all";
    const cachedData = await this.cacheService.get<StoredPost[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const storedPosts = await this.postRepository.findAllPosts(_values);
    await this.cacheService.set(cacheKey, storedPosts, 2 * 60);
    return storedPosts;
  }

  async createPost(values: { userId: number; content: string }): Promise<StoredPost> {
    const { userId, content } = values;

    const newPost = await this.postRepository.createPost({ userId, content });

    await this.cacheService.del("user_posts:all");
    const cacheKey = `user_posts:${newPost.id}`;
    await this.cacheService.set(cacheKey, newPost, 2 * 60);
    return newPost;
  }

  async findPostById(id: number): Promise<StoredPost> {
    const cacheKey = `user_posts:${id}`;

    const cachedData = await this.cacheService.get<StoredPost>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const selectedPost = await this.postRepository.findPostById(id);
    if (!selectedPost) {
      throw new NotFoundException("Post not found");
    }
    await this.cacheService.set(cacheKey, selectedPost, 5 * 1000);
    return selectedPost;
  }

  async updatePost(id: number, values: { content: string }): Promise<StoredPost> {
    const selectedPost = await this.postRepository.findPostById(id);
    if (!selectedPost) {
      throw new NotFoundException("Post not found");
    }

    const rowPost = await this.postRepository.updatePost(id, values);

    const cacheKey = `user_posts:${rowPost.id}`;
    await this.cacheService.set(cacheKey, rowPost, 2 * 60);
    return rowPost;
  }

  async deletePost(id: number): Promise<void> {
    const selectedPost = await this.postRepository.findPostById(id);
    if (!selectedPost) {
      throw new NotFoundException("Post not found");
    }

    await this.postRepository.deletePost(selectedPost.id);

    const cacheKey = `user_posts:${id}`;
    await this.cacheService.del(cacheKey);
  }
}
