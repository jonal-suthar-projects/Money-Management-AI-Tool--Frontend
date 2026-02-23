import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './BudgetsPage.module.css';
import ConfirmationModal from '../components/ConfirmationModal';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const fetchBudgets = async () => {
    try {
      const { data } = await api.get('/budgets/');
      setBudgets(data);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = (id) => {
    setBudgetToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (budgetToDelete) {
      try {
        await api.delete(`/budgets/${budgetToDelete}`);
        fetchBudgets();
      } catch (error) {
        console.error("Failed to delete budget:", error);
      } finally {
        setIsConfirmModalOpen(false);
        setBudgetToDelete(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const budgetData = {
      category,
      limit: parseFloat(limit),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
    };
    await api.post('/budgets/', budgetData);
    
    setCategory('');
    setLimit('');
    setEndDate('');
    fetchBudgets();
  };

  if (loading) return <p>Loading budgets...</p>;

  return (
    <div className={styles.pageContainer}>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Budget Deletion"
        message="Are you sure you want to delete this budget? This action cannot be undone."
      />

      <h1>Budgets</h1>
      <div className={styles.contentGrid}>
        <div className={`${styles.formContainer} card`}>
          <h3>Create New Budget</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Category (e.g., Entertainment)" value={category} onChange={e => setCategory(e.target.value)} required />
            <input type="number" placeholder="Limit (₹)" value={limit} onChange={e => setLimit(e.target.value)} required min="0.01" step="0.01" />
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            <button type="submit">Create Budget</button>
          </form>
        </div>
        <div className={styles.budgetsList}>
          {budgets.length > 0 ? budgets.map(budget => (
            <div key={budget._id} className={`${styles.budgetCard} card`}>
              <div className={styles.cardHeader}>
                <h4>{budget.category}</h4>
                <button onClick={() => handleDelete(budget._id)} className={styles.deleteBtn}>
                  &times;
                </button>
              </div>
              <p className={styles.limit}>Limit: ₹{budget.limit.toFixed(2)}</p>
              <p className={styles.dates}>
                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
              </p>
            </div>
          )) : <p>No budgets created yet. Add one to get started!</p>}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;