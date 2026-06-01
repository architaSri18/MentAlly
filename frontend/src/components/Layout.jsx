import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { TrackingProvider } from '../context/TrackingContext';

const Layout = ({ children, setUser }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <TrackingProvider>
        <div className="app-shell">
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeSidebar={closeSidebar}
                setUser={setUser}
            />
            <main className="main-content">
                <header className="mobile-header">
                    <button type="button" onClick={toggleSidebar} aria-label="Open menu">
                        <Menu size={20} />
                    </button>
                    <span className="brand">MentAlly</span>
                </header>
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
        </TrackingProvider>
    );
};

export default Layout;
