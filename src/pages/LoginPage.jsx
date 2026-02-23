// src/pages/LoginPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/Authform'
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  return (
    <div>
      <AuthForm onSubmit={login} />
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;