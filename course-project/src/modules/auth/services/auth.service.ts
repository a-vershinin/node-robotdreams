import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../../users/users.service";
import { TokensService } from "./tokens.service";
import { TokenInfo } from "../auth.types";
import { StoredUser } from "../../users/users.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  public async login(values: { username: string; password: string }) {
    const user = await this.validateUser(values.username, values.password);
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: "3h" });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: "7d" });
    await this.tokensService.saveTokens(user.id, accessToken, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    const storedToken = await this.tokensService.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    try {
      const decoded = await this.jwtService.verifyAsync<TokenInfo>(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const newAccessToken = await this.jwtService.signAsync(
        { username: decoded.username, sub: decoded.sub },
        { expiresIn: "15m", secret: process.env.JWT_SECRET },
      );
      await this.tokensService.saveTokens(decoded.sub, newAccessToken, refreshToken);

      return { access_token: newAccessToken };
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async logout(accessToken: string): Promise<void> {
    await this.tokensService.deleteAccessToken(accessToken);
  }

  async getToken(userId: number): Promise<StoredUser> {
    const user = await this.usersService.findUserTokens(userId);
    if (!user) {
      throw new UnauthorizedException("Invalid username");
    }
    return user;
  }

  private async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: number; username: string; password: string } | null> {
    const user = await this.usersService.findPasswordUsername(username);
    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return null;
    }
    return user;
  }

  public async validateAccessToken(
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

  public async validateRefreshToken(token: string, request: any): Promise<boolean> {
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
}
