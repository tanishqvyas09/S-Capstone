# Quiz Sharing Feature - Teacher Guide

## Overview
Teachers can now share quizzes with students using either a **6-digit access code** or a **QR code**. This provides flexible ways for students to access quizzes without needing direct links.

## Features

### 1. **6-Digit Access Code**
- Every quiz automatically gets a unique 6-digit code when saved
- Students can enter this code at `/quiz-access` to join the quiz
- Code is displayed in the share modal

### 2. **QR Code**
- Automatically generated for each quiz
- Students can scan with their phone camera to instantly access the quiz
- Can be downloaded as PNG for printing or sharing

## How to Use

### For Teachers:

1. **Create and Save a Quiz**
   - Upload PDFs and generate a quiz
   - Edit if needed
   - Click "Save Quiz"
   - Share modal automatically appears

2. **Share Existing Quiz**
   - Find the quiz in "Your Quizzes" section
   - Click the green "🔗 Share Quiz" button
   - Modal opens with access code and QR code

3. **Share with Students**
   - **Option 1**: Share the 6-digit code verbally, via chat, or email
   - **Option 2**: Download and print/share the QR code
   - **Option 3**: Project the QR code on screen for students to scan

### For Students:

1. **Using Access Code**
   - Go to `/quiz-access` (or click link provided by teacher)
   - Enter the 6-digit code
   - Click "Start Quiz"
   - Quiz opens automatically

2. **Using QR Code**
   - Scan QR code with phone camera
   - Browser opens to quiz access page
   - Code is auto-filled
   - Quiz starts automatically

## Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Add access_code column to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS access_code VARCHAR(6) UNIQUE;

-- Generate access codes for existing quizzes
UPDATE quizzes 
SET access_code = LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
WHERE access_code IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_access_code ON quizzes(access_code);
```

## Technical Details

### Access Code Generation
- 6-digit random number (100000-999999)
- Unique constraint ensures no duplicates
- Generated automatically on quiz creation

### QR Code
- Contains URL: `{origin}/quiz-access?code={accessCode}`
- Generated using `qrcode` library
- 300x300px with 2px margin
- Downloadable as PNG

### Quiz Access Page
- Route: `/quiz-access`
- Accepts `?code=` query parameter for QR scans
- Auto-fills code from URL
- Validates 6-digit format
- Looks up quiz in database
- Redirects to `/student/quiz/{quizId}`

## Benefits

1. **Easy Sharing**: No need to copy/paste long URLs
2. **Mobile Friendly**: QR codes work great on phones
3. **Classroom Ready**: Project QR on screen, students scan and join
4. **Flexible**: Multiple ways to share (code, QR, or both)
5. **Secure**: Each quiz has unique code, can't guess easily

## UI Elements

### Share Modal
- Large, bold display of 6-digit code
- Copy button for quick clipboard copy
- QR code visualization
- Download button for QR code PNG
- Clean, centered layout

### Quiz Access Page
- Large input for 6-digit code
- Only accepts numbers
- Auto-validates length
- Shows helpful error messages
- Back to dashboard link

## Future Enhancements (Optional)

- Expiration dates for codes
- Usage limits (max number of attempts)
- Code regeneration feature
- Analytics on code usage
- Time-limited access windows
