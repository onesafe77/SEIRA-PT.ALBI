import React from 'react';
import { Bell, UserCircle, ArrowRight, QrCode, FilePlus, AlertTriangle, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { MOCK_KPI, MOCK_INSPECTIONS } from '../constants';
import { ScreenName } from '../types';
import { Logo } from '../components/Logo';
import { API_BASE_URL } from '../utils/api';

interface HomeProps {
    onNavigate: (screen: ScreenName) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    let user: any = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
    }

    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    const SummarySection = () => {
        const [summary, setSummary] = React.useState<any>(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
            const fetchSummary = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('No auth token');

                    const res = await fetch(`${API_BASE_URL}/api/inspections/summary`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.status === 403) throw new Error('Akses Ditolak (Role tidak sesuai)');
                    if (!res.ok) throw new Error(`Server Error: ${res.status}`);

                    const data = await res.json();
                    setSummary(data);
                } catch (e: any) {
                    console.error('Error fetching summary:', e);
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchSummary();
        }, []);

        if (loading) return (
            <div className="p-6 bg-white animate-pulse rounded-[32px] h-32 flex items-center justify-center border border-slate-100 mb-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Memuat Statistik...</span>
                </div>
            </div>
        );

        if (error) return (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-500 text-[10px] font-bold uppercase text-center mb-6">
                Error Summary: {error}
            </div>
        );

        if (!summary) return null;

        const totalInspections = parseInt(summary.stats.total) || 0;
        const readyCount = parseInt(summary.stats.ready) || 0;
        const approvedCount = parseInt(summary.stats.approved) || 0;
        const healthIndex = totalInspections > 0 ? Math.round(((readyCount + approvedCount) / totalInspections) * 100) : 0;

        return (
            <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-base font-bold text-slate-800">Rekapitulasi Evaluasi P2H</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-slate-900 rounded-[32px] p-6 relative overflow-hidden shadow-xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Health Index</p>
                                <h3 className="text-4xl font-black text-white">{healthIndex}%</h3>
                                <p className="text-slate-400 text-xs mt-1">Kesiapan Armada Total</p>
                            </div>
                            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin-slow"
                                    style={{ transform: `rotate(${healthIndex * 3.6}deg)` }}
                                ></div>
                                <Shield size={24} className="text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-3">Unit Rusak</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-red-500">{summary.stats.not_ready}</span>
                            <span className="text-[10px] text-slate-400 font-bold mb-1">UNIT</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-red-500 h-full rounded-full"
                                style={{ width: totalInspections > 0 ? `${(summary.stats.not_ready / totalInspections) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100">
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-3">Approved</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-emerald-500">{summary.stats.approved}</span>
                            <span className="text-[10px] text-slate-400 font-bold mb-1">DATA</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: totalInspections > 0 ? `${(summary.stats.approved / totalInspections) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {summary.critical.length > 0 && (
                    <div className="bg-rose-50/50 rounded-[28px] p-5 border border-rose-100">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={16} className="text-rose-500" />
                            <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Atensi Segera</span>
                        </div>
                        <div className="space-y-3">
                            {summary.critical.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-white/80">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{item.unit_code}</p>
                                        <p className="text-[10px] text-slate-500">{item.operator_name}</p>
                                    </div>
                                    <div className="bg-rose-100 text-rose-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase">
                                        Broken
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="pb-32 animate-fade-in bg-[#F8FAFC] min-h-full relative">
            <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-50" />
            <div className="absolute top-[20%] left-[-20%] w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-40" />

            <div className="sticky top-0 z-30 bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Logo size="sm" showText={false} className="bg-white rounded-lg p-1 shadow-sm border border-slate-100" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome Back</p>
                    </div>
                    <h2 className="text-slate-900 font-extrabold text-2xl tracking-tight leading-none">{firstName} 👋</h2>
                </div>
                <div onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-slate-900/20 cursor-pointer hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0) : 'U'}
                </div>
            </div>

            <div className="p-6 space-y-8 relative z-10">
                {(user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'pengawas' || user.name?.includes('Muhda')) && <SummarySection />}



                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onNavigate('p2h-form')}
                        className="col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="relative z-10 text-left">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
                                <FilePlus size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Mulai Inspeksi</h3>
                            <p className="text-slate-500 text-xs font-medium mt-1">Buat form P2H baru</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </button>

                    <button className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.95]">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <QrCode size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Scan QR</span>
                    </button>

                    <button className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.95]">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-bold text-slate-700 block">Laporan</span>
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full mt-1">2 Pending</span>
                        </div>
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-base font-bold text-slate-800">Overview Hari Ini</h4>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">See All</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/60 backdrop-blur-xl rounded-[24px] p-4 flex flex-col items-center justify-center border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider">Total</p>
                            <p className="text-2xl font-black text-slate-900 drop-shadow-sm">42</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl rounded-[24px] p-4 flex flex-col items-center justify-center border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1 tracking-wider">Ready</p>
                            <p className="text-2xl font-black text-emerald-500 drop-shadow-sm">38</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl rounded-[24px] p-4 flex flex-col items-center justify-center border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <p className="text-[10px] text-red-600 font-bold uppercase mb-1 tracking-wider">Rusak</p>
                            <p className="text-2xl font-black text-red-500 drop-shadow-sm">4</p>
                        </div>
                    </div>
                </div>

                <div className="pb-24">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-base font-bold text-slate-800">Aktivitas Terkini</h4>
                    </div>
                    <div className="space-y-3">
                        {MOCK_INSPECTIONS.slice(0, 3).map((item) => (
                            <div key={item.id} className="bg-white/70 backdrop-blur-lg rounded-[24px] p-4 flex gap-4 items-center shadow-sm border border-white/60 hover:bg-white/90 transition-all cursor-pointer group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${item.status === 'READY' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-500'}`}>
                                    {item.status === 'READY' ? <FilePlus size={20} /> : <AlertTriangle size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{item.location}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide border ${item.status === 'READY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};