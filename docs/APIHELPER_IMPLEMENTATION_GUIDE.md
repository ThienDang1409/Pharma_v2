# API Helper Integration: Step-by-Step Implementation

## 🎯 Integration Strategy

You currently have **two options** for implementation:

---

## Option A: Clean Slate (Replace Current)
**Risk:** Medium | **Effort:** 2 hours | **Result:** Cleanest code

### Step 1: Backup Current
```bash
# Rename current apiHelper for reference
cp lib/utils/apiHelper.ts lib/utils/apiHelper.backup.ts
```

### Step 2: Replace with New
```bash
# Replace with simplified version
cp lib/utils/apiHelper-simplified.ts lib/utils/apiHelper.ts
```

### Step 3: Update All Components
```bash
# Find all components using old patterns
grep -r "validateAndCall\|silentApiCall\|handleFormSubmit" app/
```

### Step 4: Migrate Each Component
(See examples below)

### Step 5: Remove Backup
```bash
rm lib/utils/apiHelper.backup.ts
```

---

## Option B: Gradual Migration (Recommended ✅)
**Risk:** Low | **Effort:** 3 hours | **Result:** Safe transition

### Step 1: Add New Functions to Current File
```typescript
// lib/utils/apiHelper.ts

// ==================== NEW SIMPLIFIED PATTERNS ====================

// Pattern 1: Form Submission
export async function apiSubmit<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  data: unknown,
  apiFunction: (validatedData: TInput) => Promise<TOutput>,
  options?: { /* ... */ }
) { /* ... */ }

// Pattern 2: Data Fetching  
export async function apiFetch<T>(
  apiFunction: () => Promise<T>,
  options?: { /* ... */ }
) { /* ... */ }

// Pattern 3: Batch Operations
export async function apiMultiple<T>(
  operations: Array<() => Promise<T>>,
  options?: { /* ... */ }
) { /* ... */ }

// ==================== LEGACY (Keep for now) ====================

// Old functions stay as-is for backward compatibility
export async function validateAndCall() { /* ... */ }
export async function apiCall() { /* ... */ }
export async function silentApiCall() { /* ... */ }
// etc.
```

### Step 2: Update Components As You Work
- When you touch a component, update it
- No rush to migrate all at once
- Old functions still available

### Step 3: Track Migration
```
□ Profile page
□ Change password page  
□ Admin blog pages
□ Admin category pages
□ Admin image pages
□ Admin user pages
□ Public search page
□ Public blog page
```

### Step 4: Remove Old Functions (Final Step)
Once all components migrated, remove old functions.

---

## 📝 Migration Examples

### Example 1: Update Profile Page

#### BEFORE (Current)
```tsx
// app/profile/page.tsx
import { validateAndCall } from "@/lib/utils/apiHelper";
import { UpdateProfileSchema } from "@/lib/validators";
import { useToast } from "@/app/context/ToastContext";

export default function ProfilePage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await validateAndCall(
      UpdateProfileSchema,
      { name: formData.name, phone: formData.phone, address: formData.avatar },
      (validatedData) => updateProfile(formData),
      {
        toast: addToast,
        successMessage: "Cập nhật thành công!",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => { setIsEditing(false); }
      }
    );

    setIsLoading(false);
  };
}
```

#### AFTER (Simplified)
```tsx
// app/profile/page.tsx
import { apiSubmit } from "@/lib/utils/apiHelper";  // ← Import new function
import { UpdateProfileSchema } from "@/lib/validators";
import { useToast } from "@/app/context/ToastContext";

export default function ProfilePage() {
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ← No manual setIsLoading needed
    const result = await apiSubmit(
      UpdateProfileSchema,
      { name: formData.name, phone: formData.phone, address: formData.avatar },
      (validatedData) => updateProfile(formData),
      {
        toast: addToast,
        messages: { success: "Cập nhật thành công!" },  // ← Simpler config
        onSuccess: () => setIsEditing(false)
      }
    );
  };
}
```

**Changes:**
- ✅ Replace `validateAndCall` with `apiSubmit`
- ✅ Change `successMessage + showSuccessToast` to `messages: { success: "..." }`
- ✅ Remove `setIsLoading` (not needed)
- ✅ Remove `showErrorToast: true` (auto)

---

### Example 2: Load Categories on Admin Page

#### BEFORE (Current)
```tsx
// app/admin/blogs/add/page.tsx
import { silentApiCall } from "@/lib/utils/apiHelper";

function AdminAddNewsPageContent() {
  const [categories, setCategories] = useState<Information[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await silentApiCall(
        () => informationApi.getAll(),
        {
          onSuccess: (response) => {
            const data = response?.data?.items || [];
            setCategories(Array.isArray(data) ? data : []);
          },
          logErrors: true
        }
      );
    };
    
    fetchCategories();
  }, []);

  return (/* ... */);
}
```

#### AFTER (Simplified)
```tsx
// app/admin/blogs/add/page.tsx
import { apiFetch } from "@/lib/utils/apiHelper";  // ← Import new function

function AdminAddNewsPageContent() {
  const [categories, setCategories] = useState<Information[]>([]);

  useEffect(() => {
    // ← No async wrapper needed
    apiFetch(
      () => informationApi.getAll(),
      { onSuccess: setCategories }  // ← Direct setState
    );
  }, []);

  return (/* ... */);
}
```

**Changes:**
- ✅ Replace `silentApiCall` with `apiFetch`
- ✅ No async wrapper needed
- ✅ Auto-extract response.data
- ✅ Direct `onSuccess: setCategories`

---

### Example 3: Bulk Delete Items

#### BEFORE (Current)
```tsx
// app/admin/categories/page.tsx
import { validateAndCall } from "@/lib/utils/apiHelper";

export default function CategoriesPage() {
  const handleBulkDelete = async () => {
    const { addToast } = useToast();
    
    for (const id of selectedIds) {
      const result = await validateAndCall(
        IdSchema,
        { id },
        (data) => categoryApi.delete(data.id),
        {
          toast: addToast,
          showSuccessToast: false,  // Don't show per item
          showErrorToast: true,
          onSuccess: () => {
            // Refetch after each delete
          }
        }
      );
      
      if (!result.success) {
        console.error('Delete failed:', result.error);
        break;
      }
    }
    
    router.refresh();
  };
}
```

#### AFTER (Simplified)
```tsx
// app/admin/categories/page.tsx
import { apiMultiple } from "@/lib/utils/apiHelper";  // ← Import new function

export default function CategoriesPage() {
  const handleBulkDelete = async () => {
    const { addToast } = useToast();
    
    // ← Single call for all items
    const { results, hasErrors } = await apiMultiple(
      selectedIds.map(id => () => categoryApi.delete(id)),
      {
        toast: addToast,
        stopOnError: false,  // Try all, don't stop
        onAllSuccess: () => router.refresh()  // ← Refetch once
      }
    );
  };
}
```

**Changes:**
- ✅ Replace loop of `validateAndCall` with `apiMultiple`
- ✅ No schema validation needed (just IDs)
- ✅ Single toast for all operations
- ✅ Single refetch at end

---

## 🔍 Find & Replace Patterns

### Find: validateAndCall
```bash
# Identify all uses
grep -r "validateAndCall" app/

# In files:
# app/profile/page.tsx
# app/profile/change-password/page.tsx
# app/admin/**/*.tsx (likely)
```

**Replace with:**
- `apiSubmit()` if form/action validation needed
- Leave as-is if working fine

---

### Find: silentApiCall (for data loading)
```bash
# Identify all uses
grep -r "silentApiCall" app/
```

**Replace with:**
- `apiFetch()` for loading data
- Often used in `useEffect`

---

### Find: Loops with API calls
```bash
# Look for patterns
grep -r "for.*await\|forEach.*await" app/
```

**Replace with:**
- `apiMultiple()` for batch operations
- Single toast, better performance

---

## ✅ Migration Checklist Per Component

For each component needing update:

- [ ] Identify usage pattern (form, fetch, batch?)
- [ ] Choose new function (`apiSubmit`, `apiFetch`, `apiMultiple`)
- [ ] Update imports
- [ ] Remove old function call
- [ ] Add new function call with simpler options
- [ ] Test success flow
- [ ] Test error flow
- [ ] Verify toast messages
- [ ] Check TypeScript types
- [ ] Commit changes

---

## 🧪 Testing After Migration

### For apiSubmit():
```typescript
// Test success
const result = await apiSubmit(Schema, validData, api.update, {
  toast: addToast,
  messages: { success: 'OK' },
  onSuccess: (data) => console.log('Success:', data)
});
// ✅ Toast shows success message
// ✅ onSuccess callback runs
// ✅ result.success === true

// Test validation error
const result = await apiSubmit(Schema, invalidData, api.update, {
  toast: addToast
});
// ✅ Toast shows validation error
// ✅ result.success === false
// ✅ result.error contains message

// Test API error
const result = await apiSubmit(Schema, data, failingApi, {
  toast: addToast
});
// ✅ Toast shows error from error-handler
// ✅ result.success === false
// ✅ result.error contains message
```

### For apiFetch():
```typescript
// Test success
const data = await apiFetch(() => api.getList(), {
  onSuccess: (d) => console.log('Loaded:', d)
});
// ✅ onSuccess runs
// ✅ data is not null
// ✅ No toast shown

// Test error
const data = await apiFetch(() => failingApi());
// ✅ No toast shown
// ✅ data === null
// ✅ console.error has error message
```

### For apiMultiple():
```typescript
// Test all success
const { results, hasErrors } = await apiMultiple(
  [() => api.a(), () => api.b(), () => api.c()],
  {
    toast: addToast,
    onAllSuccess: () => console.log('All done')
  }
);
// ✅ results has 3 items
// ✅ hasErrors === false
// ✅ Toast shows success
// ✅ onAllSuccess runs

// Test partial error
const { results, hasErrors } = await apiMultiple(
  [() => api.a(), () => failingApi(), () => api.c()],
  { toast: addToast, stopOnError: false }
);
// ✅ results has 3 items (middle is null)
// ✅ hasErrors === true
// ✅ Toast shows error
// ✅ All three were attempted
```

---

## 📊 Priority Order for Migration

Recommended order:

### Phase 1: Easy Pages (30 min)
- [ ] Profile page
- [ ] Change password page
- [ ] Contact form

### Phase 2: Admin List Pages (60 min)
- [ ] Blog list → add/edit/delete
- [ ] Category list → add/edit/delete
- [ ] User list → edit/delete
- [ ] Image list

### Phase 3: Complex Pages (30 min)
- [ ] Blog create with multiple sections
- [ ] Bulk operations
- [ ] Multi-step forms

**Total: ~2 hours for full migration**

---

## 🐛 Troubleshooting

### Problem: TypeScript error - "Unknown function apiSubmit"

**Solution:** Ensure new functions are exported from apiHelper.ts
```typescript
export async function apiSubmit<TInput, TOutput>(...) { }
```

---

### Problem: Toast shows twice

**Solution:** You probably have both message and onError showing toast
```typescript
// WRONG
await apiSubmit(..., {
  messages: { error: 'Failed' },
  toast: addToast,
  onError: (err) => addToast('error', err)
});

// RIGHT
await apiSubmit(..., {
  messages: { error: 'Failed' },
  toast: addToast,
  onError: (err) => console.error(err)  // No toast here
});
```

---

### Problem: Data is null after apiFetch

**Solution:** Check if API returned data or it failed
```typescript
// WRONG
const data = await apiFetch(...);
console.log(data.items);  // Could crash if null!

// RIGHT
const data = await apiFetch(...);
if (data) {
  console.log(data.items);
} else {
  console.log('Failed to load');
}
```

---

### Problem: Multiple API calls in apiMultiple fail silently

**Solution:** Check results array for null values
```typescript
const { results, hasErrors } = await apiMultiple(operations, {...});

results.forEach((result, i) => {
  if (!result) {
    console.log(`Operation ${i} failed`);
  } else {
    console.log(`Operation ${i} succeeded:`, result);
  }
});
```

---

## 🎓 Tips for Smooth Migration

1. **One component at a time**
   - Don't try to convert everything at once
   - Test each change

2. **Keep old apiHelper.backup.ts handy**
   - Reference if you forget syntax
   - Easy rollback if needed

3. **Use TypeScript**
   - IDE will help with migration
   - Types guide correct usage

4. **Reference the docs**
   - Keep APIHELPER_QUICK_REFERENCE.md open
   - Check examples in API_HELPER_USAGE_GUIDE.md

5. **Test both paths**
   - Test success (happy path)
   - Test error (sad path)

---

## 📞 Quick Help

**Stuck? Check:**

1. **"Which function do I use?"**
   → APIHELPER_QUICK_REFERENCE.md - Decision tree

2. **"How do I use apiSubmit()?"**
   → API_HELPER_USAGE_GUIDE.md - Example 1

3. **"What about error handling?"**
   → APIHELPER_QUICK_REFERENCE.md - Error handling section

4. **"Is this the right change?"**
   → APIHELPER_BEFORE_AFTER.md - Similar scenarios

---

## ✨ Success Criteria

Migration complete when:

✅ All `validateAndCall()` replaced with `apiSubmit()`
✅ All `silentApiCall()` replaced with `apiFetch()`
✅ All `for` loops with API calls replaced with `apiMultiple()`
✅ All forms have simplified options
✅ All data loading in `useEffect`
✅ All tests pass
✅ No TypeScript errors
✅ Bundle size reduced

---

**Ready to start? Pick Option A or B above and let's go! 🚀**
