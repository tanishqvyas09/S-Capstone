// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import About from './pages/About.tsx';
import TeacherAuth from './pages/TeacherAuth.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import TeacherQuiz from './pages/TeacherQuiz.tsx';
import StudentAuth from './pages/StudentAuth.tsx';
import StudentDashboard from './pages/StudentDashboard.tsx';
import StudentQuiz from './pages/StudentQuiz.tsx';
import WebhookTest from './pages/WebhookTest.tsx';
import QuizAccess from './pages/QuizAccess.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/webhook-test" element={<WebhookTest />} />
        <Route path="/about" element={<About />} />
        <Route path="/quiz-access" element={<QuizAccess />} />
        <Route path="/teacher/auth" element={<TeacherAuth />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/quizzes/:quizId" element={<TeacherQuiz />} />
        <Route path="/student/auth" element={<StudentAuth />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/quiz/:quizId" element={<StudentQuiz />} />
      </Routes>
    </Router>
  );
}

export default App;