# 🔍 Signup Failure Diagnosis

## What's Happening

Your logs show:
```
[AuthProvider] Auth signup successful, user ID: 1a274b6c-5f7e-47e3-babc-4cc60d4dffb9
```

But then nothing else. This means:
- ✅ Auth user IS created in Supabase
- ❌ User profile insert IS failing (silently)
- ❌ User state is NOT being set
- ❌ Navigation is NOT happening

## Root Cause

One of these is happening:

### Possibility 1: `users` Table Doesn't Exist
The app tries to insert into `users` table but it doesn't exist.

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  subject TEXT,
  grade_level TEXT,
  full_name TEXT,
  class_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);
```

3. Check the output for success

### Possibility 2: RLS Policy Blocking Insertion
Table exists but RLS policies prevent the insert.

**Fix:**
1. Go to Supabase → Table Editor
2. Click `users` table
3. Click **RLS** (Row Level Security) tab
4. Check the policies
5. Make sure there's an INSERT policy allowing `auth.uid() = id`

### Possibility 3: Email Already Exists
User already has an account with that email.

**Fix:**
Try signing up with a different email (e.g., `test456@example.com`)

## How to Debug This

### Step 1: Check Your Console NOW
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up again
4. **Copy ALL the logs** you see

You should now see detailed error messages like:
```
[AuthProvider] User insert error details: {
  message: "permission denied for schema public",
  code: "42501",
  ...
}
```

### Step 2: Check Supabase Table
1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. Look for `users` table in the list
4. If it's NOT there, you need to create it (Possibility 1)
5. If it IS there, check the RLS tab (Possibility 2)

### Step 3: Check RLS Policies
1. Click `users` table
2. Click **RLS** button at top right
3. You should see policies like:
   - "Users can view their own data"
   - "Users can insert their own data"
   - "Users can update their own data"

If these are missing, run the SQL to add them.

## Next Action

**Do This Now:**

1. Check browser console - **Copy the full error message**
2. Check if `users` table exists in Supabase
3. If not, create it using the SQL above
4. If yes, check the RLS policies
5. Report back what you find!

The error message in the console will tell us EXACTLY what's wrong.
