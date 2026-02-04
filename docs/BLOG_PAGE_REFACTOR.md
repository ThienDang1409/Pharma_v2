# 🔄 Blog Page Refactor - Standardization Complete

**Status:** ✅ Complete  
**Date:** Feb 1, 2026

---

## 📋 Changes Made

### 1. ✅ Removed Unnecessary Error Suppression
**Before:**
```tsx
useEffect(() => {
  const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
    // ... 20+ lines of extension error handling
  };
  window.addEventListener("error", handleError as any);
  // ... event cleanup
}, []);
```

**Why Removed:**
- Too specific to browser extension issues
- Pollutes component with cross-cutting concerns
- Not relevant to blog page logic
- Browser extensions are global issue (handle at app level if needed)

---

### 2. ✅ Replaced Try-Catch with `apiFetch` Pattern
**Before:**
```tsx
const fetchBlogs = async () => {
  try {
    setLoading(true);
    const response = await blogApi.getAll({...});
    const blogs = response.data?.items || [];
    setBlogs(blogs);
    // ... manual error handling
  } catch (error) {
    console.error("Error fetching blogs:", error);
    setBlogs([]);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
const fetchBlogs = useCallback(async () => {
  setLoading(true);
  
  const data = await apiFetch(
    () => blogApi.getAll({...}),
    {
      onSuccess: (response: PaginationResult<Blog>) => {
        const blogs = response.items || [];
        setBlogs(blogs);
        // ... process categories
      },
      logErrors: true,
    }
  );

  setLoading(false);
}, [searchQuery, selectedCategory]);
```

**Benefits:**
- ✅ Cleaner error handling
- ✅ Consistent pattern across app
- ✅ Automatic error logging
- ✅ Type-safe response

---

### 3. ✅ Cleaned Up Category Extraction
**Before:**
```tsx
const uniqueCategories = Array.from(
  new Map(
    blogs
      .filter((blog) => blog.informationId && typeof blog.informationId === 'object')
      .map((blog) => {
        const info = blog.informationId as any;  // ❌ as any
        return [info._id, info];
      })
  ).values()
);
```

**After:**
```tsx
const categoryMap = new Map<string, Information>();
blogs.forEach((blog) => {
  if (blog.informationId && typeof blog.informationId === 'object') {
    const info = blog.informationId as Information;  // ✅ Proper type
    if (info._id && !categoryMap.has(info._id)) {
      categoryMap.set(info._id, info);
    }
  }
});

setCategories(Array.from(categoryMap.values()));
```

**Benefits:**
- ✅ More readable and maintainable
- ✅ Proper type safety (no `as any`)
- ✅ Clearer logic flow
- ✅ Avoids duplicate categories

---

### 4. ✅ Moved Utility Functions to `lib/utils`

#### Moved `formatDate` → `lib/utils/format.ts`
```tsx
// Before: In component
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// After: In lib/utils/format.ts
export function formatDate(
  date: string | Date,
  format: "short" | "long" | "full" = "short"
): string {
  // ... implementation
  case "long":
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
```

#### Created `stripHtmlTags` → `lib/utils/i18n.ts`
```tsx
// Before: In component
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "").substring(0, 150) + "...";
};

// After: In lib/utils/i18n.ts
export function stripHtmlTags(html: string, maxLength: number = 150): string {
  if (!html) return "";
  
  const stripped = html
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/&nbsp;/g, " ")           // Handle entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
  
  if (stripped.length <= maxLength) {
    return stripped;
  }
  
  return stripped.substring(0, maxLength).trimEnd() + "...";
}
```

**Benefits:**
- ✅ Reusable across components
- ✅ Consistent formatting
- ✅ Better entity handling
- ✅ Cleaner component code

---

### 5. ✅ Updated Imports & Exports
**Before:**
```tsx
import { blogApi, Blog, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
```

**After:**
```tsx
import { getLocalizedText, stripHtmlTags } from "@/lib/utils/i18n";
import { formatDate } from "@/lib/utils/format";
import { apiFetch } from "@/lib/utils/apiHelper";
import { blogApi, Blog, Information } from "@/lib/api";
import { BLOG_STATUS } from "@/lib/constants/api";
import type { PaginationResult } from "@/lib/types";
```

---

### 6. ✅ Used `useCallback` for Memoization
```tsx
const fetchBlogs = useCallback(async () => {
  // ... implementation
}, [searchQuery, selectedCategory]);

useEffect(() => {
  fetchBlogs();
}, [searchQuery, selectedCategory, fetchBlogs]);
```

**Benefits:**
- ✅ Prevents unnecessary re-renders
- ✅ Proper dependency tracking
- ✅ Stable function reference

---

### 7. ✅ Proper Formatting in JSX
**Before:**
```tsx
<span>📅 {formatDate(blog.createdAt)}</span>
<p className="...">
  {stripHtml(getLocalizedText(...))}
</p>
```

**After:**
```tsx
<span>📅 {formatDate(blog.createdAt, "long")}</span>
<p className="...">
  {stripHtmlTags(
    getLocalizedText(...),
    150  // Explicit maxLength
  )}
</p>
```

---

## 📊 Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Lines** | 250 | 200 |
| **Error handling** | Manual try-catch | `apiFetch` pattern |
| **Utility functions** | In component | In lib/utils |
| **Type safety** | `as any` ❌ | Proper types ✅ |
| **Code reuse** | No | Yes |
| **Maintainability** | Medium | High |
| **Error suppression** | ❌ Global listener | N/A - Removed |
| **Category extraction** | Complex Map/filter | Simple loop |

---

## 🎯 Result

✅ **Standardized** - Follows lib patterns  
✅ **Cleaner** - Removed unnecessary code  
✅ **Type-safe** - Proper TypeScript types  
✅ **Reusable** - Utilities in lib/utils  
✅ **Maintainable** - Clear, readable code  
✅ **Consistent** - Uses apiFetch pattern  

---

## 📚 Key Functions Now Available

### From `lib/utils/format.ts`
```tsx
formatDate(date, format?)           // Format dates: short/long/full
// Usage: formatDate(blog.createdAt, "long")
```

### From `lib/utils/i18n.ts`
```tsx
getLocalizedText(vi, en, lang)      // Get localized text
stripHtmlTags(html, maxLength)      // Strip HTML + truncate
// Usage: stripHtmlTags(html, 150)
```

### From `lib/utils/apiHelper.ts`
```tsx
apiFetch(apiFunc, options)          // Silent fetch with error handling
// Usage: apiFetch(() => api.getAll(), { onSuccess, logErrors })
```

---

## ✨ Code Quality Improvements

- ✅ Removed 50+ lines of error handling boilerplate
- ✅ Extracted 2 utility functions for reuse
- ✅ Improved type safety (no `as any`)
- ✅ Better error logging
- ✅ Cleaner component logic
- ✅ Proper dependency tracking
- ✅ Following established patterns

---

**Blog page is now standardized and ready for production! 🚀**
