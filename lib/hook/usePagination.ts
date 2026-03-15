/**
 * Pagination Hook
 * Reusable pagination logic matching backend format
 */

import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface UsePaginationReturn {
  // State
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  
  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setTotalPages: (totalPages: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  changeLimit: (newLimit: number) => void;
  reset: () => void;
  
  // Computed
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  
  // Helper to update from API response
  updateFromResponse: (response: { totalPages: number; currentPage: number; total: number }) => void;
}

/**
 * Custom hook for pagination logic
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    onPageChange,
    onLimitChange,
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Set page with callback
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  // Set limit with callback and reset to page 1
  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
    onLimitChange?.(newLimit);
  }, [onLimitChange]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  // Go to specific page
  const goToPage = useCallback((targetPage: number) => {
    const validPage = Math.max(1, Math.min(targetPage, totalPages || 1));
    setPage(validPage);
  }, [totalPages, setPage]);

  // Change limit
  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, [setLimit]);

  // Reset to initial state
  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
    setTotal(0);
    setTotalPages(0);
  }, [initialPage, initialLimit]);

  // Update from API response
  const updateFromResponse = useCallback((response: {
    totalPages: number;
    currentPage: number;
    total: number;
  }) => {
    setTotal(response.total);
    setTotalPages(response.totalPages);
    // Update page if current page is invalid
    if (response.currentPage !== page && response.currentPage >= 1 && response.currentPage <= response.totalPages) {
      setPageState(response.currentPage);
    }
  }, [page]);

  // Computed values
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrevPage = useMemo(() => page > 1, [page]);
  const startIndex = useMemo(() => (page - 1) * limit, [page, limit]);
  const endIndex = useMemo(() => Math.min(startIndex + limit, total), [startIndex, limit, total]);

  return {
    // State
    page,
    limit,
    total,
    totalPages,
    
    // Actions
    setPage,
    setLimit,
    setTotal,
    setTotalPages,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    reset,
    
    // Computed
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    
    // Helper
    updateFromResponse,
  };
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 7): (number | string)[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  // Calculate start and end of visible pages
  let start = Math.max(2, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if we're near the beginning
  if (currentPage <= halfVisible + 1) {
    end = Math.min(totalPages - 1, maxVisible - 1);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    start = Math.max(2, totalPages - maxVisible + 2);
  }

  // Add ellipsis at start if needed
  if (start > 2) {
    pages.push('...');
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis at end if needed
  if (end < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default usePagination;
