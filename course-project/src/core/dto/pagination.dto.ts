import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto<T> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  results: T[];
}
