// Service for sending PDF to webhook for AI-powered question generation

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
 * Sends PDF file to webhook for AI-powered question generation
 * @param file - The PDF file to process
 * @param extractedText - Text extracted from the PDF (optional, can send file instead)
 * @param webhookUrl - The webhook URL to send the data to
 * @returns Promise with generated questions or error
 */
export async function sendPDFToWebhook(
  file: File,
  extractedText: string,
  webhookUrl: string
): Promise<WebhookResponse> {
  console.log('[WebhookService] Sending PDF to webhook:', webhookUrl);
  
  try {
    // Create FormData to send both file and text
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('text', extractedText);
    formData.append('filename', file.name);
    formData.append('timestamp', new Date().toISOString());

    console.log('[WebhookService] FormData prepared:', {
      filename: file.name,
      fileSize: file.size,
      textLength: extractedText.length
    });

    // Send POST request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type - browser will set it with boundary for FormData
        'Accept': 'application/json',
      },
    });

    console.log('[WebhookService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WebhookService] Webhook error response:', errorText);
      throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
    }

    const data: WebhookResponse = await response.json();
    console.log('[WebhookService] Webhook response:', data);

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
 * Alternative: Send only text to webhook (lighter payload)
 */
export async function sendTextToWebhook(
  extractedText: string,
  filename: string,
  webhookUrl: string
): Promise<WebhookResponse> {
  console.log('[WebhookService] Sending text to webhook:', webhookUrl);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text: extractedText,
        filename: filename,
        timestamp: new Date().toISOString(),
        requestType: 'generate_quiz'
      }),
    });

    console.log('[WebhookService] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WebhookService] Webhook error response:', errorText);
      throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
    }

    const data: WebhookResponse = await response.json();
    console.log('[WebhookService] Webhook response:', data);

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
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[WebhookService] VITE_WEBHOOK_URL not set in environment, using fallback');
    // You can set a default webhook URL here or throw an error
    throw new Error('Webhook URL not configured. Please set VITE_WEBHOOK_URL in .env file');
  }
  
  return webhookUrl;
}
