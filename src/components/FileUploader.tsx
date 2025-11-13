import { ChangeEvent, useState, useRef } from 'react';

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  loading?: boolean;
}

const FileUploader = ({ onUpload, loading = false }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check if all files are PDFs
      const invalidFiles = selectedFiles.filter(f => f.type !== 'application/pdf');
      if (invalidFiles.length > 0) {
        alert('Please select only PDF files');
        return;
      }

      // Limit to 3 files
      if (selectedFiles.length > 3) {
        alert('Maximum 3 PDF files allowed');
        return;
      }

      setFiles(selectedFiles);
    }
  };

  const handleClick = async () => {
    if (files.length === 0) {
      alert('Please select at least one PDF file');
      return;
    }

    try {
      await onUpload(files);
      
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[FileUploader] Upload error:', error);
      alert('Error uploading PDF(s). Please try again.');
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
      <h3>📄 Upload PDFs to Generate Quiz</h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Select 1-3 PDF files from your notes to auto-generate quiz questions</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        id="pdf-input"
      />

      <label htmlFor="pdf-input">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginRight: '1rem',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Processing...' : '📁 Choose PDFs (1-3)'}
        </button>
      </label>

      {files.length > 0 && (
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          {files.map((f, i) => (
            <div key={i} style={{ 
              display: 'inline-block',
              marginRight: '0.5rem', 
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#d4edda',
              borderRadius: '20px',
              color: '#155724',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              ✓ {f.name}
            </div>
          ))}
          <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={files.length === 0 || loading}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '4px',
          cursor: (files.length === 0 || loading) ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          opacity: (files.length === 0 || loading) ? 0.6 : 1
        }}
      >
        {loading ? '🤖 Generating Quiz...' : '🚀 Generate Quiz'}
      </button>
    </div>
  );
};

export default FileUploader;