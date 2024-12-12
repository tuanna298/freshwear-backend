import { Statistic } from '../interfaces';

export class StatisticResponse {
  constructor(
    public data: Statistic[],
    public trend: number,
    public total: number,
  ) {}
}
