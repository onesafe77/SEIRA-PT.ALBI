import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardHat, HeartPulse, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';

const ZeroDefectCard = () => (
    <div className="flex flex-col h-full justify-between relative bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#DB2777] p-6 rounded-[32px] text-white overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-3 py-1 rounded-full">PRIORITY</span>
                <span className="text-white/80 text-xs font-medium bg-black/20 px-2 py-1 rounded-lg">High Risk</span>
            </div>

            <div>
                <h3 className="text-3xl font-bold text-white mb-2 leading-tight">Zero Defect<br />Campaign</h3>
                <button className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-50 transition-colors w-full sm:w-auto">
                    Check Status
                </button>
            </div>
        </div>
    </div>
);

const SafetyQuote1 = () => (
    <div className="flex flex-col h-full justify-center items-center relative bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[32px] text-white overflow-hidden shadow-2xl shadow-emerald-500/30 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="z-10 bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
            <ShieldCheck size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 z-10">Safety First</h3>
        <p className="text-white/90 font-medium z-10">
            "Keselamatan adalah prioritas utama. Keluarga menunggumu di rumah."
        </p>
    </div>
);

const SafetyQuote2 = () => (
    <div className="flex flex-col h-full justify-center items-center relative bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[32px] text-white overflow-hidden shadow-2xl shadow-indigo-500/30 text-center">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        <div className="z-10 bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
            <HardHat size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 z-10">APD Wajib</h3>
        <p className="text-white/90 font-medium z-10">
            "Helm, Rompi, dan Sepatu Safety bukan hiasan. Gunakan setiap saat!"
        </p>
    </div>
);

const SafetyQuote3 = () => (
    <div className="flex flex-col h-full justify-center items-center relative bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-[32px] text-white overflow-hidden shadow-2xl shadow-orange-500/30 text-center">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
            <HeartPulse size={48} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 z-10">Zero Accident</h3>
        <p className="text-white/90 font-medium z-10">
            "Laporkan bahaya (Hazard) segera sebelum menjadi kecelakaan."
        </p>
    </div>
);

const slides = [
    <ZeroDefectCard />,
    <SafetyQuote1 />,
    <SafetyQuote2 />,
    <SafetyQuote3 />
];

export const HomeCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000); // Auto slide every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[320px] sm:h-[280px]"> {/* Fixed height for consistency */}
            <div className="w-full h-full transition-all duration-500 ease-in-out transform">
                {slides[currentIndex]}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {/* Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-colors z-20 hidden sm:flex"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-colors z-20 hidden sm:flex"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};
