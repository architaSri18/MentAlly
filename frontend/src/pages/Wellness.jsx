import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { wellnessService } from '../services/wellnessService'
import { moodService } from '../services/apiService'
import { useTracking } from '../context/TrackingContext'
import { Wind, Activity, Smile, Send, Check, Loader2 } from 'lucide-react'

const Wellness = ({ type }) => {
    const { refreshTracking, version } = useTracking()
    const [breathing, setBreathing] = useState(false)
    const [timer, setTimer] = useState(0)
    const [assessmentScore, setAssessmentScore] = useState(0)
    const [step, setStep] = useState(0)
    const [moodText, setMoodText] = useState('')
    const [selectedEmoji, setSelectedEmoji] = useState('😊')
    const [toast, setToast] = useState('')
    const [savingMood, setSavingMood] = useState(false)
    const [recentMoods, setRecentMoods] = useState([])

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 3200)
    }

    const loadMoodHistory = async () => {
        try {
            const history = await moodService.getHistory()
            setRecentMoods(history.slice(0, 5))
        } catch {
            setRecentMoods([])
        }
    }

    useEffect(() => {
        if (type === 'mood') loadMoodHistory()
    }, [type, version])

    const startBreathing = () => {
        setBreathing(true)
        let count = 0
        const interval = setInterval(() => {
            count++
            setTimer(count)
            if (count >= 60) {
                clearInterval(interval)
                setBreathing(false)
                setTimer(0)
                wellnessService.logBreathing(60).then(() => {
                    refreshTracking()
                    showToast('You did it — one minute of calm. Be proud of yourself.')
                }).catch(() => showToast('Could not save session. Please try again.'))
            }
        }, 1000)
    }

    const questions = [
        "Over the last two weeks, how often have you felt down, low, or hopeless?",
        "How often have you had little interest or pleasure in things you usually enjoy?",
        "How often has sleep felt difficult — too little, or too much?",
        "How often have you felt tired or low on energy?"
    ]

    const handleAnswer = (val) => {
        const newScore = assessmentScore + val
        setAssessmentScore(newScore)
        if (step < questions.length - 1) {
            setStep(step + 1)
        } else {
            finishAssessment(newScore)
        }
    }

    const finishAssessment = async (score) => {
        try {
            await wellnessService.saveAssessment(score)
            refreshTracking()
            setStep(-1)
        } catch {
            showToast('Could not save check-in. Please try again.')
        }
    }

    const logMood = async () => {
        const text = moodText.trim() || `Feeling ${selectedEmoji}`
        setSavingMood(true)
        try {
            await moodService.logMood(text, selectedEmoji)
            setMoodText('')
            await loadMoodHistory()
            refreshTracking()
            showToast('Saved — your track is updated.')
        } catch {
            showToast('Could not save your mood. Please sign in again or try once more.')
        } finally {
            setSavingMood(false)
        }
    }

    const pageTitles = {
        breathing: { title: 'A minute to breathe', sub: 'Slow down with us. No rush, no expectations.' },
        assessment: { title: 'Gentle check-in', sub: 'Answer honestly — there are no wrong responses.' },
        mood: { title: 'How are you right now?', sub: 'Name what you feel. We’re listening.' },
    }

    const header = pageTitles[type]

    const renderContent = () => {
        if (type === 'breathing') {
            return (
                <div className="card wellness-center">
                    <Wind size={56} className="wellness-icon" strokeWidth={1.5} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Mindful breathing</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Follow the rhythm — breathe in slowly, then let it go.
                    </p>
                    {breathing ? (
                        <>
                            <div className="breathing-circle">
                                {timer % 10 < 5 ? 'Breathe in…' : 'Let it out…'}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{timer}s of calm</p>
                        </>
                    ) : (
                        <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={startBreathing}>
                            Begin one minute
                        </button>
                    )}
                </div>
            )
        }

        if (type === 'assessment') {
            return (
                <div className="card wellness-center" style={{ textAlign: step === -1 ? 'center' : 'left', maxWidth: '620px' }}>
                    {step !== -1 && <Activity size={48} className="wellness-icon" style={{ display: 'block', margin: '0 auto 1rem' }} />}
                    {step === -1 ? (
                        <>
                            <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', background: 'var(--primary-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={32} color="var(--primary)" />
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Thank you for sharing</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                                Your answers are saved privately. Remember — asking for help is a sign of strength.
                            </p>
                            <button className="btn btn-secondary" onClick={() => { setStep(0); setAssessmentScore(0) }}>
                                Take again
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                Question {step + 1} of {questions.length}
                            </p>
                            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500, lineHeight: 1.5 }}>
                                {questions[step]}
                            </p>
                            <div style={{ display: 'grid', gap: '0.65rem' }}>
                                {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, i) => (
                                    <button key={i} type="button" className="btn btn-ghost" onClick={() => handleAnswer(i)}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )
        }

        if (type === 'mood') {
            return (
                <>
                    <div className="card wellness-center">
                        <Smile size={48} className="wellness-icon" />
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Pick an emoji — you can save with just that, or add a few words too.
                        </p>

                        <div className="emoji-picker">
                            {['😊', '😔', '😠', '😨', '😐', '🤩'].map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
                                    onClick={() => setSelectedEmoji(emoji)}
                                    aria-label={`Select mood ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="input"
                            placeholder="What’s been on your mind? (optional)"
                            rows="4"
                            value={moodText}
                            onChange={(e) => setMoodText(e.target.value)}
                            style={{ resize: 'none', marginBottom: '1.25rem', textAlign: 'left' }}
                        />

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={logMood}
                            disabled={savingMood}
                        >
                            {savingMood ? (
                                <><Loader2 size={18} className="spin" /> Saving…</>
                            ) : (
                                <><Send size={18} /> Save how I’m feeling</>
                            )}
                        </button>
                    </div>

                    {recentMoods.length > 0 && (
                        <section className="track-section" style={{ maxWidth: '560px', margin: '1.5rem auto 0' }}>
                            <div className="track-section-title">
                                <span>Your recent check-ins</span>
                                <Link to="/" className="track-section-link">View on My track</Link>
                            </div>
                            <div className="card">
                                <div className="mood-log-list" style={{ maxHeight: 'none' }}>
                                    {recentMoods.map((m) => (
                                        <div key={m._id} className="mood-log-item">
                                            <span className="mood-log-emoji">{m.emoji || '📝'}</span>
                                            <div className="mood-log-body">
                                                <p className="mood-log-text">{m.text}</p>
                                                <div className="mood-log-meta">
                                                    {m.sentiment && (
                                                        <span className={`mood-tag ${
                                                            String(m.sentiment).toUpperCase().includes('POSITIVE') ? 'positive'
                                                                : String(m.sentiment).toUpperCase().includes('NEGATIVE') ? 'negative' : 'neutral'
                                                        }`}>{m.sentiment}</span>
                                                    )}
                                                    {m.emotion && <span className="mood-tag emotion">{m.emotion}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )
        }
    }

    return (
        <div>
            {header && (
                <header className="page-header">
                    <h1>{header.title}</h1>
                    <p>{header.sub}</p>
                </header>
            )}
            {renderContent()}
            {toast && <div className="toast" role="status">{toast}</div>}
        </div>
    )
}

export default Wellness
