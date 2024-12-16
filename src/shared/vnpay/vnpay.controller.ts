import { Public } from '@/decorators/public.decorator';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReturnQueryFromVNPay } from 'vnpay';
import { VnpayService } from './vnpay.service';

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Public()
  @Get('/callback')
  async callback(@Query() query: ReturnQueryFromVNPay, @Res() res: Response) {
    return this.vnpayService.handleVnpayCallback(query, res);
  }
}
