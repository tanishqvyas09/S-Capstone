import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Quiz, Question } from '../types/index';

const StudentQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext)!;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [answersState, setAnswersState] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      console.log('[StudentQuiz] Fetching quiz:', quizId);
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      
      if (error) throw error;
      console.log('[StudentQuiz] Quiz fetched:', data);
      setQuiz(data);
    } catch (error) {
      console.error('[StudentQuiz] Error fetching quiz:', error);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers: Record<number, string>) => {
    if (!quiz || !user) return;
    
    try {
      setAnswersState(answers);
      let correct = 0;
      quiz.questions.forEach((q: Question, i: number) => {
        if (answers[i] === q.answer) correct++;
      });
      const total = quiz.questions.length;
      setResult({ correct, total });
      setShowResult(true);

      // Save score
      console.log('[StudentQuiz] Saving score:', { quiz_id: quizId, student_id: user.id, score: `${correct}/${total}` });
      const { error } = await supabase.from('scores').insert({
        quiz_id: quizId,
        student_id: user.id,
        score: `${correct}/${total}`,
        date: new Date().toISOString(),
      });

      if (error) {
        console.error('[StudentQuiz] Error saving score:', error);
      } else {
        console.log('[StudentQuiz] Score saved successfully');
      }
    } catch (error) {
      console.error('[StudentQuiz] Error in handleSubmit:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading quiz...</div>;
  }

  if (!quiz) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Quiz not found</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>{quiz.title}</h1>

      {!showResult ? (
        <div>
          {quiz.questions.map((q: Question, i: number) => (
            <div key={i} style={{ marginBottom: '1.5rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ fontWeight: 600 }}><strong>Q{i + 1}:</strong> {q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {q.options.map((opt, j) => (
                  <label key={j} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answersState[i] === opt}
                      onChange={() => setAnswersState({ ...answersState, [i]: opt })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => handleSubmit(answersState)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ color: '#28a745' }}>✓ Quiz Complete!</h2>
          <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            You scored <strong>{result.correct}/{result.total}</strong> ({((result.correct / result.total) * 100).toFixed(0)}%)
          </div>
          
          <h3>Review Your Answers</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            {quiz.questions.map((q: Question, i: number) => {
              const isCorrect = answersState[i] === q.answer;
              return (
                <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: isCorrect ? '#d4edda' : '#f8d7da', borderRadius: '4px', borderLeft: `4px solid ${isCorrect ? '#28a745' : '#dc3545'}` }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Q{i + 1}:</strong> {q.question}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    Your answer: <strong>{answersState[i] || '—'}</strong>
                  </p>
                  <p style={{ margin: '0.25rem 0', color: isCorrect ? '#155724' : '#721c24' }}>
                    {isCorrect ? '✓ Correct' : `✗ Incorrect. Correct answer: ${q.answer}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/student/dashboard')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowResult(false);
                setAnswersState({});
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;