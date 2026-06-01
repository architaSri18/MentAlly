import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Heart } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await authService.register(name, email, password);
            if (data.message === 'User registered successfully') {
                navigate('/login');
            } else {
                setError(data.message || 'We couldn’t create your account. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <Heart size={28} fill="white" strokeWidth={1.5} />
                    </div>
                    <h1>Join MentAlly</h1>
                    <p>A calm place to track how you feel and care for yourself.</p>
                </div>

                {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-with-icon">
                        <User size={18} />
                        <input className="input" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="input-with-icon">
                        <Mail size={18} />
                        <input className="input" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-with-icon">
                        <Lock size={18} />
                        <input className="input" type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '1rem' }}>
                        {loading ? 'Setting things up…' : <><UserPlus size={20} /> Create my account</>}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
