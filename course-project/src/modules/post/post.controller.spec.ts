import { Test } from "@nestjs/testing";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { CreatePostDtoReq, CreatePostDtoRes, UpdatePostDto, PostDto } from "./post.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

describe("PostController", () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const mockPostService = {
      findAllPosts: jest.fn(),
      findPostById: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    };
    const mockJwtAuthGuard = {
      canActivate: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService, { provide: PostService, useValue: mockPostService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();
    postService = moduleRef.get<PostService>(PostService);
    postController = moduleRef.get<PostController>(PostController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(postController).toBeDefined();
  });

  it.skip("should be protected by JwtAuthGuard", async () => {
    // TODO: add implementation
  });

  it("should return list of posts with expected params", async () => {
    const mockResultData: CreatePostDtoRes[] = [{ id: 1, user_id: 1, content: "content" }];
    const serviceSpy = jest.spyOn(postService, "findAllPosts").mockResolvedValue(mockResultData);

    const resultWithParams = await postController.getAllPosts(123);

    expect(serviceSpy).toHaveBeenCalledWith({ userId: 123 });
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(resultWithParams).toStrictEqual(mockResultData);

    const result = await postController.getAllPosts();
    expect(serviceSpy).toHaveBeenCalledWith({ userId: void 0 });
    expect(serviceSpy).toHaveBeenCalledTimes(2);
    expect(result).toStrictEqual(mockResultData);
  });

  it("should create new single post", async () => {
    const mockBody: CreatePostDtoReq = { userId: 1, content: "content" };
    const mockResultData: PostDto = { id: 1, user_id: 1, content: "content" };
    postService.createPost = jest.fn().mockResolvedValueOnce(mockResultData);
    const serviceSpy = jest.spyOn(postService, "createPost");

    const result = await postController.createPost(mockBody);
    expect(serviceSpy).toHaveBeenCalledWith(mockBody);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(mockResultData);
  });

  describe("findPostById", () => {
    it("should return single post", async () => {
      const mockResultData: CreatePostDtoRes = { id: 1, user_id: 1, content: "content" };
      postService.findPostById = jest.fn().mockResolvedValueOnce(mockResultData);
      const serviceSpy = jest.spyOn(postService, "findPostById");

      const result = await postController.findPost(1);

      expect(serviceSpy).toHaveBeenCalledWith(1);
      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(mockResultData);
    });
  });

  it("should update single post", async () => {
    const mockBody: UpdatePostDto = { content: "content updated" };
    const mockReq = { postId: 2, body: mockBody };
    const mockResultData: CreatePostDtoRes = { id: 1, user_id: 1, content: mockBody.content };
    const serviceSpy = jest.spyOn(postService, "updatePost").mockResolvedValueOnce(mockResultData);

    const result = await postController.updatePost(mockReq.postId, mockReq.body);

    expect(serviceSpy).toHaveBeenCalledWith(mockReq.postId, mockReq.body);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(mockResultData);
  });

  it("should remove single post", async () => {
    const mockReq = { postId: 2 };
    const serviceSpy = jest.spyOn(postService, "deletePost").mockResolvedValueOnce(void 0);

    const result = await postController.deletePost(mockReq.postId);
    expect(serviceSpy).toHaveBeenCalledWith(mockReq.postId);
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe(void 0);
  });
});
