import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Circle, ListTodo } from 'lucide-react';
import { useTracking } from '../context/TrackingContext';

const Todo = () => {
    const { refreshTracking } = useTracking();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/habits/tasks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const response = await fetch('http://localhost:5000/api/habits/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text: newTask })
            });
            const data = await response.json();
            setTasks([...tasks, data]);
            setNewTask('');
            refreshTracking();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTask = async (id, completed) => {
        try {
            await fetch(`http://localhost:5000/api/habits/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ completed: !completed })
            });
            setTasks(tasks.map(t => t._id === id ? { ...t, completed: !completed } : t));
            refreshTracking();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <header className="page-header">
                <h1>Today’s gentle list</h1>
                <p>Only what feels doable. Cross things off when you’re ready — no pressure.</p>
            </header>

            <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                <form onSubmit={addTask} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <input
                        className="input"
                        placeholder="One small thing you’d like to do…"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    <button className="btn btn-primary btn-icon" type="submit" aria-label="Add task">
                        <Plus size={20} />
                    </button>
                </form>

                <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {tasks.map(task => (
                        <div key={task._id} className={`list-item ${task.completed ? 'completed' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <button
                                    type="button"
                                    onClick={() => toggleTask(task._id, task.completed)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: task.completed ? 'var(--primary)' : 'var(--text-muted)', padding: 0 }}
                                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                    {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>
                                <span style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? 'var(--text-muted)' : 'var(--text)'
                                }}>
                                    {task.text}
                                </span>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <div className="empty-state">
                            <ListTodo size={32} color="var(--primary-muted)" style={{ marginBottom: '0.5rem' }} />
                            <p>Your list is empty — add something small when you’re ready.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Todo;
