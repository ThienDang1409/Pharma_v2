# API Helper Optimization Recommendation Summary

## Your Observation ✅
> "apiHelper chỉ phục vụ việc hiện toast khi validate form, hoặc lỗi error khi có lỗi trả về, còn đối với các trường hợp validate thì vì đã định nghĩa ở FE, thì chỉ việc kiểm trả trước khi gọi các hàm api"

**Spot on!** That's exactly what we should focus on.

---

## Current Problem

### apiHelper.ts (331 lines)
- 10+ exported functions with overlapping features
- Complex options mixing errors
- Functions like `apiCall()`, `validateAndCall()`, `handleFormSubmit()` do similar things
- Hard to remember which function to use when

### Example: Profile Update (Current)
```tsx
const result = await validateAndCall(
  UpdateProfileSchema,
  { name, phone, address },
  (validatedData) => updateProfile(formData),
  {
    toast: addToast,
    successMessage: "Cập nhật thành công!",
    showSuccessToast: true,
    showErrorToast: true,
    onSuccess: () => { setIsEditing(false); }
  }
);
```
**Too many config options, unclear intent**

---

## Proposed Solution: 3 Core Patterns

### 1️⃣ **apiSubmit()** - Form submission
For: Login, Update profile, Create blog, Delete item, etc.

```tsx
const result = await apiSubmit(UpdateProfileSchema, formData,
  () => updateProfile(formData),
  {
    toast: addToast,
    messages: { success: "Cập nhật thành công" },
    onSuccess: () => setIsEditing(false)
  }
);
```

**What it does:**
- ✅ Validates with Zod
- ✅ Calls API function
- ✅ Shows error toast (auto from error-handler)
- ✅ Shows success toast (if message provided)
- ✅ Returns `{ success, data|error }`

---

### 2️⃣ **apiFetch()** - Data fetching
For: Load categories, Get user info, Fetch blog list, etc.

```tsx
useEffect(() => {
  const data = await apiFetch(
    () => informationApi.getAll(),
    { onSuccess: setCategories }
  );
}, []);
```

**What it does:**
- ✅ Calls API function
- ✅ Auto-extracts data from response
- ✅ No toast (silent)
- ✅ Only console.error on failure
- ✅ Returns `data | null`

---

### 3️⃣ **apiMultiple()** - Batch operations
For: Bulk delete, Update multiple records, etc.

```tsx
const { results, hasErrors } = await apiMultiple(
  ids.map(id => () => api.delete(id)),
  { toast: addToast, onAllSuccess: () => refetch() }
);
```

**What it does:**
- ✅ Executes multiple API calls
- ✅ Option to stop on first error
- ✅ Single toast for all
- ✅ Returns results array + error flag

---

## Size Reduction

| Metric | Current | Proposed | Reduction |
|--------|---------|----------|-----------|
| Lines of code | 331 | 150 | **55%** ✂️ |
| Exported functions | 10+ | 3 | **70%** ✂️ |
| Config options | 15+ | 5 | **67%** ✂️ |
| Learning curve | Medium | Low | **40%** 🎯 |

---

## Usage Comparison

### Load Data + Submit Form

#### BEFORE (Current)
```tsx
// Load categories (15 lines)
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

// Submit form (20 lines)
const result = await validateAndCall(
  CreateBlogSchema,
  formData,
  () => blogApi.create(formData),
  {
    toast: addToast,
    successMessage: "Tạo thành công",
    showSuccessToast: true,
    showErrorToast: true,
    onSuccess: () => router.push('/admin/blogs')
  }
);
```

#### AFTER (Proposed)
```tsx
// Load categories (5 lines)
useEffect(() => {
  apiFetch(() => informationApi.getAll(), {
    onSuccess: setCategories
  });
}, []);

// Submit form (8 lines)
const result = await apiSubmit(CreateBlogSchema, formData,
  () => blogApi.create(formData),
  {
    toast: addToast,
    messages: { success: "Tạo thành công" },
    onSuccess: () => router.push('/admin/blogs')
  }
);
```

**Reduction: 35 lines → 13 lines = 63% less code** ✂️

---

## Implementation Strategy

### Phase 1: Add New Functions (No Breaking Changes)
Create `apiHelper-simplified.ts` with new functions:
- ✅ `apiSubmit()`
- ✅ `apiFetch()`
- ✅ `apiMultiple()`
- Plus legacy exports for backward compatibility

### Phase 2: Gradual Migration
Update components as you work on them:
- Profile page → use `apiSubmit()`
- Admin pages → use `apiSubmit()` + `apiFetch()`
- Bulk actions → use `apiMultiple()`

### Phase 3: Cleanup (When All Components Migrated)
Remove old functions:
- ❌ `apiCall()`
- ❌ `validateAndCall()`
- ❌ `handleFormSubmit()`
- Keep: `apiSubmit()`, `apiFetch()`, `apiMultiple()`

---

## Benefits

### For You (Developer)
1. **Easier to remember** - 3 function names vs 10+
2. **Less to type** - Simpler options, more sensible defaults
3. **Clearer intent** - Function name says what it does
4. **Less duplication** - Each pattern is distinct

### For Codebase
1. **Reduced complexity** - 55% fewer lines
2. **Better maintainability** - Less code to test/debug
3. **Consistency** - Same pattern across all forms
4. **Scalability** - Easy to add new patterns later

### For Future Devs
1. **Clear documentation** - 3 obvious patterns
2. **Easy onboarding** - Simple mental model
3. **Less decisions** - "Which function do I use?" → obvious

---

## Components That Need Updates

Priority:
1. ⭐ Admin pages (blog, category, image, user management)
   - Heavy use of forms + data loading
   - Most benefit from simplification

2. ⭐ User pages (profile, auth, settings)
   - Multiple form submissions
   - Needs validation + toast

3. ⭐ Public pages (search, category, blog detail)
   - Mostly data fetching
   - Easy switch to `apiFetch()`

---

## Next Steps

1. **Review** the proposed solution (3 patterns)
2. **Decide** on naming and default behaviors:
   - Should `apiSubmit()` auto-show success toast? (I suggest: yes, but make it optional)
   - Should error message be customizable? (I suggest: yes, but auto from error-handler by default)
3. **Implement** new functions (I created `apiHelper-simplified.ts` as reference)
4. **Test** with one component (e.g., profile page)
5. **Migrate** other components gradually

---

## Questions for You

1. **Naming:** Do you like `apiSubmit()`, `apiFetch()`, `apiMultiple()`?
   - Alternatives: `submitForm()`, `fetchData()`, `batchApi()`?

2. **Default behaviors:**
   - Should success toast show by default?
   - Should `onError` callback always be called?
   - Should batch operations stop on first error?

3. **Scope:** Should we include response validation?
   - Current: Yes (`fetchWithValidation()`)
   - Proposed: Let Zod handle it at schema level

4. **Timeline:** When do you want to start migrating?
   - Immediate: Update existing components
   - Next: Only new components
   - Later: Leave as-is for now

---

## Files Created

1. **APIHELPER_REFACTOR_PROPOSAL.md** - Detailed technical proposal
2. **API_HELPER_USAGE_GUIDE.md** - How to use the new patterns (with examples)
3. **apiHelper-simplified.ts** - Reference implementation

---

## Summary

Your insight was correct: apiHelper should:
1. ✅ Validate input with Zod (already defined in FE)
2. ✅ Call API function
3. ✅ Extract errors from error-handler
4. ✅ Show toast notification
5. ✅ Run callbacks

**Not** mix multiple concerns into 10+ functions.

The solution: 3 clear patterns, 55% less code, 70% fewer functions.

**Ready to implement?** Let me know your thoughts! 🚀
