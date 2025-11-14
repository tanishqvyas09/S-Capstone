import { useState, useRef } from 'react';
import { testWebhook, sendTextToWebhook, sendFilesToWebhook, getWebhookUrl } from '../services/webhookService';

const WebhookTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webhookUrl = getWebhookUrl();

  const allowedExt = ['.pdf', '.pptx', '.docx'];
  const allowedMimePrefix = 'audio/';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      const invalid = files.filter(f => {
        const name = f.name.toLowerCase();
        const extOk = allowedExt.some(ext => name.endsWith(ext));
        const mimeOk = f.type.startsWith(allowedMimePrefix) || f.type === 'application/pdf';
        return !(extOk || mimeOk);
      });

      if (invalid.length > 0) {
        setError('Please select only PDF, PPTX, DOCX or audio files');
        return;
      }

      // no client-side maximum file count enforced anymore

      setSelectedFiles(files);
      setError('');
    }
  };

  const handleTestWithFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await sendFilesToWebhook(selectedFiles, webhookUrl);
      setResult(response);
      console.log('File upload response:', response);
    } catch (err: any) {
      setError(err.message);
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await testWebhook(webhookUrl);
      setResult(response);
      console.log('Webhook test response:', response);
    } catch (err: any) {
      setError(err.message);
      console.error('Webhook test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWithSampleText = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const sampleText = `
      Introduction to Computer Science
      
      Computer science is the study of computers and computational systems.
      Programming is a fundamental skill in computer science.
      Data structures organize and store data efficiently.
      Algorithms are step-by-step procedures for solving problems.
      Software engineering involves designing, developing, and maintaining software systems.
    `;

    try {
      const response = await sendTextToWebhook(sampleText, 'sample.pdf', webhookUrl);
      setResult(response);
      console.log('Sample text response:', response);
    } catch (err: any) {
      setError(err.message);
      console.error('Sample text error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔗 Webhook Test Page</h1>
      <p style={{ color: '#666' }}>Testing webhook: {webhookUrl}</p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleTestWebhook}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        <button
          onClick={handleTestWithSampleText}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Sending...' : 'Test with Sample Text'}
        </button>
      </div>

      {/* File Upload Section */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '2px dashed #0ea5e9'
      }}>
        <h3>📁 Test with File</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Upload a file (PDF, PPTX, DOCX, or audio) to test the webhook flow
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.docx,audio/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-test-input"
        />

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.pptx,.docx,audio/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {selectedFiles.length > 0 ? 'Change Files' : 'Select Files'}
          </button>

          {selectedFiles.length > 0 && (
            <>
              <div style={{ marginTop: '0.75rem' }}>
                {selectedFiles.map((file, i) => (
                  <div key={i} style={{ color: '#0ea5e9', fontWeight: '500', marginBottom: '0.25rem' }}>
                    ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
                  </div>
                ))}
              </div>
              <button
                onClick={handleTestWithFiles}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '0.75rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Uploading...' : 'Upload & Test'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#fee',
          color: '#c33',
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h3>Response:</h3>
          <pre style={{
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        <h3>⚠️ CORS Issue?</h3>
        <p>If you see "Failed to fetch" error, your n8n webhook needs to enable CORS.</p>
        <p><strong>In n8n:</strong></p>
        <ol style={{ marginLeft: '1.5rem' }}>
          <li>Open your webhook node</li>
          <li>In the "Options" tab, find "Response Headers"</li>
          <li>Add these headers:
            <pre style={{ background: '#000', color: '#0f0', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px' }}>
{`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type`}
            </pre>
          </li>
          <li>Save and activate your workflow</li>
        </ol>
        <p style={{ marginTop: '1rem' }}>
          <strong>Alternative:</strong> You can also test with a tool like Postman or curl first to verify the webhook works.
        </p>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h3>📝 Expected Response Format:</h3>
        <pre style={{
          background: '#1e293b',
          color: '#e2e8f0',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`{
  "success": true,
  "questions": [
    {
      "question": "What is computer science?",
      "options": ["Study of computers", "Study of biology", "Study of chemistry", "Study of physics"],
      "answer": "Study of computers",
      "explanation": "Computer science is the study of computers and computational systems."
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

export default WebhookTest;
