import React, { useState } from 'react';
import { Search, QrCode, Truck, Wrench, History } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, StatusPill } from '../components/Card';
import { Input } from '../components/Input';
import { MOCK_INSPECTIONS } from '../constants';

import { ScreenName } from '../types';
import { API_BASE_URL } from '../utils/api';

interface InspectionScreenProps {
    onNavigate?: (screen: ScreenName) => void;
    onViewInspection?: (token: string) => void;
}

export const InspectionScreen: React.FC<InspectionScreenProps> = ({ onNavigate, onViewInspection }) => {
    const [inspections, setInspections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/api/inspections`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setInspections(data);
                } else {
                    console.error('Data is not an array:', data);
                    setInspections([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                setInspections([]);
            });
    }, []);
    return (
        <div className="pb-32 animate-fade-in flex flex-col h-full bg-[#F3F6F8]">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-6 border-b border-slate-100 sticky top-0 z-10 rounded-b-[32px] shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Inspeksi</h1>

                {/* Search Mode */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari No. Unit..."
                            icon={<Search size={18} />}
                            className="!h-[50px] !bg-slate-50 border-none"
                        />
                    </div>
                    <button className="w-[50px] h-[50px] bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-300 active:scale-95 transition-transform">
                        <QrCode size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">


                {/* Recent / Drafts */}
                <div>
                    <div className="flex items-center justify-between mb-4 pl-1">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            Baru Dilihat
                        </h2>
                        <History size={16} className="text-slate-300" />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-400 py-10">Memuat info...</div>
                        ) : inspections.length === 0 ? (
                            <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50">
                                <p className="text-slate-400 font-medium">Belum ada riwayat P2H.</p>
                            </div>
                        ) : (
                            inspections.slice(0, 5).map((item: any) => {
                                let displayStatus = item.status;
                                if (item.status === 'READY' && !item.approved_at) {
                                    displayStatus = 'WAITING';
                                }

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (onViewInspection && item.approval_token) {
                                                onViewInspection(item.approval_token);
                                            }
                                        }}
                                        className="bg-white rounded-[24px] p-5 flex flex-col gap-3 shadow-card border border-slate-100 hover:shadow-float transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 group-hover:text-app-primary transition-colors">
                                                    P2H {item.unit_code}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">
                                                    {new Date(item.date).toLocaleDateString()} • {item.shift}
                                                </p>
                                            </div>
                                            <StatusPill status={displayStatus} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};