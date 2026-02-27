import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Activity, FileText, Plus, Trash2, Calendar, Stethoscope, Pill, Save, Clock } from 'lucide-react';
import api from '../../services/api';

const DoctorConsultation = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [patientHistory, setPatientHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [diagnosis, setDiagnosis] = useState('');
    const [mode, setMode] = useState('In-Person');
    const [prescriptionNotes, setPrescriptionNotes] = useState('');
    const [medicines, setMedicines] = useState([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [nextVisitDate, setNextVisitDate] = useState('');
    const [followUpMode, setFollowUpMode] = useState('Clinic');
    const [followUpRemarks, setFollowUpRemarks] = useState('');

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get(`/doctor/patients/${patientId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatientHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch patient history:', err);
        } finally {
            setLoading(false);
        }
    }, [patientId, token]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const addMedicineRow = () => {
        setMedicines([...medicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedicineRow = (index) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                patientId: parseInt(patientId),
                mode,
                diagnosis,
                prescriptionNotes,
                medicines: medicines.filter(m => m.medicineName.trim() !== ''),
                nextVisitDate,
                followUpMode,
                followUpRemarks
            };

            await api.post('/doctor/consultation', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(true);
            setTimeout(() => navigate('/doctor/dashboard'), 2000);
        } catch (err) {
            console.error('Failed to submit:', err);
            alert('Failed to submit consultation. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-green-100 max-w-md">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Save size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Saved!</h2>
                    <p className="text-gray-500">Patient dashboard has been updated automatically.</p>
                    <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    const p = patientHistory;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/doctor/dashboard')}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Stethoscope size={24} className="text-teal-600" /> Consultation Workspace
                        </h1>
                        <p className="text-gray-500">Patient: <span className="font-semibold text-gray-700">{p?.patientName}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* ════════════════════════════════════════════ */}
                    {/* LEFT SIDEBAR: Patient Info + History         */}
                    {/* ════════════════════════════════════════════ */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Patient Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-50"><User size={14} className="text-blue-600" /></div>
                                Patient Info
                            </h3>
                            <div className="space-y-2 text-sm">
                                <InfoRow label="Name" value={p?.patientName} />
                                <InfoRow label="Age" value={p?.age} />
                                <InfoRow label="Gender" value={p?.gender} />
                            </div>
                        </div>

                        {/* Active Symptoms */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-red-50"><Activity size={14} className="text-red-500" /></div>
                                Active Symptoms
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {p?.activeSymptoms?.length > 0 ? p.activeSymptoms.map((s, i) => (
                                    <div key={i} className="p-2.5 bg-red-50 rounded-lg border border-red-100 text-sm">
                                        <p className="font-semibold text-gray-800">{s.symptomName}</p>
                                        <p className="text-xs text-gray-500">{s.severity} • {s.duration}</p>
                                    </div>
                                )) : <p className="text-xs text-gray-400">No active symptoms</p>}
                            </div>
                        </div>

                        {/* Past Prescriptions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-50"><FileText size={14} className="text-purple-500" /></div>
                                Past Prescriptions
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {p?.prescriptions?.length > 0 ? p.prescriptions.map((rx, i) => (
                                    <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <p className="font-medium text-gray-800">{rx.doctorName}</p>
                                        <p className="text-xs text-gray-500">{rx.notes || 'General'}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {rx.medicines?.map((m, j) => (
                                                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                    {m.medicineName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-gray-400">No past prescriptions</p>}
                            </div>
                        </div>

                        {/* Past Follow-Ups */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-green-50"><Calendar size={14} className="text-green-500" /></div>
                                Past Follow-Ups
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                {p?.followUps?.length > 0 ? p.followUps.map((f, i) => (
                                    <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <p className="font-medium text-gray-800">{f.nextVisitDate}</p>
                                        <p className="text-xs text-gray-500">{f.status} • {f.remarks || ''}</p>
                                    </div>
                                )) : <p className="text-xs text-gray-400">No past follow-ups</p>}
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════ */}
                    {/* MAIN AREA: Consultation Form                 */}
                    {/* ════════════════════════════════════════════ */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Diagnosis */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-teal-50"><Stethoscope size={18} className="text-teal-600" /></div>
                                    Diagnosis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Mode</label>
                                        <select value={mode} onChange={(e) => setMode(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                            <option>In-Person</option>
                                            <option>Telemedicine</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea required rows={4} placeholder="Enter diagnosis notes..."
                                    value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none" />
                            </div>

                            {/* Prescription */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-purple-50"><Pill size={18} className="text-purple-600" /></div>
                                        Prescription
                                    </h3>
                                    <button type="button" onClick={addMedicineRow}
                                        className="flex items-center gap-1 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all shadow-sm">
                                        <Plus size={16} /> Add Medicine
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Notes</label>
                                    <input type="text" placeholder="e.g., Review after 1 week..."
                                        value={prescriptionNotes} onChange={(e) => setPrescriptionNotes(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                </div>

                                <div className="space-y-3">
                                    {medicines.map((med, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-bold text-gray-600">Medicine #{index + 1}</span>
                                                {medicines.length > 1 && (
                                                    <button type="button" onClick={() => removeMedicineRow(index)}
                                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                <input type="text" placeholder="Medicine Name" required
                                                    value={med.medicineName} onChange={(e) => updateMedicine(index, 'medicineName', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                                <input type="text" placeholder="Dosage (e.g., 500mg)"
                                                    value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                                <input type="text" placeholder="Frequency (e.g., Twice)"
                                                    value={med.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                                <input type="text" placeholder="Duration (e.g., 5 days)"
                                                    value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                                <input type="text" placeholder="Instructions"
                                                    value={med.instructions} onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Follow-Up */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-green-50"><Calendar size={18} className="text-green-600" /></div>
                                    Follow-Up Scheduler
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit Date</label>
                                        <input type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                                        <select value={followUpMode} onChange={(e) => setFollowUpMode(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                                            <option>Clinic</option>
                                            <option>Online</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                        <input type="text" placeholder="e.g., Monitor BP"
                                            value={followUpRemarks} onChange={(e) => setFollowUpRemarks(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> Submit Consultation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper sub-component
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{value || '—'}</span>
    </div>
);

export default DoctorConsultation;
