import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const TeacherAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[TeacherAuth] Rendered, isSignup:', isSignup);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Teacher {isSignup ? 'Registration' : 'Login'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>{isSignup ? 'Create your teacher account' : 'Welcome back! Please login'}</p>
      </div>

      <AuthForm role="teacher" isSignup={isSignup} />

      <div style={{ textAlign: 'center', marginTop: '1rem', color: 'white' }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.95rem',
              marginLeft: 6
            }}
          >
            {isSignup ? 'Login here' : 'Register here'}
          </button>
        </p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '0.75rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default TeacherAuth;