import type { PaginationResult } from '../utils/pagination.js';

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
  pagination?: PaginationResult;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    traceId?: string;
  };
};

export function success<T>(data: T, message = 'Operacao realizada com sucesso', pagination?: PaginationResult): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    ...(pagination ? { pagination } : {})
  };
}

export function failure(code: string, message: string, details?: unknown, traceId?: string): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(traceId ? { traceId } : {})
    }
  };
}
