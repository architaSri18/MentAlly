import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Habits from './pages/Habits'
import Wellness from './pages/Wellness'
import Profile from './pages/Profile'
import Todo from './pages/Todo'
import Emergency from './pages/Emergency'
import Layout from './components/Layout'
import { dashboardService, AuthError } from './services/dashboardService'
import { authService } from './services/authService'

const App = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initSession = async () => {
            const savedUser = localStorage.getItem('user')
            const token = localStorage.getItem('token')

            if (!savedUser || !token) {
                authService.logout()
                setUser(null)
                setLoading(false)
                return
            }

            try {
                const me = await dashboardService.validateSession()
                setUser(me)
                localStorage.setItem('user', JSON.stringify(me))
            } catch (err) {
                authService.logout()
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initSession()
    }, [])

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading-spinner" aria-hidden="true" />
                <p>Taking a gentle moment…</p>
            </div>
        )
    }

    const ProtectedRoute = ({ children }) => {
        if (!user) return <Navigate to="/login" />
        return <Layout setUser={setUser}>{children}</Layout>
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

                <Route path="/" element={<ProtectedRoute><Dashboard user={user} /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
                <Route path="/breathing" element={<ProtectedRoute><Wellness type="breathing" /></ProtectedRoute>} />
                <Route path="/assessment" element={<ProtectedRoute><Wellness type="assessment" /></ProtectedRoute>} />
                <Route path="/mood" element={<ProtectedRoute><Wellness type="mood" /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile user={user} /></ProtectedRoute>} />
                <Route path="/todo" element={<ProtectedRoute><Todo /></ProtectedRoute>} />
                <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
            </Routes>
        </Router>
    )
}

export default App
