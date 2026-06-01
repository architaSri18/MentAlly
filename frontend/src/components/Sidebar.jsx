import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Activity,
    Smile,
    Wind,
    ClipboardCheck,
    User,
    Phone,
    LogOut,
    MessageSquare,
    X
} from 'lucide-react';
import { authService } from '../services/authService';

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        if (setUser) setUser(null);
        navigate('/login');
    };

    const mainItems = [
        { icon: LayoutDashboard, label: 'My track', path: '/' },
        { icon: MessageSquare, label: 'Talk to companion', path: '/chat' },
        { icon: Smile, label: 'How you feel', path: '/mood' },
    ];

    const wellnessItems = [
        { icon: Wind, label: 'Breathing', path: '/breathing' },
        { icon: ClipboardCheck, label: 'Check-in', path: '/assessment' },
        { icon: Activity, label: 'Habits', path: '/habits' },
        { icon: CheckSquare, label: 'Daily tasks', path: '/todo' },
    ];

    const accountItems = [
        { icon: User, label: 'Your profile', path: '/profile' },
        { icon: Phone, label: 'People to call', path: '/emergency' },
    ];

    const renderLinks = (items) =>
        items.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                    if (window.innerWidth <= 1024) closeSidebar?.();
                }}
            >
                <item.icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
            </NavLink>
        ));

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-logo" aria-hidden="true">🌿</div>
                    <div>
                        <h1>MentAlly</h1>
                        <p className="sidebar-tagline">Here when you need us</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="mobile-only"
                    onClick={toggleSidebar}
                    style={{ border: 'none', background: 'var(--primary-soft)', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer', color: 'var(--primary)' }}
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <p className="sidebar-section-label">Today</p>
                {renderLinks(mainItems)}

                <p className="sidebar-section-label">Wellness</p>
                {renderLinks(wellnessItems)}

                <p className="sidebar-section-label">You</p>
                {renderLinks(accountItems)}
            </nav>

            <div className="sidebar-footer">
                <button type="button" onClick={handleLogout} className="sidebar-link logout">
                    <LogOut size={20} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
