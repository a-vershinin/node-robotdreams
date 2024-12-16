import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { TokenInfo } from "../auth.types";
import { AuthService } from "../services/auth.service";

@Injectable()
export class JwtAuthGuard {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization: string };
      query: { refresh_token: string };
      body: { refresh_token: string };
      user: TokenInfo | null;
    }>();

    const accessToken = this.extractTokenFromHeader(request);
    if (accessToken) {
      return this.authService.validateAccessToken(accessToken, request);
    }

    const refreshToken = request.body.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh tokens");
    }
    return this.authService.validateRefreshToken(refreshToken, request);
  }

  private extractTokenFromHeader(request: { headers: { authorization: string } }): string {
    const authHeader = request.headers.authorization;
    const [type, token] = authHeader?.split(" ") ?? [];
    return type === "Bearer" ? token : "";
  }
}
