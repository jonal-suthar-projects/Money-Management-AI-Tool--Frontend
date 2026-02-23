import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.welcome}>
        Hello, <strong>{user?.full_name || user?.email}</strong>
      </div>
      <button onClick={logout} className={styles.logoutButton}>Logout</button>
    </header>
  );
};

export default Header;