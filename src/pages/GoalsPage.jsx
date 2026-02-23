import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictDroppable } from '../components/StrictDroppable';
import styles from './GoalsPage.module.css';

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);

    // Form state
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState(new Date());

    const fetchGoals = async () => {
        try {
            const { data } = await api.get('/goals/');
            setGoals(data);
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        await api.post('/goals/', {
            name,
            target_amount: parseFloat(targetAmount),
            target_date: targetDate.toISOString(),
        });
        setIsAddModalOpen(false);
        setName('');
        setTargetAmount('');
        setTargetDate(new Date());
        fetchGoals();
    };

    const handleDelete = (id) => {
        setGoalToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (goalToDelete) {
            await api.delete(`/goals/${goalToDelete}`);
            setIsConfirmModalOpen(false);
            setGoalToDelete(null);
            fetchGoals();
        }
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) {
            return;
        }

        const newGoals = Array.from(goals);
        const [reorderedItem] = newGoals.splice(source.index, 1);
        newGoals.splice(destination.index, 0, reorderedItem);

        setGoals(newGoals);

        const orderedIds = newGoals.map(goal => goal._id);
        api.post('/goals/reorder', { ordered_ids: orderedIds });
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1>Savings Goals</h1>
                <button onClick={() => setIsAddModalOpen(true)}>+ Add Goal</button>
            </div>
            <p className={styles.subHeader}>Drag and drop goals to set their priority. Savings are allocated from top to bottom.</p>

            {loading ? <p>Loading goals...</p> :
                <DragDropContext onDragEnd={onDragEnd}>
                    <StrictDroppable droppableId="goals">
                        {(provided) => (
                            <div
                                className={styles.goalsGrid}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {goals.length > 0 ? goals.map((goal, index) => {
                                    const progress = (goal.saved_amount / goal.target_amount) * 100;
                                    return (
                                        <Draggable key={goal._id} draggableId={goal._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    className={`${styles.goalCard} card`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <div className={styles.cardHeader}>
                                                        <h4>{goal.name}</h4>
                                                        <button onClick={() => handleDelete(goal._id)} className={styles.deleteBtn}>&times;</button>
                                                    </div>
                                                    <p className={styles.goalAmount}>
                                                        ₹{goal.saved_amount.toFixed(0)} / <span className={styles.targetAmount}>₹{goal.target_amount.toFixed(0)}</span>
                                                    </p>
                                                    <div className={styles.progressBarBackground}>
                                                        <div className={styles.progressBarForeground} style={{ width: `${progress > 100 ? 100 : progress}%` }} />
                                                    </div>
                                                    <p className={styles.goalMonthly}>Target: ₹{goal.monthly_saving_target}/month</p>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                }) : <p>No goals yet. Drag and drop to prioritize!</p>}
                                {provided.placeholder}
                            </div>
                        )}
                    </StrictDroppable>
                </DragDropContext>
            }

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                 <form onSubmit={handleAddGoal} className={styles.form}>
                    <input type="text" placeholder="Goal Name (e.g., New iPhone)" value={name} onChange={e => setName(e.target.value)} required />
                    <input type="number" placeholder="Target Amount (₹)" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="1" />
                    <div className={styles.datePickerWrapper}>
                        <label>Target Date</label>
                        <DatePicker selected={targetDate} onChange={(date) => setTargetDate(date)} dateFormat="MMMM d, yyyy" className={styles.datePickerInput} />
                    </div>
                    <button type="submit">Create Goal</button>
                </form>
            </Modal>
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Confirm Goal Deletion" message="Are you sure you want to delete this goal?"/>
        </div>
    );
};

export default GoalsPage;