import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Quiz } from '../types/index';

const StudentDashboard = () => {
  const { user, loading } = useContext(AuthContext)!;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setFetching(true);
      console.log('[StudentDashboard] Fetching quizzes and scores for student:', user.id);
      // First fetch scores (quizzes the student has attempted)
      const { data: scoreData, error: scoreError } = await supabase
        .from('scores')
        .select('quiz_id, score')
        .eq('student_id', user.id);
      if (scoreError) throw scoreError;
      const map: Record<string, string> = {};
      scoreData?.forEach(s => (map[s.quiz_id] = s.score));
      setScores(map);

      // Build list of quiz IDs the student attempted
      const attemptedIds = Object.keys(map);

      // Try to fetch server-side `quiz_access` records for this student (quizzes unlocked via code)
      let accessQuizIds: string[] = [];
      try {
        const { data: accessRows, error: accessError } = await supabase
          .from('quiz_access')
          .select('quiz_id')
          .eq('student_id', user.id);
        if (accessError) {
          console.warn('[StudentDashboard] quiz_access query failed, falling back to localStorage:', accessError.message);
          throw accessError;
        }
        accessQuizIds = (accessRows || []).map((r: any) => r.quiz_id).filter(Boolean);
      } catch (e) {
        // Fallback: read enteredQuizCodes from localStorage if server-side table not available
        try {
          const stored = localStorage.getItem('enteredQuizCodes');
          const enteredCodes = stored ? JSON.parse(stored) as string[] : [];
          if (enteredCodes.length > 0) {
            const { data: codeQuizzes, error: codeError } = await supabase
              .from('quizzes')
              .select('id')
              .in('access_code', enteredCodes);
            if (!codeError && codeQuizzes) accessQuizIds = codeQuizzes.map((q: any) => q.id);
          }
        } catch (err) {
          console.warn('[StudentDashboard] Fallback localStorage read failed:', err);
        }
      }

      // Merge attemptedIds and accessQuizIds
      const allQuizIds = Array.from(new Set([...attemptedIds, ...accessQuizIds]));

      // Fetch quizzes by these ids
      const quizzesSet: Record<string, Quiz> = {};
      if (allQuizIds.length > 0) {
        const { data: fetchedQuizzes, error: fetchError } = await supabase
          .from('quizzes')
          .select('*')
          .in('id', allQuizIds);
        if (fetchError) throw fetchError;
        fetchedQuizzes?.forEach((q: Quiz) => { quizzesSet[q.id] = q; });
      }

      const finalQuizzes = Object.values(quizzesSet);
      console.log('[StudentDashboard] Quizzes visible to student:', finalQuizzes);
      setQuizzes(finalQuizzes || []);
    } catch (error) {
      console.error('[StudentDashboard] Error fetching data:', error);
    } finally {
      setFetching(false);
    }
  };

  const getStatus = (quizId: string) => {
    if (scores[quizId]) return `Completed – ${scores[quizId]}`;
    return 'Not Started';
  };

  const handleAccessCode = async () => {
    if (accessCode.length !== 6) {
      setCodeError('Please enter a valid 6-digit code');
      return;
    }
    navigate(`/quiz-access?code=${accessCode}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '500' }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a202c' }}>Authentication Required</h2>
          <p style={{ color: '#718096', marginBottom: '2rem' }}>Please log in to access your dashboard</p>
          <Link to="/student/auth" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)';
            }}>
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = Object.keys(scores).length;
  const totalCount = quizzes.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '2.25rem', 
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    EngageAI — Welcome Back! 👋
                  </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                {user.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={fetchData}
                disabled={fetching}
                style={{
                  background: fetching ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: fetching ? '#94a3b8' : 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: fetching ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: fetching ? 'none' : '0 4px 15px rgba(16,185,129,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => !fetching && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !fetching && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span style={{ fontSize: '1.2rem' }}>🔄</span>
                {fetching ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link to="/student/auth" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '1.2rem' }}>🚪</span>
                  Logout
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(59,130,246,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', opacity: 0.9, fontWeight: '500' }}>Total Quizzes</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>{totalCount}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', opacity: 0.9, fontWeight: '500' }}>Completed</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>{completedCount}</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(245,158,11,0.3)',
            color: 'white'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', opacity: 0.9, fontWeight: '500' }}>Progress</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>{progressPercentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Quick Access Code Section */}
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🔑</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>Quick Access</h2>
          </div>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Enter your 6-digit quiz code to start immediately
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '240px', maxWidth: '320px' }}>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => { 
                  setAccessCode(e.target.value.replace(/\D/g, '').slice(0,6)); 
                  setCodeError(''); 
                }}
                placeholder="000000"
                maxLength={6}
                style={{ 
                  padding: '1rem 1.25rem', 
                  fontSize: '1.25rem', 
                  borderRadius: '12px', 
                  border: `2px solid ${codeError ? '#ef4444' : accessCode.length === 6 ? '#10b981' : '#e2e8f0'}`,
                  width: '100%',
                  fontWeight: '600',
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: codeError ? '0 0 0 3px rgba(239,68,68,0.1)' : accessCode.length === 6 ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none'
                }}
                onKeyPress={(e) => { if (e.key === 'Enter') handleAccessCode(); }}
                onFocus={(e) => e.currentTarget.style.borderColor = codeError ? '#ef4444' : '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = codeError ? '#ef4444' : accessCode.length === 6 ? '#10b981' : '#e2e8f0'}
              />
              {codeError && (
                <p style={{ 
                  color: '#ef4444', 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  {codeError}
                </p>
              )}
            </div>
            <button
              onClick={() => handleAccessCode()}
              style={{ 
                padding: '1rem 2.5rem',
                background: accessCode.length === 6 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#e2e8f0',
                color: accessCode.length === 6 ? 'white' : '#94a3b8',
                border: 'none',
                borderRadius: '12px',
                cursor: accessCode.length === 6 ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: accessCode.length === 6 ? '0 4px 15px rgba(102,126,234,0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              disabled={accessCode.length !== 6}
              onMouseEnter={(e) => accessCode.length === 6 && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => accessCode.length === 6 && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span style={{ fontSize: '1.25rem' }}>🚀</span>
              Open Quiz
            </button>
          </div>
        </div>

        {/* Quizzes Section */}
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '700', color: '#1a202c' }}>
                Available Quizzes
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                {totalCount === 0 ? 'No quizzes available yet' : `${totalCount} ${totalCount === 1 ? 'quiz' : 'quizzes'} ready for you`}
              </p>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', color: '#475569', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                No Quizzes Yet
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0 }}>
                Check back later for new assessments!
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {quizzes.map((q) => {
                const status = getStatus(q.id);
                const isCompleted = scores[q.id];
                
                return (
                  <div 
                    key={q.id} 
                    style={{ 
                      border: 'none',
                      background: isCompleted 
                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      padding: '0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Card Header with Gradient */}
                    <div style={{
                      background: isCompleted 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      padding: '1.5rem',
                      color: 'white',
                      position: 'relative'
                    }}>
                      {isCompleted && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'rgba(255,255,255,0.3)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          padding: '0.4rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                          <span>✓</span> COMPLETED
                        </div>
                      )}
                      
                      <h3 style={{ 
                        margin: isCompleted ? '0 5rem 0 0' : 0,
                        fontSize: '1.35rem',
                        fontWeight: '700',
                        lineHeight: '1.4',
                        color: 'white'
                      }}>
                        {q.title}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.5rem' }}>
                      {q.description && (
                        <p style={{ 
                          fontSize: '0.95rem', 
                          color: '#475569',
                          marginBottom: '1.5rem',
                          lineHeight: '1.6',
                          margin: '0 0 1.5rem 0'
                        }}>
                          {q.description}
                        </p>
                      )}
                      
                      {/* Stats Grid */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.7)',
                          padding: '1rem',
                          borderRadius: '12px',
                          textAlign: 'center',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>📋</div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                            Questions
                          </p>
                          <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                            {q.questions?.length || 0}
                          </p>
                        </div>
                        
                        <div style={{
                          background: 'rgba(255,255,255,0.7)',
                          padding: '1rem',
                          borderRadius: '12px',
                          textAlign: 'center',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                            {isCompleted ? '🎯' : '📝'}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                            {isCompleted ? 'Score' : 'Status'}
                          </p>
                          <p style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700', 
                            margin: 0,
                            color: isCompleted ? '#059669' : '#64748b'
                          }}>
                            {isCompleted ? scores[q.id] : 'New'}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#64748b'
                      }}>
                        <span style={{ fontSize: '1rem' }}>📅</span>
                        <span style={{ fontWeight: '500' }}>
                          Created {new Date(q.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      <Link to={`/student/quiz/${q.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ 
                          background: isCompleted 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white', 
                          padding: '1rem 1.5rem', 
                          border: 'none', 
                          borderRadius: '12px', 
                          cursor: 'pointer', 
                          width: '100%',
                          fontSize: '1.05rem',
                          fontWeight: '700',
                          transition: 'all 0.3s ease',
                          boxShadow: isCompleted 
                            ? '0 4px 15px rgba(59,130,246,0.4)'
                            : '0 4px 15px rgba(16,185,129,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = isCompleted 
                            ? '0 6px 20px rgba(59,130,246,0.5)'
                            : '0 6px 20px rgba(16,185,129,0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = isCompleted 
                            ? '0 4px 15px rgba(59,130,246,0.4)'
                            : '0 4px 15px rgba(16,185,129,0.4)';
                        }}
                        >
                          <span style={{ fontSize: '1.25rem' }}>
                            {isCompleted ? '📊' : '▶️'}
                          </span>
                          {isCompleted ? 'Review Results' : 'Start Quiz'}
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(255,255,255,0.95)',
              color: '#667eea',
              padding: '0.875rem 2rem',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.15)';
              e.currentTarget.style.background = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            }}
            >
              <span style={{ fontSize: '1.25rem' }}>🏠</span>
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
