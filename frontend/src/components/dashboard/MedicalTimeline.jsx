import React from 'react';
import { Clock, Activity, Stethoscope, Pill, Calendar } from 'lucide-react';

const iconMap = {
    SYMPTOM: <Activity size={16} />,
    CONSULTATION: <Stethoscope size={16} />,
    PRESCRIPTION: <Pill size={16} />,
    FOLLOWUP: <Calendar size={16} />
};

const colorMap = {
    SYMPTOM: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
    CONSULTATION: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
    PRESCRIPTION: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500' },
    FOLLOWUP: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' }
};

const MedicalTimeline = ({ events }) => {
    const getColor = (type) => colorMap[type] || colorMap.SYMPTOM;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50"><Clock size={18} className="text-indigo-500" /></div>
                Medical Timeline
            </h3>

            <div className="relative pl-6 flex-grow overflow-y-auto max-h-[400px] pr-1" style={{ scrollbarWidth: 'thin' }}>
                {/* Vertical line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200" />

                {(!events || events.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Clock size={40} className="mb-3 opacity-40" />
                        <p className="font-medium">No activity yet</p>
                        <p className="text-sm">Your medical history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event, index) => {
                            const c = getColor(event.type);
                            return (
                                <div key={`${event.type}-${event.id}-${index}`} className="relative">
                                    {/* Dot */}
                                    <div className={`absolute -left-[19px] top-1 w-4 h-4 rounded-full ${c.dot} border-[3px] border-white shadow-sm`} />

                                    <div className={`rounded-xl p-4 ${c.bg} bg-opacity-30 border ${c.border} border-opacity-30 hover:shadow-sm transition-all`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`p-1 rounded-md ${c.bg} ${c.text}`}>{iconMap[event.type]}</span>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{event.date}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800">{event.title}</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalTimeline;
