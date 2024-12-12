import { CurrentUser } from '@/decorators/current-user.decorator';
import { Public } from '@/decorators/public.decorator';
import { EmailService } from '@/shared/mailer/email.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { omit } from 'lodash';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { RequestForgotPasswordDto } from './dtos/request-forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  // public endpoints

  @Public()
  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@CurrentUser() user: User) {
    return await this.authService.signIn(user.id);
  }

  @Public()
  @Post('forgot-password/request')
  async requestForgotPassword(@Body() dto: RequestForgotPasswordDto) {
    return await this.authService.requestForgotPassword(dto);
  }

  @Public()
  @Post('forgot-password/reset')
  async resetForgotPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  // protected endpoints

  @Get('me')
  async me(
    @CurrentUser() user: User,
  ): Promise<Omit<User, 'password' | 'password_reset_token_id'>> {
    return omit(user, ['password', 'password_reset_token_id']);
  }

  @Put('me/update-profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() body: UpdateProfileDto,
  ) {
    return await this.authService.updateProfile(user, body);
  }

  @Post('me/change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return await this.authService.changePassword(body, user);
  }

  @Post('sign-out')
  async signOut(@Request() req: Request) {
    const access_token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    return await this.authService.signOut(access_token);
  }
}
