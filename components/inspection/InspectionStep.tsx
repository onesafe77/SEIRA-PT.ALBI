import React from 'react';
import { P2HSection, P2HItem } from '../../types';
import { Check, X, Camera, MessageSquare } from 'lucide-react';
import { Button } from '../Button';
import { SignaturePad } from '../SignaturePad';

interface InspectionStepProps {
    section: P2HSection;
    answers: Record<string, any>;
    onAnswerChange: (itemId: string, value: any, comment?: string) => void;
    metadata?: any;
}

export const InspectionStep: React.FC<InspectionStepProps> = ({ section, answers, onAnswerChange, metadata }) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{section.title}</h2>

            {section.items.map((item) => {
                const currentAnswer = answers[item.id];
                // Default to undefined/null. If true -> Good, false -> Bad

                return (
                    <div key={item.id} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="font-medium text-slate-800 text-sm md:text-base">{item.label}</p>
                                {item.required && <span className="text-xs text-red-400">*Wajib</span>}
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                                {item.type === 'boolean' ? (
                                    ['C', 'K', 'B', 'N', 'R'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => onAnswerChange(item.id, opt)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 ${currentAnswer === opt
                                                ? ['K', 'B', 'R'].includes(opt)
                                                    ? 'bg-red-500 border-red-500 text-white shadow-md scale-110'
                                                    : 'bg-emerald-500 border-emerald-500 text-white shadow-md scale-110'
                                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))
                                ) : (
                                    <div className="w-full max-w-[200px]">
                                        {item.id === 'catatan_umum' ? (
                                            <textarea
                                                className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/20 border-slate-200 border"
                                                placeholder="Tambahkan catatan..."
                                                rows={3}
                                                value={currentAnswer || ''}
                                                onChange={(e) => onAnswerChange(item.id, e.target.value)}
                                            />
                                        ) : item.id === 'nama_pengawas' ? (
                                            <select
                                                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/20 border-slate-200 border appearance-none"
                                                value={currentAnswer || ''}
                                                onChange={(e) => onAnswerChange(item.id, e.target.value)}
                                            >
                                                <option value="" disabled>Pilih Pengawas</option>
                                                <option value="Nanda Wahyu Hermawan">Nanda Wahyu Hermawan</option>
                                                <option value="Muhda Isnandar">Muhda Isnandar</option>
                                                <option value="Ahmad Junaidy Ishak">Ahmad Junaidy Ishak</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={item.type === 'number' ? 'number' : 'text'}
                                                className="w-full h-10 bg-slate-50 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/20 border-slate-200 border"
                                                placeholder={item.label}
                                                value={currentAnswer || ''}
                                                onChange={(e) => onAnswerChange(item.id, e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Status Label */}
                        {item.type === 'boolean' && currentAnswer && (
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                                Status: <span className={['K', 'B', 'R'].includes(currentAnswer) ? 'text-red-500' : 'text-emerald-500'}>{
                                    currentAnswer === 'C' ? 'Cukup' :
                                        currentAnswer === 'K' ? 'Kurang' :
                                            currentAnswer === 'B' ? 'Bocor' :
                                                currentAnswer === 'N' ? 'Normal' : 'Rusak'
                                }</span>
                            </div>
                        )}

                        {/* Special Layout for Approval Step */}
                        {section.id === 'approval' && item.id === 'nama_pengawas' && (() => {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            const isOperator = user.role === 'operator';

                            return (
                                <div className="mt-8 space-y-10 pt-8 border-t border-slate-100 italic text-slate-400">
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-slate-600 not-italic">Tanda Tangan Operator (Dikerjakan oleh):</p>
                                        <SignaturePad
                                            onSave={(data) => onAnswerChange('signature_operator', data)}
                                            placeholder="Goreskan tanda tangan operator di sini"
                                            disabled={!isOperator} // Only operator can sign here
                                        />
                                        <div className="border-b border-slate-300 pb-1 mx-4 min-h-[28px] flex items-end justify-center">
                                            <p className="text-sm font-bold text-slate-800 not-italic uppercase">{metadata?.operatorName || 'Operator'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-slate-600 not-italic">Tanda Tangan Pengawas (Diperiksa Oleh):</p>
                                        <SignaturePad
                                            onSave={(data) => onAnswerChange('signature_supervisor', data)}
                                            placeholder="Goreskan tanda tangan pengawas di sini"
                                            disabled={isOperator} // Operator CANNOT sign here
                                        />
                                        <div className="border-b border-slate-300 pb-1 mx-4 min-h-[24px] flex items-end justify-center">
                                            <p className="text-sm font-bold text-slate-800 not-italic uppercase">{answers['nama_pengawas'] || 'Pengawas'}</p>
                                        </div>
                                        {isOperator && (
                                            <p className="text-[10px] text-center text-blue-500 font-bold not-italic">
                                                * Gunakan tombol "Kirim ke Pengawas" untuk meminta tanda tangan.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Conditional input for "R" / Rusak */}
                        {item.type === 'boolean' && currentAnswer === 'R' && (
                            <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-up">
                                <label className="text-xs font-bold text-slate-500 mb-2 block">Keterangan Kerusakan</label>
                                <textarea
                                    className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/20 border-none"
                                    placeholder="Jelaskan kerusakan..."
                                    rows={2}
                                    value={answers[`${item.id}_comment`] || ''}
                                    onChange={(e) => onAnswerChange(item.id, false, e.target.value)}
                                />
                                <div className="mt-2 flex justify-end">
                                    <button className="flex items-center gap-2 text-xs font-bold text-app-primary bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Camera size={14} /> Ambil Foto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
