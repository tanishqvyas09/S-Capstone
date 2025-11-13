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
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; details: Array<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean; explanation?: string }> }>({ correct: 0, total: 0, details: [] });
  const [answersState, setAnswersState] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  // Proctoring: Fullscreen and tab switch detection
  useEffect(() => {
    if (!quiz || showResult || showReview || loading) return;

    // Enable fullscreen
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log('[StudentQuiz] Fullscreen not supported:', err);
      }
    };
    enterFullscreen();

    // Disable copy/paste
    const preventCopyPaste = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'C' || e.key === 'V')) {
        e.preventDefault();
        alert('⚠️ Copy/Paste is disabled during the quiz!');
      }
    };

    // Detect tab/window switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('keydown', preventCopyPaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', preventCopyPaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Exit fullscreen on cleanup
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [quiz, showResult, showReview, loading]);

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
      const details = quiz.questions.map((q: Question, i: number) => {
        const isCorrect = answers[i] === q.answer;
        if (isCorrect) correct++;
        return {
          question: q.question,
          userAnswer: answers[i] || 'Not answered',
          correctAnswer: q.answer,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const total = quiz.questions.length;
      setResult({ correct, total, details });
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

  const handleAnswerSelect = (qIdx: number, opt: string) => {
    setAnswersState({ ...answersState, [qIdx]: opt });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleReview = () => {
    setShowReview(true);
  };

  const handleFinalSubmit = () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const unanswered = quiz.questions.filter((_, i) => !answersState[i]).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Do you want to submit anyway?`)) {
        return;
      }
    }

    handleSubmit(answersState);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading quiz...</div>;
  }

  if (!quiz) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Quiz not found</div>;
  }

  // If showing results
  if (showResult) {
    const percentage = ((result.correct / result.total) * 100).toFixed(1);
    const passed = Number(percentage) >= 50;

    return (
      <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ 
          border: '2px solid ' + (passed ? '#28a745' : '#dc3545'), 
          padding: '2rem', 
          borderRadius: '12px', 
          backgroundColor: passed ? '#d4edda' : '#f8d7da',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: passed ? '#155724' : '#721c24', marginTop: 0 }}>
            {passed ? '🎉 Quiz Complete!' : '📝 Quiz Complete'}
          </h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: passed ? '#155724' : '#721c24' }}>
            {result.correct}/{result.total}
          </div>
          <div style={{ fontSize: '1.5rem', color: passed ? '#155724' : '#721c24' }}>
            {percentage}% Score
          </div>
          {passed ? (
            <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#155724' }}>Great job! You passed! 🌟</p>
          ) : (
            <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#721c24' }}>Keep practicing! 💪</p>
          )}
        </div>

        <h3>📋 Review Your Answers</h3>
        <div>
          {result.details.map((detail, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: '1.5rem', 
                padding: '1.25rem', 
                backgroundColor: detail.isCorrect ? '#d4edda' : '#f8d7da', 
                borderRadius: '8px', 
                borderLeft: `5px solid ${detail.isCorrect ? '#28a745' : '#dc3545'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', fontWeight: 'bold' }}>
                Question {i + 1}: {detail.question}
              </p>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold' }}>Your answer: </span>
                <span style={{ 
                  color: detail.isCorrect ? '#155724' : '#721c24',
                  fontWeight: detail.isCorrect ? 'bold' : 'normal'
                }}>
                  {detail.userAnswer}
                </span>
              </div>
              {!detail.isCorrect && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Correct answer: </span>
                  <span style={{ color: '#155724', fontWeight: 'bold' }}>{detail.correctAnswer}</span>
                </div>
              )}
              {detail.explanation && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.7)', 
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}>
                  <strong>💡 Explanation:</strong> {detail.explanation}
                </div>
              )}
              <div style={{ 
                marginTop: '0.75rem', 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: detail.isCorrect ? '#155724' : '#721c24'
              }}>
                {detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/student/dashboard')}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // If showing review page before submit
  if (showReview) {
    const answeredCount = Object.keys(answersState).length;
    const totalCount = quiz.questions.length;
    const unansweredCount = totalCount - answeredCount;

    return (
      <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        <h1>📝 Review Your Answers</h1>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #ffc107'
        }}>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>
            Answered: {answeredCount}/{totalCount} questions
          </p>
          {unansweredCount > 0 && (
            <p style={{ margin: '0.5rem 0', color: '#856404' }}>
              ⚠️ You have {unansweredCount} unanswered question(s)
            </p>
          )}
        </div>

        <div>
          {quiz.questions.map((q: Question, i: number) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                border: '1px solid ' + (answersState[i] ? '#28a745' : '#ffc107'), 
                borderRadius: '8px',
                backgroundColor: answersState[i] ? '#f8f9fa' : '#fffbf0'
              }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Question {i + 1}: {q.question}
              </p>
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: 'white', 
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                {answersState[i] ? (
                  <>
                    <span style={{ fontWeight: 'bold', color: '#28a745' }}>Your answer: </span>
                    <span>{answersState[i]}</span>
                    <button
                      onClick={() => setShowReview(false)}
                      style={{
                        marginLeft: '1rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Change Answer
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#856404', fontStyle: 'italic' }}>Not answered</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => setShowReview(false)}
            style={{
              flex: 1,
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
            ← Back to Quiz
          </button>
          <button
            onClick={handleFinalSubmit}
            style={{
              flex: 1,
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
            Submit Quiz →
          </button>
        </div>
      </div>
    );
  }

  // Main quiz taking interface
  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answersState).length;

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', position: 'relative' }}>
      {/* Proctoring Warning Banner */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'shake 0.5s'
        }}>
          ⚠️ Tab Switch Detected! ({tabSwitchCount} warning{tabSwitchCount > 1 ? 's' : ''})
        </div>
      )}
      {tabSwitchCount > 0 && !showWarning && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span style={{ color: '#856404', fontWeight: 'bold' }}>
            Tab switches detected: {tabSwitchCount} time{tabSwitchCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
      <h1>{quiz.title}</h1>
      {quiz.description && (
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{quiz.description}</p>
      )}

      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 'bold' }}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span style={{ color: '#666' }}>
            Answered: {answeredCount}/{quiz.questions.length}
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: '#007bff',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Current Question */}
      <div style={{ 
        border: '2px solid #007bff', 
        padding: '2rem', 
        borderRadius: '12px', 
        backgroundColor: '#f8f9fa',
        marginBottom: '2rem',
        minHeight: '300px'
      }}>
        <p style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          color: '#333'
        }}>
          {currentQ.question}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQ.options.map((opt, j) => (
            <label 
              key={j} 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem',
                backgroundColor: answersState[currentQuestion] === opt ? '#007bff' : 'white',
                color: answersState[currentQuestion] === opt ? 'white' : '#333',
                border: '2px solid ' + (answersState[currentQuestion] === opt ? '#0056b3' : '#dee2e6'),
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontWeight: answersState[currentQuestion] === opt ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (answersState[currentQuestion] !== opt) {
                  e.currentTarget.style.backgroundColor = '#e7f3ff';
                  e.currentTarget.style.borderColor = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                if (answersState[currentQuestion] !== opt) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }
              }}
            >
              <input
                type="radio"
                name={`q${currentQuestion}`}
                checked={answersState[currentQuestion] === opt}
                onChange={() => handleAnswerSelect(currentQuestion, opt)}
                style={{ marginRight: '1rem', transform: 'scale(1.3)' }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          style={{
            padding: '0.75rem',
            backgroundColor: currentQuestion === 0 ? '#e0e0e0' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestion === quiz.questions.length - 1}
          style={{
            padding: '0.75rem',
            backgroundColor: currentQuestion === quiz.questions.length - 1 ? '#e0e0e0' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentQuestion === quiz.questions.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Next →
        </button>
        <button
          onClick={handleReview}
          style={{
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
          Review & Submit ({answeredCount}/{quiz.questions.length})
        </button>
      </div>

      {/* Question Navigator */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Question Navigator</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '0.5rem' }}>
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              style={{
                padding: '0.75rem',
                backgroundColor: answersState[i] ? '#28a745' : (i === currentQuestion ? '#007bff' : 'white'),
                color: answersState[i] || i === currentQuestion ? 'white' : '#333',
                border: '1px solid ' + (i === currentQuestion ? '#0056b3' : '#dee2e6'),
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: i === currentQuestion ? 'bold' : 'normal'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.85rem', color: '#666' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#28a745', marginRight: '0.5rem', borderRadius: '2px' }}></span>
          Answered
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#007bff', marginLeft: '1rem', marginRight: '0.5rem', borderRadius: '2px' }}></span>
          Current
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: 'white', border: '1px solid #dee2e6', marginLeft: '1rem', marginRight: '0.5rem', borderRadius: '2px' }}></span>
          Not answered
        </p>
      </div>
    </div>
  );
};

export default StudentQuiz;