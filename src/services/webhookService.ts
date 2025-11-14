// Service for sending files to webhook for AI-powered question generation

interface WebhookResponse {
  success: boolean;
  questions?: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
  error?: string;
  message?: string;
}

/**
 * Test the webhook to see what format it expects and returns
 */
export async function testWebhook(webhookUrl: string): Promise<any> {
  console.log('[WebhookService] Testing webhook:', webhookUrl);
  
  try {
    const testData = {
      test: true,
      message: "Testing webhook from Quiz App",
      timestamp: new Date().toISOString()
    };

    console.log('[WebhookService] Sending test data:', testData);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('[WebhookService] Test response status:', response.status);
    const data = await response.json();
    console.log('[WebhookService] Test response data:', data);
    return data;
  } catch (error: any) {
    console.error('[WebhookService] Test error:', error);
    console.error('[WebhookService] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Webhook test failed: ${error.message}. This might be a CORS issue - check your n8n webhook settings.`);
  }
}

/**
 * Sends file(s) to webhook for AI-powered question generation
 * @param files - Single file or array of files (max 3)
 * @param webhookUrl - The webhook URL to send the data to
 * @returns Promise with generated questions or error
 */
export async function sendFilesToWebhook(
  files: File | File[],
  webhookUrl: string,
  options?: { questionCount?: number; difficulty?: string; questionType?: string }
): Promise<WebhookResponse> {
  console.log('[WebhookService] Sending file(s) to webhook:', webhookUrl);
  
  try {
    // Convert to array if single file
    const fileArray = Array.isArray(files) ? files : [files];
    
    // No client-side limit on number of files; webhook/service should handle limits

    // Create FormData to send the file(s)
    const formData = new FormData();
    
    // Append all files
    fileArray.forEach((file, index) => {
      formData.append('file', file, file.name); // n8n will receive multiple files
      console.log(`[WebhookService] Added file ${index + 1}:`, file.name, file.size, 'bytes');
    });
    
    formData.append('fileCount', fileArray.length.toString());
    // Append generation options if provided
    if (options?.questionCount) formData.append('questionCount', String(options.questionCount));
    if (options?.difficulty) formData.append('difficulty', options.difficulty);
    if (options?.questionType) formData.append('questionType', options.questionType);
    formData.append('timestamp', new Date().toISOString());

    console.log('[WebhookService] FormData prepared with', fileArray.length, 'file(s)');

    // Send POST request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    });

    console.log('[WebhookService] Response status:', response.status);
    console.log('[WebhookService] Response headers:', Object.fromEntries(response.headers.entries()));

    // Read response text
    const responseText = await response.text();
    console.log('[WebhookService] Raw response text length:', responseText.length);

    // ✅ SUCCESS: If we got status 200, the file(s) reached n8n!
    if (response.status === 200) {
      console.log('✅ SUCCESS: File(s) were received by n8n webhook (status 200)');
    }

    if (!response.ok) {
      console.error('❌ FAILED: Webhook error response:', responseText);
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }

    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.warn('⚠️ FILE(S) SENT SUCCESSFULLY but n8n returned EMPTY response');
      console.warn('This means:');
      console.warn('  ✅ Your file(s) reached n8n');
      console.warn('  ❌ n8n workflow is NOT sending response back');
      throw new Error(
        'Files sent successfully to n8n, but no response received.\n\n' +
        '🔧 Fix in n8n:\n' +
        '1. Add "Respond to Webhook" node at the end of your workflow\n' +
        '2. Set response format to JSON\n' +
        '3. Return this structure:\n' +
        '{\n' +
        '  "success": true,\n' +
        '  "questions": [\n' +
        '    {\n' +
        '      "question": "Your question text",\n' +
        '      "options": ["A", "B", "C", "D"],\n' +
        '      "answer": "A",\n' +
        '      "explanation": "Why A is correct"\n' +
        '    }\n' +
        '  ]\n' +
        '}'
      );
    }

    // Try to parse as JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[WebhookService] Parsed JSON response:', data);
    } catch (e) {
      console.error('[WebhookService] Failed to parse JSON response:', responseText);
      throw new Error(`Webhook returned invalid JSON. Raw response (truncated): ${responseText.substring(0, 200)}`);
    }

    // Handle n8n array response format: [{ output: { questions: [...] } }]
    if (Array.isArray(data) && data.length > 0 && data[0].output?.questions) {
      console.log('[WebhookService] Detected n8n array format, extracting questions...');
      const questions = data[0].output.questions;
      
      // Transform n8n format to our app format
      const transformedQuestions = questions.map((q: any) => ({
        question: q.question,
        options: [q.options.A, q.options.B, q.options.C, q.options.D].filter(opt => opt !== "N/A"),
        answer: q.correct_answer === true ? "True" : 
                q.correct_answer === false ? "False" : 
                q.options[q.correct_answer] || q.correct_answer,
        explanation: q.explanation
      }));

      console.log('[WebhookService] Transformed questions:', transformedQuestions);
      
      return {
        success: true,
        questions: transformedQuestions
      };
    }

    // Handle direct format: { success: true, questions: [...] }
    if (data.success && data.questions) {
      console.log('[WebhookService] Direct format detected');
      return data;
    }

    // If we got here, format is unexpected
    console.error('[WebhookService] Unexpected response format:', data);
    throw new Error('Webhook returned data in unexpected format');
  } catch (error) {
    console.error('[WebhookService] Error sending to webhook:', error);
    throw error;
  }
}

// Backwards compatible alias for older callers
export const sendPDFToWebhook = sendFilesToWebhook;

/**
 * Alternative: Send only text to webhook (lighter payload)
 */
export async function sendTextToWebhook(
  extractedText: string,
  filename: string,
  webhookUrl: string
): Promise<WebhookResponse> {
  console.log('[WebhookService] Sending text to webhook:', webhookUrl);
  
  try {
    const payload = {
      text: extractedText,
      filename: filename,
      timestamp: new Date().toISOString(),
      requestType: 'generate_quiz'
    };

    console.log('[WebhookService] Payload:', {
      textLength: extractedText.length,
      filename,
      timestamp: payload.timestamp
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[WebhookService] Response status:', response.status);
    console.log('[WebhookService] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WebhookService] Webhook error response:', errorText);
      throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
    }

    // Get response as text first
    const responseText = await response.text();
    console.log('[WebhookService] Raw response text:', responseText);

    // Try to parse as JSON
    let data: WebhookResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[WebhookService] Failed to parse JSON response:', responseText);
      throw new Error(`Webhook returned invalid JSON. Raw response: ${responseText.substring(0, 200)}`);
    }

    console.log('[WebhookService] Parsed response:', data);

    if (!data.success) {
      throw new Error(data.error || data.message || 'Webhook returned unsuccessful response');
    }

    return data;
  } catch (error) {
    console.error('[WebhookService] Error sending to webhook:', error);
    throw error;
  }
}

/**
 * Get webhook URL from environment or configuration
 */
export function getWebhookUrl(): string {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://glowing-g79w8.crab.containers.automata.host/webhook/shabbar2';
  
  console.log('[WebhookService] Using webhook URL:', webhookUrl);
  
  return webhookUrl;
}
