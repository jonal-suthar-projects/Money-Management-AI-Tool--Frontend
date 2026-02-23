// src/pages/SignupPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/Authform';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const { signup } = useAuth();
  return (
    <div>
      <AuthForm isSignup={true} onSubmit={signup} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupPage;