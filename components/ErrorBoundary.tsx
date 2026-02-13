import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h1>
                        <p className="text-slate-500 text-sm mb-6">
                            Maaf, aplikasi mengalami masalah saat memproses permintaan Anda.
                        </p>

                        <div className="bg-slate-50 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
                            <p className="text-xs font-mono text-slate-600 break-all">{this.state.error?.message}</p>
                        </div>

                        <button
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Muat Ulang Aplikasi
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
