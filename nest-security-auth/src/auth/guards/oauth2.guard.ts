import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../services/tokens.service';


@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!(authHeader && authHeader.startsWith('Bearer '))) {
      throw new UnauthorizedException('Missing tokens');
    }
    const accessToken = authHeader.split(' ')[1];

    return this.validateAccessToken(accessToken, request);
  }

  private async validateAccessToken(
    token: string,
    request: any,
  ): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const storedToken = await this.tokensService.findAccessToken(token);
      if (!storedToken) {
        throw new UnauthorizedException('Access token not found in database');
      }

      request.user = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
