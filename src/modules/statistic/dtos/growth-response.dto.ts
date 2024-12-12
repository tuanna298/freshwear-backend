export class GrowthResponse {
  constructor(
    public date: number,
    public dailyGrowth: number,
    public name?: string,
  ) {}
}
