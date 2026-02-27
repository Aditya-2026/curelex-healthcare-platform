import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, X, Pill, Download, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const PatientRecords = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const token = localStorage.getItem('token');

    const fetchPrescriptions = useCallback(async () => {
        try {
            const res = await api.get('/patient/prescriptions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrescriptions(res.data);
        } catch (err) {
            console.error('Failed to fetch prescriptions:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser || !token) { navigate('/login'); return; }
        fetchPrescriptions();
    }, [navigate, fetchPrescriptions, token]);

    const handleDownloadPdf = (id) => {
        api.get(`/patient/prescriptions/${id}/download`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        }).then(res => {
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        }).catch(err => {
            console.error('PDF download error:', err);
            alert('Failed to download prescription PDF');
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/patient/dashboard')}
                            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-purple-50"><FileText size={22} className="text-purple-600" /></div>
                                Medical Records
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">All your past prescriptions and treatment history</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{prescriptions.length} record{prescriptions.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {prescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FileText size={48} className="mb-4 opacity-30" />
                            <p className="font-medium text-lg">No medical records yet</p>
                            <p className="text-sm">Prescriptions from your doctors will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Treatment Summary</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {prescriptions.map((script) => (
                                        <tr key={script.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{script.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{script.doctorName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <p className="font-medium text-gray-700 mb-1">{script.notes || 'General Consultation'}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {script.medicines && script.medicines.map((med, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                            <Pill size={10} /> {med.medicineName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedPrescription(script)}
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        View <ChevronRight size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadPdf(script.id)}
                                                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Download size={14} /> PDF
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
            </div>

            {/* Prescription Detail Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPrescription(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Prescription Details</h3>
                            <button onClick={() => setSelectedPrescription(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Doctor</p>
                                    <p className="font-medium text-gray-900">{selectedPrescription.doctorName}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Date</p>
                                    <p className="font-medium text-gray-900">{selectedPrescription.date}</p>
                                </div>
                            </div>

                            {selectedPrescription.notes && (
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-500 font-semibold uppercase mb-1">Notes</p>
                                    <p className="text-sm text-gray-700">{selectedPrescription.notes}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
                                    <Pill size={14} className="text-blue-600" /> Medicines
                                </h4>
                                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedPrescription.medicines.map((med, idx) => (
                                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <p className="font-semibold text-gray-900 mb-2">{med.medicineName}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {med.dosage && (
                                                        <p className="text-gray-600"><span className="font-medium text-gray-700">Dosage:</span> {med.dosage}</p>
                                                    )}
                                                    {med.frequency && (
                                                        <p className="text-gray-600"><span className="font-medium text-gray-700">Frequency:</span> {med.frequency}</p>
                                                    )}
                                                    {med.duration && (
                                                        <p className="text-gray-600"><span className="font-medium text-gray-700">Duration:</span> {med.duration}</p>
                                                    )}
                                                    {med.instructions && (
                                                        <p className="text-gray-600 col-span-2"><span className="font-medium text-gray-700">Instructions:</span> {med.instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No medicines listed</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => handleDownloadPdf(selectedPrescription.id)}
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Download PDF
                            </button>
                            <button
                                onClick={() => setSelectedPrescription(null)}
                                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRecords;
