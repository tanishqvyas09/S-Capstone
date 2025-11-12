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
        <p>No quizzes available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {quizzes.map((q) => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
              <h3>{q.title}</h3>
              <p>Questions: {q.questions?.length || 0}</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>Status: {getStatus(q.id)}</p>
              <Link to={`/student/quiz/${q.id}`}>
                <button style={{ backgroundColor: '#28a745', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                  {scores[q.id] ? 'Review' : 'Take Quiz'}
                </button>
              </Link>
            </div>
          ))}
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