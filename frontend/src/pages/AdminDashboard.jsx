import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserCheck, Clock, FileText, ShieldCheck, Stethoscope,
    CheckCircle, XCircle, Eye, Mail, Activity, Trash2, Ban, X, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { FILE_BASE_URL } from '../config/constants';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [user, setUser] = useState(null);

    // Data
    const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, pendingApprovals: 0, totalConsultations: 0 });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);

    // Active panel
    const [activePanel, setActivePanel] = useState('approvals');
    const [detailDoctor, setDetailDoctor] = useState(null);

    // Certificate modal
    const [certModal, setCertModal] = useState({ open: false, url: '', doctorName: '' });

    // Remove confirmation modal
    const [removeModal, setRemoveModal] = useState({ open: false, id: null, name: '' });

    // ─── Notification badge counts ───────────────────────────────
    const [badges, setBadges] = useState({ doctorApprovals: 0, patients: 0, messages: 0 });

    const headers = { Authorization: `Bearer ${token}` };

    const fetchBadges = useCallback(async () => {
        try {
            const res = await api.get('/admin/notifications/count', { headers });
            setBadges(res.data);
        } catch (err) {
            console.error('Badge fetch error:', err);
        }
    }, [token]);

    const markSeen = async (type) => {
        try {
            await api.put(`/admin/notifications/seen/${type}`, {}, { headers });
            setBadges(prev => ({ ...prev, [type === 'approvals' || type === 'doctor' ? 'doctorApprovals' : type]: 0 }));
        } catch (err) {
            console.error('Mark seen error:', err);
        }
    };

    const fetchAll = useCallback(async () => {
        try {
            const [statsRes, pendingRes, doctorsRes, patientsRes, messagesRes, activityRes] = await Promise.all([
                api.get('/admin/stats', { headers }),
                api.get('/admin/doctors/pending', { headers }),
                api.get('/admin/doctors', { headers }),
                api.get('/admin/patients', { headers }),
                api.get('/admin/messages', { headers }),
                api.get('/admin/activity', { headers }),
            ]);
            setStats(statsRes.data);
            setPendingDoctors(pendingRes.data);
            setAllDoctors(doctorsRes.data);
            setAllPatients(patientsRes.data);
            setMessages(messagesRes.data);
            setActivityLogs(activityRes.data);
        } catch (err) {
            console.error('Admin fetch error:', err);
        }
    }, [token]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser || !token) { navigate('/admin/login'); return; }
        const parsed = JSON.parse(storedUser);
        if (parsed.role !== 'admin') { navigate('/login'); return; }
        setUser(parsed);
        fetchAll();
        fetchBadges();
    }, [navigate, fetchAll, fetchBadges, token]);

    // ─── Tab click handler (mark seen + switch panel) ───────────
    const handlePanelClick = (panelId) => {
        setActivePanel(panelId);
        if (panelId === 'approvals') markSeen('approvals');
        else if (panelId === 'patients') markSeen('patients');
        else if (panelId === 'messages') markSeen('messages');
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/doctors/${id}/approve`, {}, { headers });
            fetchAll();
            fetchBadges();
        } catch (err) { alert('Failed to approve doctor'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and remove this doctor?')) return;
        try {
            await api.put(`/admin/doctors/${id}/reject`, {}, { headers });
            fetchAll();
            fetchBadges();
        } catch (err) { alert('Failed to reject doctor'); }
    };

    const handleDisableDoctor = async (id, name) => {
        if (!window.confirm(`Disable Dr. ${name}?\n\nDoctor will:\n✔ Lose consultation access\n✔ Move back to approval queue\n✔ Cannot log in until re-approved`)) return;
        try {
            await api.put(`/admin/doctors/${id}/disable`, {}, { headers });
            fetchAll();
        } catch (err) { alert('Failed to disable doctor'); }
    };

    const handleRemoveDoctor = async () => {
        try {
            await api.delete(`/admin/doctors/${removeModal.id}`, { headers });
            setRemoveModal({ open: false, id: null, name: '' });
            fetchAll();
        } catch (err) { alert('Failed to remove doctor'); }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    // ─── Panel definitions with smart badge counts ──────────────
    const panels = [
        { id: 'approvals', label: 'Doctor Approvals', icon: <UserCheck size={16} />, badge: badges.doctorApprovals },
        { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={16} />, badge: 0 },
        { id: 'patients', label: 'Patients', icon: <Users size={16} />, badge: badges.patients },
        { id: 'messages', label: 'Messages', icon: <Mail size={16} />, badge: badges.messages },
        { id: 'activity', label: 'Activity', icon: <Activity size={16} />, badge: 0 },
    ];

    const getStatusBadge = (doc) => {
        const status = doc.accountStatus || (doc.isApproved ? 'ACTIVE' : 'PENDING');
        const styles = {
            ACTIVE: 'bg-green-100 text-green-700',
            DISABLED: 'bg-red-100 text-red-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
        };
        return (
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${styles[status] || styles.PENDING}`}>
                {status === 'ACTIVE' ? 'Active' : status === 'DISABLED' ? 'Disabled' : 'Pending'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl"><ShieldCheck size={28} /></div>
                            <div>
                                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                                <p className="text-indigo-200 text-sm">Welcome, {user.name}</p>
                            </div>
                        </div>
                        <p className="text-sm text-indigo-200 mt-2 sm:mt-0">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<Users size={22} />} title="Total Patients" value={stats.totalPatients} color="blue" />
                    <StatCard icon={<Stethoscope size={22} />} title="Total Doctors" value={stats.totalDoctors} color="green" />
                    <StatCard icon={<Clock size={22} />} title="Pending Approvals" value={stats.pendingApprovals} color="orange" />
                    <StatCard icon={<FileText size={22} />} title="Total Consultations" value={stats.totalConsultations} color="purple" />
                </div>

                {/* ─── Panel Navigation with Smart Badges ──────────── */}
                <div className="flex flex-wrap gap-2">
                    {panels.map(p => (
                        <button key={p.id} onClick={() => handlePanelClick(p.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activePanel === p.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {p.icon}
                            {p.label}
                            {/* Smart Badge — only shows for unseen items */}
                            {p.badge > 0 && (
                                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold bg-red-500 text-white shadow-sm animate-pulse">
                                    {p.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* PANEL: Doctor Approvals                     */}
                {/* ═══════════════════════════════════════════ */}
                {activePanel === 'approvals' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-orange-50"><UserCheck size={20} className="text-orange-600" /></div>
                            Pending Doctor Approvals
                        </h3>

                        {pendingDoctors.length === 0 ? (
                            <EmptyState icon={<UserCheck size={48} />} title="No pending approvals" subtitle="All doctors have been reviewed" />
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Doctor</Th>
                                            <Th>Specialization</Th>
                                            <Th>Hospital</Th>
                                            <Th>Reg. Number</Th>
                                            <Th>View Details</Th>
                                            <Th className="text-right">Actions</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendingDoctors.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {doc.photoUrl ? (
                                                            <img src={`${FILE_BASE_URL}${doc.photoUrl}`} alt={doc.fullName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm"
                                                            style={{ display: doc.photoUrl ? 'none' : 'flex' }}>
                                                            {doc.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{doc.fullName}</p>
                                                            <p className="text-xs text-gray-400">{doc.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{doc.specialization}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{doc.currentHospital || '—'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600 font-mono">{doc.registrationNumber}</td>
                                                {/* View Details column */}
                                                <td className="px-5 py-4">
                                                    <button onClick={() => setDetailDoctor(detailDoctor?.id === doc.id ? null : doc)}
                                                        className="text-blue-600 font-semibold text-sm hover:text-blue-800 hover:underline transition-colors">
                                                        View Details
                                                    </button>
                                                </td>
                                                {/* Actions: Approve / Reject (card buttons) */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex flex-col gap-2 items-center w-[110px] ml-auto">
                                                        <button onClick={() => handleApprove(doc.id)}
                                                            className="w-full py-2 rounded-lg font-semibold text-sm bg-green-100 text-green-700 hover:bg-green-200 transition cursor-pointer text-center">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => handleReject(doc.id)}
                                                            className="w-full py-2 rounded-lg font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition cursor-pointer text-center">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Detail Expand */}
                        {detailDoctor && (
                            <div className="mt-4 p-5 bg-blue-50 rounded-xl border border-blue-100 animate-in">
                                <h4 className="font-bold text-gray-900 mb-3">Details: Dr. {detailDoctor.fullName}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <InfoItem label="Experience" value={`${detailDoctor.experienceYears || 0} yrs`} />
                                    <InfoItem label="Reg. Number" value={detailDoctor.registrationNumber} />
                                    <InfoItem label="Hospital" value={detailDoctor.currentHospital || '—'} />
                                    <InfoItem label="Applied" value={detailDoctor.createdAt ? new Date(detailDoctor.createdAt).toLocaleDateString() : '—'} />
                                </div>
                                {detailDoctor.certificateUrl && (
                                    <button onClick={() => setCertModal({ open: true, url: detailDoctor.certificateUrl, doctorName: detailDoctor.fullName })}
                                        className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        📄 View Certificate
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* PANEL: All Doctors                          */}
                {/* ═══════════════════════════════════════════ */}
                {activePanel === 'doctors' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-50"><Stethoscope size={20} className="text-green-600" /></div>
                            All Doctors
                        </h3>
                        {allDoctors.length === 0 ? (
                            <EmptyState icon={<Stethoscope size={48} />} title="No doctors registered" subtitle="Doctors will appear here after registration" />
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Doctor</Th>
                                            <Th>Specialization</Th>
                                            <Th>Hospital</Th>
                                            <Th>Experience</Th>
                                            <Th>Certificate</Th>
                                            <Th>Status</Th>
                                            <Th className="text-right">Actions</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allDoctors.map(doc => (
                                            <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${doc.accountStatus === 'DISABLED' ? 'opacity-60' : ''}`}>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {doc.photoUrl ? (
                                                            <img src={`${FILE_BASE_URL}${doc.photoUrl}`} alt={doc.fullName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm"
                                                            style={{ display: doc.photoUrl ? 'none' : 'flex' }}>
                                                            {doc.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{doc.fullName}</p>
                                                            <p className="text-xs text-gray-400">{doc.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{doc.specialization}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{doc.currentHospital || '—'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{doc.experienceYears || 0} yrs</td>
                                                <td className="px-5 py-4">
                                                    {doc.certificateUrl ? (
                                                        <button onClick={() => setCertModal({ open: true, url: doc.certificateUrl, doctorName: doc.fullName })}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium">
                                                            <Eye size={14} /> View
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">{getStatusBadge(doc)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(doc.accountStatus === 'ACTIVE' || (!doc.accountStatus && doc.isApproved)) && (
                                                            <button onClick={() => handleDisableDoctor(doc.id, doc.fullName)}
                                                                className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors" title="Disable Doctor">
                                                                <Ban size={16} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => setRemoveModal({ open: true, id: doc.id, name: doc.fullName })}
                                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Permanently Remove">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* PANEL: All Patients                         */}
                {/* ═══════════════════════════════════════════ */}
                {activePanel === 'patients' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50"><Users size={20} className="text-blue-600" /></div>
                            All Patients
                        </h3>
                        {allPatients.length === 0 ? (
                            <EmptyState icon={<Users size={48} />} title="No patients registered" subtitle="Patients will appear here after registration" />
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Patient</Th>
                                            <Th>Age</Th>
                                            <Th>Gender</Th>
                                            <Th>Mobile</Th>
                                            <Th>Joined</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allPatients.map(pt => (
                                            <tr key={pt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {pt.profileImageUrl ? (
                                                            <img src={`${FILE_BASE_URL}${pt.profileImageUrl}`} alt={pt.fullName}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                        ) : null}
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm"
                                                            style={{ display: pt.profileImageUrl ? 'none' : 'flex' }}>
                                                            {pt.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{pt.fullName}</p>
                                                            <p className="text-xs text-gray-400">{pt.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{pt.age || '—'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{pt.gender || '—'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{pt.mobile}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {pt.createdAt ? new Date(pt.createdAt).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* PANEL: Contact Messages                     */}
                {/* ═══════════════════════════════════════════ */}
                {activePanel === 'messages' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-50"><Mail size={20} className="text-purple-600" /></div>
                            Contact Messages
                        </h3>
                        {messages.length === 0 ? (
                            <EmptyState icon={<Mail size={48} />} title="No messages" subtitle="Contact form submissions will appear here" />
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <Th>Name</Th>
                                            <Th>Email</Th>
                                            <Th>Inquiry</Th>
                                            <Th>Message</Th>
                                            <Th>Date</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {messages.map(msg => (
                                            <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 text-sm font-medium text-gray-900">{msg.fullName}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{msg.email}</td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                                        {msg.inquiryType || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{msg.message}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* PANEL: Activity Logs                        */}
                {/* ═══════════════════════════════════════════ */}
                {activePanel === 'activity' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gray-100"><Activity size={20} className="text-gray-600" /></div>
                            System Activity
                        </h3>
                        {activityLogs.length === 0 ? (
                            <EmptyState icon={<Activity size={48} />} title="No activity yet" subtitle="System events will appear here" />
                        ) : (
                            <div className="space-y-3">
                                {activityLogs.map((log, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${log.type === 'DOCTOR_APPROVED' ? 'bg-green-100 text-green-600' :
                                            log.type === 'CONSULTATION_CREATED' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-200 text-gray-500'
                                            }`}>
                                            {log.type === 'DOCTOR_APPROVED' ? <CheckCircle size={16} /> :
                                                log.type === 'CONSULTATION_CREATED' ? <FileText size={16} /> :
                                                    <Activity size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{log.description}</p>
                                            <p className="text-xs text-gray-400">{log.date ? new Date(log.date).toLocaleString() : '—'}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${log.type === 'DOCTOR_APPROVED' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'
                                            }`}>{log.type?.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MODAL: Certificate Viewer                              */}
            {/* ═══════════════════════════════════════════════════════ */}
            {certModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setCertModal({ open: false, url: '', doctorName: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50"><FileText size={20} className="text-blue-600" /></div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Doctor Certificate Preview</h3>
                                    <p className="text-xs text-gray-500">Dr. {certModal.doctorName}</p>
                                </div>
                            </div>
                            <button onClick={() => setCertModal({ open: false, url: '', doctorName: '' })}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex items-center justify-center bg-gray-50 min-h-[400px]">
                            {certModal.url.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={`${FILE_BASE_URL}${certModal.url}`}
                                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                                    title="Certificate PDF"
                                />
                            ) : (
                                <img
                                    src={`${FILE_BASE_URL}${certModal.url}`}
                                    alt="Doctor Certificate"
                                    className="max-w-full max-h-[70vh] rounded-lg shadow-md object-contain"
                                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<p class="text-gray-500 text-sm">Unable to load certificate</p>'; }}
                                />
                            )}
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                            <a href={`${FILE_BASE_URL}${certModal.url}`} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Open in New Tab ↗
                            </a>
                            <button onClick={() => setCertModal({ open: false, url: '', doctorName: '' })}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* MODAL: Remove Doctor Confirmation                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            {removeModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setRemoveModal({ open: false, id: null, name: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-red-50 px-6 py-5 flex items-center gap-4 border-b border-red-100">
                            <div className="p-3 rounded-full bg-red-100">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 text-lg">Permanently Remove Doctor?</h3>
                                <p className="text-sm text-red-700 mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-700 mb-4">
                                You are about to permanently delete <strong>Dr. {removeModal.name}</strong> from the Curelex platform.
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-red-800 font-medium">⚠️ This will:</p>
                                <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                                    <li>Remove doctor from all lists</li>
                                    <li>Delete doctor data permanently</li>
                                    <li>Doctor will not be able to login</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button onClick={() => setRemoveModal({ open: false, id: null, name: '' })}
                                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleRemoveDoctor}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold text-white transition-colors flex items-center gap-2">
                                <Trash2 size={16} />
                                Yes, Remove Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components ---
const colorStyles = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    green: { iconBg: 'bg-green-50', iconText: 'text-green-600' },
    orange: { iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
};

const StatCard = ({ icon, title, value, color }) => {
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

const Th = ({ children, className = '' }) => (
    <th className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
        {children}
    </th>
);

const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <div className="opacity-30 mb-3">{icon}</div>
        <p className="font-medium text-lg">{title}</p>
        <p className="text-sm">{subtitle}</p>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);

export default AdminDashboard;
