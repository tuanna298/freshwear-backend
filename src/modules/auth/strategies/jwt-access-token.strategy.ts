import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { accessTokenPublicKey } from '../jwt.key';
import { TokenPayload } from '../type';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access_token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenPublicKey,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.authService.validateAccessToken(payload.user_id);
    return user;
  }
}
