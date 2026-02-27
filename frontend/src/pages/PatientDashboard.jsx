import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Calendar, FileText, Plus, Phone, ClipboardList, X, Stethoscope, Mail } from 'lucide-react';
import api from '../services/api';

import CurrentSymptoms from '../components/dashboard/CurrentSymptoms';
import MedicalTimeline from '../components/dashboard/MedicalTimeline';
import FollowUpStatus from '../components/dashboard/FollowUpStatus';
import PrescriptionHistory from '../components/dashboard/PrescriptionHistory';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [symptoms, setSymptoms] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    const symptomsRef = useRef();
    const token = localStorage.getItem('token');

    const fetchSymptoms = useCallback(async () => {
        try {
            const res = await api.get('/patient/symptoms', { headers: { Authorization: `Bearer ${token}` } });
            setSymptoms(res.data);
        } catch (err) { console.error('Symptoms fetch error:', err); }
    }, [token]);

    const fetchTimeline = useCallback(async () => {
        try {
            const res = await api.get('/patient/timeline', { headers: { Authorization: `Bearer ${token}` } });
            setTimeline(res.data);
        } catch (err) { console.error('Timeline fetch error:', err); }
    }, [token]);

    const fetchFollowUps = useCallback(async () => {
        try {
            const res = await api.get('/patient/followups', { headers: { Authorization: `Bearer ${token}` } });
            setFollowUps(res.data);
        } catch (err) { console.error('Follow-ups fetch error:', err); }
    }, [token]);

    const fetchPrescriptions = useCallback(async () => {
        try {
            const res = await api.get('/patient/prescriptions', { headers: { Authorization: `Bearer ${token}` } });
            setPrescriptions(res.data);
        } catch (err) { console.error('Prescriptions fetch error:', err); }
    }, [token]);

    const refreshAll = useCallback(() => {
        fetchSymptoms();
        fetchTimeline();
        fetchFollowUps();
        fetchPrescriptions();
    }, [fetchSymptoms, fetchTimeline, fetchFollowUps, fetchPrescriptions]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const tkn = localStorage.getItem('token');
        if (!storedUser || !tkn) { navigate('/login'); return; }
        setUser(JSON.parse(storedUser));
        refreshAll();
        setLoading(false);
    }, [navigate, refreshAll]);

    const handleSymptomChange = () => { fetchSymptoms(); fetchTimeline(); };

    const handleAddSymptoms = () => { if (symptomsRef.current) symptomsRef.current.openAddModal(); };
    const handleViewRecords = () => { navigate('/patient/records'); };

    const handleEmergencyContact = async () => {
        setShowEmergencyModal(true);
        setLoadingContacts(true);
        try {
            const res = await api.get('/patient/emergency-contacts', { headers: { Authorization: `Bearer ${token}` } });
            setEmergencyContacts(res.data);
        } catch (err) { console.error('Emergency contacts fetch error:', err); setEmergencyContacts([]); }
        finally { setLoadingContacts(false); }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const activeSymptoms = symptoms.filter(s => s.status === 'ACTIVE').length;
    const currentFollowUp = followUps.length > 0 ? followUps[0] : null;
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. GREETING BANNER */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold">Hello, {user.name} 👋</h1>
                                <p className="text-blue-100 mt-1">Here is your health overview</p>
                            </div>
                            <p className="text-sm text-blue-200 mt-2 sm:mt-0">{todayStr}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <MiniCard label="Treatment Status" value={currentFollowUp ? 'Active' : 'None'} />
                            <MiniCard label="Assigned Doctor" value={currentFollowUp?.doctorName || '—'} />
                            <MiniCard label="Next Follow-Up" value={currentFollowUp?.nextVisitDate || '—'} />
                            <MiniCard label="Mode" value={currentFollowUp?.consultationMode || '—'} />
                        </div>
                    </div>
                </div>

                {/* 2. SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard icon={<Calendar size={22} />} title="Upcoming Appointments" value={followUps.length} color="blue" />
                    <SummaryCard icon={<FileText size={22} />} title="Medical Records" value={prescriptions.length} color="purple" />
                    <SummaryCard icon={<Activity size={22} />} title="Active Symptoms" value={activeSymptoms} color="red" />
                    <SummaryCard icon={<User size={22} />} title="Profile Status" value="Active" color="green" />
                </div>

                {/* 3. Symptoms | Timeline | Follow-Up */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <CurrentSymptoms ref={symptomsRef} symptoms={symptoms} onSymptomAdded={handleSymptomChange} onSymptomUpdated={handleSymptomChange} />
                    <MedicalTimeline events={timeline} />
                    <FollowUpStatus followUps={followUps} />
                </div>

                {/* 4. RECENT PRESCRIPTION | QUICK ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PrescriptionHistory prescriptions={prescriptions} />

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gray-100"><ClipboardList size={18} className="text-gray-600" /></div>
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <QuickAction icon={<Plus size={16} />} label="Add Symptoms" color="text-red-600 bg-red-50 hover:bg-red-100" onClick={handleAddSymptoms} />
                            <QuickAction icon={<Calendar size={16} />} label="Book Appointment" color="text-blue-600 bg-blue-50 hover:bg-blue-100" />
                            <QuickAction icon={<FileText size={16} />} label="View Records" color="text-purple-600 bg-purple-50 hover:bg-purple-100" onClick={handleViewRecords} />
                            <QuickAction icon={<Phone size={16} />} label="Emergency Contact" color="text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={handleEmergencyContact} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: Emergency Contacts */}
            {showEmergencyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEmergencyModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-orange-50"><Phone size={18} className="text-orange-600" /></div>
                                Emergency Contacts
                            </h3>
                            <button onClick={() => setShowEmergencyModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Doctors you've consulted previously</p>

                        {loadingContacts ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                            </div>
                        ) : emergencyContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Stethoscope size={40} className="mb-3 opacity-40" />
                                <p className="font-medium">No consulted doctors yet</p>
                                <p className="text-sm">Doctors will appear here after your first consultation</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                                {emergencyContacts.map((contact, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                                {contact.name?.charAt(4) || 'D'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                                                <p className="text-xs text-gray-500">{contact.specialization}</p>
                                                {contact.hospital && <p className="text-xs text-gray-400">{contact.hospital}</p>}
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3">
                                            {contact.mobile ? (
                                                <a href={`tel:${contact.mobile}`} className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium">
                                                    <Phone size={14} /> {contact.mobile}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400 flex items-center gap-1.5"><Phone size={14} /> N/A</span>
                                            )}
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    <Mail size={14} /> Email
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => setShowEmergencyModal(false)} className="w-full mt-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Components ---
const MiniCard = ({ label, value }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <p className="text-xs text-blue-200 font-medium">{label}</p>
        <p className="text-lg font-bold mt-1 truncate">{value}</p>
    </div>
);

const colorStyles = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
    red: { iconBg: 'bg-red-50', iconText: 'text-red-600' },
    green: { iconBg: 'bg-green-50', iconText: 'text-green-600' },
};

const SummaryCard = ({ icon, title, value, color }) => {
    const c = colorStyles[color] || colorStyles.blue;
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl ${c.iconBg} ${c.iconText} mr-4`}>{icon}</div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
};

const QuickAction = ({ icon, label, color, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all ${color}`}>
        {icon} {label}
    </button>
);

export default PatientDashboard;
