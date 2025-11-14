import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import ThemeToggle from '../components/ThemeToggle';

const TeacherAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[TeacherAuth] Rendered, isSignup:', isSignup);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Theme Toggle */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        zIndex: 100
      }}>
        <ThemeToggle />
      </div>

      {/* Subtle gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(20, 184, 166, 0.05) 0%, transparent 60%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Content */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', zIndex: 10, position: 'relative' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: 700, 
          margin: 0, 
          color: '#FFFFFF',
          letterSpacing: '-0.02em'
        }}>
          Teacher {isSignup ? 'Registration' : 'Portal'}
        </h1>
        <p style={{ 
          color: '#E5E7EB', 
          marginTop: 12,
          fontSize: '1rem',
          fontWeight: 400
        }}>
          {isSignup ? 'Create your teacher account' : 'Welcome back! Please sign in'}
        </p>
      </div>

      <div style={{ zIndex: 10, position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <AuthForm role="teacher" isSignup={isSignup} />
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '1.5rem', 
        zIndex: 10, 
        position: 'relative',
        background: 'rgba(31, 41, 55, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1.25rem 2rem'
      }}>
        <p style={{ color: '#E5E7EB', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: '#14B8A6',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              marginLeft: 8,
              padding: '6px 16px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(20, 184, 166, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0D9488';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#14B8A6';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isSignup ? 'Login here' : 'Register here'}
          </button>
        </p>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-block', 
            color: '#9CA3AF', 
            fontSize: '0.9rem', 
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#14B8A6'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TeacherAuth;