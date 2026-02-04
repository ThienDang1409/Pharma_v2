/**
 * Loading Skeleton Components
 * Provides better UX with placeholder layouts during data loading
 * Prevents layout shift and gives visual feedback to user
 */

/**
 * News Card Skeleton - For blog/news listings
 * Matches the layout of actual NewsCard
 */
export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Featured News Card Skeleton (2-column layout)
 */
export function FeaturedNewsCardSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="h-64 md:h-full bg-gray-200"></div>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-4/5"></div>
          <div className="h-6 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 mt-4"></div>
      </div>
    </div>
  );
}

/**
 * Blog Grid Skeleton - Multiple news cards
 */
export function NewsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8">
      {[...Array(count)].map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Category Card Skeleton
 */
export function CategoryCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-4"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

/**
 * Category Grid Skeleton
 */
export function CategoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Form Field Skeleton
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

/**
 * Form Skeleton - Multiple form fields
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
      <div className="flex gap-4 pt-4">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );
}

/**
 * Image Upload Area Skeleton
 */
export function ImageUploadSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300"></div>
      <div className="h-20 bg-gray-200 rounded w-full"></div>
      <div className="h-20 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="bg-white border-b animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 animate-pulse">
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Profile Card Skeleton
 */
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b">
        <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-6 mt-6">
        {[...Array(3)].map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );
}

/**
 * Hero Section Skeleton
 */
export function HeroSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200"></div>
    </div>
  );
}

/**
 * Mini Loading Spinner (for buttons, inline operations)
 */
export function MiniLoadingSpinner({ text = "" }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary-600"></div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * Page Loading Spinner (full screen)
 */
export function PageLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
}
