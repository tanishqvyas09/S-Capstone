import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const StudentAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[StudentAuth] Rendered, isSignup:', isSignup);

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
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Student {isSignup ? 'Registration' : 'Login'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            {isSignup ? 'Create your student account' : 'Welcome back! Please login'}
          </p>
        </div>
        
        <AuthForm role="student" isSignup={isSignup} />
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              {isSignup ? 'Login here' : 'Register here'}
            </button>
          </p>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: '#6b7280',
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentAuth;