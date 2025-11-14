import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const QuizAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext)!;
  const { showToast } = useToast();

  useEffect(() => {
    // Auto-fill code from QR scan
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
      handleAccessQuiz(codeFromUrl);
    }
  }, [searchParams]);

  const handleAccessQuiz = async (code?: string) => {
    const codeToUse = code || accessCode;
    
    if (!codeToUse || codeToUse.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('[QuizAccess] Looking up quiz with code:', codeToUse);

      const { data, error: queryError } = await supabase
        .from('quizzes')
        .select('id, title')
        .eq('access_code', codeToUse)
        .single();

      if (queryError || !data) {
        console.error('[QuizAccess] Quiz not found:', queryError);
        setError('Invalid access code. Please check and try again.');
        return;
      }

      console.log('[QuizAccess] Quiz found:', data);
      
      // If a student is logged in, persist this access server-side into `quiz_access`.
      if (user && user.role === 'student') {
        try {
          const record = {
            id: crypto.randomUUID(),
            quiz_id: data.id,
            student_id: user.id,
            access_code: codeToUse,
            granted_at: new Date().toISOString()
          };

          const { error: insertError } = await supabase.from('quiz_access').insert(record);
          if (insertError) {
            console.warn('[QuizAccess] Could not write quiz_access record (falling back to localStorage):', insertError.message);
            showToast('Could not persist access server-side — saved locally', 'warning');
            throw insertError;
          }

          console.log('[QuizAccess] Recorded quiz access on server for student:', user.id);
          showToast('Access recorded on server — opening quiz', 'success');
        } catch (err) {
          // Fallback to localStorage if server insert fails
          try {
            const stored = localStorage.getItem('enteredQuizCodes');
            const arr = stored ? JSON.parse(stored) as string[] : [];
            if (!arr.includes(codeToUse)) {
              arr.push(codeToUse);
              localStorage.setItem('enteredQuizCodes', JSON.stringify(arr));
              console.log('[QuizAccess] Persisted access code in localStorage as fallback');
            }
          } catch (e) {
            console.warn('[QuizAccess] Could not persist access code to localStorage:', e);
          }
        }
      } else {
        // Not logged in: persist locally so dashboard can surface unlocked quizzes
        try {
          const stored = localStorage.getItem('enteredQuizCodes');
          const arr = stored ? JSON.parse(stored) as string[] : [];
          if (!arr.includes(codeToUse)) {
            arr.push(codeToUse);
            localStorage.setItem('enteredQuizCodes', JSON.stringify(arr));
            console.log('[QuizAccess] Persisted access code in localStorage');
            showToast('Quiz unlocked locally — opening quiz', 'info');
          }
        } catch (e) {
          console.warn('[QuizAccess] Could not persist access code to localStorage:', e);
        }
      }

      // Redirect to the quiz
      navigate(`/student/quiz/${data.id}`);
    } catch (err) {
      console.error('[QuizAccess] Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAccessCode(value);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#007bff',
          marginTop: 0,
          marginBottom: '0.5rem'
        }}>
          📝 Access Quiz
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#666',
          marginBottom: '2rem'
        }}>
          Enter the 6-digit code provided by your teacher
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Access Code
          </label>
          <input
            type="text"
            value={accessCode}
            onChange={handleInputChange}
            placeholder="000000"
            maxLength={6}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '2rem',
              textAlign: 'center',
              letterSpacing: '1rem',
              border: '2px solid ' + (error ? '#dc3545' : '#ddd'),
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              outline: 'none'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAccessQuiz();
              }
            }}
          />
          {error && (
            <p style={{
              color: '#dc3545',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              marginBottom: 0
            }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        <button
          onClick={() => handleAccessQuiz()}
          disabled={loading || accessCode.length !== 6}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: loading || accessCode.length !== 6 ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading || accessCode.length !== 6 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '⏳ Accessing...' : '🚀 Start Quiz'}
        </button>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            Don't have a code? Ask your teacher for the quiz access code or QR code.
          </p>
        </div>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              backgroundColor: 'transparent',
              color: '#007bff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              textDecoration: 'underline'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizAccess;
