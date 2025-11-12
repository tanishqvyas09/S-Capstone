# Authentication Setup & Troubleshooting Guide

## Current Issue
Signup/Login buttons are not working when clicked. The form appears to not be responding.

## Root Causes & Solutions

### 1. **Email Confirmation Requirement** (Most Likely Issue)
By default, Supabase requires email verification before a user can log in.

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Authentication** → **Settings**
3. Under "Email Confirmation", find the toggle for "Confirm email"
4. **Disable it** (turn it OFF) for development testing
5. Save changes
6. Restart your dev server

### 2. **Missing `users` Table in Database**
The AuthContext tries to insert/fetch from a `users` table that might not exist.

**Solution - Create the table via Supabase SQL Editor:**

Go to SQL Editor in Supabase and run:

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

### 3. **Authentication Listener Not Ready**
The AuthContext might not be fully initialized when the form tries to authenticate.

**Solution:**
The component has been updated with:
- ✅ Loading states for the submit button
- ✅ Enhanced console logging with `[AuthForm]` prefix
- ✅ Error display with red error box
- ✅ Button disabled state during authentication

### 4. **How to Test Authentication**

#### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Shift+I)
2. Go to **Console** tab
3. Clear any previous logs
4. Try to sign up with test credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
5. Watch for these logs in order:
   ```
   [AuthForm] handleSubmit called { role: 'teacher', isSignup: true, email: 'test@example.com' }
   [AuthForm] Starting auth process... { isSignup: true }
   [AuthForm] Calling signup with: { email: 'test@example.com', role: 'teacher' }
   [AuthProvider] Signup attempt for: { email: 'test@example.com', role: 'teacher' }
   [AuthForm] Signup successful
   [AuthForm] Navigating to dashboard...
   ```

#### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try authentication again
3. Look for requests to Supabase API (should see POST to `/auth/v1/signup` or `/auth/v1/signin`)
4. Check the response for errors

#### Step 3: Check Supabase Logs
1. Go to Supabase Dashboard → Your Project
2. Go to **Logs** → **Auth Logs**
3. Try signing up again
4. You should see log entries showing:
   - User signup attempt
   - Email confirmation sent (if enabled)
   - Any errors

### 5. **Step-by-Step Testing Procedure**

1. **Disable Email Confirmation** (Supabase Dashboard)
   - Settings → Email Confirmation → Toggle OFF

2. **Verify `.env` file has correct credentials:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Create the `users` table** (using SQL from Section 2 above)

4. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Test signup:**
   - Navigate to http://localhost:5173 (or your dev port)
   - Click "Teacher Login" or "Student Login"
   - Click "Switch to Sign Up"
   - Fill in credentials:
     - Email: `test123@example.com`
     - Password: `Password123!`
     - Confirm: `Password123!`
     - Subject: `Math` (if teacher)
   - Click "Create Account"
   - **Check browser console for logs**
   - If no errors appear, you should be redirected to `/teacher/dashboard` or `/student/dashboard`

6. **Test login:**
   - Go back to auth page
   - Enter the same email and password
   - Click "Login"
   - Should redirect to dashboard

### 6. **Troubleshooting Error Messages**

| Error Message | Cause | Solution |
|---|---|---|
| `Invalid login credentials` | Email/password wrong or user doesn't exist | Check credentials, try signup first |
| `User already exists` | Email already used | Try different email |
| `Email not confirmed` | Email confirmation is enabled | Disable in Supabase Settings |
| `Could not parse JWT` | Invalid credentials or token issue | Check `.env` variables, restart dev server |
| `User insert error` | `users` table doesn't exist or has RLS issue | Create table using SQL from Section 2 |

### 7. **Enhanced Debugging**

The AuthForm now includes:

**Loading State:**
- Button text changes to "Creating Account..." or "Logging In..."
- Button becomes disabled (faded out)
- All inputs disabled during processing

**Error Display:**
- Red error box appears above form if something fails
- Error also shown in `alert()` for visibility
- Error logged to console with `[AuthForm]` prefix

**Console Logging:**
- `[AuthForm]` prefix for form events
- `[AuthProvider]` prefix for auth context events
- Traces flow from form submission through auth methods

### 8. **Common Issues & Quick Fixes**

**Issue: "User insert error" after signup**
- The `users` table probably doesn't exist
- Fix: Run the SQL from Section 2

**Issue: "Email not confirmed" error**
- Email confirmation is enabled in Supabase
- Fix: Disable it in Supabase Settings → Email Confirmation

**Issue: No console logs appear when clicking button**
- Form might not be getting the context
- Check that `AuthProvider` wraps your entire app in `src/main.tsx`

**Issue: Network request fails with 400/401**
- Supabase credentials are invalid
- Fix: Double-check `.env` file, restart dev server

**Issue: Successfully signs up but can't log in**
- Email confirmation might be pending
- Check Supabase Auth logs to see if email confirmation was required
- Disable email confirmation and try again

## Next Steps

1. **Follow the checklist above** starting with "Disable Email Confirmation"
2. **Create the `users` table** using the SQL provided
3. **Restart the dev server**
4. **Test signup and login** following the step-by-step procedure
5. **Watch browser console** for the logs mentioned
6. **Check Network tab** for actual API requests
7. **Check Supabase Logs** to see server-side info

## Files Modified

- `src/components/AuthForm.tsx`: Enhanced with loading states, error display, and detailed logging
- `src/contexts/AuthContext.tsx`: Already has comprehensive logging
- `.env`: Should have `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Quick Reference: What Happens When You Click "Login"

```
User clicks "Login" button
  ↓
handleSubmit(e) fires
  ↓
e.preventDefault() prevents page reload
  ↓
console: [AuthForm] handleSubmit called
  ↓
Validate email & password not empty
  ↓
Set loading = true (button disabled)
  ↓
Call login(email, password)
  ↓
AuthContext calls supabase.auth.signInWithPassword()
  ↓
If successful:
  - Fetch user data from `users` table
  - Set loading = false
  - Navigate to /teacher/dashboard or /student/dashboard
  ↓
If error:
  - Display error in red box
  - Show alert()
  - Set loading = false
  - Stay on auth page
```

## Support Commands

**Check if dev server is running:**
```bash
ps aux | grep "npm run dev"
```

**Check environment variables are set:**
```bash
cat .env
```

**Check for TypeScript errors:**
```bash
npx tsc --noEmit
```

**View Supabase credentials (if forgotten):**
1. Go to Supabase Dashboard
2. Project → Settings → API
3. Copy the values for `.env`
