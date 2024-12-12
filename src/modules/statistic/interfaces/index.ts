export interface Statistic {
  date: number;
  value: number | null;
}

export interface TrendingStat {
  product_detail_id: string;
  total_quantity: number;
}
