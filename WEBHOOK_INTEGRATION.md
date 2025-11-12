# Webhook Integration for AI-Powered Quiz Generation

## Overview

The app now supports sending PDF text to a webhook for AI-powered question generation. If no webhook is configured, it falls back to local generation.

## Setup

### 1. Add Webhook URL to Environment

Add this to your `.env` file:

```env
VITE_WEBHOOK_URL=https://your-webhook-url.com/generate-quiz
```

### 2. Webhook Expected Format

**Request (POST):**

```json
{
  "text": "extracted text from PDF...",
  "filename": "chapter1.pdf",
  "timestamp": "2025-11-12T10:30:00.000Z",
  "requestType": "generate_quiz"
}
```

**Response (JSON):**

```json
{
  "success": true,
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "answer": "Paris",
      "explanation": "Paris is the capital and largest city of France"
    },
    {
      "question": "Another question...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Option 2",
      "explanation": "Optional explanation"
    }
  ]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message here",
  "message": "Additional context"
}
```

## How It Works

1. User uploads PDF
2. PDF text is extracted locally (using pdfjs-dist)
3. App checks if `VITE_WEBHOOK_URL` is set
4. **If webhook URL exists:**
   - Sends extracted text to webhook
   - Waits for AI-generated questions
   - Displays questions in QuizEditor
5. **If webhook fails or not configured:**
   - Falls back to local generation
   - Uses built-in `quizGenerator.ts`
   - Shows user a message about fallback

## Webhook Integration Options

### Option 1: OpenAI API

Create a webhook that uses OpenAI:

```javascript
// Example Node.js/Express endpoint
app.post('/generate-quiz', async (req, res) => {
  const { text, filename } = req.body;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a quiz generator. Generate 5 multiple choice questions from the provided text."
    }, {
      role: "user",
      content: text
    }],
    response_format: { type: "json_object" }
  });
  
  const questions = JSON.parse(response.choices[0].message.content);
  
  res.json({
    success: true,
    questions: questions
  });
});
```

### Option 2: Claude API (Anthropic)

```javascript
app.post('/generate-quiz', async (req, res) => {
  const { text } = req.body;
  
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Generate 5 quiz questions from this text: ${text}`
    }]
  });
  
  res.json({
    success: true,
    questions: parseClaudeResponse(response.content[0].text)
  });
});
```

### Option 3: n8n Workflow

1. Create an n8n workflow
2. Add webhook trigger
3. Add HTTP Request node to call OpenAI/Claude
4. Add transformation node to format response
5. Return JSON response

### Option 4: Make.com (Integromat)

1. Create a new scenario
2. Add Webhook module
3. Add OpenAI or Claude module
4. Add JSON formatter
5. Return response

### Option 5: Zapier

1. Create Zap with Webhook trigger
2. Add OpenAI or Claude action
3. Format JSON response
4. Return to webhook

## Testing

### Test Locally

```bash
# Set webhook URL in .env
VITE_WEBHOOK_URL=http://localhost:5000/generate-quiz

# Start your local webhook server
node webhook-server.js

# Start the app
npm run dev

# Upload a PDF and check console logs
```

### Test with Mock Webhook

Create a simple test endpoint:

```javascript
// test-webhook.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/generate-quiz', (req, res) => {
  console.log('Received request:', req.body);
  
  res.json({
    success: true,
    questions: [
      {
        question: "Test question from webhook?",
        options: ["A", "B", "C", "D"],
        answer: "B",
        explanation: "This is a test question"
      }
    ]
  });
});

app.listen(5000, () => console.log('Test webhook running on port 5000'));
```

Run: `node test-webhook.js`

## Console Logs

When webhook is used, you'll see:

```
[TeacherDashboard] Processing PDF: chapter1.pdf
[TeacherDashboard] Using webhook for AI-powered generation
[WebhookService] Sending text to webhook: https://...
[WebhookService] Response status: 200
[WebhookService] Webhook response: { success: true, questions: [...] }
[TeacherDashboard] Quiz generated via webhook: {...}
```

When falling back to local:

```
[TeacherDashboard] Processing PDF: chapter1.pdf
[TeacherDashboard] No webhook URL configured, using local generation
[TeacherDashboard] Generating quiz locally from extracted text
[QuizGenerator] Generating quiz with 5 questions
[TeacherDashboard] Quiz generated locally: {...}
```

## Error Handling

The app gracefully handles:
- Webhook not configured (falls back to local)
- Webhook timeout (falls back to local)
- Webhook returns error (shows message, falls back)
- Network errors (falls back to local)

## Production Deployment

1. Set `VITE_WEBHOOK_URL` in production environment
2. Ensure webhook endpoint is secure (HTTPS)
3. Add authentication if needed (API key in headers)
4. Set reasonable timeouts
5. Monitor webhook performance

## Security Considerations

- Use HTTPS for webhook URLs
- Add API key authentication to webhook
- Validate webhook responses
- Rate limit webhook calls
- Don't send sensitive data in PDF text

## Cost Optimization

- Cache frequently generated quizzes
- Limit number of questions per request
- Use cheaper models (GPT-3.5 instead of GPT-4)
- Implement client-side debouncing
- Set maximum text length limits

## Files Modified

- `src/services/webhookService.ts` - New webhook service
- `src/pages/TeacherDashboard.tsx` - Updated to use webhook
- `src/vite-env.d.ts` - Added VITE_WEBHOOK_URL type
- `.env.example` - Added webhook URL example
