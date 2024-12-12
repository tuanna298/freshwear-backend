import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { GrowthResponse } from './dtos/growth-response.dto';
import { StatisticQueryDto } from './dtos/statistic-query.dto';
import { Statistic, TrendingStat } from './interfaces';
import { DailyStatisticUtil } from './utils';

@Injectable()
export class StatisticService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistic(query: StatisticQueryDto) {
    const revenueGrowth = await this.getRevenueGrowth(query);
    const orderGrowth = await this.getOrderGrowth(query);
    const userGrowth = await this.getUserGrowth(query);

    const combinedGrowth: GrowthResponse[] = [];

    revenueGrowth.filter(Boolean).forEach((revenue) => {
      combinedGrowth.push({
        date: revenue.date,
        dailyGrowth: revenue.dailyGrowth,
        name: 'Revenue',
      });
    });

    orderGrowth.filter(Boolean).forEach((order) => {
      combinedGrowth.push({
        date: order.date,
        dailyGrowth: order.dailyGrowth,
        name: 'Order',
      });
    });

    userGrowth.filter(Boolean).forEach((user) => {
      combinedGrowth.push({
        date: user.date,
        dailyGrowth: user.dailyGrowth,
        name: 'Customers',
      });
    });

    return combinedGrowth;
  }
  async getStatisticRevenue(query: StatisticQueryDto) {
    const statistics = await this.getStatisticRevenueBetween(query);
    return DailyStatisticUtil.getDailyStatisticResponse(statistics);
  }

  async getStatisticOrders(query: StatisticQueryDto) {
    const statistics = await this.getStatisticOrdersBetween(query);
    return DailyStatisticUtil.getDailyStatisticResponse(statistics);
  }

  async getRevenueGrowth(query: StatisticQueryDto) {
    const statistics = await this.getStatisticRevenueBetween(query);
    return DailyStatisticUtil.getDailyGrowth(statistics);
  }

  async getOrderGrowth(query: StatisticQueryDto) {
    const statistics = await this.getStatisticOrdersBetween(query);
    return DailyStatisticUtil.getDailyGrowth(statistics);
  }

  async getStatisticCustomers(query: StatisticQueryDto) {
    const statistics = await this.getStatisticUsersBetween(query);
    return DailyStatisticUtil.getDailyStatisticResponse(statistics);
  }

  async getUserGrowth(query: StatisticQueryDto) {
    const statistics = await this.getStatisticUsersBetween(query);
    return DailyStatisticUtil.getDailyGrowth(statistics);
  }

  async getTrendingProducts(query: StatisticQueryDto) {
    const trendingStatistics = await this.getStatisticTrendingBetween(query);
    const trendingProducts = await Promise.all(
      trendingStatistics.map(async (stat) => {
        const productDetail = await this.prisma.productDetail.findUnique({
          where: { id: stat.product_detail_id },
        });
        return {
          ...productDetail,
          sale_count: stat.total_quantity,
        };
      }),
    );
    return trendingProducts;
  }

  private async getStatisticRevenueBetween(query: StatisticQueryDto) {
    const { start, end } = query;
    return await this.prisma.$queryRaw<Statistic[]>`
      SELECT
        extract(epoch from date_trunc('day', created_at::timestamp)) AS date,
        SUM(total_money) AS value
      FROM
        shop_order
      WHERE
        status = ${Prisma.sql`${OrderStatus.COMPLETED}`} AND
        created_at >= ${start} AND
        created_at <= ${end}
      GROUP BY
        date
      ORDER BY
        date
    `;
  }

  private async getStatisticOrdersBetween(query: StatisticQueryDto) {
    const { start, end } = query;
    return await this.prisma.$queryRaw<Statistic[]>`
      SELECT
        extract(epoch from date_trunc('day', created_at::timestamp)) AS date,
        COUNT(*) AS value
      FROM
        shop_order
      WHERE
        status = ${Prisma.sql`${OrderStatus.COMPLETED}`} AND
        created_at >= ${start} AND
        created_at <= ${end}
      GROUP BY
        date
      ORDER BY
        date
    `;
  }

  private async getStatisticUsersBetween(query: StatisticQueryDto) {
    const { start, end } = query;
    return await this.prisma.$queryRaw<Statistic[]>`
      SELECT
        extract(epoch from date_trunc('day', created_at::timestamp)) AS date,
        COUNT(*) AS value
      FROM
        shop_user
      WHERE
        deleted = false AND
        created_at >= ${start} AND
        created_at <= ${end}
      GROUP BY
        date
      ORDER BY
        date
    `;
  }

  private async getStatisticTrendingBetween(query: StatisticQueryDto) {
    const { start, end } = query;
    return await this.prisma.$queryRaw<TrendingStat[]>`
      SELECT
        pd.id AS product_detail_id,
        SUM(od.quantity) AS total_quantity
      FROM
        order_detail od
      JOIN
        product_detail pd ON od.product_detail_id = pd.id
      JOIN
        shop_order o ON od.order_id = o.id
      WHERE
        o.status = ${Prisma.sql`${OrderStatus.COMPLETED}`}
        AND o.created_at >= ${Prisma.sql`${start}`}
        AND o.created_at <= ${Prisma.sql`${end}`}
      GROUP BY
        pd.id
      ORDER BY
        total_quantity DESC
      LIMIT 5
    `;
  }
}
