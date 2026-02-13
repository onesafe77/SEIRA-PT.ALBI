import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '../components/Input';
import { Card, StatusPill, SeverityBadge } from '../components/Card';
import { generateP2HPDF } from '../utils/pdfGenerator';
import { EXCAVATOR_P2H_DATA } from '../data/excavatorP2H';
import { Download } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

interface HistoryScreenProps {
  onViewInspection?: (token: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewInspection }) => {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [filterDate, setFilterDate] = React.useState<string>('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${API_BASE_URL}/api/inspections`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching history:', err);
        setLoading(false);
      });
  }, []);

  const handleDownloadPDF = (item: any) => {
    try {
      generateP2HPDF({
        metadata: {
          unitCode: item.unit_code,
          date: item.date,
          shift: item.shift,
          hmStart: item.hm_start.toString(),
          operatorName: item.operator_name,
          status: item.status as any,
          supervisorSignature: item.supervisor_signature
        },
        answers: item.answers,
        sections: EXCAVATOR_P2H_DATA
      });
    } catch (e) {
      console.error("PDF Generation Error", e);
      alert("Gagal mendownload PDF");
    }
  };

  const filteredHistory = history.filter(item => {
    let itemStatus = item.status;
    if (item.status === 'READY') {
      itemStatus = item.approved_at ? 'APPROVED' : 'WAITING';
    } else if (item.status !== 'APPROVED') {
      itemStatus = 'NOT READY';
    }

    const matchesStatus = filterStatus === 'ALL' || itemStatus === filterStatus;

    let matchesDate = true;
    if (filterDate) {
      const itemDate = new Date(item.date);
      const filterD = new Date(filterDate);
      matchesDate = itemDate.getFullYear() === filterD.getFullYear() &&
        itemDate.getMonth() === filterD.getMonth() &&
        itemDate.getDate() === filterD.getDate();
    }

    return matchesStatus && matchesDate;
  });

  return (
    <div className="pb-32 animate-fade-in flex flex-col h-full bg-[#F3F6F8]">
      <div className="px-6 py-6 space-y-4 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm rounded-b-[32px]">
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Inspeksi</h1>



        <Input
          placeholder="Cari Unit, Gear, atau QR..."
          icon={<Search size={18} />}
          className="!bg-slate-50 !border-slate-100"
        />
        <div className="flex gap-3">
          <select
            className="flex-1 py-3 px-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm appearance-none text-center"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="WAITING">Waiting</option>
            <option value="APPROVED">Approved</option>
            <option value="NOT READY">Not Ready</option>
          </select>
          <input
            type="date"
            className="flex-1 py-3 px-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 transition-colors shadow-sm text-center"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center text-slate-400 py-10">Memuat data...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center text-slate-400 py-10">Tidak ada riwayat inspeksi yang cocok.</div>
        ) : (
          filteredHistory.map((item) => {
            let displayStatus = item.status;
            let statusStyles = {
              bg: 'bg-slate-100',
              text: 'text-slate-500',
              border: 'border-slate-200',
              dot: 'bg-slate-400'
            };

            if (item.status === 'READY' && !item.approved_at) {
              displayStatus = 'WAITING';
              statusStyles = {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                border: 'border-amber-100',
                dot: 'bg-amber-500'
              };
            } else if (item.status === 'READY' && item.approved_at) {
              displayStatus = 'APPROVED';
              statusStyles = {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                border: 'border-emerald-100',
                dot: 'bg-emerald-500'
              };
            } else if (item.status === 'APPROVED') {
              displayStatus = 'APPROVED';
              statusStyles = {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                border: 'border-emerald-100',
                dot: 'bg-emerald-500'
              };
            } else if (item.status === 'NOT READY') {
              statusStyles = {
                bg: 'bg-red-50',
                text: 'text-red-600',
                border: 'border-red-100',
                dot: 'bg-red-500'
              };
            }

            const isApproved = !!item.approved_at || item.status === 'APPROVED';

            // Check user role from localStorage
            let userRole = '';
            try {
              const storedUser = localStorage.getItem('user');
              if (storedUser && storedUser !== 'undefined') {
                userRole = (JSON.parse(storedUser).role || '').toLowerCase();
              }
            } catch (e) {
              console.error('Error parsing user role:', e);
            }
            const isSupervisor = ['admin', 'super_admin', 'pengawas'].includes(userRole);
            const needsApproval = displayStatus === 'WAITING' && isSupervisor;

            return (
              <div key={item.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col gap-4">
                {/* Header: ID & Badge */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-mono text-xs border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                      #{item.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Report P2H</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                    {displayStatus}
                  </div>
                </div>

                {/* Body: Unit & Operator */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.unit_code}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-500">{item.shift}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-500">{item.operator_name || 'Operator'}</span>
                  </div>
                </div>

                {/* Footer: Action */}
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <SeverityBadge level={item.status === 'READY' || item.status === 'APPROVED' ? 'Low' : 'Critical'} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {item.status === 'READY' || item.status === 'APPROVED' ? 'SAFE' : 'CRITICAL'}
                    </span>
                  </div>

                  {needsApproval ? (
                    <button
                      onClick={() => onViewInspection && onViewInspection(item.approval_token)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-indigo-200 shadow-lg active:scale-95 hover:bg-indigo-700"
                    >
                      Review & Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => isApproved && handleDownloadPDF(item)}
                      disabled={!isApproved}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${isApproved
                        ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg active:scale-95 hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      title={isApproved ? "Download Laporan PDF" : "Menunggu Approval Pengawas"}
                    >
                      <Download size={14} />
                      {isApproved ? 'Download PDF' : 'Menunggu'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};