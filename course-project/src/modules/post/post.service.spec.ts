import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { Pool } from "pg";
import { PostService } from "./post.service";
import { CacheService } from "../../core/cache/cache.service";

describe("PostService", () => {
  let postService: PostService;
  let databaseService: Pool;
  let cacheService: CacheService;

  const mockCacheService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };
  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: "DATABASE_POOL", useValue: mockDatabaseService },
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    databaseService = module.get<Pool>("DATABASE_POOL");
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(postService).toBeDefined();
  });

  describe("findAllPosts", () => {
    it("should return list of posts with expected params by origin", async () => {
      const mockParams = { userId: 1 };
      const mockResultData = [{ id: 1, user_id: 1, content: "content" }];

      cacheService.get = jest.fn().mockResolvedValueOnce(null);
      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: mockResultData });
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");
      const databaseServiceSpy = jest.spyOn(databaseService, "query");

      const resultFull = await postService.findAllPosts(mockParams);

      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith("user_posts:all");
      expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith("user_posts:all", mockResultData, 120);
      expect(resultFull).toStrictEqual(mockResultData);
    });

    it("should find all posts from cache", async () => {
      const mockResultData = [{ id: 1, user_id: 1, content: "content" }];
      cacheService.get = jest.fn().mockResolvedValueOnce(mockResultData);
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");

      const resultWithCache = await postService.findAllPosts();

      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith("user_posts:all");
      expect(resultWithCache).toStrictEqual(mockResultData);
    });
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      const mockBody = { userId: 1, content: "some post content" };
      const mockNewPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockNewPost.id}`;

      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: [mockNewPost] });
      cacheService.del = jest.fn().mockResolvedValueOnce(null);
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceDeleteSpy = jest.spyOn(cacheService, "del");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.createPost(mockBody);

      expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceDeleteSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceDeleteSpy).toHaveBeenCalledWith("user_posts:all");
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith(cacheKey, mockNewPost, 120);
      expect(result).toStrictEqual(mockNewPost);
    });
  });

  describe("findPostById", () => {
    it("should find post by origin", async () => {
      const mockParams = { userId: 1 };
      const mockPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockPost.id}`;

      cacheService.get = jest.fn().mockResolvedValueOnce(null);
      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: [mockPost] });
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.findPostById(mockParams.userId);

      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
      expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith(cacheKey, mockPost, 5 * 1000);
      expect(result).toStrictEqual(mockPost);
    });

    it("should find post by post by cache", async () => {
      const mockParams = { userId: 1 };
      const mockPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockParams.userId}`;

      cacheService.get = jest.fn().mockResolvedValueOnce(mockPost);
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");

      const result = await postService.findPostById(mockParams.userId);

      expect(databaseServiceSpy).toHaveBeenCalledTimes(0);
      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
      expect(result).toStrictEqual(mockPost);
    });

    it("should not found post by origin", async () => {
      const mockParams = { userId: 1 };
      const mockPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockPost.id}`;

      cacheService.get = jest.fn().mockResolvedValueOnce(null);
      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: [] });
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      try {
        await postService.findPostById(mockParams.userId);
      } catch (error) {
        expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
        expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
        expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
        expect(cacheServiceSetSpy).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe("updatePost", () => {
    it("should update post", async () => {
      const mockParams = { userId: 1, values: { content: "new updated content" } };
      const mockSelectedPost = {
        id: 1,
        user_id: mockParams.userId,
        content: "selected post content",
      };
      const mockUpdatedPost = {
        id: 1,
        user_id: mockParams.userId,
        content: mockParams.values.content,
      };
      const cacheKey = `user_posts:${mockUpdatedPost.id}`;

      databaseService.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [mockSelectedPost] })
        .mockResolvedValueOnce({ rows: [mockUpdatedPost] });
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.updatePost(mockParams.userId, mockParams.values);

      expect(databaseServiceSpy).toHaveBeenCalledTimes(2);
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith(cacheKey, mockUpdatedPost, 2 * 60);
      expect(result).toStrictEqual(mockUpdatedPost);
    });

    it("should not found post for update", async () => {
      const mockParams = { userId: 1, values: { content: "new updated content" } };
      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      try {
        await postService.updatePost(mockParams.userId, mockParams.values);
      } catch (error) {
        expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
        expect(cacheServiceSetSpy).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe("deletePost", () => {
    it("should remove post", async () => {
      const mockParams = { userId: 1 };
      const mockSelectedPost = {
        id: 1,
        user_id: mockParams.userId,
        content: "selected post content",
      };
      const cacheKey = `user_posts:${mockSelectedPost.id}`;

      databaseService.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [mockSelectedPost] })
        .mockResolvedValueOnce(null);
      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceDelSpy = jest.spyOn(cacheService, "del");

      await postService.deletePost(mockParams.userId);

      expect(databaseServiceSpy).toHaveBeenCalledTimes(2);
      expect(cacheServiceDelSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceDelSpy).toHaveBeenCalledWith(cacheKey);
    });

    it("should not found post for delete", async () => {
      const mockParams = { userId: 1 };
      databaseService.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      const databaseServiceSpy = jest.spyOn(databaseService, "query");
      const cacheServiceDelSpy = jest.spyOn(cacheService, "del");

      try {
        await postService.deletePost(mockParams.userId);
      } catch (error) {
        expect(databaseServiceSpy).toHaveBeenCalledTimes(1);
        expect(cacheServiceDelSpy).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
