import React, { useState, useEffect } from 'react';
import { Phone, Trash2, UserPlus, HeartHandshake } from 'lucide-react';

const Emergency = () => {
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/emergency/', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setContacts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addContact = async (e) => {
        e.preventDefault();
        if (!newContact.name || !newContact.phone) return;

        try {
            const response = await fetch('http://localhost:5000/api/emergency/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newContact)
            });
            const data = await response.json();
            setContacts([...contacts, data]);
            setNewContact({ name: '', phone: '', relation: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteContact = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/emergency/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setContacts(contacts.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <header className="page-header">
                <h1>People you can reach</h1>
                <p>When things feel heavy, having someone to call can make all the difference. You’re not alone.</p>
            </header>

            <div className="two-col">
                <div className="card">
                    <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={20} color="var(--primary)" /> Add someone trusted
                    </h2>
                    <form onSubmit={addContact} className="field-group">
                        <input
                            className="input"
                            placeholder="Their name"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Phone number"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="How you know them (friend, family, therapist…)"
                            value={newContact.relation}
                            onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        />
                        <button className="btn btn-primary" type="submit">Save contact</button>
                    </form>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
                    {contacts.map(contact => (
                        <div key={contact._id} className="card contact-card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="contact-avatar">
                                    <Phone size={22} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{contact.name}</h4>
                                    <p style={{ margin: '0.15rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{contact.relation}</p>
                                    <a href={`tel:${contact.phone}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                                        {contact.phone}
                                    </a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteContact(contact._id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b54a4a', padding: '0.5rem' }}
                                aria-label="Remove contact"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {contacts.length === 0 && (
                        <div className="empty-state card" style={{ borderStyle: 'dashed' }}>
                            <HeartHandshake size={32} color="var(--primary-muted)" style={{ marginBottom: '0.5rem' }} />
                            <p>Add someone you trust — a friend, family member, or counselor.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card alert-card" style={{ marginTop: '1.75rem' }}>
                <h3>If you need help right now</h3>
                <p>Please reach out to emergency services or a crisis helpline. You deserve support.</p>
                <div style={{ marginTop: '1rem', fontWeight: 600, color: '#8b4a3a', fontSize: '0.95rem' }}>
                    Lifeline: 112 · Police: 100 · Ambulance: 108
                </div>
            </div>
        </div>
    );
};

export default Emergency;
