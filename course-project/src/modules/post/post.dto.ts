import { ApiProperty, ApiExtraModels } from "@nestjs/swagger";
import { PaginationDto } from "../../core/dto/pagination.dto";

export class PostDto {
  @ApiProperty({
    type: Number,
    description: "post unique id",
    example: 1,
  })
  id: number;
  @ApiProperty({
    type: Number,
    description: "userId to which the post belongs",
    example: 1,
  })
  user_id: number;
  @ApiProperty({
    type: String,
    description: "post content",
    example: "post content",
  })
  content: string;
}

export class GetPostListDtoRes {
  @ApiProperty({
    type: [PostDto],
    description: "list of posts",
  })
  items: [];
}
export class CreatePostDtoReq {
  @ApiProperty({
    type: Number,
    description: "user id how created this post",
    default: 1,
    example: 1,
  })
  userId: number;
  @ApiProperty({
    type: String,
    default: "new post content",
    example: "post content",
  })
  content: string;
}

@ApiExtraModels(PaginationDto)
export class CreatePostDtoRes {
  @ApiProperty({
    type: Number,
    description: "post unique id",
    example: 1,
  })
  id: number;
  @ApiProperty({
    type: Number,
    description: "user id how created this post",
    example: 1,
  })
  user_id: number;
  @ApiProperty({
    type: String,
    description: "post content",
    example: "post content",
  })
  content: string;
}

export class UpdatePostDto {
  @ApiProperty({
    type: String,
  })
  content: string;
}
