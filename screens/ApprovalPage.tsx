import React, { useState, useEffect } from 'react';
import { EXCAVATOR_P2H_DATA } from '../data/excavatorP2H';
import { SignaturePad } from '../components/SignaturePad';
import { Button } from '../components/Button'; // Assuming Button is in components folder
import { Check, X, AlertTriangle, CheckCircle, Calendar, Hash, User, Clock, ChevronDown, ChevronUp, Download, ArrowLeft } from 'lucide-react';
import { generateP2HPDF } from '../utils/pdfGenerator';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { SuccessModal } from '../components/SuccessModal';

interface ApprovalPageProps {
    token: string;
    onBack?: () => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({ token, onBack }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [signature, setSignature] = useState('');
    const [approving, setApproving] = useState(false);
    const [approved, setApproved] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                const role = JSON.parse(storedUser).role || '';
                setUserRole(role.toLowerCase());
            }
        } catch (e) {
            console.error('Error parsing user role:', e);
        }
        fetchData();
    }, [token]);

    const isSupervisor = ['admin', 'super_admin', 'pengawas'].includes(userRole);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/approve/${token}`);
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || 'Gagal memuat data inspeksi');
            }
            const json = await res.json();
            setData(json);
            if (json.approved_at) {
                setApproved(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!data) return;
        try {
            generateP2HPDF({
                metadata: {
                    unitCode: data.unit_code,
                    date: data.date,
                    shift: data.shift,
                    hmStart: data.hm_start?.toString() || '',
                    operatorName: data.operator_name,
                    status: data.status,
                    supervisorSignature: data.supervisor_signature || signature // Use from DB or current state
                },
                answers: data.answers,
                sections: EXCAVATOR_P2H_DATA
            });
        } catch (e) {
            console.error(e);
            alert('Gagal download PDF');
        }
    };

    const handleApprove = async () => {
        if (!signature) {
            setModalError('Mohon tanda tangan terlebih dahulu untuk menyetujui laporan.');
            return;
        }
        setShowConfirm(true);
    };

    const confirmApprove = async () => {
        setShowConfirm(false);
        setApproving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/approve/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supervisorSignature: signature })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.message || 'Gagal melakukan approval');
            }

            setShowSuccess(true);
            setApproved(true);
            fetchData(); // Refresh data
        } catch (err: any) {
            setModalError(err.message);
        } finally {
            setApproving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat data inspeksi...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 p-4 text-center">{error}</div>;
    if (!data) return null;

    const answers = data.answers || {};

    return (
        <div className="h-full overflow-y-auto bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-6 shadow-sm border-b border-slate-200 sticky top-0 z-10 flex items-center justify-center relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute left-4 p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
                <div className="text-center">
                    <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Approval P2H</h1>
                    <p className="text-xs text-slate-500 mt-1">PT Alam Lestari Baratamaindo</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {/* Status Card */}
                <div className={`rounded-2xl p-6 text-white shadow-lg ${approved ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            {approved ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{approved ? 'SUDAH DISETUJUI' : 'PERLU APPROVAL'}</h2>
                            <p className="text-white/80 text-sm mt-1">
                                {approved
                                    ? `Disetujui pada ${new Date(data.approved_at).toLocaleString('id-ID')}`
                                    : 'Silakan periksa detail inspeksi di bawah ini'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <MetaItem icon={<Hash size={16} />} label="Unit" value={data.unit_code} />
                    <MetaItem icon={<User size={16} />} label="Operator" value={data.operator_name || '-'} />
                    <MetaItem icon={<Calendar size={16} />} label="Tanggal" value={new Date(data.date).toLocaleDateString('id-ID')} />
                    <MetaItem icon={<Clock size={16} />} label="Shift" value={data.shift} />
                    <MetaItem icon={<Clock size={16} />} label="HM Start" value={data.hm_start} />
                    <MetaItem
                        icon={<CheckCircle size={16} />}
                        label="Status Unit"
                        value={data.status}
                        color={data.status === 'READY' ? 'text-emerald-600' : 'text-red-600'}
                    />
                </div>

                {/* Inspection Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-700">Detail Pemeriksaan</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {EXCAVATOR_P2H_DATA.filter(s => s.id !== 'approval').map((section) => (
                            <div key={section.id} className="p-4">
                                <h4 className="font-bold text-sm text-slate-800 mb-3 bg-slate-100/50 inline-block px-3 py-1 rounded-lg uppercase tracking-wider">{section.title}</h4>
                                <div className="space-y-3">
                                    {section.items.map((item) => {
                                        const res = answers[item.id];
                                        const isBad = ['K', 'B', 'R'].includes(res);
                                        return (
                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 pl-2 border-l-2 border-slate-200">{item.label}</span>
                                                <span className={`font-bold px-3 py-1 rounded-full text-xs ${isBad ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                    {res === true ? 'Normal' : res}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signature Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Pengesahan</h3>

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-slate-500">Tanda Tangan Pengawas</p>
                        {approved ? (
                            <div className="space-y-3">
                                <div className="h-[150px] w-full border-2 border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                    {data.supervisor_signature ? (
                                        <img src={data.supervisor_signature} alt="Signature" className="h-full object-contain" />
                                    ) : (
                                        <span className="text-slate-400 italic">Tanda tangan digital tersimpan</span>
                                    )}
                                    <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-emerald-200">
                                        Approved
                                    </div>
                                </div>
                                <Button onClick={handleDownloadPDF} variant="secondary" fullWidth className="gap-2">
                                    <Download size={16} /> Download PDF (Signed)
                                </Button>
                            </div>
                        ) : isSupervisor ? (
                            <SignaturePad
                                onSave={setSignature}
                                placeholder="Tanda tangan pengawas di sini"
                            />
                        ) : (
                            <div className="h-auto w-full border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/50 flex flex-col items-center justify-center p-6 text-center">
                                <AlertTriangle className="text-amber-500 mb-2" size={32} />
                                <p className="text-sm font-bold text-amber-700">Wewenang Terbatas</p>
                                <p className="text-xs text-amber-600 mt-2 mb-4">Akun Anda (*{userRole}*) tidak memiliki izin untuk tanda tangan. Silakan masuk sebagai **Pengawas**.</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="!text-xs !py-2 !h-auto !bg-amber-500 !text-white border-none shadow-sm"
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                        window.location.href = '/';
                                    }}
                                >
                                    Login sebagai Pengawas
                                </Button>
                            </div>
                        )}
                        <p className="text-center font-bold text-slate-800 uppercase text-sm mt-2">{answers.nama_pengawas || 'Pengawas'}</p>
                    </div>

                    {!approved && isSupervisor && (
                        <div className="pt-4">
                            <Button onClick={handleApprove} isLoading={approving} fullWidth variant="primary">
                                Setujui & Tanda Tangan
                            </Button>
                        </div>
                    )}

                    {!approved && !isSupervisor && (
                        <div className="pt-4">
                            <Button variant="ghost" fullWidth disabled className="!bg-slate-100 !text-slate-400 border-none cursor-not-allowed">
                                Menunggu Approval Pengawas
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmApprove}
                title="Konfirmasi Approval"
                message="Apakah Anda yakin data inspeksi sudah benar dan ingin menyetujui laporan P2H ini?"
                isLoading={approving}
            />

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="Berhasil!"
                message="Laporan P2H telah berhasil disetujui dan ditandatangani secara digital."
            />

            <SuccessModal
                isOpen={!!modalError}
                onClose={() => setModalError('')}
                type="warning"
                title="Perhatian"
                message={modalError}
            />
        </div>
    );
};

const MetaItem = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            {icon}
            <span>{label}</span>
        </div>
        <div className={`font-bold text-sm truncate ${color || 'text-slate-800'}`}>{value}</div>
    </div>
);
