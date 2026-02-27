import React from 'react';
import { Calendar, Stethoscope, Clock } from 'lucide-react';

const statusStyles = {
    ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Active' },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending' },
    MISSED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Missed' }
};

const FollowUpStatus = ({ followUps }) => {
    const activeFollowUp = followUps && followUps.length > 0 ? followUps[0] : null;

    const getStatus = (status) => statusStyles[status] || statusStyles.PENDING;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-50"><Calendar size={18} className="text-green-500" /></div>
                Follow-Up Status
            </h3>

            {!activeFollowUp ? (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 py-12">
                    <Calendar size={40} className="mb-3 opacity-40" />
                    <p className="font-medium">No follow-ups</p>
                    <p className="text-sm">Your doctor will schedule follow-ups after consultation</p>
                </div>
            ) : (
                <div className="flex-grow flex flex-col">
                    {/* Main Card */}
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-green-50 to-emerald-50 rounded-xl border border-green-100 mb-4">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-green-100">
                            <Stethoscope size={28} className="text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{activeFollowUp.doctorName}</h4>
                        <p className="text-green-700 font-medium mt-1 flex items-center gap-1">
                            <Calendar size={14} /> {activeFollowUp.nextVisitDate}
                        </p>
                        {activeFollowUp.consultationMode && (
                            <p className="text-xs text-gray-500 mt-1">{activeFollowUp.consultationMode}</p>
                        )}

                        <div className="mt-4 flex items-center gap-3">
                            {(() => {
                                const s = getStatus(activeFollowUp.status);
                                return (
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${s.bg} ${s.text} border ${s.border}`}>
                                        {s.label}
                                    </span>
                                );
                            })()}
                        </div>

                        {activeFollowUp.daysRemaining > 0 && (
                            <div className="mt-4 flex items-center gap-1 text-sm text-gray-600">
                                <Clock size={14} />
                                <span className="font-medium">{activeFollowUp.daysRemaining} days remaining</span>
                            </div>
                        )}
                    </div>

                    {activeFollowUp.remarks && (
                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                            <span className="font-medium text-gray-700">Remarks:</span> {activeFollowUp.remarks}
                        </div>
                    )}

                    <button className="w-full py-2.5 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors border border-blue-200">
                        View Details
                    </button>
                </div>
            )}
        </div>
    );
};

export default FollowUpStatus;
