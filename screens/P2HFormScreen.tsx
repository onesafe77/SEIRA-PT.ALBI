import React from 'react';
import { InspectionWizard } from '../components/inspection/InspectionWizard';
import { EXCAVATOR_P2H_DATA } from '../data/excavatorP2H';
import { ScreenName, P2HFormState } from '../types';
import { generateP2HPDF } from '../utils/pdfGenerator';

interface P2HFormScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

import { SuccessModal } from '../components/SuccessModal';

export const P2HFormScreen: React.FC<P2HFormScreenProps> = ({ onNavigate }) => {
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [waStatus, setWaStatus] = React.useState(false);

    const handleSubmit = async (data: any) => {
        try {
            let user: any = {};
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser && storedUser !== 'undefined') {
                    user = JSON.parse(storedUser);
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
            const dataToSubmit = {
                metadata: {
                    ...data.metadata,
                    operatorId: user.employeeId
                },
                answers: data.answers
            };

            const response = await fetch('http://localhost:5000/api/inspections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (response.ok) {
                const result = await response.json();

                setWaStatus(!!result.waNotified);
                setShowSuccess(true);
                localStorage.removeItem('p2h_autosave_data');
            } else {
                const err = await response.json();
                alert("Gagal menyimpan: " + (err.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert("Terjadi kesalahan koneksi ke server.");
        }
    };

    return (
        <div className="h-full bg-white md:rounded-[32px] overflow-hidden">
            <InspectionWizard
                sections={EXCAVATOR_P2H_DATA}
                onBack={() => onNavigate('inspection')}
                onSubmit={handleSubmit}
            />

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => onNavigate('inspection')}
                title="Berhasil Disimpan!"
                message="Data inspeksi P2H Anda telah berhasil dicatat ke dalam sistem."
                waNotified={waStatus}
            />
        </div>
    );
};
