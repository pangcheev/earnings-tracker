# Multi-User Implementation Guide

## Overview
This guide explains how to implement multi-user support with data isolation using Supabase Auth and Row Level Security.

## What's Changed

### 1. **Database Migration** (`008_add_multi_user_support.sql`)
- Added `user_id` column to sessions table
- Implemented Row Level Security (RLS) policies
- Users can only see/edit/delete their own sessions
- Automatically enforced by Supabase

### 2. **New Auth Utility** (`src/utils/auth.ts`)
- `signupUser(email, password)` - Register new account
- `loginUser(email, password)` - Login with email/password  
- `logoutUser()` - Logout current user
- `getCurrentUser()` - Get authenticated user info
- `onAuthStateChange(callback)` - Listen for auth changes

### 3. **Updated Supabase Functions** (pending)
- All session sync functions now need to include `user_id`
- All queries filter by authenticated user automatically (via RLS)

## Implementation Steps

### Step 1: Run Migration in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/008_add_multi_user_support.sql`
3. Paste and execute

### Step 2: Update Login Component
Replace the simple password login with email/password signup/login interface

### Step 3: Update Session Sync Functions
Update `syncSessionsToCloud()` to:
```typescript
export async function syncSessionsToCloud(sessions: SessionData[], userId: string): Promise<boolean> {
  // ... existing code ...
  const sessionsToSync = sessions.map((session) => {
    return {
      // ... all existing fields ...
      user_id: userId,  // ADD THIS
    }
  })
  // ... rest of code ...
}
```

### Step 4: Update App.tsx
```typescript
import { getCurrentUser, onAuthStateChange } from './utils/auth'

export function App() {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(setUser)
    return unsubscribe
  }, [])
  
  // Pass userId to sync functions
  useEffect(() => {
    if (user && sessions.length > 0) {
      syncSessionsToCloud(sessions, user.id)
    }
  }, [sessions, user])
}
```

### Step 5: Update Query Functions
Update `querySessionsFromCloud()` in `src/utils/dataQuery.ts` to filter by user

## Security Features

- ✅ Row Level Security: Users can only query their own data
- ✅ Automatic enforcement: Supabase enforces at database level
- ✅ No cross-user access: Even if someone manipulates the API, RLS blocks access
- ✅ Email/password auth: Individual credentials per user

## Benefits

| Feature | Before | After |
|---------|--------|-------|
| Multi-user | ❌ No | ✅ Yes |
| Data isolation | ❌ No | ✅ Yes |
| Auth | Single password | Email/password signup |
| Security | Basic | Enterprise-grade RLS |
| Sharing | N/A | Can invite users |

## Migration Path for Existing Users

If you already have data:
1. Add a superadmin user account
2. Run migration to add user_id column
3. Manually assign existing sessions to superadmin user
4. Other users create their own accounts

## Next Steps

1. Review and execute the migration
2. Update Login component for signup/login UI
3. Update supabase.ts functions to include user_id
4. Test with multiple user accounts
