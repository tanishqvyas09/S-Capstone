// Modern Student Auth - Glassmorphic Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { BookOpen, GraduationCap, TrendingUp, Award } from 'lucide-react';

const StudentAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[StudentAuth] Rendered, isSignup:', isSignup);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 25s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: 1100,
        width: '100%',
        gap: '2rem',
        position: 'relative',
        zIndex: 1
      }}
      className="auth-container">
        {/* Left Side - Info Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          animation: 'fadeInUp 0.8s ease-out'
        }}
        className="info-panel">
          <div style={{
            width: 64,
            height: 64,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }}>
            <GraduationCap color="#667eea" size={36} strokeWidth={2} />
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-1px',
            lineHeight: 1.2
          }}>
            Welcome to Your Learning Journey
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2.5rem',
            lineHeight: 1.7
          }}>
            Access your quizzes, track progress, and achieve your learning goals with our modern platform.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {[
              { icon: <BookOpen size={22} />, text: 'Interactive quizzes with instant feedback' },
              { icon: <TrendingUp size={22} />, text: 'Track your progress and performance' },
              { icon: <Award size={22} />, text: 'Earn achievements and badges' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  animation: `slideIn 0.6s ease-out ${idx * 0.1 + 0.3}s both`
                }}
              >
                <div style={{
                  minWidth: 44,
                  height: 44,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {item.icon}
                </div>
                <span style={{
                  color: 'white',
                  fontSize: '1.05rem',
                  fontWeight: 500
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '0.75rem',
              letterSpacing: '-0.5px'
            }}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '1.05rem',
              fontWeight: 500
            }}>
              {isSignup ? 'Start your learning journey today' : 'Login to continue learning'}
            </p>
          </div>

          <AuthForm role="student" isSignup={isSignup} />

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{
              color: '#64748b',
              fontSize: '0.95rem',
              marginBottom: '1rem'
            }}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignup(!isSignup)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.875rem 2rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
              }}
            >
              {isSignup ? 'Login Instead' : 'Create New Account'}
            </button>

            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
                color: '#64748b',
                fontSize: '0.95rem',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-container {
            grid-template-columns: 1fr !important;
          }
          .info-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentAuth;
