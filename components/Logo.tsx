import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
    const sizes = {
        sm: { icon: 24, text: 'text-xl' },
        md: { icon: 40, text: 'text-2xl' },
        lg: { icon: 64, text: 'text-4xl' },
        xl: { icon: 96, text: 'text-6xl' }
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Final Logo Image from User */}
            <img
                src="/logo_final.png"
                alt="SIERAAA Logo"
                style={{ width: currentSize.icon, height: currentSize.icon }}
                className="object-contain drop-shadow-sm"
            />

            {showText && (
                <span className={`${currentSize.text} font-black tracking-tighter text-slate-800 flex items-center`}>
                    SIE<span className="text-yellow-600">RA</span>
                </span>
            )}
        </div>
    );
};
