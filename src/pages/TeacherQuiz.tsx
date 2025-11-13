import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../contexts/AuthContext';
import type { Score, Student, Quiz } from '../types/index';

interface ScoreWithStudent extends Score {
  student_name: string;
  student_email: string;
}

const TeacherQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useContext(AuthContext)!;
  const [scores, setScores] = useState<ScoreWithStudent[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

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

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      if (quizError) throw quizError;
      console.log('[TeacherQuiz] Quiz fetched:', quizData);
      setQuiz(quizData);

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');
      if (studentsError) throw studentsError;
      console.log('[TeacherQuiz] Students fetched:', studentsData);
      setAllStudents(studentsData || []);

      // Fetch scores
      const { data: scoresData, error: scoreError } = await supabase
        .from('scores')
        .select('*')
        .eq('quiz_id', quizId);
      if (scoreError) throw scoreError;
      console.log('[TeacherQuiz] Scores fetched:', scoresData);

      // Merge scores with student information
      const scoresWithStudents: ScoreWithStudent[] = (scoresData || []).map((score) => {
        const student = studentsData?.find((s) => s.id === score.student_id);
        return {
          ...score,
          student_name: student?.full_name || 'Unknown',
          student_email: student?.email || 'Unknown',
        };
      });

      setScores(scoresWithStudents);
    } catch (error) {
      console.error('[TeacherQuiz] Error fetching data:', error);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    if (scores.length === 0) return null;

    const scoreValues = scores.map((s) => {
      const [correct, total] = s.score.split('/').map(Number);
      return (correct / total) * 100;
    });

    const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
    const highest = Math.max(...scoreValues);
    const lowest = Math.min(...scoreValues);

    return {
      average: average.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      totalSubmissions: scores.length,
    };
  };

  const stats = getStatistics();

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>📊 {quiz?.title || 'Quiz'} – Results</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/teacher/dashboard">
          <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Quiz Information */}
          {quiz && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>Quiz Details</h3>
              {quiz.description && <p style={{ marginBottom: '0.5rem' }}>{quiz.description}</p>}
              <p style={{ marginBottom: '0.25rem' }}>
                <strong>Total Questions:</strong> {quiz.questions?.length || 0}
              </p>
              <p style={{ marginBottom: '0.25rem' }}>
                <strong>Created:</strong> {new Date(quiz.created_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>Submissions</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.totalSubmissions}</p>
              </div>
              <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#388e3c' }}>Average Score</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.average}%</p>
              </div>
              <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f57c00' }}>Highest Score</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.highest}%</p>
              </div>
              <div style={{ backgroundColor: '#fce4ec', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#c2185b' }}>Lowest Score</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.lowest}%</p>
              </div>
            </div>
          )}

          {/* Student Scores Table */}
          <h3>Student Submissions</h3>
          {scores.length === 0 ? (
            <p style={{ color: '#666', fontSize: '1.1rem' }}>No submissions yet. Students haven't taken this quiz.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #0056b3' }}>Student Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #0056b3' }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid #0056b3' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid #0056b3' }}>Percentage</th>
                    <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #0056b3' }}>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => {
                    const [correct, total] = s.score.split('/').map(Number);
                    const percentage = ((correct / total) * 100).toFixed(1);
                    const bgColor = i % 2 === 0 ? '#f9f9f9' : 'white';
                    
                    return (
                      <tr key={i} style={{ backgroundColor: bgColor, borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{s.student_name}</td>
                        <td style={{ padding: '0.75rem', color: '#666' }}>{s.student_email}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{s.score}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          textAlign: 'center',
                          color: Number(percentage) >= 70 ? '#388e3c' : Number(percentage) >= 50 ? '#f57c00' : '#d32f2f',
                          fontWeight: 'bold'
                        }}>
                          {percentage}%
                        </td>
                        <td style={{ padding: '0.75rem' }}>{new Date(s.date).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherQuiz;