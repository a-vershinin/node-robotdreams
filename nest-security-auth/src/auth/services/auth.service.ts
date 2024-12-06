import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { TokensService } from './tokens.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findPasswordUsername(username);
    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const userStored = await this.tokensService.findTokenByUserId(user.id);

    if (userStored) {
      await this.tokensService.deleteTokensByUserId(user.id);
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    await this.tokensService.saveToken(user.id, accessToken);

    return {
      access_token: accessToken,
    };
  }
}
