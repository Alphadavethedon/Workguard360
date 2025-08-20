export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const generatePagination = (
  total: number,
  page: number,
  limit: number
): PaginationResult => {
  const pages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};