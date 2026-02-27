import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, Edit3, Save, X, Loader2, ChevronLeft, Lock, Camera } from 'lucide-react';
import { FILE_BASE_URL } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfileDetails = () => {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const token = localStorage.getItem('token');

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
            setProfile(res.data);
            setFormData({ ...res.data });
            setOriginalData({ ...res.data });
        } catch (err) {
            console.error('Profile fetch error:', err);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const payload = {
                fullName: formData.fullName,
                mobile: formData.mobile,
                address: formData.address,
                gender: formData.gender,
                age: formData.age ? parseInt(formData.age) : null,
            };
            const res = await api.put('/profile/update', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setFormData({ ...res.data });
            setOriginalData({ ...res.data });
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ ...originalData });
        setEditing(false);
        setMessage({ type: '', text: '' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading Profile...</p>
                </div>
            </div>
        );
    }

    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';

    const fields = [
        { key: 'fullName', label: 'Full Name', icon: <User size={16} />, editable: true },
        { key: 'email', label: 'Email Address', icon: <Mail size={16} />, editable: false },
        { key: 'mobile', label: 'Mobile Number', icon: <Phone size={16} />, editable: true },
        ...(isPatient ? [
            { key: 'aadhaarNumber', label: 'Aadhaar Number', icon: <Shield size={16} />, editable: false },
        ] : []),
        { key: 'gender', label: 'Gender', icon: null, editable: true },
        { key: 'age', label: 'Age', icon: null, editable: true },
        ...(isPatient ? [
            { key: 'address', label: 'Address', icon: <MapPin size={16} />, editable: true, fullWidth: true },
        ] : []),
        ...(isDoctor ? [
            { key: 'specialization', label: 'Specialization', icon: null, editable: true },
            { key: 'registrationNumber', label: 'Registration Number', icon: null, editable: false },
            { key: 'currentHospital', label: 'Hospital / Clinic', icon: null, editable: true },
            { key: 'experienceYears', label: 'Experience (Years)', icon: null, editable: true },
        ] : []),
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => navigate(isPatient ? '/patient/dashboard' : '/doctor/dashboard')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
                    <p className="text-gray-500 mt-1">Manage your personal information</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {(profile?.profileImageUrl || profile?.photoUrl) ? (
                                    <img
                                        src={`${FILE_BASE_URL}${profile.profileImageUrl || profile.photoUrl}`}
                                        alt={profile.fullName}
                                        className="w-[110px] h-[110px] rounded-full object-cover border-4 border-white shadow-md"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <div className="w-[110px] h-[110px] rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl border-4 border-white shadow-md"
                                    style={{ display: (profile?.profileImageUrl || profile?.photoUrl) ? 'none' : 'flex' }}>
                                    {profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{profile?.fullName}</p>
                                <p className="text-sm text-gray-500 capitalize">{role}</p>
                            </div>
                        </div>
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Edit3 size={14} /> Edit Details
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <X size={14} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Fields */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map((f) => (
                                <div key={f.key} className={f.fullWidth ? 'md:col-span-2' : ''}>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        {f.label}
                                        {!f.editable && <Lock size={10} className="inline ml-1 opacity-50" />}
                                    </label>

                                    {editing && f.editable ? (
                                        <div className="relative">
                                            {f.icon && (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                                            )}
                                            {f.key === 'gender' ? (
                                                <select
                                                    value={formData[f.key] || ''}
                                                    onChange={(e) => handleChange(f.key, e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type={f.key === 'mobile' ? 'tel' : f.key === 'age' || f.key === 'experienceYears' ? 'number' : 'text'}
                                                    value={formData[f.key] || ''}
                                                    onChange={(e) => handleChange(f.key, e.target.value)}
                                                    className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${f.icon ? 'pl-10 pr-4' : 'px-4'}`}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${!f.editable ? 'text-gray-400 border border-dashed border-gray-200' : 'text-gray-900 border border-gray-100'}`}>
                                            {f.icon && <span className="text-gray-400">{f.icon}</span>}
                                            {formData[f.key] || 'Not Provided'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
