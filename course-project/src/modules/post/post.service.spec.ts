import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PostService } from "./post.service";
import { CacheService } from "../../core/cache/cache.service";
import { PostRepository } from "../../core/database/repositories/post.repository";

describe("PostService", () => {
  let postService: PostService;

  let cacheService: CacheService;
  let postRepository: PostRepository;

  const mockCacheService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };
  const mockPostRepository = {
    findAllPosts: jest.fn(),
    createPost: jest.fn(),
    findPostById: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: PostRepository, useValue: mockPostRepository },
      ],
    }).compile();
    postService = module.get<PostService>(PostService);
    cacheService = module.get<CacheService>(CacheService);
    postRepository = module.get<PostRepository>(PostRepository);
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
      postRepository.findAllPosts = jest.fn().mockResolvedValueOnce(mockResultData);
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");
      const postRepositorySpy = jest.spyOn(postRepository, "findAllPosts");

      const resultFull = await postService.findAllPosts(mockParams);

      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith("user_posts:all");
      expect(postRepositorySpy).toHaveBeenCalledTimes(1);
      expect(postRepositorySpy).toHaveBeenCalledWith(mockParams);
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

      postRepository.createPost = jest.fn().mockResolvedValueOnce(mockNewPost);
      cacheService.del = jest.fn().mockResolvedValueOnce(null);
      const postRepositorySpy = jest.spyOn(postRepository, "createPost");
      const cacheServiceDeleteSpy = jest.spyOn(cacheService, "del");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.createPost(mockBody);

      expect(postRepositorySpy).toHaveBeenCalledTimes(1);
      expect(postRepositorySpy).toHaveBeenCalledWith(mockBody);
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
      postRepository.findPostById = jest.fn().mockResolvedValueOnce(mockPost);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.findPostById(mockParams.userId);

      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith(cacheKey, mockPost, 5 * 1000);
      expect(result).toStrictEqual(mockPost);
    });

    it("should find post by post by cache", async () => {
      const mockParams = { userId: 1 };
      const mockPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockParams.userId}`;

      cacheService.get = jest.fn().mockResolvedValueOnce(mockPost);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");

      const result = await postService.findPostById(mockParams.userId);

      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(0);
      expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
      expect(result).toStrictEqual(mockPost);
    });

    it("should not found post by origin", async () => {
      const mockParams = { userId: 1 };
      const mockPost = { id: 1, user_id: 1, content: "some post content" };
      const cacheKey = `user_posts:${mockPost.id}`;

      cacheService.get = jest.fn().mockResolvedValueOnce(null);
      postRepository.findPostById = jest.fn().mockResolvedValueOnce(null);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const cacheServiceGetSpy = jest.spyOn(cacheService, "get");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      try {
        await postService.findPostById(mockParams.userId);
      } catch (error) {
        expect(cacheServiceGetSpy).toHaveBeenCalledTimes(1);
        expect(cacheServiceGetSpy).toHaveBeenCalledWith(cacheKey);
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
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

      postRepository.findPostById = jest.fn().mockResolvedValueOnce(mockSelectedPost);
      postRepository.updatePost = jest.fn().mockResolvedValueOnce(mockUpdatedPost);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const postRepositoryUpdatePostSpy = jest.spyOn(postRepository, "updatePost");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      const result = await postService.updatePost(mockParams.userId, mockParams.values);

      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
      expect(postRepositoryUpdatePostSpy).toHaveBeenCalledTimes(1);
      expect(postRepositoryUpdatePostSpy).toHaveBeenCalledWith(
        mockParams.userId,
        mockParams.values,
      );
      expect(cacheServiceSetSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceSetSpy).toHaveBeenCalledWith(cacheKey, mockUpdatedPost, 2 * 60);
      expect(result).toStrictEqual(mockUpdatedPost);
    });

    it("should not found post for update", async () => {
      const mockParams = { userId: 1, values: { content: "new updated content" } };
      postRepository.findPostById = jest.fn().mockResolvedValueOnce(null);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const cacheServiceSetSpy = jest.spyOn(cacheService, "set");

      try {
        await postService.updatePost(mockParams.userId, mockParams.values);
      } catch (error) {
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
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

      postRepository.findPostById = jest.fn().mockResolvedValueOnce(mockSelectedPost);
      postRepository.updatePost = jest.fn().mockResolvedValueOnce(null);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const postRepositoryDeletePostSpy = jest.spyOn(postRepository, "deletePost");
      const cacheServiceDelSpy = jest.spyOn(cacheService, "del");

      await postService.deletePost(mockParams.userId);

      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
      expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
      expect(postRepositoryDeletePostSpy).toHaveBeenCalledTimes(1);
      expect(postRepositoryDeletePostSpy).toHaveBeenCalledWith(mockParams.userId);
      expect(cacheServiceDelSpy).toHaveBeenCalledTimes(1);
      expect(cacheServiceDelSpy).toHaveBeenCalledWith(cacheKey);
    });

    it("should not found post for delete", async () => {
      const mockParams = { userId: 1 };

      postRepository.findPostById = jest.fn().mockResolvedValueOnce(null);
      const postRepositoryFindPostByIdSpy = jest.spyOn(postRepository, "findPostById");
      const cacheServiceDelSpy = jest.spyOn(cacheService, "del");

      try {
        await postService.deletePost(mockParams.userId);
      } catch (error) {
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledTimes(1);
        expect(postRepositoryFindPostByIdSpy).toHaveBeenCalledWith(mockParams.userId);
        expect(cacheServiceDelSpy).toHaveBeenCalledTimes(0);
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
