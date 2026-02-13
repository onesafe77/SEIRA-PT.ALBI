import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, placeholder = "Tanda tangan di sini", disabled = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#1e293b'; // slate-800
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawing || disabled) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
        }
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clear = () => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSave('');
    };

    return (
        <div className="flex flex-col gap-2 w-full max-w-md">
            <div className={`relative bg-white rounded-2xl border-2 overflow-hidden shadow-inner ${disabled ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200'}`}>
                {isEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
                        <p className="text-slate-300 text-sm italic">{placeholder}</p>
                        {disabled && <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-tight">Hanya untuk Pengawas</p>}
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`w-full h-[150px] touch-none ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                />
            </div>
            {!isEmpty && !disabled && (
                <button
                    onClick={clear}
                    className="text-xs font-bold text-red-500 self-end px-2 py-1 hover:bg-red-50 rounded"
                >
                    Hapus Ulang
                </button>
            )}
        </div>
    );
};
