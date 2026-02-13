import React from 'react';
import { CheckCircle2, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    waNotified?: boolean;
    type?: 'success' | 'warning';
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    waNotified,
    type = 'success'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden animate-success-pop">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

                <div className="p-8 text-center relative z-10">
                    {/* Animated Icon Container */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-check-bounce
                            ${type === 'success' ? 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/20' : 'bg-amber-500/20 text-amber-500 shadow-amber-500/20'}`}
                        >
                            {type === 'success' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {title}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        {message}
                    </p>

                    {/* Notification Status Capsule */}
                    {waNotified !== undefined && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border mb-8 animate-fade-up
                            ${waNotified
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-amber-50 border-amber-100 text-amber-700'}`}
                            style={{ animationDelay: '0.3s' }}
                        >
                            <div className={`w-2 h-2 rounded-full ${waNotified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {waNotified ? 'WhatsApp Terkirim' : 'WhatsApp Gagal'}
                            </span>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
                        <Button
                            fullWidth
                            onClick={onClose}
                            className={`!h-14 !rounded-2xl shadow-xl transition-all active:scale-95
                                ${type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}
                        >
                            <span className="font-bold tracking-wide">Lanjut</span>
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Close Button Handle (Minimalist) */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
