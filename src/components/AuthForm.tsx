import { useState, FormEvent } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  role: 'teacher' | 'student';
  isSignup: boolean;
}

const AuthForm: React.FC<Props> = ({ role, isSignup }) => {
  const { login, signup } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [extra, setExtra] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[AuthForm] handleSubmit called', { role, isSignup, email });
    
    setError('');
    setLoading(true);

    if (isSignup && password !== confirm) {
      const msg = "Passwords don't match";
      setError(msg);
      alert(msg);
      setLoading(false);
      return;
    }

    if (!email || !password) {
      const msg = 'Email and password are required';
      setError(msg);
      alert(msg);
      setLoading(false);
      return;
    }

    try {
      console.log('[AuthForm] Starting auth process...', { isSignup });
      if (isSignup) {
        console.log('[AuthForm] Calling signup with:', { email, role });
        await signup(email, password, role, extra);
        console.log('[AuthForm] Signup successful');
      } else {
        console.log('[AuthForm] Calling login with:', { email, role });
        await login(email, password, role);
        console.log('[AuthForm] Login successful');
      }
      console.log('[AuthForm] Navigating to dashboard...');
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      console.error('[AuthForm] Auth error:', err);
      const errorMsg = err?.message || 'Authentication failed. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    margin: '10px 0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: '#FFFFFF',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 0 0 rgba(20, 184, 166, 0)',
    outline: 'none'
  };

  return (
    <div style={{
      display: 'flex',
      maxWidth: 950,
      width: '100%',
      background: 'rgba(31, 41, 55, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      position: 'relative'
    }}>
      {/* Glow effect on hover */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(20, 184, 166, 0.03) 0%, transparent 50%)',
        pointerEvents: 'none',
        opacity: 0.5
      }} />

      {/* Left info panel */}
      <div style={{
        flex: 1.1,
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%)',
        color: 'white',
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '1.5rem',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 60,
          height: 60,
          border: '2px solid rgba(20, 184, 166, 0.3)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        
        <h2 style={{ 
          margin: 0, 
          fontSize: '2rem', 
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.02em'
        }}>
          {isSignup ? 'Join EngageAI' : 'Welcome Back'}
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '1rem',
          color: '#E5E7EB',
          lineHeight: 1.6
        }}>
          {isSignup ? 'Create your account' : 'Sign in'} to access {role === 'teacher' ? 'the teacher dashboard' : 'student portal'} and unlock AI-powered quiz generation.
        </p>
        <div style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#E5E7EB' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '12px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#14B8A6',
              boxShadow: '0 0 8px rgba(20, 184, 166, 0.4)'
            }} />
            AI-powered quiz generation
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '12px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#14B8A6',
              boxShadow: '0 0 8px rgba(20, 184, 166, 0.4)'
            }} />
            Fast sharing & access codes
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#14B8A6',
              boxShadow: '0 0 8px rgba(20, 184, 166, 0.4)'
            }} />
            Secure student results
          </div>
        </div>
      </div>

      {/* Form panel */}
      <form onSubmit={handleSubmit} style={{
        flex: 1,
        background: 'rgba(0, 0, 0, 0.4)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#F87171',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.95rem',
            backdropFilter: 'blur(10px)'
          }}>
            {error}
          </div>
        )}

        <input 
          style={inputStyle}
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          disabled={loading}
          required
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
          }}
        />
        <input 
          style={inputStyle}
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          disabled={loading}
          required
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
          }}
        />
        {isSignup && (
          <>
            <input 
              style={inputStyle}
              type="password" 
              placeholder="Confirm Password" 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
              disabled={loading}
              required
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
              }}
            />
            {role === 'teacher' && (
              <>
                <input 
                  style={inputStyle}
                  placeholder="Full Name *" 
                  onChange={e => setExtra({ ...extra, full_name: e.target.value })} 
                  disabled={loading}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Subject *" 
                  onChange={e => setExtra({ ...extra, subject: e.target.value })} 
                  disabled={loading}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Grade Level *" 
                  onChange={e => setExtra({ ...extra, grade_level: e.target.value })} 
                  disabled={loading}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Phone Number" 
                  type="tel"
                  onChange={e => setExtra({ ...extra, phone: e.target.value })} 
                  disabled={loading}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="School/Institution" 
                  onChange={e => setExtra({ ...extra, institution: e.target.value })} 
                  disabled={loading}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
              </>
            )}
            {role === 'student' && (
              <>
                <input 
                  style={inputStyle}
                  placeholder="Full Name *" 
                  onChange={e => setExtra({ ...extra, full_name: e.target.value })} 
                  disabled={loading}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Class/Grade *" 
                  onChange={e => setExtra({ ...extra, class_year: e.target.value })} 
                  disabled={loading}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Roll Number" 
                  onChange={e => setExtra({ ...extra, roll_number: e.target.value })} 
                  disabled={loading}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="Phone Number" 
                  type="tel"
                  onChange={e => setExtra({ ...extra, phone: e.target.value })} 
                  disabled={loading}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
                <input 
                  style={inputStyle}
                  placeholder="School/Institution" 
                  onChange={e => setExtra({ ...extra, institution: e.target.value })} 
                  disabled={loading}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(20, 184, 166, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(20, 184, 166, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(20, 184, 166, 0)';
                  }}
                />
              </>
            )}
          </>
        )}
        <button
          type="submit"
          style={{ 
            width: '100%',
            marginTop: '20px',
            padding: '16px',
            fontSize: '1.05rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '12px',
            background: loading ? 'rgba(100, 100, 100, 0.3)' : '#14B8A6',
            color: loading ? '#6B7280' : '#FFFFFF',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(20, 184, 166, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#0D9488';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(20, 184, 166, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#14B8A6';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Account' : 'Sign In')}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;