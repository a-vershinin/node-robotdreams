import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
  ApiTags,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBody,
  ApiOperation,
} from "@nestjs/swagger";
import { PostService } from "./post.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreatePostDtoReq, CreatePostDtoRes, UpdatePostDto, PostDto } from "./post.dto";
import { PostEntity } from "./post.entity";

@ApiTags("posts")
@ApiUnauthorizedResponse({
  description: "Unauthorized",
  examples: {
    case: {
      summary: "Access token invalid",
      value: {
        error: "Unauthorized",
        message: "Missing tokens",
        statusCode: 401,
      },
    },
    case2: {
      summary: "Access token not found",
      value: {
        error: "Unauthorized",
        message: "Access token not found",
        statusCode: 401,
      },
    },
    case3: {
      summary: "Invalid user",
      value: {
        error: "Unauthorized",
        message: "Invalid username or password",
        statusCode: 401,
      },
    },
  },
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: "userId",
    type: String,
    description: "filter by some user",
    required: false,
  })
  @ApiOperation({
    summary: "Fetch list of posts",
  })
  @ApiOkResponse({
    description: "The posts successfully returned.",
    type: [PostDto],
  })
  async getAllPosts(@Query("userId") userId?: number): Promise<CreatePostDtoRes[]> {
    return this.postService.findAllPosts({ userId });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({
    description: "Structure for post object",
    type: CreatePostDtoReq,
  })
  @ApiOperation({
    summary: "Create single post",
  })
  @ApiCreatedResponse({
    description: "The post successfully created.",
    type: CreatePostDtoRes,
  })
  async createPost(@Body() body: CreatePostDtoReq): Promise<PostEntity> {
    return await this.postService.createPost({ userId: body.userId, content: body.content });
  }

  @Get(":postId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Fetch single post by post id",
  })
  @ApiOkResponse({ description: "The post successfully returned." })
  @ApiNotFoundResponse({
    description: "The post not found.",
    example: {
      message: "message",
      error: "error",
      statusCode: 400,
    },
  })
  async findPost(@Param("postId") id: number): Promise<PostEntity> {
    return await this.postService.findPostById(id);
  }

  @Put(":postId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update single post by post id",
  })
  @ApiOkResponse({ description: "The post successfully updated.", type: CreatePostDtoRes })
  @ApiNotFoundResponse({ description: "The post not found." })
  async updatePost(@Param("postId") id: number, @Body() body: UpdatePostDto): Promise<PostEntity> {
    return await this.postService.updatePost(id, body);
  }

  @Delete(":postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove single post by post id",
  })
  @ApiNoContentResponse({ description: "The post successfully deleted." })
  async deletePost(@Param("postId") id: number): Promise<void> {
    await this.postService.deletePost(id);
  }
}
