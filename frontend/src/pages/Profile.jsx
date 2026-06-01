import React, { useState, useEffect } from 'react';
import { User, Camera, Save } from 'lucide-react';

const Profile = ({ user }) => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        dob: '',
        gender: '',
        country: '',
        profile_image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/profile/me', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setProfile(data);
            if (data.profile_image) {
                setPreviewUrl(`http://localhost:5000${data.profile_image}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('dob', profile.dob);
        formData.append('gender', profile.gender);
        formData.append('country', profile.country);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('http://localhost:5000/api/profile/update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (response.ok) {
                setToast('Your profile looks great — saved with care.');
                setTimeout(() => setToast(''), 3200);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="page-header">
                <h1>About you</h1>
                <p>Your details stay private. Update them whenever it feels right.</p>
            </header>

            <div className="card" style={{ maxWidth: '520px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Your profile" />
                            ) : (
                                <User size={56} color="var(--primary-muted)" />
                            )}
                        </div>
                        <label className="profile-camera-btn" aria-label="Change photo">
                            <Camera size={16} />
                            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    <div className="field-group">
                        <div>
                            <label className="field-label" htmlFor="name">Name</label>
                            <input id="name" className="input" name="name" value={profile.name} onChange={handleChange} placeholder={user?.name || 'Your name'} />
                        </div>
                        <div>
                            <label className="field-label">Email</label>
                            <input className="input" value={profile.email} disabled style={{ background: 'var(--bg)', opacity: 0.85 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="field-label" htmlFor="dob">Birthday</label>
                                <input id="dob" className="input" type="date" name="dob" value={profile.dob} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="field-label" htmlFor="gender">Gender</label>
                                <select id="gender" className="input" name="gender" value={profile.gender} onChange={handleChange}>
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="field-label" htmlFor="country">Where you’re from</label>
                            <input id="country" className="input" name="country" value={profile.country} onChange={handleChange} placeholder="Country or region" />
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            <Save size={18} />
                            {loading ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
            {toast && <div className="toast" role="status">{toast}</div>}
        </div>
    );
};

export default Profile;
