import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Score } from '../types/index';

const TeacherQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useContext(AuthContext)!;
  const [scores, setScores] = useState<Score[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId && user) {
      fetchData();
    }
  }, [quizId, user]);

  const fetchData = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      console.log('[TeacherQuiz] Fetching quiz and scores for quizId:', quizId);

      // Fetch quiz title
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', quizId)
        .single();
      if (quizError) throw quizError;
      console.log('[TeacherQuiz] Quiz fetched:', quiz);
      setQuizTitle(quiz?.title || 'Quiz');

      // Fetch scores
      const { data, error: scoreError } = await supabase
        .from('scores')
        .select('*')
        .eq('quiz_id', quizId);
      if (scoreError) throw scoreError;
      console.log('[TeacherQuiz] Scores fetched:', data);
      setScores(data || []);
    } catch (error) {
      console.error('[TeacherQuiz] Error fetching data:', error);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>{quizTitle} – Results</h1>
      <Link to="/teacher/dashboard">
        <button style={{ marginBottom: '1rem', backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </Link>

      {loading ? (
        <p>Loading...</p>
      ) : scores.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Student ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Score</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.75rem' }}>{s.student_id}</td>
                <td style={{ padding: '0.75rem' }}>{s.score}</td>
                <td style={{ padding: '0.75rem' }}>{new Date(s.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherQuiz;