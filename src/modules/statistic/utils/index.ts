import { GrowthResponse } from '../dtos/growth-response.dto';
import { StatisticResponse } from '../dtos/statistic-response.dto';
import { Statistic } from '../interfaces';

export class DailyStatisticUtil {
  static getDailyStatisticResponse(statistics: Statistic[]): StatisticResponse {
    if (!statistics.length) {
      return new StatisticResponse([], 0, 0);
    }

    const initialRevenue = this.getStatisticValue(statistics, 0);
    const finalRevenue = this.getStatisticValue(
      statistics,
      statistics.length - 1,
    );

    if (initialRevenue === null || finalRevenue === null) {
      return new StatisticResponse([], 0, 0);
    }

    const growth = this.calculateGrowth(initialRevenue, finalRevenue);
    const total = this.calculateTotal(statistics);

    return new StatisticResponse(statistics, Math.round(growth), Number(total));
  }

  static getDailyGrowth(statistics: Statistic[]): (GrowthResponse | null)[] {
    const dailyGrowthList: (GrowthResponse | null)[] = [];

    for (let i = 0; i < statistics.length; i++) {
      const todayRevenue = this.getStatisticValue(statistics, i);
      const yesterdayRevenue = this.getStatisticValue(statistics, i - 1);

      if (
        todayRevenue !== null &&
        yesterdayRevenue !== null &&
        yesterdayRevenue !== 0
      ) {
        const dailyGrowth = this.calculateGrowth(
          yesterdayRevenue,
          todayRevenue,
        );
        dailyGrowthList.push(
          new GrowthResponse(statistics[i].date, Math.round(dailyGrowth)),
        );
      } else {
        dailyGrowthList.push(null);
      }
    }

    return dailyGrowthList;
  }

  private static getStatisticValue(
    statistics: Statistic[],
    index: number,
  ): number | null {
    return index >= 0 && index < statistics.length
      ? statistics[index].value
      : null;
  }

  private static calculateGrowth(initial: number, finalValue: number): number {
    return ((finalValue - initial) / initial) * 100;
  }

  private static calculateTotal(statistics: Statistic[]): number {
    return statistics.reduce((total, stat) => total + (stat.value ?? 0), 0);
  }
}
