import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Quiz } from '../types/index';

const StudentDashboard = () => {
  const { user, loading } = useContext(AuthContext)!;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(false);

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

      // Fetch all available quizzes
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*');
      if (quizError) throw quizError;
      console.log('[StudentDashboard] Quizzes fetched:', quizData);
      setQuizzes(quizData || []);

      // Fetch student's scores
      const { data: scoreData, error: scoreError } = await supabase
        .from('scores')
        .select('quiz_id, score')
        .eq('student_id', user.id);
      if (scoreError) throw scoreError;
      
      const map: Record<string, string> = {};
      scoreData?.forEach(s => (map[s.quiz_id] = s.score));
      console.log('[StudentDashboard] Scores fetched:', map);
      setScores(map);
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

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Please log in first</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Student Dashboard</h1>
      <p>Welcome, {user.email} ({user.role})</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={fetchData}
          disabled={fetching}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          {fetching ? 'Refreshing...' : 'Refresh Quizzes'}
        </button>
        <Link to="/student/auth">
          <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </Link>
      </div>

      <h2>Available Quizzes ({quizzes.length})</h2>
      {quizzes.length === 0 ? (
        <p style={{ fontSize: '1.1rem', color: '#666' }}>No quizzes available yet. Check back later!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quizzes.map((q) => {
            const status = getStatus(q.id);
            const isCompleted = scores[q.id];
            
            return (
              <div 
                key={q.id} 
                style={{ 
                  border: '2px solid ' + (isCompleted ? '#28a745' : '#007bff'), 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  backgroundColor: isCompleted ? '#d4edda' : '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ Completed
                  </div>
                )}
                
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: isCompleted ? '#155724' : '#007bff' }}>
                    {q.title}
                  </h3>
                  
                  {q.description && (
                    <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {q.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem 0' }}>Questions</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                        📋 {q.questions?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem 0' }}>
                        {isCompleted ? 'Your Score' : 'Status'}
                      </p>
                      <p style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        margin: 0,
                        color: isCompleted ? '#155724' : '#666'
                      }}>
                        {isCompleted ? `🎯 ${scores[q.id]}` : '📝 Not Started'}
                      </p>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>
                    Created: {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <Link to={`/student/quiz/${q.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ 
                    backgroundColor: isCompleted ? '#007bff' : '#28a745',
                    color: 'white', 
                    padding: '0.75rem 1.5rem', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    width: '100%',
                    marginTop: '1rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isCompleted ? '📊 Review Results' : '▶️ Start Quiz'}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Link to="/">
        <button style={{ marginTop: '2rem', backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back Home
        </button>
      </Link>
    </div>
  );
};

export default StudentDashboard;