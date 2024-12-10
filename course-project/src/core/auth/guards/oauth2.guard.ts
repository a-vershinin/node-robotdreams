import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokensService } from "../services/tokens.service";
import { TokenInfo } from "../auth.types";

@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization: string };
      query: { refresh_token: string };
      body: { refresh_token: string };
      user: TokenInfo | null;
    }>();

    const accessToken = this.extractTokenFromHeader(request);
    if (accessToken) {
      return this.validateAccessToken(accessToken, request);
    }

    const refreshToken = request.body.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException("Missing tokens");
    }
    return this.validateRefreshToken(refreshToken, request);
  }

  private async validateAccessToken(
    token: string,
    request: { user: TokenInfo | null },
  ): Promise<boolean> {
    try {
      const decodedToken = await this.jwtService.verifyAsync<TokenInfo>(token, {
        secret: process.env.JWT_SECRET,
      });

      const storedToken = await this.tokensService.findAccessToken(token);
      if (!storedToken) {
        throw new UnauthorizedException("Access token not found");
      }

      request.user = decodedToken;
      return true;
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  private async validateRefreshToken(token: string, request: any): Promise<boolean> {
    try {
      const decoded = await this.jwtService.verifyAsync<TokenInfo>(token, {
        secret: process.env.JWT_SECRET,
      });
      const storedToken = await this.tokensService.findRefreshToken(token);

      if (!storedToken) {
        throw new UnauthorizedException("Refresh token not found");
      }

      const newAccessToken = await this.jwtService.signAsync(
        { username: decoded.username, sub: decoded.sub },
        { expiresIn: "15m", secret: process.env.JWT_SECRET },
      );

      await this.tokensService.saveTokens(decoded.sub, newAccessToken, token);

      request.user = decoded;
      request.newAccessToken = newAccessToken;
      return true;
    } catch (err) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private extractTokenFromHeader(request: { headers: { authorization: string } }): string {
    const authHeader = request.headers.authorization;
    const [type, token] = authHeader?.split(" ") ?? [];
    return type === "Bearer" ? token : "";
  }
}
