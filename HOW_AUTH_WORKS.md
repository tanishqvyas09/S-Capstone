# 🔐 How Password Authentication Works

## You Asked: "Where are passwords stored?"

**Answer:** Passwords are stored securely in Supabase's built-in `auth.users` table (NOT in our custom tables).

### How It Works:

1. **When User Registers:**
   ```
   User enters: email + password
   ↓
   Supabase encrypts password (bcrypt)
   ↓
   Stores in auth.users table
   ↓
   We store OTHER details (name, subject, etc.) in teachers/students table
   ```

2. **When User Logs In:**
   ```
   User enters: email + password
   ↓
   Supabase checks auth.users table
   ↓
   Compares encrypted password
   ↓
   If match → Login successful
   ↓
   We fetch user profile from teachers/students table
   ```

### Why We Don't Store Passwords Ourselves:

❌ **BAD:** Storing passwords in plain text or in our own table  
✅ **GOOD:** Letting Supabase handle password encryption & security

---

## 🗄️ New Database Structure

### **Separate Tables for Teachers & Students**

**teachers table:**
- id (links to auth.users)
- email
- full_name
- subject
- grade_level
- phone
- institution

**students table:**
- id (links to auth.users)
- email
- full_name
- class_year
- roll_number
- phone
- institution

**quizzes table:**
- created by teachers
- stores quiz questions

**scores table:**
- stores student quiz results

---

## 📝 Setup Instructions

1. **Open Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy & paste entire content from `DATABASE_SETUP.sql`
5. Click **Run**
6. Done! ✅

Now try registering a teacher and a student!
