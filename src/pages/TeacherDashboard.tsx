import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import QuizEditor from '../components/QuizEditor';
import { generateQuiz } from '../services/quizGenerator';
import { sendTextToWebhook, getWebhookUrl } from '../services/webhookService';
import type { Quiz } from '../types/index';

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }>;
}

const TeacherDashboard = () => {
  const { user, loading } = useContext(AuthContext)!;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [fetching, setFetching] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);

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

  const handlePDFUpload = async (file: File, extractedText: string) => {
    try {
      setGeneratingQuiz(true);
      console.log('[TeacherDashboard] Processing PDF:', file.name);

      // Try to use webhook if URL is configured, otherwise fall back to local generation
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      if (webhookUrl) {
        console.log('[TeacherDashboard] Using webhook for AI-powered generation');
        try {
          const webhookResponse = await sendTextToWebhook(extractedText, file.name, webhookUrl);
          
          if (webhookResponse.success && webhookResponse.questions) {
            const quiz: GeneratedQuiz = {
              title: file.name.replace('.pdf', ''),
              description: `Quiz generated from ${file.name}`,
              questions: webhookResponse.questions
            };
            console.log('[TeacherDashboard] Quiz generated via webhook:', quiz);
            setGeneratedQuiz(quiz);
            return;
          }
        } catch (webhookError) {
          console.error('[TeacherDashboard] Webhook failed, falling back to local generation:', webhookError);
          alert('Webhook failed: ' + (webhookError instanceof Error ? webhookError.message : 'Unknown error') + '\n\nFalling back to local generation...');
        }
      } else {
        console.log('[TeacherDashboard] No webhook URL configured, using local generation');
      }

      // Fallback to local generation
      console.log('[TeacherDashboard] Generating quiz locally from extracted text');
      const quiz = await generateQuiz(file.name, extractedText, 5);
      console.log('[TeacherDashboard] Quiz generated locally:', quiz);
      setGeneratedQuiz(quiz);
    } catch (error) {
      console.error('[TeacherDashboard] Error generating quiz:', error);
      alert('Error generating quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSaveQuiz = async (editedQuiz: any) => {
    if (!user) {
      alert('Not authenticated');
      return;
    }

    try {
      setSavingQuiz(true);
      console.log('[TeacherDashboard] Saving quiz to Supabase:', editedQuiz);

      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          {
            title: editedQuiz.title,
            description: editedQuiz.description || '',
            questions: editedQuiz.questions,
            created_by: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      console.log('[TeacherDashboard] Quiz saved successfully:', data);
      alert('✅ Quiz saved successfully!');
      setGeneratedQuiz(null);
      await fetchQuizzes();
    } catch (error) {
      console.error('[TeacherDashboard] Error saving quiz:', error);
      alert('Error saving quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setSavingQuiz(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in first</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>👨‍🏫 Teacher Dashboard</h1>
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

      {/* PDF Upload & Quiz Generation */}
      {!generatedQuiz ? (
        <>
          <FileUploader onUpload={handlePDFUpload} loading={generatingQuiz} />
        </>
      ) : (
        <QuizEditor
          quiz={generatedQuiz}
          onSave={handleSaveQuiz}
          onCancel={() => setGeneratedQuiz(null)}
          loading={savingQuiz}
        />
      )}

      {/* Saved Quizzes */}
      <div style={{ marginTop: '3rem' }}>
        <h2>📚 Your Quizzes ({quizzes.length})</h2>
        {quizzes.length === 0 ? (
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            No quizzes yet. Upload a PDF above to create your first quiz! 📄
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0, color: '#007bff' }}>{q.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    📋 Questions: {q.questions?.length || 0}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>
                    Created: {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/teacher/quizzes/${q.id}`}>
                  <button
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '0.6rem 1.2rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '1rem',
                      fontSize: '0.95rem'
                    }}
                  >
                    📊 View Results
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;