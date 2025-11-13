# 🔗 N8N Webhook Integration Guide

## Step 1: Provide Your Webhook URL

Please provide your n8n webhook URL here:
```
YOUR_WEBHOOK_URL_HERE
```

---

## Step 2: What We'll Send to the Webhook

When a teacher uploads a PDF, we'll send:

### Option A: FormData (with file)
```javascript
{
  pdf: <File>,              // The actual PDF file
  text: "extracted text",   // Text extracted from PDF
  filename: "notes.pdf",    // Original filename
  timestamp: "2025-11-13T..." // When uploaded
}
```

### Option B: JSON (text only - faster)
```json
{
  "text": "This is the extracted text from the PDF...",
  "filename": "notes.pdf",
  "timestamp": "2025-11-13T10:30:00Z",
  "requestType": "generate_quiz"
}
```

---

## Step 3: What We Expect Back from n8n

Your n8n workflow should return JSON in this format:

```json
{
  "success": true,
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "Paris",
      "explanation": "Paris is the capital and largest city of France."
    },
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "answer": "4",
      "explanation": "Basic addition: 2 + 2 equals 4."
    }
  ]
}
```

If there's an error:
```json
{
  "success": false,
  "error": "Failed to generate questions",
  "message": "Additional error details..."
}
```

---

## Step 4: Testing the Webhook

Once you provide the URL, I'll create a test page where you can:
1. Click "Test Webhook" to see if it's working
2. Upload a PDF and see the generated quiz
3. View the exact request/response format

---

## Step 5: Complete Flow

```
Teacher uploads PDF
       ↓
Extract text from PDF
       ↓
Send to n8n webhook (with text)
       ↓
n8n processes with AI (ChatGPT/Claude)
       ↓
Returns quiz questions
       ↓
Teacher reviews & publishes quiz
       ↓
Students see quiz and take it
       ↓
Scores saved to database
```

---

## 📝 Next Steps:

1. **Provide your n8n webhook URL**
2. Tell me which format you want to use (FormData with file OR JSON with text only)
3. I'll update the code and create a test interface
