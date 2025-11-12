# 📚 Teacher Quiz Creation Guide

## Overview
Teachers can now create quizzes in just **3 steps**:
1. **Upload PDF** → Extract text from notes
2. **Generate Quiz** → AI generates questions automatically
3. **Review & Edit** → Customize questions before saving
4. **Save to Supabase** → Quiz becomes available to students

---

## Step-by-Step Flow

### Step 1: Login as Teacher
1. Go to `http://localhost:3000/`
2. Click **"Teacher Login"**
3. Sign up or login with email/password

### Step 2: Upload PDF
On the **Teacher Dashboard**, you'll see:

```
┌─────────────────────────────────────────┐
│  📄 Upload PDF to Generate Quiz         │
│                                         │
│  Select a PDF file from your notes to   │
│  auto-generate quiz questions           │
│                                         │
│  [📁 Choose PDF]  ✓ document.pdf        │
│         [🚀 Generate Quiz]              │
└─────────────────────────────────────────┘
```

**What happens:**
- Click **"Choose PDF"** to select a PDF file from your computer
- The FileUploader component validates it's a PDF
- Click **"Generate Quiz"** to start processing

### Step 3: PDF Text Extraction
The app automatically:
1. Reads the PDF file (using pdfjs-dist)
2. Extracts text from all pages
3. Cleans and processes the content
4. Displays console logs: `[FileUploader] Text extracted successfully`

### Step 4: Quiz Generation
The QuizGenerator service:
1. Analyzes the extracted text
2. Identifies key sentences
3. Converts them into multiple-choice questions
4. Generates 4 options per question (correct + plausible distractors)

**Generated Questions Format:**
```javascript
{
  question: "Q1: Fill in the blank: ____ is a process...",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: "Option C",  // Correct answer
  explanation: "Optional explanation for the answer"
}
```

### Step 5: Review & Edit Quiz
You'll see the **Quiz Editor** screen:

```
┌──────────────────────────────────────────┐
│ ✏️ Review & Edit Your Quiz               │
│                                          │
│ Quiz Title: [________________]           │
│ Description: [_______________]           │
│                                          │
│ Questions (5)                            │
│ ┌─────────────────────────────────────┐ │
│ │ Question 1                          │ │
│ │ Question Text: [__________________] │ │
│ │                                     │ │
│ │ Options:                            │ │
│ │ [Option 1]  [Option 2]             │ │
│ │ [Option 3]  [Option 4]             │ │
│ │                                     │ │
│ │ Correct Answer: [Option 2] ✓        │ │
│ │ Explanation: [_______________]      │ │
│ │                                     │ │
│ │ [🗑️ Delete]                         │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [➕ Add Another Question]                │
│                 [Cancel]  [💾 Save Quiz] │
└──────────────────────────────────────────┘
```

**You can:**
- ✏️ Edit quiz title and description
- ✏️ Modify each question text
- ✏️ Change options (answers)
- ✓ Select the correct answer (highlighted in green)
- 📝 Add explanations for each question
- 🗑️ Delete incorrect questions
- ➕ Add more questions manually

### Step 6: Save Quiz
When you click **"Save Quiz"**:
1. The quiz is **validated** (all fields required)
2. Sent to **Supabase** database
3. Stored with `created_by: teacher_id`
4. Immediately available to **all students**

---

## Behind the Scenes

### File Structure
```
src/
├── components/
│   ├── FileUploader.tsx      # PDF upload & extraction
│   └── QuizEditor.tsx        # Review & edit interface
├── services/
│   └── quizGenerator.ts      # Question generation logic
└── pages/
    └── TeacherDashboard.tsx  # Main flow coordinator
```

### Component Flow

```
TeacherDashboard
├── FileUploader
│   ├── Select PDF ↓
│   └── Extract Text (pdfjs) ↓
│       onUpload(file, extractedText)
│
├── QuizGenerator Service
│   ├── Parse extracted text ↓
│   ├── Find key sentences ↓
│   ├── Generate questions ↓
│   └── Return GeneratedQuiz ↓
│
├── QuizEditor
│   ├── Display generated quiz ↓
│   ├── Allow editing ↓
│   └── onSave(editedQuiz) ↓
│
└── Supabase
    └── INSERT into quizzes table
```

### Code Example: PDF Extraction

```typescript
// FileUploader.tsx
const extractTextFromPDF = async (file: File): Promise<string> => {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ');
  }
  
  return text;
};
```

### Code Example: Quiz Generation

```typescript
// quizGenerator.ts
export const generateQuiz = async (
  fileName: string,
  extractedText: string
): Promise<GeneratedQuiz> => {
  // Extract key sentences
  const sentences = extractKeySentences(extractedText, 5);
  
  // Convert to questions
  const questions = sentences.map(sentence => ({
    question: `Fill in: ${sentence.replace(answer, '____')}?`,
    options: generateOptions(answer, extractedText),
    answer: answer,
    explanation: 'Auto-generated from PDF content'
  }));
  
  return { title, description, questions };
};
```

### Code Example: Saving to Supabase

```typescript
// TeacherDashboard.tsx
const handleSaveQuiz = async (editedQuiz: GeneratedQuiz) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([
      {
        title: editedQuiz.title,
        questions: editedQuiz.questions,
        created_by: user.id,
        created_at: new Date().toISOString(),
      },
    ])
    .select();
  
  if (!error) {
    alert('✅ Quiz saved successfully!');
    setGeneratedQuiz(null);
    await fetchQuizzes();
  }
};
```

---

## Database Schema

### `quizzes` Table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,  -- Array of question objects
  created_by UUID NOT NULL,  -- Teacher's user ID
  created_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Question Object Structure
```json
{
  "question": "Q1: Fill in the blank: The capital of France is ____?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "answer": "Paris",
  "explanation": "Paris is the capital of France."
}
```

---

## Debugging

### Console Logs
Open browser **DevTools** (F12 → Console) to see:

```
[FileUploader] Extracting text from PDF: document.pdf
[FileUploader] Text extracted successfully, length: 5234
[QuizGenerator] Generating questions from text
[QuizGenerator] Generated questions: 5
[TeacherDashboard] Saving quiz to Supabase
[TeacherDashboard] Quiz saved successfully
```

### Common Issues

| Issue | Solution |
|-------|----------|
| PDF not extracting | Check browser console for pdfjs errors; ensure `/pdf.worker.js` exists in `public/` |
| Generated questions are bad | Extract text is minimal; upload longer PDFs with more content |
| Quiz not saving | Check Supabase connection; verify `.env` has correct URL and key |
| Duplicate exports error | This is normal on Fast Refresh; page will reload automatically |

---

## Advanced Features (Coming Soon)

- 🤖 **AI Question Generation** - Integrate OpenAI API for smarter questions
- 📊 **Quiz Analytics** - See which questions students struggle with
- 🔄 **Quiz Versioning** - Create new versions of existing quizzes
- 📥 **Bulk Import** - Import quizzes from CSV/JSON
- 🎨 **Custom Styling** - Teachers can customize quiz appearance

---

## Example Workflow

**Teacher John uploads "Biology_Notes.pdf":**

```
1. John logs in → Teacher Dashboard
2. Uploads PDF → "Biology_Notes.pdf"
3. App extracts → 2,500 words of text
4. Generates → 5 multiple-choice questions
5. John reviews → Edits 2 questions
6. John saves → Quiz available to students
7. Students see → "Biology Quiz" in dashboard
8. Students take → Quiz and get instant scores
9. John reviews → Student results in analytics
```

---

## Testing the Feature

1. **Login as Teacher**
   ```
   Email: teacher@example.com
   Password: password123
   ```

2. **Upload a Sample PDF**
   - Create a simple text file with content
   - Save as `.pdf` (or use actual PDF)

3. **Generate Quiz**
   - Click "Generate Quiz"
   - Wait for extraction and generation

4. **Edit & Save**
   - Modify questions as needed
   - Click "Save Quiz"

5. **Verify in Student Dashboard**
   - Login as student
   - See the new quiz in dashboard
   - Take the quiz and verify it works

---

## Quick Reference

| Component | Purpose |
|-----------|---------|
| `FileUploader.tsx` | Upload PDF, extract text using pdfjs-dist |
| `quizGenerator.ts` | Convert text → questions |
| `QuizEditor.tsx` | Review, edit, validate before saving |
| `TeacherDashboard.tsx` | Orchestrate entire flow + Supabase |

**Key Methods:**
- `extractTextFromPDF(file)` → Promise<string>
- `generateQuiz(fileName, text)` → Promise<GeneratedQuiz>
- `handleSaveQuiz(quiz)` → Promise<void>

**Dependencies:**
- `pdfjs-dist` - PDF text extraction
- `@supabase/supabase-js` - Database
- React hooks (useState, useEffect, useContext)

---

## Summary

Teachers can now:
✅ Upload PDF notes  
✅ Auto-generate quiz questions  
✅ Edit and customize  
✅ Save to database  
✅ Share with students instantly  

All in under **2 minutes!** 🚀
