export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationResult = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function normalizePagination(input: PaginationInput) {
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

export function buildPagination(page: number, limit: number, total: number): PaginationResult {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}
