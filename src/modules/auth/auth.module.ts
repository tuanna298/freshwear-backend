import { MailerModule } from '@/shared/mailer/mailer.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCleanUpJob } from './jobs/auth-clean-up.job';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UserModule, MailerModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    JwtAccessTokenStrategy,
    LocalStrategy,
    AuthCleanUpJob,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
