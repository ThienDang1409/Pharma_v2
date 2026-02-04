# API Base URL Example Usage

This project uses Axios for HTTP requests with a centralized configuration.

## Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Usage Examples

### Basic API Calls

```typescript
import { newsApi, imageApi, authApi } from "@/lib/api";

// Get all news
const news = await newsApi.getAll({ page: 1, limit: 10 });

// Create news
const newArticle = await newsApi.create({
  title: "My Article",
  category: "product",
  content: "<p>Content here</p>",
  excerpt: "Summary",
  author: "John Doe",
  publishDate: "2025-11-05",
  status: "published",
  featuredImage: "https://...",
});

// Upload image
const result = await imageApi.upload(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### Using HTTP Service Directly

```typescript
import { http } from "@/lib/http";

// GET request
const data = await http.get("/custom-endpoint");

// POST request
const result = await http.post("/custom-endpoint", { key: "value" });

// Upload file
const formData = new FormData();
formData.append("file", file);
const uploadResult = await http.uploadFile("/upload", formData);
```

### Authentication

```typescript
import { authApi } from "@/lib/api";
import { http } from "@/lib/http";

// Login
const response = await authApi.login({ email, password });
http.setAuthToken(response.data.token);

// Logout
await authApi.logout();
```

## Features

✅ Axios instance with default config
✅ Request/Response interceptors
✅ Auto token management
✅ Error handling
✅ File upload with progress
✅ TypeScript support
✅ Centralized API endpoints

## API Endpoints

All API endpoints are organized in `lib/api.ts`:

- `newsApi` - News articles CRUD
- `imageApi` - Image upload
- `eventsApi` - Events CRUD
- `productsApi` - Products CRUD
- `authApi` - Authentication
