import { ApiProperty } from "@nestjs/swagger";

export class LoginAuthDtoReq {
  @ApiProperty({
    type: String,
    description: "username",
    default: "janedoe",
  })
  username: string;
  @ApiProperty({
    type: String,
    description: "user password",
    default: "securepassword",
  })
  password: string;
}

export class LoginAuthDtoRes {
  @ApiProperty({
    type: String,
    description: "JWT access token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphbmVkb2UiLCJzdWIiOjIsImlhdCI6MTczNDAwNjU5MywiZXhwIjoxNzM0MDE3MzkzfQ.YV1bc2d07aVN6LzIXZ0moM-xW723udpAjCYAPlNGjCU",
  })
  access_token: string;
  @ApiProperty({
    type: String,
    description: "JWT refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphbmVkb2UiLCJzdWIiOjIsImlhdCI6MTczNDAwNjU5MywiZXhwIjoxNzM0MDE3MzkzfQ.YV1bc2d07aVN6LzIXZ0moM-xW723udpAjCYAPlNGjCU",
  })
  refresh_token: string;
}
