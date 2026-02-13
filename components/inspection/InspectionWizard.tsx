import React, { useState, useEffect } from 'react';
import { P2HSection, P2HFormState } from '../../types';
import { InspectionStep } from './InspectionStep';
import { Button } from '../Button';
import { ArrowLeft, ArrowRight, CheckCircle, Save } from 'lucide-react';
import { Input } from '../Input';

interface InspectionWizardProps {
    sections: P2HSection[];
    onBack: () => void;
    onSubmit: (data: P2HFormState) => void;
}

const STORAGE_KEY = 'p2h_autosave_data';

export const InspectionWizard: React.FC<InspectionWizardProps> = ({ sections, onBack, onSubmit }) => {
    // Load initial state from localStorage or use defaults
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const { currentStep } = JSON.parse(saved);
            return currentStep ?? -1;
        }
        return -1;
    });

    const [formData, setFormData] = useState<P2HFormState>(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const { formData: savedData } = JSON.parse(saved);
            if (savedData) {
                // Ensure operator name always matches current logged-in user
                // to prevent stale data from previous users (e.g. Syamsudin Noor vs Sartono)
                return {
                    ...savedData,
                    metadata: {
                        ...savedData.metadata,
                        operatorName: user.name || savedData.metadata.operatorName || ''
                    }
                };
            }
        }

        return {
            sections,
            metadata: {
                operatorName: user.name || '',
                unitCode: '',
                shift: '',
                hmStart: '',
                date: new Date().toISOString().split('T')[0]
            }
        };
    });

    const [answers, setAnswers] = useState<Record<string, any>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const { answers } = JSON.parse(saved);
            if (answers) return answers;
        }
        return {};
    });

    // Save functionality
    useEffect(() => {
        const dataToSave = {
            currentStep,
            formData,
            answers
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [currentStep, formData, answers]);

    const handleMetadataChange = (field: keyof typeof formData.metadata, value: string) => {
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value }
        }));
    };

    const handleAnswerChange = (itemId: string, value: any, comment?: string) => {
        setAnswers(prev => ({
            ...prev,
            [itemId]: value,
            ...(comment !== undefined ? { [`${itemId}_comment`]: comment } : {})
        }));
    };

    const handleNext = () => {
        if (currentStep < sections.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (currentStep > -1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        } else {
            onBack();
        }
    };

    const handleSubmit = () => {
        onSubmit({ metadata: formData.metadata, answers } as any);
    };

    const progress = ((currentStep + 1) / (sections.length + 1)) * 100;
    const currentSection = sections[currentStep];

    return (
        <div className="flex flex-col h-full bg-[#F3F6F8]">
            {/* Header with Progress */}
            <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">
                        {currentStep === -1 ? 'Data Unit' : `Step ${currentStep + 1}/${sections.length}`}
                    </h1>
                    <div className="w-6" /> {/* Spacer */}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-app-primary transition-all duration-500 ease-out rounded-full shadow-blue-200"
                        style={{ width: `${Math.max(5, progress)}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32">
                {currentStep === -1 ? (
                    /* Step 0: Metadata / Data Awal */
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Data Operasional</h2>

                            <Input
                                label="Tanggal"
                                type="date"
                                value={formData.metadata.date}
                                onChange={(e) => handleMetadataChange('date', e.target.value)}
                                className="!bg-slate-50"
                            />

                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-bold text-slate-800 ml-1">Kode Unit</label>
                                <div className="relative">
                                    <select
                                        value={formData.metadata.unitCode}
                                        onChange={(e) => handleMetadataChange('unitCode', e.target.value)}
                                        className="w-full h-[54px] bg-slate-50 border border-slate-200 rounded-2xl px-5 text-slate-800 focus:outline-none focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 appearance-none"
                                    >
                                        <option value="" disabled>Pilih Unit</option>
                                        <option value="ALBI EXCA 0201">ALBI EXCA 0201</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Jam Awal (HM)"
                                    type="number"
                                    placeholder="00000"
                                    value={formData.metadata.hmStart}
                                    onChange={(e) => handleMetadataChange('hmStart', e.target.value)}
                                    className="!bg-slate-50"
                                />
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-sm font-bold text-slate-800 ml-1">Shift</label>
                                    <div className="relative">
                                        <select
                                            value={formData.metadata.shift}
                                            onChange={(e) => handleMetadataChange('shift', e.target.value)}
                                            className="w-full h-[54px] bg-slate-50 border border-slate-200 rounded-2xl px-5 text-slate-800 focus:outline-none focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 appearance-none"
                                        >
                                            <option value="" disabled>Pilih Shift</option>
                                            <option value="Shift 1">Shift 1</option>
                                            <option value="Shift 2">Shift 2</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <Input
                                label="Nama Operator"
                                placeholder="Nama lengkap"
                                value={formData.metadata.operatorName}
                                onChange={(e) => handleMetadataChange('operatorName', e.target.value)}
                                className="!bg-slate-50"
                            />
                        </div>
                    </div>
                ) : (
                    /* Inspection Steps */
                    <InspectionStep
                        section={currentSection}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                        metadata={formData.metadata}
                    />
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 p-4 md:rounded-b-[32px] md:mb-4 z-20">
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handlePrev} className="flex-1 !rounded-[16px]">
                        {currentStep === -1 ? 'Batal' : 'Kembali'}
                    </Button>

                    {currentStep < sections.length - 1 ? (
                        <Button onClick={handleNext} fullWidth className="flex-[2] !rounded-[16px] shadow-blue-500/25">
                            Lanjut <ArrowRight size={18} />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} fullWidth className="flex-[2] !rounded-[16px] !bg-emerald-500 shadow-emerald-500/25">
                            Selesai & Kirim <CheckCircle size={18} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
