import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAccessTokenGuard } from './modules/auth/guards/jwt-access-token.guard';
import { BrandModule } from './modules/brand/brand.module';
import { ColorModule } from './modules/color/color.module';
import { MaterialModule } from './modules/material/material.module';
import { SizeModule } from './modules/size/size.module';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ReviewModule } from './modules/review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    SizeModule,
    BrandModule,
    MaterialModule,
    ColorModule,
    AuthModule,
    MailerModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: JwtAccessTokenGuard,
    },
  ],
})
export class AppModule {}
