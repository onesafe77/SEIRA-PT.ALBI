export type ScreenName = 'landing' | 'login' | 'home' | 'inspection' | 'chat' | 'history' | 'profile' | 'p2h-form' | 'approval';

export interface Inspection {
  id: string;
  title: string;
  type: 'P2H' | 'Gear';
  location: string;
  date: string;
  status: 'READY' | 'NOT READY' | 'Draft' | 'Submitted' | 'Approved' | 'WAITING_SUPERVISOR';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface P2HItem {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'number' | 'photo'; // photo is triggered by boolean=false usually, but can be standalone
  required: boolean;
  value?: any;
  comment?: string;
  photo?: string; // base64 or url
}

export interface P2HSection {
  id: string;
  title: string;
  items: P2HItem[];
}

export interface P2HFormState {
  sections: P2HSection[];
  metadata: {
    operatorName: string;
    unitCode: string;
    shift: string;
    hmStart: string;
    hmStop?: string;
    date: string;
    notes?: string;
    supervisorName?: string;
    supervisorPhone?: string;
    supervisorSignature?: string;
    status?: 'Draft' | 'Waiting' | 'Completed';
  };
  answers?: Record<string, any>;
}

export interface NavItem {
  id: ScreenName;
  label: string;
  icon: any;
  badge?: string | boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface KPI {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}