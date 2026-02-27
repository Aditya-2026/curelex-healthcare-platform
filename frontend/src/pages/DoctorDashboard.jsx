import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, FileText, Activity, Stethoscope, ChevronRight, Eye, Pill, CheckCircle } from 'lucide-react';
import api from '../services/api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dashboard data
    const [stats, setStats] = useState({ todayPatients: 0, pendingConsultations: 0, followUpsDueToday: 0, totalActivePatients: 0 });
    const [patientQueue, setPatientQueue] = useState([]);
    const [activity, setActivity] = useState([]);
    const [accepting, setAccepting] = useState(null); // track which consultation is being accepted

    const token = localStorage.getItem('token');

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/doctor/stats', { headers: { Authorization: `Bearer ${token}` } });
            setStats(res.data);
        } catch (err) { console.error('Stats error:', err); }
    }, [token]);

    const fetchQueue = useCallback(async () => {
        try {
            const res = await api.get('/doctor/patients', { headers: { Authorization: `Bearer ${token}` } });
            setPatientQueue(res.data);
        } catch (err) { console.error('Queue error:', err); }
    }, [token]);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await api.get('/doctor/activity', { headers: { Authorization: `Bearer ${token}` } });
            setActivity(res.data);
        } catch (err) { console.error('Activity error:', err); }
    }, [token]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const tkn = localStorage.getItem('token');
        if (!storedUser || !tkn) { navigate('/login'); return; }
        setUser(JSON.parse(storedUser));

        fetchStats();
        fetchQueue();
        fetchActivity();
        setLoading(false);
    }, [navigate, fetchStats, fetchQueue, fetchActivity]);

    const handleAccept = async (consultationId) => {
        setAccepting(consultationId);
        try {
            await api.post(`/doctor/consultations/${consultationId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQueue();
            fetchStats();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to accept';
            alert(msg);
        } finally {
            setAccepting(null);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const activityIcons = {
        CONSULTATION: <Stethoscope size={14} className="text-purple-500" />,
        PRESCRIPTION: <Pill size={14} className="text-green-500" />,
        FOLLOWUP: <Calendar size={14} className="text-orange-500" />
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ═══════════════════════════════════════════════════ */}
                {/* HEADER BANNER                                       */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">Dr. {user.name} 🩺</h1>
                            <p className="text-teal-100 mt-1">Medical Control Panel</p>
                        </div>
                        <p className="text-sm text-teal-200 mt-2 sm:mt-0">{todayStr}</p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* SUMMARY CARDS                                       */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<Users size={22} />} title="Today's Patients" value={stats.todayPatients} color="blue" />
                    <StatCard icon={<Clock size={22} />} title="Pending Consultations" value={stats.pendingConsultations} color="orange" />
                    <StatCard icon={<Calendar size={22} />} title="Follow-Ups Due Today" value={stats.followUpsDueToday} color="green" />
                    <StatCard icon={<FileText size={22} />} title="Total Active Patients" value={stats.totalActivePatients} color="purple" />
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* PATIENT QUEUE + RECENT ACTIVITY                     */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Patient Queue — 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-50"><Users size={20} className="text-blue-600" /></div>
                                Today's Patient Queue
                            </h3>
                            <span className="text-sm text-gray-400 font-medium">{patientQueue.length} patient(s)</span>
                        </div>

                        {patientQueue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Users size={48} className="mb-3 opacity-30" />
                                <p className="font-medium text-lg">No patients waiting</p>
                                <p className="text-sm">Patients who submit symptoms will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Symptoms</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported</th>
                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {patientQueue.map((pt) => (
                                            <tr key={pt.patientId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{pt.patientName}</p>
                                                        <p className="text-xs text-gray-500">{pt.age} yrs • {pt.gender}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {pt.symptoms?.map((sym, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                                <Activity size={10} /> {sym}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {pt.earliestSymptomDate ? new Date(pt.earliestSymptomDate).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${pt.consultationStatus === 'ACTIVE'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {pt.consultationStatus}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {pt.consultationStatus === 'PENDING' ? (
                                                            <button
                                                                onClick={() => handleAccept(pt.consultationId)}
                                                                disabled={accepting === pt.consultationId}
                                                                className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                                            >
                                                                {accepting === pt.consultationId ? (
                                                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Accepting...</>
                                                                ) : (
                                                                    <><CheckCircle size={14} /> Accept</>)}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => navigate(`/doctor/consultation/${pt.patientId}`)}
                                                                className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
                                                            >
                                                                <Stethoscope size={14} /> Start Consultation
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity — 1 col */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gray-100"><Clock size={18} className="text-gray-600" /></div>
                            Recent Activity
                        </h3>

                        {activity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Clock size={40} className="mb-3 opacity-30" />
                                <p className="font-medium">No recent activity</p>
                                <p className="text-sm">Your consultations will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                                {activity.map((act, index) => (
                                    <div key={index} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 rounded-lg bg-white border border-gray-200 mt-0.5">
                                                {activityIcons[act.type] || <FileText size={14} className="text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{act.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        {act.date ? new Date(act.date).toLocaleDateString() : '—'}
                                                    </span>
                                                    {act.status && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${act.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {act.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Sub-components ---
const colorStyles = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    orange: { iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
    green: { iconBg: 'bg-green-50', iconText: 'text-green-600' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-600' }
};

const StatCard = ({ icon, title, value, color }) => {
    const c = colorStyles[color] || colorStyles.blue;
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl ${c.iconBg} ${c.iconText} mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
};

export default DoctorDashboard;
