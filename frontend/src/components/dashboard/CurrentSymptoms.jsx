import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Activity, Plus, X, Check, Edit3 } from 'lucide-react';
import api from '../../services/api';

const CurrentSymptoms = forwardRef(({ symptoms, onSymptomAdded, onSymptomUpdated }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ symptomName: '', duration: '', severity: 'Mild', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem('token');

    const resetForm = () => {
        setForm({ symptomName: '', duration: '', severity: 'Mild', notes: '' });
        setEditingId(null);
    };

    const handleOpen = (symptom = null) => {
        if (symptom) {
            setForm({
                symptomName: symptom.symptomName,
                duration: symptom.duration,
                severity: symptom.severity,
                notes: symptom.notes || ''
            });
            setEditingId(symptom.id);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    // Expose handleOpen to parent via ref
    useImperativeHandle(ref, () => ({
        openAddModal: () => handleOpen()
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/patient/symptoms/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onSymptomUpdated && onSymptomUpdated();
            } else {
                await api.post('/patient/symptoms', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onSymptomAdded && onSymptomAdded();
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save symptom:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await api.put(`/patient/symptoms/${id}`, { status: 'RESOLVED' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSymptomUpdated && onSymptomUpdated();
        } catch (err) {
            console.error('Failed to resolve symptom:', err);
        }
    };

    const severityColor = (s) => {
        if (s === 'High') return 'bg-red-100 text-red-700 border-red-200';
        if (s === 'Moderate') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-red-50"><Activity size={18} className="text-red-500" /></div>
                        Current Symptoms
                    </h3>
                    <button
                        onClick={() => handleOpen()}
                        className="flex items-center gap-1 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                <div className="flex-grow space-y-3 overflow-y-auto max-h-[400px] pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {(!symptoms || symptoms.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Activity size={40} className="mb-3 opacity-40" />
                            <p className="font-medium">No symptoms recorded</p>
                            <p className="text-sm">Click "Add" to log your first symptom</p>
                        </div>
                    ) : (
                        symptoms.filter(s => s.status === 'ACTIVE').map((sym) => (
                            <div key={sym.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all group">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-900">{sym.symptomName}</h4>
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${severityColor(sym.severity)}`}>
                                        {sym.severity}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-500 flex justify-between items-center">
                                    <span>Duration: {sym.duration}</span>
                                    <span className="text-xs">{sym.createdAt ? new Date(sym.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                                <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpen(sym)} className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md">
                                        <Edit3 size={12} /> Edit
                                    </button>
                                    <button onClick={() => handleResolve(sym.id)} className="text-xs flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded-md">
                                        <Check size={12} /> Resolved
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Symptom' : 'Add New Symptom'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symptom Name</label>
                                <input type="text" required placeholder="e.g. Fever, Cough"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.symptomName} onChange={(e) => setForm({ ...form, symptomName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input type="text" required placeholder="e.g. 2 days"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                                        <option>Mild</option>
                                        <option>Moderate</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea rows="3" placeholder="Additional details..."
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                                    {submitting ? 'Saving...' : (editingId ? 'Update' : 'Submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
});

CurrentSymptoms.displayName = 'CurrentSymptoms';

export default CurrentSymptoms;
