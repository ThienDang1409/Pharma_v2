export type DateInput = string | Date | null | undefined;
export type DateDisplayFormat = "short" | "long" | "full";

export function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidDate(value: DateInput): boolean {
  return toDate(value) !== null;
}

export function formatDateIntl(
  value: DateInput,
  locale = "vi-VN",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, options);
}

export function formatDate(
  value: DateInput,
  format: DateDisplayFormat = "short",
  locale = "vi-VN"
): string {
  const date = toDate(value);
  if (!date) return "Invalid date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  if (format === "short") {
    return `${day}/${month}/${year}`;
  }

  if (format === "long") {
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  return `${weekday}, ${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateLong(value: DateInput, locale = "en-US"): string {
  return formatDateIntl(value, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeTime(value: DateInput, locale = "vi-VN"): string {
  const date = toDate(value);
  if (!date) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return locale === "vi-VN" ? "Vua xong" : "Just now";
  if (diffMins < 60) return `${diffMins} ${locale === "vi-VN" ? "phut truoc" : "minutes ago"}`;
  if (diffHours < 24) return `${diffHours} ${locale === "vi-VN" ? "gio truoc" : "hours ago"}`;
  if (diffDays < 7) return `${diffDays} ${locale === "vi-VN" ? "ngay truoc" : "days ago"}`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${locale === "vi-VN" ? "tuan truoc" : "weeks ago"}`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${locale === "vi-VN" ? "thang truoc" : "months ago"}`;
  return `${Math.floor(diffDays / 365)} ${locale === "vi-VN" ? "nam truoc" : "years ago"}`;
}

export function fromNow(value: DateInput, locale = "vi-VN"): string {
  const date = toDate(value);
  if (!date) return "";

  const diffMs = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes}m`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}h`;
  }

  const days = Math.floor(diffMs / day);
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-days, "day");
}

export function formatCurrency(
  amount: number,
  currency: "VND" | "USD" = "VND"
): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getReadingTime(text: string, wpm: number = 200): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wpm);
  return `${minutes} phút đọc`;
}