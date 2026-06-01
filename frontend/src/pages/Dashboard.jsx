import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTracking } from '../context/TrackingContext';
import { TRACKING_UPDATED } from '../utils/tracking';
import {
    Smile,
    CheckCircle2,
    Flame,
    ArrowRight,
    TrendingUp,
    Brain,
    MessageCircle,
    Wind,
    Calendar,
    Activity,
} from 'lucide-react';
import { dashboardService, AuthError } from '../services/dashboardService';
import { authService } from '../services/authService';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

const formatRelative = (value) => {
    const d = parseDate(value);
    if (!d) return '';
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const sentimentScore = (sentiment) => {
    const s = (sentiment || '').toUpperCase();
    if (s.includes('POSITIVE')) return 85;
    if (s.includes('NEGATIVE')) return 25;
    return 55;
};

const buildWeekChart = (moods) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const key = day.toDateString();
        const dayMoods = moods.filter((m) => {
            const md = parseDate(m.timestamp);
            return md && md.toDateString() === key;
        });
        const avg =
            dayMoods.length > 0
                ? dayMoods.reduce((sum, m) => sum + sentimentScore(m.sentiment), 0) / dayMoods.length
                : null;
        days.push({
            label: DAY_LABELS[day.getDay()],
            height: avg != null ? avg : 8,
            hasData: avg != null,
            date: day,
        });
    }
    return days;
};

const buildActivity = (moods, tasks, breathing, assessments) => {
    const items = [];

    moods.slice(0, 8).forEach((m) => {
        items.push({
            type: 'mood',
            time: m.timestamp,
            text: m.text ? `Logged mood: “${m.text.slice(0, 60)}${m.text.length > 60 ? '…' : ''}”` : `Logged mood ${m.emoji || ''}`,
            sub: [m.sentiment, m.emotion].filter(Boolean).join(' · '),
        });
    });

    tasks
        .filter((t) => t.completed)
        .slice(0, 5)
        .forEach((t) => {
            items.push({
                type: 'task',
                time: t.created_at,
                text: `Completed: ${t.text}`,
            });
        });

    breathing.slice(0, 5).forEach((b) => {
        items.push({
            type: 'breathing',
            time: b.timestamp,
            text: `Breathing session — ${b.duration || 60}s of calm`,
        });
    });

    assessments.slice(0, 3).forEach((a) => {
        items.push({
            type: 'wellness',
            time: a.timestamp,
            text: `Wellness check-in — score ${a.score}`,
            sub: a.severity ? `${a.severity} level` : '',
        });
    });

    return items
        .sort((a, b) => {
            const ta = parseDate(a.time)?.getTime() || 0;
            const tb = parseDate(b.time)?.getTime() || 0;
            return tb - ta;
        })
        .slice(0, 12);
};

const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { version } = useTracking();
    const firstName = user?.name?.split(' ')[0] || 'friend';
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [data, setData] = useState({
        tasks: [],
        habits: [],
        moods: [],
        assessment: null,
        assessments: [],
        breathing: [],
        counts: {
            moods: 0,
            habits: 0,
            tasks: 0,
            tasks_done: 0,
            assessments: 0,
            breathing_sessions: 0,
        },
    });

    const loadTrack = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const result = await dashboardService.fetchAll();
            setData(result);
        } catch (err) {
            console.error(err);
            if (err instanceof AuthError) {
                authService.logout();
                setLoadError('Your session expired. Please sign in again — your saved moods are still in your account.');
                window.location.href = '/login';
                return;
            }
            setLoadError('Could not load your track. Make sure the server is running, then try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTrack();
    }, [loadTrack, version, location.key]);

    useEffect(() => {
        const onUpdate = () => loadTrack();
        window.addEventListener(TRACKING_UPDATED, onUpdate);
        const onVisible = () => {
            if (document.visibilityState === 'visible') loadTrack();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener(TRACKING_UPDATED, onUpdate);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [loadTrack]);

    const { tasks, habits, moods, assessment, assessments, breathing, counts } = data;

    const tasksDone = counts?.tasks_done ?? tasks.filter((t) => t.completed).length;
    const taskTotal = counts?.tasks ?? tasks.length;
    const taskPercent = taskTotal ? Math.round((tasksDone / taskTotal) * 100) : 0;
    const maxStreak = habits.length ? Math.max(...habits.map((h) => h.streak || 0)) : 0;
    const latestMood = moods[0];
    const moodCount = counts?.moods ?? moods.length;
    const habitCount = counts?.habits ?? habits.length;
    const checkInCount = counts?.assessments ?? assessments.length;
    const totalBreathingMins = Math.round(
        breathing.reduce((sum, b) => sum + (b.duration || 60), 0) / 60
    );

    const weekChart = useMemo(() => buildWeekChart(moods), [moods]);
    const activity = useMemo(
        () => buildActivity(moods, tasks, breathing, assessments),
        [moods, tasks, breathing, assessments]
    );

    const cards = [
        {
            title: 'Latest mood',
            value: latestMood
                ? `${latestMood.emoji || ''} ${latestMood.sentiment || latestMood.emotion || 'Logged'}`.trim()
                : 'Log your first check-in',
            icon: Smile,
            color: 'var(--primary)',
            bg: 'var(--primary-soft)',
            path: '/mood',
        },
        {
            title: 'Tasks done',
            value: taskTotal ? `${tasksDone} / ${taskTotal}` : 'No tasks yet',
            icon: CheckCircle2,
            color: 'var(--sage)',
            bg: '#e8f2ec',
            path: '/todo',
        },
        {
            title: 'Best habit streak',
            value: maxStreak ? `${maxStreak} day${maxStreak !== 1 ? 's' : ''}` : 'Start a habit',
            icon: Flame,
            color: 'var(--accent)',
            bg: 'var(--accent-soft)',
            path: '/habits',
        },
        {
            title: 'Wellness score',
            value: assessment?.score != null ? assessment.score : 'Take check-in',
            icon: Brain,
            color: 'var(--lavender)',
            bg: '#f0ecf5',
            path: '/assessment',
        },
    ];

    const severityClass = (assessment?.severity || 'low').toLowerCase();

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="app-loading-spinner" style={{ margin: '0 auto 1rem' }} />
                <p>Gathering your wellness journey…</p>
            </div>
        );
    }

    return (
        <div className="personal-dashboard">
            <header className="page-header">
                <span className="page-greeting">Your personal track</span>
                <h1>Hi, {firstName}</h1>
                <p>Everything you’ve logged — moods, habits, tasks, and wellness — in one calm place.</p>
            </header>

            {loadError && (
                <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                    {loadError}
                    <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} onClick={loadTrack}>
                        Retry
                    </button>
                </div>
            )}

            <div className="track-overview">
                <div className="track-pill">
                    <span className="track-pill-label">Mood entries</span>
                    <span className="track-pill-value">{moodCount}</span>
                </div>
                <div className="track-pill">
                    <span className="track-pill-label">Active habits</span>
                    <span className="track-pill-value">{habitCount}</span>
                </div>
                <div className="track-pill">
                    <span className="track-pill-label">Breathing time</span>
                    <span className="track-pill-value">{totalBreathingMins} min</span>
                </div>
                <div className="track-pill">
                    <span className="track-pill-label">Check-ins</span>
                    <span className="track-pill-value">{checkInCount}</span>
                </div>
            </div>

            <div className="stat-grid">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="card stat-card interactive"
                        onClick={() => navigate(card.path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(card.path)}
                    >
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                                <card.icon size={22} />
                            </div>
                            <ArrowRight size={18} className="stat-arrow" />
                        </div>
                        <h3>{card.title}</h3>
                        <p className="stat-value">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="track-layout">
                <div>
                    <section className="track-section">
                        <div className="track-section-title">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={20} color="var(--primary)" />
                                Mood over the last 7 days
                            </span>
                            <Link to="/mood" className="track-section-link">Log mood</Link>
                        </div>
                        <div className="card">
                            <div className="mood-chart-labeled">
                                {weekChart.map((day, i) => (
                                    <div key={i} className="mood-chart-col">
                                        <div
                                            className="mood-bar"
                                            style={{
                                                height: `${day.height}%`,
                                                opacity: day.hasData ? 0.5 + (day.height / 200) : 0.12,
                                            }}
                                            title={day.hasData ? 'Mood logged' : 'No entry'}
                                        />
                                        <span className="mood-chart-day">{day.label}</span>
                                    </div>
                                ))}
                            </div>
                            {moods.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
                                    Start logging how you feel to see your trend here.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="track-section">
                        <div className="track-section-title">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Smile size={20} color="var(--primary)" />
                                Recent mood logs
                            </span>
                            <Link to="/mood" className="track-section-link">View all</Link>
                        </div>
                        <div className="card">
                            {moods.length > 0 ? (
                                <div className="mood-log-list">
                                    {moods.slice(0, 6).map((m) => (
                                        <div key={m._id} className="mood-log-item">
                                            <span className="mood-log-emoji">{m.emoji || '📝'}</span>
                                            <div className="mood-log-body">
                                                <p className="mood-log-text">{m.text || 'Mood check-in'}</p>
                                                <div className="mood-log-meta">
                                                    {m.sentiment && (
                                                        <span
                                                            className={`mood-tag ${
                                                                m.sentiment.toUpperCase().includes('POSITIVE')
                                                                    ? 'positive'
                                                                    : m.sentiment.toUpperCase().includes('NEGATIVE')
                                                                      ? 'negative'
                                                                      : 'neutral'
                                                            }`}
                                                        >
                                                            {m.sentiment}
                                                        </span>
                                                    )}
                                                    {m.emotion && (
                                                        <span className="mood-tag emotion">{m.emotion}</span>
                                                    )}
                                                    <span className="mood-log-date">{formatRelative(m.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No mood logs yet. How are you feeling today?</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/mood')}>
                                        Log your mood
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div>
                    <section className="track-section">
                        <div className="track-section-title">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={20} color="var(--sage)" />
                                Task progress
                            </span>
                            <Link to="/todo" className="track-section-link">Manage tasks</Link>
                        </div>
                        <div className="card">
                            <div className="progress-track">
                                <div className="progress-track-header">
                                    <span>Completed today</span>
                                    <span>{taskPercent}%</span>
                                </div>
                                <div className="progress-bar-track">
                                    <div className="progress-bar-track-fill" style={{ width: `${taskPercent}%` }} />
                                </div>
                            </div>
                            {tasks.length > 0 ? (
                                tasks.slice(0, 5).map((t) => (
                                    <div key={t._id} className="habit-track-row">
                                        <span
                                            className="habit-track-name"
                                            style={{
                                                textDecoration: t.completed ? 'line-through' : 'none',
                                                color: t.completed ? 'var(--text-muted)' : 'var(--text)',
                                            }}
                                        >
                                            {t.text}
                                        </span>
                                        {t.completed && <CheckCircle2 size={18} color="var(--primary)" />}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add small tasks to track your wins.</p>
                            )}
                        </div>
                    </section>

                    <section className="track-section">
                        <div className="track-section-title">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Flame size={20} color="var(--accent)" />
                                Habit streaks
                            </span>
                            <Link to="/habits" className="track-section-link">All habits</Link>
                        </div>
                        <div className="card">
                            {habits.length > 0 ? (
                                habits.map((h) => (
                                    <div key={h._id} className="habit-track-row">
                                        <span className="habit-track-name">{h.name}</span>
                                        <span className="habit-streak-badge">{h.streak || 0} days</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Build a habit to see streaks here.</p>
                            )}
                        </div>
                    </section>

                    <section className="track-section">
                        <div className="track-section-title">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Brain size={20} color="var(--lavender)" />
                                Wellness check-in
                            </span>
                            <Link to="/assessment" className="track-section-link">Retake</Link>
                        </div>
                        <div className="card wellness-score-card">
                            {assessment?.score != null ? (
                                <>
                                    <div className={`wellness-score-ring ${severityClass}`}>{assessment.score}</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your latest score</p>
                                    {assessment.severity && (
                                        <span className={`severity-badge ${severityClass}`}>{assessment.severity} concern</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No check-in yet</p>
                                    <button className="btn btn-secondary" onClick={() => navigate('/assessment')}>
                                        Start check-in
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <section className="track-section">
                <div className="track-section-title">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="var(--primary)" />
                        Your activity timeline
                    </span>
                </div>
                <div className="card">
                    {activity.length > 0 ? (
                        <div className="activity-timeline">
                            {activity.map((item, i) => (
                                <div key={i} className="activity-item">
                                    <div className={`activity-dot ${item.type}`} />
                                    <div className="activity-content">
                                        <p>{item.text}</p>
                                        {item.sub && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.sub}</p>
                                        )}
                                        <time>{formatRelative(item.time)}</time>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Activity size={32} color="var(--primary-muted)" style={{ marginBottom: '0.5rem' }} />
                            <p>Your journey will show up here as you log moods, tasks, and wellness activities.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="dashboard-grid" style={{ marginTop: '0.5rem' }}>
                <div className="card card-hero">
                    <MessageCircle size={28} style={{ marginBottom: '0.75rem', opacity: 0.9 }} />
                    <h2 style={{ marginBottom: '0.75rem', color: 'white' }}>Need someone to listen?</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                        Talk through what’s on your mind — your companion remembers the emotional tone of your chats.
                    </p>
                    <button className="btn btn-light" onClick={() => navigate('/chat')}>
                        Start a conversation
                    </button>
                </div>

                <div className="card card-warm">
                    <Wind size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
                    <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Breathing sessions</h2>
                    <p style={{ color: 'var(--text-soft)', marginBottom: '1rem' }}>
                        You’ve logged <strong>{breathing.length}</strong> session{breathing.length !== 1 ? 's' : ''} ({totalBreathingMins} minutes of calm).
                    </p>
                    <button className="btn btn-secondary" onClick={() => navigate('/breathing')}>
                        Practice breathing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
