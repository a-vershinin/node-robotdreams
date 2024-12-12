import { Controller, Post, Get, Body, UseGuards, Request } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { TokenInfo } from "./auth.types";
import { AuthService } from "./services/auth.service";
import { LoginAuthDtoReq, LoginAuthDtoRes } from "./auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiCreatedResponse({
    description: "Successfully authenticated.",
    type: LoginAuthDtoRes,
  })
  async login(@Body() body: LoginAuthDtoReq) {
    return this.authService.login(body);
  }

  @Post("refresh")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async refresh(@Body() body: { refresh_token: string }) {
    return await this.authService.refreshAccessToken(body.refresh_token);
  }

  @Get("get-token")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getToken(@Request() request: { user: TokenInfo | null }) {
    const user = request.user;
    return await this.authService.getToken(user.sub);
  }
}
