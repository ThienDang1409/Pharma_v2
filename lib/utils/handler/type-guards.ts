import type { ImagePreview, PaginationResult } from "@/lib/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function hasKey<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isRecord(value) && key in value;
}

export function isImagePreview(value: unknown): value is ImagePreview {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.cloudinaryUrl === "string" &&
    typeof value.cloudinaryPublicId === "string"
  );
}

export function isPaginationResult<T>(value: unknown): value is PaginationResult<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    typeof value.totalPages === "number" &&
    typeof value.currentPage === "number" &&
    typeof value.total === "number"
  );
}
