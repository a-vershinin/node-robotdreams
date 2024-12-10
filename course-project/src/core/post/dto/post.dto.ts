import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({
    type: Number,
  })
  userId: number;
  @ApiProperty({
    type: String,
  })
  content: string;
}

export class UpdatePostDto {
  @ApiProperty({
    type: String,
  })
  content: string;
}
