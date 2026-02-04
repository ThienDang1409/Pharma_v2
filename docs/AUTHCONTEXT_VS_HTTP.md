# AuthContext vs http.ts - Sự Khác Biệt

## 📊 Tóm Tắt Nhanh

| Aspect | http.ts | AuthContext.tsx |
|--------|---------|-----------------|
| **Vị trí** | `lib/http.ts` | `app/context/AuthContext.tsx` |
| **Mục đích** | HTTP layer (API calls) | State management (Auth state) |
| **Cấp độ** | Infrastructure (Axios) | Application (React Context) |
| **Trách nhiệm** | Network requests | User state, UI logic |

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────┐
│   AuthContext (app/context)         │
│   ─ User state management           │
│   ─ Login/logout/signup flows       │
│   ─ Token refresh logic (manual)    │
└────────────┬────────────────────────┘
             │ Uses
             ↓
┌─────────────────────────────────────┐
│   authApi (lib/api) & http (lib)    │
│   ─ API functions                   │
│   ─ Axios wrapper                   │
│   ─ Auto token refresh (interceptor)│
└────────────┬────────────────────────┘
             │ Uses
             ↓
┌─────────────────────────────────────┐
│   Axios Interceptors                │
│   ─ Add token to requests           │
│   ─ Handle 401 responses            │
│   ─ Auto refresh + retry            │
└─────────────────────────────────────┘
```

---

## 🔧 http.ts - HTTP Layer

**Vị trí:** `lib/http.ts` (267 lines)

**Mục đích:** Tầng network - quản lý HTTP requests/responses

**Chức năng chính:**
```typescript
// 1. HTTP Methods
http.get(url)
http.post(url, data)
http.put(url, data)
http.patch(url, data)
http.delete(url)

// 2. Token management (low-level)
http.setAuthToken(token)
http.removeAuthToken()
http.getAuthToken()
http.isAuthenticated()

// 3. Interceptors (automatic)
- Request interceptor:
  • Add token to Authorization header
  • Proactive token refresh (5 min before expiry)
  • Wait for ongoing refresh before request

- Response interceptor:
  • Handle 401 → Try refresh → Retry request
  • Handle 403 → Pass through
  • Handle errors → Parse and reject
```

**Ưu điểm:**
- ✅ Automatic token refresh
- ✅ No duplication of refresh logic
- ✅ All requests share same interceptors
- ✅ Global error handling
- ✅ Works for ANY http call (not just auth)

---

## 🎯 AuthContext - State Layer

**Vị trí:** `app/context/AuthContext.tsx` (295 lines)

**Mục đích:** Tầng application - quản lý auth state cho components

**Chức năng chính:**
```typescript
// 1. Auth state management
user: User | null
accessToken: string | null
refreshToken: string | null
isAuthenticated: boolean
isAdmin: boolean
isLoading: boolean

// 2. Auth flows (business logic)
login(email, password)
register(email, password, name, phone?)
logout()
updateProfile(data)
changePassword(oldPass, newPass)

// 3. Token sync
- Load tokens from localStorage on mount
- Verify token is still valid
- Try refresh token if needed
- Clear auth data on logout
- Sync http.ts with new tokens
```

**Tác dụng:**
```tsx
// Components can use:
const { user, isAuthenticated, login, logout } = useAuth();

// Show current user in UI
<span>{user?.name}</span>

// Conditional rendering
{isAuthenticated ? <Dashboard /> : <Login />}
```

---

## 🔁 Interaction Between Them

### Scenario 1: User Logs In

```
Component                    AuthContext              http.ts
   │                            │                        │
   ├─ login(email, pass)─────→  │                        │
   │                            ├─ authApi.login()──────→│
   │                            │   (POST /auth/login)   │
   │                            │←─ { token, user }──────┤
   │                            │                        │
   │                            ├─ setAccessToken()      │
   │                            ├─ setUser()             │
   │                            ├─ http.setAuthToken()   │
   │                            │   (Sync token to http) │
   │←─ login done───────────────┤                        │
   │                            │                        │
```

### Scenario 2: Auto Token Refresh (http.ts handles)

```
Component                    http.ts (Interceptor)    Backend
   │                            │                        │
   ├─ http.get(url)───────────→ │                        │
   │                            ├─ Is token expiring?    │
   │                            │  YES → Refresh         │
   │                            ├─ authApi.refresh()────→│
   │                            │←─ new token───────────┤
   │                            │                        │
   │                            ├─ Update header        │
   │                            ├─ Retry original req.──→│
   │                            │←─ response────────────┤
   │←─ response────────────────┤                        │
   │                            │                        │
```

### Scenario 3: 401 Response (http.ts tries to fix)

```
Component                    http.ts (Interceptor)
   │                            │
   ├─ http.get(url)───────────→ │
   │                            ├─ 401 response
   │                            ├─ Try refresh
   │                            │  ├─ If success → Retry request
   │                            │  └─ If fail → redirectToLogin()
   │←─ response or redirect────┤
```

---

## ⚙️ Token Refresh: Hai Nơi?

### **Why token refresh in TWO places?**

#### 1️⃣ **http.ts (Automatic, Proactive)**
```typescript
// Request interceptor
if (isTokenExpiringSoon()) {  // 5 min before expiry
  // Refresh BEFORE token expires
  const newToken = await refreshToken();
  // Update header
  // Request continues with new token
}
```

**Lợi ích:**
- ✅ Prevents 401 errors
- ✅ Smooth user experience
- ✅ Token never actually expires in requests
- ✅ Works automatically for all API calls

#### 2️⃣ **AuthContext (Manual, Fallback)**
```typescript
// Verify token on app init
const verifyToken = async (token: string) => {
  try {
    const user = await authApi.getCurrentUser();  // Tests token
    setUser(user);
  } catch (error) {
    if (error.status === 401) {  // Token IS expired
      await tryRefreshToken();    // Last-ditch refresh
    } else {
      clearAuthData();            // Give up
    }
  }
};
```

**Lợi ích:**
- ✅ Handles edge cases (browser refresh)
- ✅ Verifies token is actually valid
- ✅ Clears auth state if refresh fails
- ✅ Syncs http.ts with new tokens
- ✅ Initializes user state on app load

---

## 📋 What Each Does

### http.ts Handles
- ✅ All HTTP requests/responses
- ✅ Adding token to request headers
- ✅ Detecting token expiry BEFORE it's needed
- ✅ Auto-refreshing tokens
- ✅ Retrying requests after refresh
- ✅ Global error parsing
- ✅ 401/403/422/5xx handling

### AuthContext Handles
- ✅ Storing auth state (user, tokens)
- ✅ Providing hooks to components (`useAuth()`)
- ✅ Managing login/register/logout flows
- ✅ Initial app load verification
- ✅ Fallback token refresh if needed
- ✅ Clearing auth data on logout
- ✅ Syncing token state between layers

---

## 🎨 Why Not Just Use One?

### ❌ If only http.ts:
- No React context for components
- No `useAuth()` hook
- Components can't know if user is logged in
- No central place to store user data
- Hard to implement conditional rendering

### ❌ If only AuthContext:
- Duplicated token refresh logic
- No automatic refresh on every request
- Different refresh behavior in different places
- Harder to maintain

### ✅ Using both:
- **http.ts** = automatic, global network layer
- **AuthContext** = business logic, UI state
- Separation of concerns
- Both can work together smoothly

---

## 🔄 Data Flow Example

### User logs in:

```
1. Component submits form
   ↓
2. AuthContext.login(email, pass)
   ↓
3. authApi.login() calls http.post('/auth/login')
   ↓
4. http.ts adds token to request (if exists)
   ↓
5. Backend returns { token, user }
   ↓
6. AuthContext stores token + user + updates http.ts
   ↓
7. Component receives updated user state
   ↓
8. UI re-renders with logged-in state
```

### User makes API call later:

```
1. Component calls http.get('/profile')
   ↓
2. http.ts request interceptor checks:
   - Is token valid? YES → Add to header
   - Is token expiring soon? NO → Continue
   ↓
3. Request sent with token
   ↓
4. Backend returns data
   ↓
5. Component receives response
```

### Token expires during request:

```
1. Component calls http.get('/profile')
   ↓
2. http.ts request interceptor checks:
   - Is token expiring soon? YES → Refresh it
   ↓
3. refreshToken() updates token
   ↓
4. Add NEW token to header
   ↓
5. Request sent with NEW token
   ↓
6. Backend returns data
   ↓
7. Component never notices token changed!
```

---

## 📚 Summary

| Layer | Purpose | Location | Responsibility |
|-------|---------|----------|-----------------|
| **http.ts** | Network | `lib/http.ts` | HTTP + auto refresh |
| **AuthContext** | State | `app/context/` | User state + UI logic |
| **Components** | UI | `app/` | Render + interact |

**http.ts** = Infrastructure (network plumbing)  
**AuthContext** = Application (business logic)  
**Components** = UI (user interaction)

---

**Key Point:** Chúng không đối lập, chúng BỔ SUNG nhau! 🎯
- http.ts là tầng thấp (mạng)
- AuthContext là tầng cao (ứng dụng)
- Cả hai cần nhau để hoàn chỉnh
