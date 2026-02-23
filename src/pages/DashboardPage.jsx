import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './DashboardPage.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [language, setLanguage] = useState('en');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const chartData = {
    labels: summary ? Object.keys(summary.spending_by_category) : [],
    datasets: [{
      data: summary ? Object.values(summary.spending_by_category) : [],
      backgroundColor: ['#4a90e2', '#50e3c2', '#f5a623', '#f8e71c', '#bd10e0', '#9013fe'],
      borderColor: 'var(--surface-color)',
      borderWidth: 2,
    }],
  };
  
  if (loading) return <p>Loading dashboard...</p>;
  if (!summary) return <p>Could not load dashboard data.</p>;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>
      
      <div className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.income}`}>
          <h3>Total Income</h3>
          <p>₹{summary.total_income.toFixed(2)}</p>
        </div>
        <div className={`${styles.card} ${styles.expense}`}>
          <h3>Total Expense</h3>
          <p>₹{summary.total_expense.toFixed(2)}</p>
        </div>
        <div className={`${styles.card} ${styles.savings}`}>
          <h3>Net Savings</h3>
          <p>₹{summary.net_savings.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={`${styles.chartContainer} card`}>
          <h3>Spending by Category</h3>
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className={`${styles.suggestionsContainer} card`}>
          <h3>🧠 Smart Suggestions</h3>
          <ul>
            {summary.smart_suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
        <div className={`${styles.predictionContainer} card`}>
                    <h3>🔮 AI Spend Predictor</h3>
                    <p className={styles.predictionAmount}>₹{summary.prediction.predicted_amount.toFixed(2)}</p>
                    <p className={styles.predictionText}>predicted spend for the next 30 days</p>
                    <p className={styles.predictionReasoning}>{summary.prediction.reasoning}</p>
                </div>
      </div>
    </div>
  );
};

export default DashboardPage

