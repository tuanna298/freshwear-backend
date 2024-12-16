import { MailerModule as DefaultMailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
  imports: [
    DefaultMailerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        const port = config.get<number>('SMTP_PORT');
        const secure = config.get<boolean>('SMTP_SECURE');
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');
        const from = config.get<string>('SMTP_FROM');

        if (!host || !port || !user || !pass || !from) {
          throw new Error('SMTP configuration is missing');
        }

        return {
          transport: {
            host,
            port,
            secure,
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: `"FreshWear" <${from}>`,
          },
          template: {
            dir: path.join(
              __dirname,
              '../../../../src/shared/mailer/templates',
            ),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
})
export class MailerModule {}
