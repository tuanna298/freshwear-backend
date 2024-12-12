import { Controller, Get, Query } from '@nestjs/common';
import { ReturnQueryFromVNPay } from 'vnpay';
import { VnpayService } from './vnpay.service';

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('/callback')
  async callback(@Query() query: ReturnQueryFromVNPay) {
    return this.vnpayService.handleVnpayCallback(query);
  }
}
