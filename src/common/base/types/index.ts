export type IPaginationResponse<T> = {
  /** Mảng các items */
  data: T[];
  pageInfo: {
    /** Số item trong một trang */
    take: number;
    /** Số trang hiện tại */
    page: number;
    /** Tổng số lượng item */
    total: number;
    /** Tổng số lượng trang */
    total_page: number;
    /** Trang tiếp theo */
    next_page: number;
    /** Trang trước */
    prev_page: number;
    /** Có trang tiếp theo */
    has_next_page: boolean;
    /** Có trang trước */
    has_prev_page: boolean;
  };
};

export type IResponse<T> = {
  /** Response status code */
  status: number;
  /** Thông báo */
  message: string;
  /** Dữ liệu */
  data: T;
  /** Dữ liệu phân trang */
  pageInfo?: {
    /** Số item trong một trang */
    limit: number;
    /** Số trang hiện tại */
    page: number;
    /** Tổng số lượng item */
    total: number;
  };
};

export type CreatePageInfoParams<T> = {
  data: T[];
  total: number;
  take: number;
  skip: number;
};

export type DefaultSort = { [key: string]: 'asc' | 'desc' };
