# API Helper: Quick Reference & Decision Tree

## 🎯 Quick Decision: Which Function to Use?

```
┌─────────────────────────────────────────────────────────────┐
│ What are you doing?                                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Submitting         Fetching              Multiple
   form data?         data?                 operations?
        │                   │                   │
        │ YES               │ YES               │ YES
        ▼                   ▼                   ▼
   apiSubmit()        apiFetch()          apiMultiple()
```

---

## Function Matrix

### When to Use What

| Need | Function | Validate | API Call | Toast | Returns |
|------|----------|----------|----------|-------|---------|
| Form submit | `apiSubmit()` | ✅ Yes | ✅ Yes | ✅ Yes | `{ success, data\|error }` |
| Get list/detail | `apiFetch()` | ❌ No | ✅ Yes | ❌ No | `data \| null` |
| Delete single | `apiSubmit()` | ✅ Optional | ✅ Yes | ✅ Yes | `{ success, data\|error }` |
| Delete multiple | `apiMultiple()` | ❌ No | ✅ Yes | ✅ Yes | `{ results[], hasErrors }` |
| Update multiple | `apiMultiple()` | ❌ No | ✅ Yes | ✅ Yes | `{ results[], hasErrors }` |
| Check API health | `apiFetch()` | ❌ No | ✅ Yes | ❌ No | `data \| null` |
| Silent operation | `apiFetch()` | ❌ No | ✅ Yes | ❌ No | `data \| null` |

---

## Pattern Selection Flowchart

### Pattern 1: Form Submission (apiSubmit)

**Used for:**
- ✅ User login/register
- ✅ Update profile
- ✅ Create/edit content
- ✅ Delete item
- ✅ Any action that needs validation

```tsx
const result = await apiSubmit(
  SCHEMA,           // Zod validation
  data,             // Form data to validate
  apiFunction,      // Function that calls API
  { toast, messages, onSuccess, onError }
);

// Returns: { success: true, data: T } | { success: false, error: string }
```

**Characteristics:**
- Validates input first
- Shows success toast (if message provided)
- Shows error toast (auto from error-handler)
- Returns result for conditional logic
- Best for: Forms, critical operations

**Usage signals:**
- Need Zod schema? → Use `apiSubmit()`
- Need success confirmation? → Use `apiSubmit()`
- User interaction? → Use `apiSubmit()`

---

### Pattern 2: Data Fetching (apiFetch)

**Used for:**
- ✅ Load categories/users/items
- ✅ Get current user profile
- ✅ Fetch blog details
- ✅ Any GET request

```tsx
const data = await apiFetch(
  apiFunction,      // Function that calls API
  { onSuccess, onError, logErrors }
);

// Returns: T | null
```

**Characteristics:**
- No validation (already typed)
- No toast (silent operation)
- Auto-extracts response.data
- Only console.error on failure
- Best for: Data loading, non-critical

**Usage signals:**
- Just loading data? → Use `apiFetch()`
- Don't need user confirmation? → Use `apiFetch()`
- Want to show skeleton UI? → Use `apiFetch()`

---

### Pattern 3: Batch Operations (apiMultiple)

**Used for:**
- ✅ Bulk delete items
- ✅ Update multiple records
- ✅ Execute many API calls
- ✅ Batch uploads

```tsx
const { results, hasErrors } = await apiMultiple(
  [apiFunc1, apiFunc2, apiFunc3],  // Array of API functions
  { toast, stopOnError, onAllSuccess, onAnyError }
);

// Returns: { results: (T | null)[], hasErrors: boolean }
```

**Characteristics:**
- Executes multiple API calls
- Single toast for all operations
- Option to stop on first error
- Returns all results + error flag
- Best for: Bulk operations, admin tasks

**Usage signals:**
- Looping multiple API calls? → Use `apiMultiple()`
- Bulk delete/update? → Use `apiMultiple()`
- Multiple results to handle? → Use `apiMultiple()`

---

## Real-World Examples

### Example 1: User Registration

```tsx
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  // 🎯 Pattern: apiSubmit (form submission)
  const result = await apiSubmit(
    RegisterSchema,              // Validate: email, password, name
    { email, password, name },
    (data) => authApi.register(data),
    {
      toast: addToast,
      messages: {
        success: 'Đăng ký thành công! Vui lòng đăng nhập.',
      },
      onSuccess: () => router.push('/auth/login')
    }
  );

  if (!result.success) {
    console.log('Validation failed:', result.error);
  }
};
```

**Decision logic:**
- User submitting form? ✅
- Need validation? ✅ (email, password)
- Need toast? ✅ (confirm registration)
- Single operation? ✅
→ **Use: apiSubmit()**

---

### Example 2: Load Admin Dashboard

```tsx
useEffect(() => {
  // Load users
  const users = await apiFetch(
    () => userApi.getAll(),
    { onSuccess: setUsers }
  );

  // Load categories
  const categories = await apiFetch(
    () => categoryApi.getAll(),
    { onSuccess: setCategories }
  );

  // Load recent blogs
  const blogs = await apiFetch(
    () => blogApi.getRecent({ limit: 10 }),
    { onSuccess: setBlogs }
  );
}, []);
```

**Decision logic:**
- Just loading data? ✅
- No validation needed? ✅
- No user confirmation needed? ✅
- Multiple fetch operations? ✅
→ **Use: apiFetch() + apiMultiple()**

---

### Example 3: Bulk Delete Categories

```tsx
const handleBulkDelete = async () => {
  // 🎯 Pattern: apiMultiple (batch operations)
  const { results, hasErrors } = await apiMultiple(
    selectedIds.map(id => () => categoryApi.delete(id)),
    {
      toast: addToast,
      stopOnError: false,  // Delete all, don't stop on error
      onAllSuccess: () => {
        addToast('success', `Xóa ${selectedIds.length} danh mục`);
        setSelected([]);
        router.refresh();
      },
      onAnyError: (error, index) => {
        console.error(`Delete failed for item ${index}:`, error);
      }
    }
  );

  if (hasErrors) {
    console.log(`${results.filter(r => !r).length} items failed to delete`);
  }
};
```

**Decision logic:**
- Multiple operations? ✅
- Bulk action? ✅
- No validation needed? ✅ (just delete by ID)
- Want all results? ✅
→ **Use: apiMultiple()**

---

### Example 4: Update User Profile

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 🎯 Pattern: apiSubmit (form submission)
  const result = await apiSubmit(
    UpdateProfileSchema,
    {
      name: formData.name,
      phone: formData.phone,
      avatar: formData.avatar,
    },
    (data) => userApi.updateProfile(data),
    {
      toast: addToast,
      messages: {
        success: 'Cập nhật hồ sơ thành công',
      },
      onSuccess: (updatedUser) => {
        // Can access returned data
        setCurrentUser(updatedUser);
        setIsEditing(false);
      }
    }
  );

  if (!result.success) {
    // Handle validation error
    console.log('Validation error:', result.error);
  }
};
```

**Decision logic:**
- Form submission? ✅
- Need validation? ✅ (name, phone)
- Need success toast? ✅
- Single operation? ✅
→ **Use: apiSubmit()**

---

## Error Handling By Pattern

### apiSubmit() Error Handling
```tsx
// ✅ Error is shown in toast automatically
await apiSubmit(Schema, data, apiCall, { toast: addToast });

// ✅ Error is passed to callback for additional handling
await apiSubmit(Schema, data, apiCall, {
  toast: addToast,
  onError: (error) => {
    logError(error);  // Side effects only
    // Don't show toast again - already done!
  }
});

// ✅ Override error message
await apiSubmit(Schema, data, apiCall, {
  toast: addToast,
  messages: {
    error: 'Custom error message' // Replaces auto error
  }
});

// ❌ DON'T: Show toast twice
await apiSubmit(Schema, data, apiCall, {
  toast: addToast,
  onError: (error) => {
    addToast('error', error);  // Already shown!
  }
});
```

### apiFetch() Error Handling
```tsx
// ✅ Silent with callback
const data = await apiFetch(apiCall, {
  onSuccess: (data) => console.log('Loaded:', data),
  onError: (error) => console.log('Failed:', error),
  logErrors: true  // Also console.error
});

// ✅ Check if data is null
if (!data) {
  // Failed to fetch
  setData([]); // Use default
}

// ❌ DON'T: Expect return value to be typed when null
const data: User | null = await apiFetch(userApi.getById);
// data could be null - handle it!
```

### apiMultiple() Error Handling
```tsx
// ✅ Partial failures are OK
const { results, hasErrors } = await apiMultiple(
  operations,
  { toast: addToast, stopOnError: false }
);
// Delete 3 items, 1 fails, 2 succeed - all done

// ✅ Stop on first error
const { results, hasErrors } = await apiMultiple(
  operations,
  { toast: addToast, stopOnError: true }
);
// Delete 3 items, 1 fails, stop - only 1 deleted

// ✅ Process results
results.forEach((result, index) => {
  if (result) {
    console.log('Success:', result);
  } else {
    console.log('Failed:', index);
  }
});
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Using apiSubmit for data fetching
```tsx
// WRONG
const categories = await apiSubmit(
  CategoriesSchema,  // Unnecessary validation
  {},
  () => categoryApi.getAll(),
  { toast: addToast }
);
```

```tsx
// RIGHT
const categories = await apiFetch(
  () => categoryApi.getAll(),
  { onSuccess: setCategories }
);
```

---

### ❌ Mistake 2: Showing toast twice
```tsx
// WRONG
await apiSubmit(..., {
  toast: addToast,
  messages: { error: 'Failed' },
  onError: (error) => addToast('error', error)  // Duplicate!
});
```

```tsx
// RIGHT
await apiSubmit(..., {
  toast: addToast,
  messages: { error: 'Failed' },  // Only here
  onError: (error) => {
    // Do side effects, NOT toast
    logError(error);
  }
});
```

---

### ❌ Mistake 3: Looping apiSubmit
```tsx
// WRONG
for (const id of ids) {
  await apiSubmit(IdSchema, { id },
    () => api.delete(id),
    { toast: addToast }  // Toast per item!
  );
}
```

```tsx
// RIGHT
await apiMultiple(
  ids.map(id => () => api.delete(id)),
  { toast: addToast }  // Single toast
);
```

---

### ❌ Mistake 4: Forgetting to check result
```tsx
// WRONG
const result = await apiFetch(...);
setData(result);  // Could be null!
```

```tsx
// RIGHT
const result = await apiFetch(...);
if (result) {
  setData(result);
} else {
  setData([]);  // Default
}

// OR use nullish coalescing
setData(result ?? []);
```

---

## Cheat Sheet

### apiSubmit() Usage Template
```tsx
const result = await apiSubmit(
  SCHEMA,              // ← Zod schema
  formData,            // ← Data to validate
  (data) => api.call(data),  // ← API function
  {
    toast: addToast,   // ← Toast context
    messages: {
      success: 'Success message',
      // error: 'Custom error' (optional)
    },
    onSuccess: () => {  // ← Side effects
      // Do stuff after success
    },
    onError: (error) => {  // ← Optional
      // Do stuff after error (not toast)
    }
  }
);

if (result.success) {
  // Access result.data
} else {
  // Access result.error
}
```

### apiFetch() Usage Template
```tsx
const data = await apiFetch(
  () => api.getData(),  // ← API function
  {
    onSuccess: setData,  // ← Just setState
    onError: (error) => {  // ← Optional
      console.error(error);
    }
  }
);

if (!data) {
  // Failed to fetch
}
```

### apiMultiple() Usage Template
```tsx
const { results, hasErrors } = await apiMultiple(
  operations.map(op => () => api.call(op)),  // ← API functions array
  {
    toast: addToast,
    stopOnError: true/false,  // ← Stop on error?
    onAllSuccess: () => {  // ← Optional
      // Do stuff after all succeed
    },
    onAnyError: (error, index) => {  // ← Optional
      // Do stuff for each error
    }
  }
);

// Process results
results.forEach((result, i) => {
  if (result) {
    // Success
  } else {
    // Error
  }
});
```

---

## Performance Considerations

| Operation | Old Way | New Way | Impact |
|-----------|---------|---------|--------|
| Form submit | ~30 lines | ~15 lines | 50% less code |
| Data fetch | ~15 lines | ~5 lines | 67% less code |
| Bulk delete | ~25 lines | ~10 lines | 60% less code |
| Error handling | Custom | Auto | Fewer bugs |
| Bundle size | Large | Smaller | ~2KB saved |

---

## Migration Checklist

For each component:
- [ ] Identify what it does (form, fetch, batch?)
- [ ] Replace with appropriate new function
- [ ] Remove manual error handling (if redundant)
- [ ] Test success and error flows
- [ ] Verify toast messages are clear
- [ ] Check TypeScript types

---

## Final Recommendation

**Use the Decision Tree:**
1. Is it a form? → `apiSubmit()`
2. Is it data loading? → `apiFetch()`
3. Is it multiple operations? → `apiMultiple()`

**If unsure:** Ask yourself: "Do I need validation?" 
- Yes → `apiSubmit()`
- No → `apiFetch()` or `apiMultiple()`

That's it! 🎯
