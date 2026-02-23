import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from './TablePage.module.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
}

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('expense');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());

    const [aiText, setAiText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [aiError, setAiError] = useState('');

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/transactions/');
            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(sortedData);
        } catch (error) { console.error("Failed to fetch transactions:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleAiSubmit = async (textToParse) => {
        if (!textToParse.trim()) return;
        setAiError('');
        try {
            await api.post('/transactions/parse', { text: textToParse });
            setAiText('');
            fetchTransactions();
        } catch (error) {
            console.error("AI parsing failed:", error);
            setAiError(error.response?.data?.detail || "AI failed to understand. Please try again.");
        }
    };

    useEffect(() => {
        if (!recognition) return;
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setAiText(transcript);
            handleAiSubmit(transcript);
            setIsListening(false);
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onend = () => { setIsListening(false); }
    }, []);

    const toggleListen = () => {
        if (isListening) {
            recognition.stop();
        } else {
            if (recognition) {
                recognition.lang = language;
                recognition.start();
            }
        }
        setIsListening(!isListening);
    };

    const handleDelete = (id) => {
        setTransactionToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (transactionToDelete) {
            try {
                await api.delete(`/transactions/${transactionToDelete}`);
                fetchTransactions();
            } catch (error) { console.error("Failed to delete transaction:", error); }
            finally {
                setIsConfirmModalOpen(false);
                setTransactionToDelete(null);
            }
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const transactionData = {
                amount: parseFloat(amount),
                category,
                type,
                note,
                date: date.toISOString()
            };
            await api.post('/transactions/', transactionData);
            
            setIsAddModalOpen(false);
            setAmount('');
            setCategory('');
            setType('expense');
            setNote('');
            setDate(new Date());
            fetchTransactions();
        } catch (error) {
            console.error("Failed to create transaction:", error);
            alert("Failed to add transaction. Please check your input.");
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/transactions/upload-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchTransactions();
        } catch (error) {
            console.error("OCR Upload failed:", error);
            alert(error.response?.data?.detail || "Could not process the image.");
        } finally {
            setUploading(false);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    if (loading) return <p>Loading transactions...</p>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1>Transactions</h1>
                <div className={styles.headerActions}>
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className={styles.hiddenInput}
                    />
                    <button onClick={triggerFileUpload} disabled={uploading} className={styles.iconButton}>
                        📷 Scan Receipt
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)}>Add Manually</button>
                </div>
            </div>

            <div className={`${styles.aiContainer} card`}>
                <h3>Add with AI ✨</h3>
                <p>Type or use your voice in English or Hindi. (e.g., "chai ke liye 15 rupaye kal")</p>
                <div className={styles.aiForm}>
                    <input
                        type="text"
                        placeholder="Start typing or click the mic..."
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAiSubmit(aiText); }}
                    />
                    {recognition && (
                        <button onClick={toggleListen} className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}>
                            🎙️
                        </button>
                    )}
                    <button onClick={() => handleAiSubmit(aiText)}>Add</button>
                </div>
                {aiError && <p className={styles.aiError}>{aiError}</p>}
                {recognition &&
                    <div className={styles.langToggle}>
                        <p>Language: </p>
                        <button onClick={() => setLanguage('en-US')} className={language === 'en-US' ? styles.activeLang : ''}>English</button>
                        <button onClick={() => setLanguage('hi-IN')} className={language === 'hi-IN' ? styles.activeLang : ''}>हिन्दी</button>
                    </div>
                }
            </div>
            
            {uploading && <p>Uploading and processing image...</p>}

            <div className={`${styles.tableContainer} card`}>
                <h3>History</h3>
                {/* Wrapped Table in a responsive wrapper */}
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Note</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t._id} className={t.type === 'income' ? styles.incomeRow : styles.expenseRow}>
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td className={styles.typeCell}>{t.type}</td>
                                    <td>{t.category}</td>
                                    <td className={styles.noteCell}>{t.note}</td>
                                    <td>₹{t.amount.toFixed(2)}</td>
                                    <td><button onClick={() => handleDelete(t._id)} className={styles.deleteBtn}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transactions.length === 0 && <p className={styles.emptyMessage}>No transactions yet. Add one to start!</p>}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h3>Add New Transaction</h3>
                <form onSubmit={handleManualSubmit}>
                    <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" />
                    <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <input type="text" placeholder="Note (e.g., Tea for 15)" value={note} onChange={e => setNote(e.target.value)} />
                    
                    <div className={styles.datePickerWrapper}>
                        <label>Transaction Date</label>
                        <DatePicker selected={date} onChange={(d) => setDate(d)} dateFormat="MMMM d, yyyy" className={styles.datePickerInput} />
                    </div>

                    <button type="submit">Save Transaction</button>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this transaction?"
            />
        </div>
    );
};

export default TransactionsPage;