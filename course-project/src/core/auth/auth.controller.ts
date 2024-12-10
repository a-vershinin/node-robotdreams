import { Controller, Post, Get, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { JwtAuthGuard } from "./guards/oauth2.guard";
import { TokenInfo } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body);
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  async refresh(@Body() body: { refresh_token: string }) {
    return await this.authService.refreshAccessToken(body.refresh_token);
  }

  @Get("get-token")
  @UseGuards(JwtAuthGuard)
  async getToken(@Request() request: { user: TokenInfo | null }) {
    const user = request.user;
    return await this.authService.getToken(user.sub);
  }
}
