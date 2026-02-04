# API Helper Usage Guide - Simplified Patterns

## Overview
Three core functions for 95% of use cases:

| Function | Use Case | Toast | Returns |
|----------|----------|-------|---------|
| `apiSubmit()` | Form submission with validation | ✅ Yes | `{ success, data \| error }` |
| `apiFetch()` | Data fetching (GET) | ❌ No | `data \| null` |
| `apiMultiple()` | Batch operations | ✅ Yes | `{ results[], hasErrors }` |

---

## Pattern 1: Form Submission (apiSubmit)

### Simple Profile Update
```tsx
"use client";

import { useToast } from "@/app/context/ToastContext";
import { apiSubmit } from "@/lib/utils/apiHelper";
import { UpdateProfileSchema } from "@/lib/validators";
import { authApi } from "@/lib/api";

export default function ProfilePage() {
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await apiSubmit(
      UpdateProfileSchema,
      { name: formData.name, phone: formData.phone },
      () => authApi.updateProfile(formData),
      {
        toast: addToast,
        messages: {
          success: "Cập nhật thành công",
          // error is auto from error-handler
        },
        onSuccess: () => setIsEditing(false),
      }
    );

    if (result.success) {
      // Already handled in onSuccess
    }
  };

  return <form onSubmit={handleSubmit}>/* ... */</form>;
}
```

### With Language Support
```tsx
const result = await apiSubmit(CreateBlogSchema, formData,
  () => blogApi.create(formData),
  {
    toast: addToast,
    messages: {
      success: language === 'vi' ? 'Tạo bài viết thành công' : 'Blog created',
    },
    onSuccess: () => router.push('/admin/blogs'),
    onError: (error) => console.log('Validation failed:', error),
  }
);

if (!result.success) {
  console.log('Error:', result.error); // Can handle specific errors
}
```

### Without Success Message (Silent Success)
```tsx
const result = await apiSubmit(Schema, data,
  () => api.update(data),
  { toast: addToast } // No messages = no success toast
);
```

---

## Pattern 2: Data Fetching (apiFetch)

### Load Categories on Mount
```tsx
const [categories, setCategories] = useState<Category[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const data = await apiFetch(
      () => informationApi.getAll(),
      {
        onSuccess: (data) => {
          console.log('Loaded:', data);
          setCategories(data?.items || []);
        },
        onError: (error) => {
          console.error('Failed to load categories:', error);
        }
      }
    );
    setLoading(false);
  };

  fetchData();
}, []);

if (loading) return <Spinner />;
if (!categories.length) return <Empty />;
return <CategoryList categories={categories} />;
```

### With Error Handling
```tsx
const images = await apiFetch(
  () => imageApi.getByFolder('blog'),
  {
    onSuccess: (data) => setImages(data),
    logErrors: true, // console.error on failure
  }
);

// Returns null on error, so:
if (!images) {
  // Use fallback empty array
  setImages([]);
}
```

### Simple Pattern (Just Load & Set)
```tsx
useEffect(() => {
  // Simplest: just pass setState directly
  apiFetch(() => informationApi.getAll(), {
    onSuccess: (data) => setCategoriesData(data),
  });
}, []);
```

---

## Pattern 3: Batch Operations (apiMultiple)

### Bulk Delete Items
```tsx
const handleBulkDelete = async (ids: string[]) => {
  const { results, hasErrors } = await apiMultiple(
    ids.map(id => () => itemApi.delete(id)),
    {
      toast: addToast,
      stopOnError: false, // Continue even if one fails
      onAllSuccess: () => {
        addToast('success', '删除成功');
        router.refresh();
      },
      onAnyError: (error, index) => {
        console.log(`Failed to delete item ${index}:`, error);
      }
    }
  );

  console.log(`Deleted: ${results.filter(r => r).length}/${ids.length}`);
};
```

### Update Multiple Records
```tsx
const { results, hasErrors } = await apiMultiple(
  [
    () => api.updateUser(user1),
    () => api.updateUser(user2),
    () => api.updateSettings(settings),
  ],
  {
    toast: addToast,
    stopOnError: true, // Stop if any operation fails
    onAllSuccess: () => {
      addToast('success', 'Cập nhật tất cả thành công');
      setIsEditing(false);
    }
  }
);

if (hasErrors) {
  console.log('Some operations failed:', results);
} else {
  console.log('All succeeded');
}
```

---

## Advanced: Custom Error Messages

### Override Auto Error
```tsx
const result = await apiSubmit(Schema, data,
  () => api.update(data),
  {
    toast: addToast,
    messages: {
      error: 'Could not save. Please check your internet connection.',
      // Overrides auto error from error-handler
    }
  }
);
```

### Handle Specific Errors
```tsx
const result = await apiSubmit(Schema, data,
  () => api.create(data),
  {
    toast: addToast,
    onError: (error) => {
      if (error.includes('duplicate')) {
        // Handle duplicate
        setDuplicateError(true);
      } else if (error.includes('permission')) {
        // Handle permission
        router.push('/admin');
      }
    }
  }
);
```

---

## Comparison: Old vs New

### Profile Update Form

#### OLD Way (validateAndCall)
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
**15 lines config, confusing flags**

#### NEW Way (apiSubmit)
```tsx
const result = await apiSubmit(UpdateProfileSchema, formData,
  () => updateProfile(formData),
  {
    toast: addToast,
    messages: { success: "Cập nhật thành công!" },
    onSuccess: () => setIsEditing(false)
  }
);
```
**11 lines config, clear intent**

---

## Error Handling Strategy

### How Errors Flow
```
1. Validation Error (Zod)
   → Shows validation message from schema
   → Toast: "Email không hợp lệ"

2. API Error (Network, 4xx, 5xx)
   → Extracted by error-handler.ts
   → Toast: "Dịch vụ tạm thời không khả dụng" (500)
   → Or custom: "Yêu cầu không hợp lệ" (400)

3. Custom Error Message
   → You provide in messages.error
   → Toast: Your custom message
```

### No Need to Handle Errors in Component
```tsx
// WRONG - redundant error toast
const result = await apiSubmit(..., {
  toast: addToast,
  onError: (error) => {
    addToast('error', error); // Already shown!
  }
});

// RIGHT - just use onError for side effects
const result = await apiSubmit(..., {
  toast: addToast,
  onError: (error) => {
    // Side effects only: logging, state updates, redirects
    logErrorMetrics(error);
    setIsSubmitting(false);
  }
});
```

---

## Common Patterns by Page Type

### User Profile Page
```tsx
// Load user on mount
useEffect(() => {
  apiFetch(() => authApi.getCurrentUser(), {
    onSuccess: setUserData
  });
}, []);

// Submit form
const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await apiSubmit(UpdateProfileSchema, formData,
    () => authApi.updateProfile(formData),
    { toast: addToast, messages: { success: 'Cập nhật thành công' } }
  );
};
```

### Admin CRUD Page
```tsx
// Load list
useEffect(() => {
  apiFetch(() => api.getAll(), { onSuccess: setItems });
}, []);

// Create/Update
const handleSave = async (item) => {
  const result = await apiSubmit(Schema, item,
    () => item.id ? api.update(item) : api.create(item),
    {
      toast: addToast,
      messages: {
        success: item.id ? 'Cập nhật thành công' : 'Tạo thành công'
      },
      onSuccess: () => refetch()
    }
  );
};

// Delete single
const handleDelete = async (id) => {
  const result = await apiSubmit(IdSchema, { id },
    (data) => api.delete(data.id),
    { toast: addToast, onSuccess: () => refetch() }
  );
};

// Delete multiple
const handleBulkDelete = async (ids) => {
  const { hasErrors } = await apiMultiple(
    ids.map(id => () => api.delete(id)),
    { toast: addToast, onAllSuccess: refetch }
  );
};
```

### Admin Upload Form
```tsx
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiSubmit(UploadSchema, { file },
    (data) => imageApi.upload(data),
    {
      toast: addToast,
      messages: { success: 'Tải lên thành công' },
      onSuccess: (image) => setPreview(image.url)
    }
  );
};
```

---

## TypeScript Types

### Form Submission Result
```typescript
const result: 
  | { success: true; data: BlogResponse }
  | { success: false; error: string }
  = await apiSubmit(...);

if (result.success) {
  // result.data is typed as BlogResponse
  console.log(result.data.id);
} else {
  // result.error is typed as string
  console.log(result.error);
}
```

### Data Fetching Result
```typescript
const categories: CategoryList | null = await apiFetch(...);

if (categories) {
  // categories is typed as CategoryList
  categories.items.map(c => c.name);
}
```

### Batch Operations Result
```typescript
const { results, hasErrors } = await apiMultiple(...);

// results: (ImageResponse | null)[]
results.forEach((img, i) => {
  if (img) {
    console.log(img.url); // img is typed as ImageResponse
  } else {
    console.log('Operation', i, 'failed');
  }
});
```

---

## Migration Checklist

For each component:
- [ ] Replace `validateAndCall()` with `apiSubmit()`
- [ ] Replace `silentApiCall()` for data loading with `apiFetch()`
- [ ] Remove redundant error toast in `onError`
- [ ] Move form state updates to `onSuccess`
- [ ] Test success/error flows

---

## Tips & Best Practices

1. **Always provide toast context** for form submissions
   ```tsx
   // BAD - no toast
   await apiSubmit(..., { onSuccess: () => {} });

   // GOOD - user sees feedback
   await apiSubmit(..., { toast: addToast, messages: { success: 'OK' } });
   ```

2. **Use onSuccess for side effects**, not for basic logic
   ```tsx
   // BAD - complex logic in onSuccess
   onSuccess: (data) => {
     if (data.type === 'special') { /* ... */ }
   }

   // GOOD - check result after
   const result = await apiSubmit(...);
   if (result.success && result.data.type === 'special') { /* ... */ }
   ```

3. **For data fetching, use apiFetch in useEffect**
   ```tsx
   // BAD - promise not awaited
   useEffect(() => {
     apiFetch(...);
   }, []);

   // GOOD - async wrapper
   useEffect(() => {
     (async () => {
       const data = await apiFetch(...);
       setData(data);
     })();
   }, []);

   // BETTER - extract to hook
   const data = useApiData(() => api.getAll());
   ```

4. **Batch operations for bulk actions**
   ```tsx
   // Instead of loop + multiple toasts
   for (const id of ids) {
     await apiSubmit(..., { toast: addToast }); // Multiple toasts!
   }

   // Use batch
   await apiMultiple(
     ids.map(id => () => api.delete(id)),
     { toast: addToast } // Single toast
   );
   ```
