import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import QuizEditor from '../components/QuizEditor';
import { generateQuiz } from '../services/quizGenerator';
import { sendFilesToWebhook, getWebhookUrl } from '../services/webhookService';
import { useToast } from '../components/Toast';
import type { Quiz, Question } from '../types/index';
import QRCode from 'qrcode';

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: Question[];
}

interface EditingQuiz extends GeneratedQuiz {
  id: string;
}

const TeacherDashboard = () => {
  const { user, loading } = useContext(AuthContext)!;
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [fetching, setFetching] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [showGenerationStreaming, setShowGenerationStreaming] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const generationTimerRef = useRef<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionType, setQuestionType] = useState<string>('mcq');
  const [editingQuiz, setEditingQuiz] = useState<EditingQuiz | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [shareQuiz, setShareQuiz] = useState<Quiz | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (user && !loading) {
      fetchQuizzes();
    }
  }, [user, loading]);

  const fetchQuizzes = async () => {
    if (!user) return;
    try {
      setFetching(true);
      console.log('[TeacherDashboard] Fetching quizzes for teacher:', user.id);
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('created_by', user.id);

      if (error) throw error;
      console.log('[TeacherDashboard] Quizzes fetched:', data);
      setQuizzes(data || []);
    } catch (error) {
      console.error('[TeacherDashboard] Error fetching quizzes:', error);
      setQuizzes([]);
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      setGeneratingQuiz(true);
      try { showToast('Generating quiz — this may take a moment...', 'info', 4000); } catch {};
      // start a delayed streaming indicator if generation takes longer than 800ms
      generationTimerRef.current = window.setTimeout(() => {
        setShowGenerationStreaming(true);
      }, 800);
      console.log('[TeacherDashboard] Uploading files:', files.map(f => f.name));

      // Get webhook URL
      const webhookUrl = getWebhookUrl();

      console.log('[TeacherDashboard] Using webhook for AI-powered generation');
      try {
        // Map our UI selection to the webhook expected type names (n8n uses these strings)
        const webhookQuestionType = questionType === 'mcq' ? 'mcq' : questionType === 'tf' ? 'true_false' : 'fill_in_blank';

        // clear previous stream log
        setStreamLog([]);
        const webhookResponse = await sendFilesToWebhook(files, webhookUrl, { questionCount, difficulty, questionType: webhookQuestionType, onChunk: (chunk: string) => {
          // Append chunk to log, cap at 80 entries to avoid memory bloat
          setStreamLog(prev => {
            const next = [...prev, chunk.trim()];
            if (next.length > 80) return next.slice(next.length - 80);
            return next;
          });
        } });

        if (webhookResponse.success && webhookResponse.questions) {
          // Normalize incoming questions: ensure type/options exist and strip options for non-mcq types
          const normalizedQuestions = (webhookResponse.questions || []).map((q: any) => {
            // Determine returned type (normalize variants), fall back to requested type
            const returned = (q.type || '').toString().toLowerCase();
            let type: 'mcq' | 'tf' | 'fill' = 'mcq';

            if (returned.includes('fill') || returned.includes('blank')) type = 'fill';
            else if (returned.includes('true') || returned === 'tf' || returned.includes('false')) type = 'tf';
            else if (returned.includes('mcq')) type = 'mcq';
            else {
              // fallback to the teacher's requested type
              if (webhookQuestionType === 'mcq') type = 'mcq';
              else if (webhookQuestionType === 'true_false') type = 'tf';
              else type = 'fill';
            }

            // For True/False questions: ignore any incoming options and force True/False
            if (type === 'tf') {
              const answerRaw = (q.answer || q.answer === false || q.answer === true) ? q.answer : q.correct_answer || '';
              const answer = typeof answerRaw === 'boolean' ? (answerRaw ? 'True' : 'False') : String(answerRaw || '').replace(/^(true|false)$/i, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase());
              return {
                question: q.question || '',
                options: ['True', 'False'],
                answer: answer || '',
                explanation: q.explanation || '',
                type: 'tf'
              };
            }

            // For MCQ: keep options (ensure array) and answer
            if (type === 'mcq') {
              // Ensure options is an array of strings
              const opts = Array.isArray(q.options) ? q.options : (q.options && typeof q.options === 'object' ? Object.values(q.options) : []);
              const optionsArr = opts.length > 0 ? opts : ['', '', '', ''];
              return {
                question: q.question || '',
                options: optionsArr,
                answer: q.answer || '',
                explanation: q.explanation || '',
                type: 'mcq'
              };
            }

            // fill_in_blank: strip any options returned by webhook
            return {
              question: q.question || '',
              options: [],
              answer: q.answer || '',
              explanation: q.explanation || '',
              type: 'fill'
            };
          });

          const quiz: GeneratedQuiz = {
            title: files.length > 1 
              ? `Quiz from ${files.length} files` 
              : files[0].name.replace(/\.[^/.]+$/, ''),
            description: files.length > 1
              ? `Quiz generated from: ${files.map(f => f.name).join(', ')}`
              : `Quiz generated from ${files[0].name}`,
            questions: normalizedQuestions
          };
          console.log('[TeacherDashboard] Quiz generated via webhook:', quiz);
          setGeneratedQuiz(quiz);
          try { showToast('✅ Quiz generated successfully!', 'success'); } catch {};
          return;
        }
      } catch (webhookError) {
        console.error('[TeacherDashboard] Webhook failed:', webhookError);
        try { showToast('Webhook failed: ' + (webhookError instanceof Error ? webhookError.message : 'Unknown error'), 'error', 6000); } catch {};
        throw webhookError;
      }
    } catch (error) {
      console.error('[TeacherDashboard] Error generating quiz:', error);
      try { showToast('Error generating quiz: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error', 6000); } catch {};
    } finally {
      setGeneratingQuiz(false);
      // clear streaming indicator and timer
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
        generationTimerRef.current = null;
      }
      setShowGenerationStreaming(false);
    }
  };

  const handleSaveQuiz = async (editedQuiz: any) => {
    if (!user) {
      try { showToast('Not authenticated', 'error'); } catch {};
      return;
    }

    try {
      setSavingQuiz(true);

      // Check if we're editing an existing quiz or creating a new one
      if (editingQuiz && editingQuiz.id) {
        console.log('[TeacherDashboard] Updating existing quiz:', editingQuiz.id);
        
        const { data, error } = await supabase
          .from('quizzes')
          .update({
            title: editedQuiz.title,
            description: editedQuiz.description || '',
            questions: editedQuiz.questions,
          })
          .eq('id', editingQuiz.id)
          .select();

        if (error) throw error;

        console.log('[TeacherDashboard] Quiz updated successfully:', data);
        try { showToast('✅ Quiz updated successfully!', 'success'); } catch {};
        setEditingQuiz(null);
      } else {
        console.log('[TeacherDashboard] Creating new quiz:', editedQuiz);

        // Generate 6-digit access code
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        const { data, error } = await supabase
          .from('quizzes')
          .insert([
            {
              title: editedQuiz.title,
              description: editedQuiz.description || '',
              questions: editedQuiz.questions,
              created_by: user.id,
              created_at: new Date().toISOString(),
              access_code: accessCode,
            },
          ])
          .select();

        if (error) throw error;

        console.log('[TeacherDashboard] Quiz saved successfully:', data);
        try { showToast('✅ Quiz saved successfully!', 'success'); } catch {};
        setGeneratedQuiz(null);
        
        // Automatically show share modal for new quiz
        if (data && data[0]) {
          setShareQuiz(data[0]);
          generateQRCode(data[0].id, accessCode);
        }
      }

      await fetchQuizzes();
    } catch (error) {
      console.error('[TeacherDashboard] Error saving quiz:', error);
      try { showToast('Error saving quiz: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error', 6000); } catch {};
      throw error;
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      questions: quiz.questions,
    });
    setGeneratedQuiz(null); // Clear any generated quiz
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingQuizId(quizId);
      console.log('[TeacherDashboard] Deleting quiz:', quizId);

      // First delete all scores associated with this quiz
      const { error: scoresError } = await supabase
        .from('scores')
        .delete()
        .eq('quiz_id', quizId);

      if (scoresError) {
        console.warn('[TeacherDashboard] Error deleting scores:', scoresError);
      }

      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (quizError) throw quizError;

      console.log('[TeacherDashboard] Quiz deleted successfully');
      try { showToast('✅ Quiz deleted successfully!', 'success'); } catch {};
      await fetchQuizzes();
    } catch (error) {
      console.error('[TeacherDashboard] Error deleting quiz:', error);
      try { showToast('Error deleting quiz: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error', 6000); } catch {};
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleCancelEdit = () => {
    setGeneratedQuiz(null);
    setEditingQuiz(null);
  };

  const generateQRCode = async (quizId: string, accessCode: string) => {
    try {
      const url = `${window.location.origin}/quiz-access?code=${accessCode}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('[TeacherDashboard] Error generating QR code:', error);
    }
  };

  const handleShareQuiz = (quiz: Quiz) => {
    setShareQuiz(quiz);
    if (quiz.access_code) {
      generateQRCode(quiz.id, quiz.access_code);
    }
  };

  const handleCloseShareModal = () => {
    setShareQuiz(null);
    setQrCodeUrl('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    try { showToast('✅ Copied to clipboard!', 'success'); } catch {};
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in first</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>EngageAI — 👨‍🏫 Teacher Dashboard</h1>
      <p>Welcome, <strong>{user.email}</strong> ({user.role})</p>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={fetchQuizzes}
          disabled={fetching}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem',
            opacity: fetching ? 0.6 : 1
          }}
        >
          {fetching ? '⏳ Refreshing...' : '🔄 Refresh Quizzes'}
        </button>
        <Link to="/teacher/auth">
          <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🚪 Logout
          </button>
        </Link>
      </div>

      {/* Generation Options (hidden when editing or reviewing generated quiz) */}
      {!generatedQuiz && !editingQuiz && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Number of Questions</label>
          <input type="number" min={1} max={50} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value) || 1)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd', width: 140 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Question Type</label>
          <select value={questionType} onChange={e => setQuestionType(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}>
            <option value="mcq">MCQ</option>
            <option value="tf">True / False</option>
            <option value="fill">Fill Ups</option>
          </select>
        </div>
        </div>
      )}

      {/* Streaming indicator shown only when generation is taking time */}
      {generatingQuiz && showGenerationStreaming && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="streaming-spinner" aria-hidden />
          <div style={{ color: '#64748b', fontWeight: 600 }}>Generating quiz — this may take a moment...</div>
        </div>
      )}

      {/* Live progress log from webhook streaming chunks */}
      {streamLog.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#334155' }}>Generation progress</div>
          <div style={{ background: '#0f172a', color: '#e6eef8', padding: '0.75rem', borderRadius: 8, maxHeight: 240, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {streamLog.map((chunk, idx) => (
              <div key={idx} style={{ marginBottom: 6, whiteSpace: 'pre-wrap' }}>
                {chunk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Upload & Quiz Generation */}
      {!generatedQuiz && !editingQuiz ? (
        <>
          <FileUploader onUpload={handleFileUpload} loading={generatingQuiz} />
        </>
      ) : (
        <QuizEditor
          quiz={editingQuiz || generatedQuiz!}
          onSave={handleSaveQuiz}
          onCancel={handleCancelEdit}
          loading={savingQuiz}
        />
      )}

      {/* Saved Quizzes */}
      <div style={{ marginTop: '3rem' }}>
        <h2>📚 Your Quizzes ({quizzes.length})</h2>
        {quizzes.length === 0 ? (
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            No quizzes yet. Upload a file above to create your first quiz! 📁
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {quizzes.map((q) => (
              <div
                key={q.id}
                style={{
                  border: '1px solid #ddd',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: deletingQuizId === q.id ? 0.5 : 1
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0, color: '#007bff' }}>{q.title}</h3>
                  {q.description && (
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.75rem' }}>
                      {q.description}
                    </p>
                  )}
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    📋 Questions: {q.questions?.length || 0}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>
                    Created: {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleShareQuiz(q)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '0.95rem',
                      fontWeight: 'bold'
                    }}
                  >
                    🔗 Share Quiz
                  </button>
                  <button
                    onClick={() => handleEditQuiz(q)}
                    disabled={deletingQuizId === q.id || !!editingQuiz || !!generatedQuiz}
                    style={{
                      backgroundColor: '#ffc107',
                      color: '#000',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingQuizId === q.id || !!editingQuiz || !!generatedQuiz ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      opacity: deletingQuizId === q.id || !!editingQuiz || !!generatedQuiz ? 0.6 : 1
                    }}
                  >
                    ✏️ Edit Quiz
                  </button>
                  <Link to={`/teacher/quizzes/${q.id}`} style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.95rem'
                      }}
                    >
                      📊 View Results
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    disabled={deletingQuizId === q.id}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: deletingQuizId === q.id ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '0.95rem',
                      opacity: deletingQuizId === q.id ? 0.6 : 1
                    }}
                  >
                    {deletingQuizId === q.id ? '⏳ Deleting...' : '🗑️ Delete Quiz'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Quiz Modal */}
      {shareQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={handleCloseShareModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{ marginTop: 0, color: '#28a745' }}>🔗 Share Quiz</h2>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>{shareQuiz.title}</h3>

            {/* Access Code */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '2px solid #28a745'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>📱 6-Digit Access Code</h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#28a745',
                  letterSpacing: '0.5rem',
                  fontFamily: 'monospace'
                }}>
                  {shareQuiz.access_code || 'N/A'}
                </div>
                <button
                  onClick={() => copyToClipboard(shareQuiz.access_code || '')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.9rem', color: '#666' }}>
                Students can enter this code at: <strong>{window.location.origin}/quiz-access</strong>
              </p>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: '2px solid #007bff'
              }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>📱 QR Code</h4>
                <img 
                  src={qrCodeUrl} 
                  alt="Quiz QR Code" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    border: '4px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
                <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.9rem', color: '#666' }}>
                  Students can scan this QR code to access the quiz directly
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `quiz-${shareQuiz.access_code}-qr.png`;
                    link.href = qrCodeUrl;
                    link.click();
                  }}
                  style={{
                    marginTop: '1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  💾 Download QR Code
                </button>
              </div>
            )}

            <button
              onClick={handleCloseShareModal}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;