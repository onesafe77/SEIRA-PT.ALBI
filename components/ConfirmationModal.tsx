import React from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Ya, Setujui',
    cancelLabel = 'Batal',
    isLoading = false
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
                <div className="p-8 text-center">
                    {/* Warning Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center shadow-lg animate-check-bounce shadow-blue-500/10">
                            <AlertCircle size={40} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
                        {message}
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            fullWidth
                            onClick={onConfirm}
                            isLoading={isLoading}
                            className="!h-14 !rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                        >
                            <span className="font-bold tracking-wide">{confirmLabel}</span>
                        </Button>
                        <Button
                            fullWidth
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="!h-12 !rounded-2xl text-slate-400 hover:text-slate-600"
                        >
                            <span className="font-bold tracking-wide">{cancelLabel}</span>
                        </Button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
