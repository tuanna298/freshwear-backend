import { Module } from '@nestjs/common';
import { VnpayModule as NestjsVnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';

@Module({
  imports: [
    NestjsVnpayModule.register({
      tmnCode: 'NNKBINLE',
      secureSecret: '85M1VROVBMFMHRHCPR56II26KY2C8U8S',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true

      /**
       * Sử dụng enableLog để bật/tắt logger
       * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
       */
      enableLog: true, // tùy chọn

      /**
       * Hàm `loggerFn` sẽ được gọi để ghi log
       * Mặc định, loggerFn sẽ ghi log ra console
       * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
       *
       * `ignoreLogger` là một hàm không làm gì cả
       */
      loggerFn: ignoreLogger, // tùy chọn
    }),
  ],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnpayModule {}
