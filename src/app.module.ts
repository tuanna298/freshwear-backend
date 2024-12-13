import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ResponseMappingInterceptor } from './interceptors/response-mapping.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAccessTokenGuard } from './modules/auth/guards/jwt-access-token.guard';
import { BrandModule } from './modules/brand/brand.module';
import { ColorModule } from './modules/color/color.module';
import { MaterialModule } from './modules/material/material.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { ReviewModule } from './modules/review/review.module';
import { SizeModule } from './modules/size/size.module';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { VnpayModule } from './shared/vnpay/vnpay.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SseModule } from './modules/sse/sse.module';

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
    ProductModule,
    OrderModule,
    VnpayModule,
    StatisticModule,
    NotificationModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAccessTokenGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMappingInterceptor,
    },
  ],
})
export class AppModule {}
