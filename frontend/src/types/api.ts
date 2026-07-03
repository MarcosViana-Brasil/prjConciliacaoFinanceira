export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
  pagination?: Pagination;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    traceId?: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type ListResult<T> = {
  data: T[];
  pagination?: Pagination;
};
