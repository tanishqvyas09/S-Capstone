import { useState } from 'react';
import AuthForm from '../components/AuthForm';

const StudentAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[StudentAuth] Rendered, isSignup:', isSignup);

  return (
    <div style={{ paddingTop: '3rem' }}>
      <button 
        onClick={() => setIsSignup(!isSignup)} 
        style={{ marginBottom: '1rem', marginLeft: '1rem' }}
      >
        Switch to {isSignup ? 'Login' : 'Sign Up'}
      </button>
      <AuthForm role="student" isSignup={isSignup} />
    </div>
  );
};

export default StudentAuth;