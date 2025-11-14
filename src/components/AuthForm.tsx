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

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <p>Sign {isSignup ? 'up' : 'in'} to access {role === 'teacher' ? 'the teacher dashboard' : 'student portal'} and create interactive quizzes with EngageAI.</p>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.95 }}>
          <div>• AI-powered quiz generation</div>
          <div>• Fast sharing and access codes</div>
          <div>• Secure student results</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
      {error && (
        <div className="auth-error">{error}</div>
      )}

      <input 
        className="form-input" 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        disabled={loading}
        required 
      />
      <input 
        className="form-input" 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        disabled={loading}
        required 
      />
      {isSignup && (
        <>
          <input 
            className="form-input" 
            type="password" 
            placeholder="Confirm Password" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
            disabled={loading}
            required 
          />
          {role === 'teacher' && (
            <>
              <input 
                className="form-input" 
                placeholder="Full Name *" 
                onChange={e => setExtra({ ...extra, full_name: e.target.value })} 
                disabled={loading}
                required
              />
              <input 
                className="form-input" 
                placeholder="Subject *" 
                onChange={e => setExtra({ ...extra, subject: e.target.value })} 
                disabled={loading}
                required
              />
              <input 
                className="form-input" 
                placeholder="Grade Level *" 
                onChange={e => setExtra({ ...extra, grade_level: e.target.value })} 
                disabled={loading}
                required
              />
              <input 
                className="form-input" 
                placeholder="Phone Number" 
                type="tel"
                onChange={e => setExtra({ ...extra, phone: e.target.value })} 
                disabled={loading}
              />
              <input 
                className="form-input" 
                placeholder="School/Institution" 
                onChange={e => setExtra({ ...extra, institution: e.target.value })} 
                disabled={loading}
              />
            </>
          )}
          {role === 'student' && (
            <>
              <input 
                className="form-input" 
                placeholder="Full Name *" 
                onChange={e => setExtra({ ...extra, full_name: e.target.value })} 
                disabled={loading}
                required
              />
              <input 
                className="form-input" 
                placeholder="Class/Grade *" 
                onChange={e => setExtra({ ...extra, class_year: e.target.value })} 
                disabled={loading}
                required
              />
              <input 
                className="form-input" 
                placeholder="Roll Number" 
                onChange={e => setExtra({ ...extra, roll_number: e.target.value })} 
                disabled={loading}
              />
              <input 
                className="form-input" 
                placeholder="Phone Number" 
                type="tel"
                onChange={e => setExtra({ ...extra, phone: e.target.value })} 
                disabled={loading}
              />
              <input 
                className="form-input" 
                placeholder="School/Institution" 
                onChange={e => setExtra({ ...extra, institution: e.target.value })} 
                disabled={loading}
              />
            </>
          )}
        </>
      )}
      <button
        type="submit"
        className="btn-primary auth-submit"
        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
      >
        {loading ? (isSignup ? 'Creating Account...' : 'Logging In...') : (isSignup ? 'Create Account' : 'Login')}
      </button>
    </form>
    </div>
  );
}

export default AuthForm;