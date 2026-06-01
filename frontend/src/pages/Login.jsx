import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Heart } from 'lucide-react';

const Login = ({ setUser }) => {
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
            const data = await authService.login(email, password);
            if (data.token) {
                setUser(data.user);
                navigate('/');
            } else {
                setError(data.message || 'We couldn’t sign you in. Please check your details.');
            }
        } catch (err) {
            setError('Something went wrong on our end. Please try again in a moment.');
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
                    <h1>Welcome back</h1>
                    <p>We’re glad you’re here. Take things at your own pace.</p>
                </div>

                {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-with-icon">
                        <Mail size={18} />
                        <input
                            className="input"
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-with-icon">
                        <Lock size={18} />
                        <input
                            className="input"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '1rem' }}>
                        {loading ? 'Signing you in…' : <><LogIn size={20} /> Sign in</>}
                    </button>
                </form>

                <p className="auth-footer">
                    New here? <Link to="/register">Create a gentle space for yourself</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
