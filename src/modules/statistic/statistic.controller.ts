import { Controller, Get, Query } from '@nestjs/common';
import { StatisticQueryDto } from './dtos/statistic-query.dto';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('')
  async getStatistic(@Query() query: StatisticQueryDto) {
    return this.statisticService.getStatistic(query);
  }

  @Get('/revenue')
  async getStatisticRevenue(@Query() query: StatisticQueryDto) {
    return this.statisticService.getStatisticRevenue(query);
  }

  @Get('/orders')
  async getStatisticOrders(@Query() query: StatisticQueryDto) {
    return this.statisticService.getStatisticOrders(query);
  }

  @Get('/users')
  async getStatisticCustomers(@Query() query: StatisticQueryDto) {
    return this.statisticService.getStatisticCustomers(query);
  }

  @Get('/trending')
  async getTrendingProducts(@Query() query: { where: string }) {
    return this.statisticService.getTrendingProducts(query.where);
  }
}
