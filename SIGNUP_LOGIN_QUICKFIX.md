# Quick Signup/Login Fix Checklist ✓

## 🔴 CRITICAL: Do These First (Most Likely Fixes)

### 1. **Disable Email Confirmation in Supabase** ⭐
This is the #1 reason signup/login doesn't work!

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Authentication** → **Settings**
4. Look for **"Confirm email"** setting
5. **Toggle it OFF** (disable email confirmation)
6. Click **Save**
7. Restart your dev server: `npm run dev`

### 2. **Create the `users` Table** (If Not Already Done)

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Create users table if it doesn't exist
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own data during signup
CREATE POLICY "Users can insert their own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);
```

5. Click **Run** (or Cmd+Enter)
6. You should see "Success" message

### 3. **Verify `.env` File**

Check that `/Users/tanishqvyas/quiz-app/.env` contains:

```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-long-anon-key]
```

If you don't know these values:
1. Go to Supabase Dashboard
2. Project → Settings → API
3. Copy **Project URL** and **anon public key**
4. Update `.env` file
5. Restart dev server

---

## 🧪 Testing After Fixes

### Test Signup:

1. Open http://localhost:5173 (or your dev port)
2. Click **"Teacher Login"** or **"Student Login"**
3. Click **"Switch to Sign Up"**
4. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirm: `Test123!`
   - Subject (teacher) or Full Name (student): `Test`
5. Click **"Create Account"**

**Expected result:** You should be redirected to `/teacher/dashboard` or `/student/dashboard`

### Test Login:

1. Go back to the login page
2. Enter the same email and password from signup
3. Click **"Login"**

**Expected result:** You should be redirected to the same dashboard

---

## 🐛 Debugging (If Still Not Working)

### Check Browser Console:

1. Press **F12** or **Cmd+Shift+I** to open Developer Tools
2. Click **Console** tab
3. Look for messages starting with:
   - `[AuthForm]`
   - `[AuthProvider]`

### Look for Error Messages:

You should see logs like:
```
[AuthForm] handleSubmit called { role: 'teacher', isSignup: true, email: 'test@example.com' }
[AuthForm] Starting auth process... { isSignup: true }
[AuthProvider] Signup attempt for: { email: 'test@example.com', role: 'teacher' }
[AuthForm] Signup successful
[AuthForm] Navigating to dashboard...
```

If you see an **error**, it will be displayed in red in the form AND in the console.

### Common Errors:

| Error | Fix |
|-------|-----|
| `Email not confirmed` | Disable email confirmation in Supabase Settings |
| `User already exists` | Try signup with a different email |
| `Failed to create user profile` | `users` table doesn't exist - create it using SQL above |
| `Invalid login credentials` | Wrong email or password, or user doesn't exist |

---

## 📝 Files Modified for Better Debugging

- ✅ `src/components/AuthForm.tsx` - Enhanced with error display and loading states
- ✅ `src/contexts/AuthContext.tsx` - Better error messages and logging
- ✅ `AUTH_SETUP_GUIDE.md` - Comprehensive troubleshooting guide (in workspace)

---

## ✅ Success Indicators

You'll know it's working when:

- [ ] No error messages in browser console
- [ ] Button text changes to "Creating Account..." during signup
- [ ] Form shows red error box if something goes wrong
- [ ] After successful signup, redirected to `/teacher/dashboard` or `/student/dashboard`
- [ ] Can log back in with the same credentials

---

## 🚀 Ready to Test?

1. Complete steps in **🔴 CRITICAL section** above
2. Run `npm run dev`
3. Go to http://localhost:5173
4. Try signing up following the test procedure
5. Watch browser console (F12 → Console tab)
6. Report any errors you see in the red box or console

**That's it!** Your signup/login should work. 🎉
