import { ChangeEvent, useState, useRef } from 'react';

interface FileUploaderProps {
  onUpload: (file: File, extractedText: string) => Promise<void>;
  loading?: boolean;
}

const FileUploader = ({ onUpload, loading = false }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please select a valid PDF file');
        setFile(null);
      }
    }
  };

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    try {
      console.log('[FileUploader] Extracting text from PDF:', pdfFile.name);
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += pageText + '\n';
      }

      console.log('[FileUploader] Text extracted successfully, length:', extractedText.length);
      return extractedText;
    } catch (error) {
      console.error('[FileUploader] Error extracting text from PDF:', error);
      throw error;
    }
  };

  const handleClick = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    try {
      setIsExtracting(true);
      const extractedText = await extractTextFromPDF(file);
      await onUpload(file, extractedText);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[FileUploader] Upload error:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div style={{
      border: '2px dashed #007bff',
      padding: '2rem',
      borderRadius: '8px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      marginBottom: '2rem'
    }}>
      <h3>📄 Upload PDF to Generate Quiz</h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Select a PDF file from your notes to auto-generate quiz questions</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="pdf-input"
      />

      <label htmlFor="pdf-input">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || isExtracting}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || isExtracting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginRight: '1rem',
            opacity: loading || isExtracting ? 0.6 : 1
          }}
        >
          {loading || isExtracting ? '⏳ Processing...' : '📁 Choose PDF'}
        </button>
      </label>

      {file && (
        <span style={{ marginRight: '1rem', color: '#28a745', fontWeight: 'bold' }}>
          ✓ {file.name}
        </span>
      )}

      <button
        onClick={handleClick}
        disabled={!file || loading || isExtracting}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: !file || loading || isExtracting ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          opacity: !file || loading || isExtracting ? 0.6 : 1
        }}
      >
        {isExtracting ? '⏳ Extracting PDF...' : loading ? '⏳ Generating Quiz...' : '🚀 Generate Quiz'}
      </button>
    </div>
  );
};

export default FileUploader;