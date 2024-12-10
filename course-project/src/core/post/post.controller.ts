import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { PostService } from "./post.service";
import { JwtAuthGuard } from "../auth/guards/oauth2.guard";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { ApiResponse, ApiOkResponse, ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth("access_token")
@UseGuards(JwtAuthGuard)
@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOkResponse({ description: "The posts successfully returned." })
  @ApiResponse({ status: 401, description: "Access token invalid or not found" })
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(":id")
  @ApiResponse({ status: 200, description: "The post successfully returned." })
  @ApiResponse({ status: 401, description: "Access token invalid or not found" })
  @ApiResponse({ status: 404, description: "The post not found." })
  async findPost(@Param("id") id: number) {
    return this.postService.findPostById(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: "The post successfully created." })
  @ApiResponse({ status: 401, description: "Access token invalid or not found" })
  async createPost(@Body() body: CreatePostDto) {
    return this.postService.createPost(body.userId, body.content);
  }

  @Put(":id")
  @ApiResponse({ status: 200, description: "The post successfully updated." })
  @ApiResponse({ status: 401, description: "Access token invalid or not found" })
  @ApiResponse({ status: 404, description: "The post not found." })
  async updatePost(@Param("id") id: number, @Body() body: UpdatePostDto) {
    return this.postService.updatePost(id, body.content);
  }

  @Delete(":id")
  @ApiResponse({ status: 200, description: "The post successfully deleted." })
  @ApiResponse({ status: 401, description: "Access token invalid or not found" })
  @ApiResponse({ status: 404, description: "The post not found." })
  async deletePost(@Param("id") id: number) {
    return this.postService.deletePost(id);
  }
}
