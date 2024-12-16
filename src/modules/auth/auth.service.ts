import { EmailService } from '@/shared/mailer/email.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RequestForgotPasswordDto } from './dtos/request-forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { accessTokenPrivateKey, refreshTokenPrivateKey } from './jwt.key';
import { TokenPayload } from './type';

@Injectable()
export class AuthService {
  private readonly SALT_ROUND = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async signIn(user_id: string) {
    const access_token = this.generateAccessToken({ user_id });
    const refresh_token = this.generateRefreshToken({ user_id });

    await this.userService.bUpdate(user_id, {
      last_login: new Date(),
    });
    return {
      access_token,
      refresh_token,
    };
  }

  async signUp(dto: SignUpDto): Promise<void> {
    const { email, username, password } = dto;

    const [existingUsername, existingEmail] = await Promise.all([
      this.userService.bFindFirstByConditions({
        where: {
          username,
        },
      }),
      this.userService.bFindFirstByConditions({
        where: { email },
      }),
    ]);

    if (existingUsername) {
      throw new ConflictException('Username đã tồn tại');
    }

    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUND);
    await this.userService.bCreate({
      ...dto,
      password: hashedPassword,
      full_name: email.split('@')[0],
    });
  }

  async signOut(access_token: string) {
    const decodedToken = this.jwtService.decode(access_token) as {
      exp: number;
    };
    const expires_at = new Date(decodedToken.exp * 1000);

    await this.prisma.revokedToken.create({
      data: {
        token: access_token,
        expires_at,
      },
    });
  }

  async changePassword(
    { current_password, new_password }: ChangePasswordDto,
    user: User,
  ): Promise<void> {
    const isSamePassword = await bcrypt.compare(new_password, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu cũ',
      );
    }

    const is_matching = bcrypt.compare(current_password, user.password);

    if (!is_matching) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashed_password = await bcrypt.hash(new_password, this.SALT_ROUND);

    await this.userService.bUpdate(user.id, {
      password: hashed_password,
    });
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    await this.userService.bUpdate(user.id, dto);
  }

  async requestForgotPassword({
    email,
  }: RequestForgotPasswordDto): Promise<void> {
    const user = await this.userService.bFindOneByConditions({
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    const existingToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        user_id: user.id,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingToken) {
      throw new BadRequestException(
        'Yêu cầu đặt lại mật khẩu đã được gửi trước đó, vui lòng kiểm tra email của bạn',
      );
    }

    const reset_password_token = uuidv4();

    // gửi email
    await this.sendForgotPasswordEmail(email, reset_password_token);

    const hashedToken = crypto
      .createHash('sha256')
      .update(reset_password_token)
      .digest('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 0.5); // expires in 30 minutes

    await this.prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token: hashedToken,
        expires_at: tokenExpiresAt,
      },
    });
  }

  async resetPassword({ token, new_password }: ResetPasswordDto) {
    const user = await this.userService.bFindFirstExists({
      args: {
        where: {
          password_reset_token: {
            token,
          },
        },
      },
      mess_err: 'Token không hợp lệ',
    });

    const isSamePassword = await bcrypt.compare(new_password, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu cũ',
      );
    }

    const hashed_password = await bcrypt.hash(new_password, this.SALT_ROUND);

    await this.userService.bUpdate(user.id, {
      password: hashed_password,
    });

    await this.prisma.passwordResetToken.delete({
      where: {
        user_id: user.id,
      },
    });
  }

  async sendForgotPasswordEmail(email: string, token: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      template: 'mail-verification',
      context: {
        link: `http://localhost:5174/reset-password?token=${token}`,
      },
    });
  }

  async validateAccessToken(id: string) {
    return await this.userService.bFindFirstExists({
      args: {
        where: {
          id,
        },
      },
      mess_err: 'Xác thực không thành công',
    });
  }

  async validateLocalUser(username: string, password: string) {
    const user = await this.userService.bFindFirstExists({
      args: {
        where: {
          username,
        },
      },
      mess_err: 'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu',
    });

    // verify user's password

    const isMatching = await bcrypt.compare(password, user.password);

    if (!isMatching) {
      throw new BadRequestException(
        'Bạn đã nhập sai tên đăng nhập hoặc mật khẩu',
      );
    }

    return user;
  }

  async validateToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token, {
        algorithms: ['RS256'],
        publicKey: accessTokenPrivateKey,
      });

      await this.userService.bFindFirstExists({
        args: {
          where: {
            id: decoded.user_id,
          },
        },
        mess_err: 'Xác thực không thành công',
      });
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ: ' + error.message);
    }
  }

  generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: accessTokenPrivateKey,
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
  }

  generateRefreshToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey: refreshTokenPrivateKey,
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
  }
}
