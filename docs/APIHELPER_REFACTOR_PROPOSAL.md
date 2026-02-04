# API Helper Refactor Proposal - Simplification Strategy

## Current Situation
`apiHelper.ts` has 331 lines with multiple functions that overlap in functionality:
- `apiCall()` - base API wrapper with toast/callbacks
- `validateAndCall()` - validation + API + toast
- `silentApiCall()` - no toast, just logging
- `fetchWithValidation()` - response validation
- `handleFormSubmit()` - form-specific wrapper
- Plus: `getZodErrors()`, `isZodError()`, `isPaginationResult()`, `safeValidate()`, `validateWithSchema()`

## Your Insight (Correct!)
1. Error handling is **already defined** in `error-handler.ts` ✅
2. Validation is **already defined in FE** (i18n.validator.ts) ✅
3. apiHelper should **just coordinate** validation → API → toast ✅

## Proposed Simplified Patterns

### Current Flow (Complex)
```tsx
// Profile page - 15 lines
const result = await validateAndCall(
  UpdateProfileSchema,
  { name, phone, address },
  (validatedData) => updateProfile(formData),
  {
    toast: addToast,
    successMessage: "...",
    showSuccessToast: true,
    showErrorToast: true,
    onSuccess: () => { setIsEditing(false); }
  }
);
```

### Proposed Simplified Flow

#### **Pattern 1: Simple Form Submit** (95% of use cases)
```tsx
// SIMPLEST - Only 8 lines!
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const result = await apiSubmit(UpdateProfileSchema, formData, 
    () => updateProfile(formData),
    { toast: addToast }
  );
  
  if (result.success) setIsEditing(false);
};
```

#### **Pattern 2: Data Fetch** (Silent, no toast)
```tsx
// 5 lines
const [categories, setCategories] = useState([]);

useEffect(() => {
  apiFetch(informationApi.getAll(), { onSuccess: setCategories });
}, []);
```

#### **Pattern 3: Complex Form** (With custom messages)
```tsx
// 10 lines
const result = await apiSubmit(CreateBlogSchema, formData,
  () => blogApi.create(formData),
  {
    toast: addToast,
    onSuccess: () => router.push('/admin/blogs'),
    messages: {
      success: t('blog.created'),
      error: t('common.error')
    }
  }
);
```

---

## New Simplified apiHelper.ts Design

### Keep These (Only 3 core functions):

```typescript
// 1. Core form submission pattern
export async function apiSubmit<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  data: unknown,
  apiFunction: (validatedData: TInput) => Promise<TOutput>,
  options?: {
    toast?: ToastCallback;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    messages?: {
      success?: string;
      error?: string;
    };
  }
): Promise<{ success: true; data: TOutput } | { success: false; error: string }>
```

**Features:**
- ✅ Validates data first
- ✅ Shows success toast (with custom message)
- ✅ Shows error toast (auto from error-handler)
- ✅ Calls onSuccess/onError callbacks
- ✅ Returns result for conditional logic

**Usage:**
```tsx
const result = await apiSubmit(Schema, data, apiCall, { toast, onSuccess });
if (result.success) { /* do something */ }
```

---

```typescript
// 2. Silent data fetch pattern
export async function apiFetch<T>(
  apiFunction: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): Promise<T | null>
```

**Features:**
- ✅ No toast notifications
- ✅ Only console logs errors
- ✅ Auto-extracts data from API response
- ✅ Returns data directly (or null on error)

**Usage:**
```tsx
const categories = await apiFetch(informationApi.getAll(), { onSuccess });
```

---

```typescript
// 3. Batch operations pattern
export async function apiMultiple<T>(
  operations: Array<() => Promise<T>>,
  options?: {
    toast?: ToastCallback;
    stopOnError?: boolean;
    onAllSuccess?: () => void;
    onAnyError?: (error: string, index: number) => void;
  }
): Promise<{ results: (T | null)[]; hasErrors: boolean }>
```

**Features:**
- ✅ Execute multiple API calls
- ✅ Option to stop on first error
- ✅ Single toast for all successes
- ✅ Returns all results + error flag

**Usage:**
```tsx
const { results, hasErrors } = await apiMultiple(
  [
    () => api.update1(data1),
    () => api.update2(data2),
    () => api.delete1(id1),
  ],
  { toast: addToast, stopOnError: true }
);
```

---

### Delete These (Already in error-handler or not needed):
- ❌ `apiCall()` - Replaced by `apiSubmit()` with clearer name
- ❌ `validateAndCall()` - Merged into `apiSubmit()`
- ❌ `handleFormSubmit()` - Rarely used, pattern is clear with `apiSubmit()`
- ❌ `fetchWithValidation()` - Use Zod in response parsing instead
- ❌ `getZodErrors()` - Not needed in new pattern (validation fails once)
- ❌ `isZodError()` - Internal only
- ❌ `safeValidate()` - Internal only
- ❌ `validateWithSchema()` - Duplicate
- ❌ `isPaginationResult()` - Use TypeScript types instead
- ❌ `normalizeToast()` - Internal helper

---

## Migration Path

### Step 1: Keep Current + Add New (No Breaking Changes)
```typescript
// Old functions still work
export async function apiCall() { /* ... */ }
export async function validateAndCall() { /* ... */ }

// New simplified functions
export async function apiSubmit() { /* ... */ }
export async function apiFetch() { /* ... */ }
export async function apiMultiple() { /* ... */ }
```

### Step 2: Gradually Update Components
```
Profile page       → uses apiSubmit() ✓
Change password    → uses apiSubmit() ✓
Blog add/edit      → uses apiSubmit() + apiFetch() ✓
Category fetch     → uses apiFetch() ✓
Batch delete       → uses apiMultiple() ✓
```

### Step 3: Remove Old Functions (After all components migrated)
- Delete old `apiCall()`, `validateAndCall()`, etc.
- Keep only: `apiSubmit()`, `apiFetch()`, `apiMultiple()`

---

## Size Reduction

**Current:** 331 lines  
**New:** ~150 lines (55% reduction)

### Current Structure:
- 10+ exported functions
- Complex options with overlapping features
- Callbacks mixing errors

### New Structure:
- 3 core exported functions
- Clear separation: form submit vs data fetch vs batch
- Simple, single-purpose options

---

## Benefits

1. **Simpler to understand** - 3 functions instead of 10+
2. **Easier to use** - Pattern is obvious from function name
3. **Less duplication** - No overlapping functionality
4. **Scales better** - Easy to add new patterns (form reset, retry, etc.)
5. **Better naming** - `apiSubmit` vs `validateAndCall` is clearer
6. **Easier to maintain** - Less code to test and debug

---

## Side-by-Side Comparison

### Before (Current)
```tsx
const result = await validateAndCall(
  UpdateProfileSchema,
  { name, phone, address },
  (validatedData) => updateProfile(formData),
  {
    toast: addToast,
    successMessage: "Cập nhật thành công",
    showSuccessToast: true,
    showErrorToast: true,
    onSuccess: () => { setIsEditing(false); },
  }
);
```

### After (Proposed)
```tsx
const result = await apiSubmit(UpdateProfileSchema, formData,
  () => updateProfile(formData),
  { toast: addToast, onSuccess: () => setIsEditing(false) }
);
```

**Reduction: 15 lines → 3 lines** ✅

---

## Implementation Strategy

### Recommendation:
1. ✅ Create new simplified `apiHelper.ts` with `apiSubmit()`, `apiFetch()`, `apiMultiple()`
2. ✅ Keep old functions in parallel (export both)
3. ✅ Update docs with new patterns
4. ✅ Gradually migrate components (as they're touched)
5. ✅ Remove old functions in next major version

This way: **Zero breaking changes** + **gradual improvement**

---

## Questions for You

1. Should `apiSubmit()` auto-show success toast by default?
   - Current: `showSuccessToast: true` explicitly
   - Proposed: Default true, can pass `messages: { success: null }` to disable

2. Should success message be optional?
   - Proposed: If not provided, shows nothing (user sets custom)
   - Current: `successMessage` required

3. For `apiFetch()`, should it extract response.data automatically?
   - Proposed: Yes, like current behavior
   - This assumes API response structure: `{ data: T, message?: string }`
