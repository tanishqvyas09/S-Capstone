import { useState } from 'react';
import AuthForm from '../components/AuthForm';

const TeacherAuth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  console.log('[TeacherAuth] Rendered, isSignup:', isSignup);

  return (
    <div style={{ paddingTop: '3rem' }}>
      <button 
        onClick={() => setIsSignup(!isSignup)} 
        style={{ marginBottom: '1rem', marginLeft: '1rem' }}
      >
        Switch to {isSignup ? 'Login' : 'Sign Up'}
      </button>
      <AuthForm role="teacher" isSignup={isSignup} />
    </div>
  );
};

export default TeacherAuth;