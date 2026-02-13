import { Inspection, KPI } from './types';

export const MOCK_KPI: KPI[] = [
  { label: 'P2H Hari Ini', value: '8/10', trend: 'up' },
  { label: 'Unit Not Ready', value: '1', trend: 'down' },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'P2H-089',
    title: 'P2H Unit Excavator 01',
    type: 'P2H',
    location: 'Station 1',
    date: 'Hari ini, 07:00',
    status: 'NOT READY',
    severity: 'Critical',
  },
  {
    id: 'P2H-088',
    title: 'P2H Ambulance 02',
    type: 'P2H',
    location: 'Station Main',
    date: '24 Okt',
    status: 'Approved',
    severity: 'Low',
  },
];

export const QUICK_PROMPTS = [
  "Ringkas inspeksi",
  "Analisa temuan",
  "Buat tindakan korektif",
  "Klasifikasi severity"
];