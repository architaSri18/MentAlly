import React, { useState, useEffect } from 'react'
import { habitService } from '../services/wellnessService'
import { useTracking } from '../context/TrackingContext'
import { Trophy, Plus, CheckCircle2, Leaf } from 'lucide-react'

const Habits = () => {
    const { refreshTracking } = useTracking()
    const [habits, setHabits] = useState([])
    const [newHabit, setNewHabit] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const h = await habitService.getHabits()
        if (Array.isArray(h)) setHabits(h)
    }

    const handleCreateHabit = async (e) => {
        e.preventDefault()
        if (!newHabit) return
        await habitService.createHabit(newHabit)
        setNewHabit('')
        loadData()
        refreshTracking()
    }

    return (
        <div>
            <header className="page-header">
                <h1>Small habits, big care</h1>
                <p>Little routines add up. Celebrate each day you show up for yourself.</p>
            </header>

            <div className="two-col">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Trophy style={{ color: 'var(--accent)' }} size={24} />
                        <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Your habits</h2>
                    </div>

                    <form onSubmit={handleCreateHabit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <input
                            className="input"
                            placeholder="Something kind, like a morning walk…"
                            value={newHabit}
                            onChange={(e) => setNewHabit(e.target.value)}
                        />
                        <button className="btn btn-primary btn-icon" type="submit" aria-label="Add habit">
                            <Plus size={20} />
                        </button>
                    </form>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {habits.map((h, idx) => (
                            <div key={idx} className="list-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <CheckCircle2 size={22} color="var(--primary)" />
                                    <span style={{ fontWeight: 500 }}>{h.name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {h.streak}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        day streak
                                    </div>
                                </div>
                            </div>
                        ))}
                        {habits.length === 0 && (
                            <div className="empty-state">
                                <Leaf size={32} color="var(--primary-muted)" style={{ marginBottom: '0.5rem' }} />
                                <p>No habits yet — start with one small thing you’d like to nurture.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card card-warm">
                    <h2 style={{ marginBottom: '0.75rem', fontSize: '1.15rem' }}>Why this matters</h2>
                    <p style={{ color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                        Consistent, gentle habits aren’t about perfection. They’re about giving your mind a little anchor each day.
                    </p>
                    <ul style={{ color: 'var(--text-soft)', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                        <li>Less mental clutter</li>
                        <li>More confidence in small steps</li>
                        <li>A calmer, clearer headspace</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Habits
