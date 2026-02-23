// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <h2>SmartMoney</h2>
        </div>
        {/* Close Button (Mobile Only) */}
        <button className={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        <NavLink 
            to="/" 
            onClick={onClose} // Close sidebar when link is clicked on mobile
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Dashboard
        </NavLink>
        <NavLink 
            to="/transactions" 
            onClick={onClose}
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Transactions
        </NavLink>
        <NavLink 
            to="/budgets" 
            onClick={onClose}
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Budgets
        </NavLink>
        <NavLink 
            to="/goals" 
            onClick={onClose}
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Goals
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;