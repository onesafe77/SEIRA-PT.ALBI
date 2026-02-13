import React from 'react';
import { LogOut, Globe, Bell, Info, Shield, WifiOff, ChevronRight, User, Settings, CreditCard, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { ScreenName } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface ProfileProps {
  onNavigate: (screen: ScreenName) => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [user, setUser] = React.useState<any>({});
  const [stats, setStats] = React.useState({ inspections: 0, hours: 0, rank: '-' });
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        setUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    // Fetch Stats
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/profile/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.inspections !== undefined) {
            setStats(data);
            // Sync photo from server if available (and different)
            if (data.photoUrl) {
              setUser((prev: any) => ({ ...prev, photo_url: data.photoUrl }));
              // Optional: update localStorage for persistence
              const stored = JSON.parse(localStorage.getItem('user') || '{}');
              if (stored.photo_url !== data.photoUrl) {
                stored.photo_url = data.photoUrl;
                localStorage.setItem('user', JSON.stringify(stored));
              }
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const menuItems = [
    { icon: WifiOff, label: 'Offline Sync', sub: 'Last sync: 10m ago', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Bell, label: 'Notifikasi', sub: 'On', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Info, label: 'Tentang Aplikasi', sub: 'v3.0.1 Enterprise', color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/profile/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64String })
        });

        if (res.ok) {
          const data = await res.json();
          setUser((prev: any) => ({ ...prev, photo_url: data.photoUrl }));
          // Update local storage too to keep it fresh
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.photo_url = data.photoUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));
          alert("Foto profil berhasil diperbarui!");
        } else {
          alert("Gagal mengupload foto.");
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat upload.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-32 animate-fade-in min-h-full relative bg-[#F8FAFC]">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-slate-900 via-slate-800 to-[#F8FAFC] rounded-b-[40px] z-0"></div>
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] z-0"></div>
      <div className="absolute top-[50px] left-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] z-0"></div>

      <div className="relative z-10 px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
            <Settings size={20} />
          </div>
        </div>

        {/* Glassmorphic ID Card */}
        <div className="relative overflow-hidden rounded-[32px] p-1 shadow-2xl shadow-indigo-500/20 mb-8 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-[32px]"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-md rounded-[30px] p-6 border border-white/5">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/30 overflow-hidden relative">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-white font-bold uppercase">Edit</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-[3px] border-slate-800 shadow-sm">
                  <Shield size={12} fill="currentColor" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{user.name || 'User Name'}</h2>
                <p className="text-sm text-indigo-200 font-medium mb-2">{user.position || 'Operator'}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>

            {/* Stats Row within card */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Inspections</p>
                <p className="text-lg font-bold text-white">{stats.inspections}</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Hours</p>
                <p className="text-lg font-bold text-white">{stats.hours}h</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Rank</p>
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-lg font-bold text-white">{stats.rank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Settings</p>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-slate-100/50 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-200 transition-all cursor-pointer group active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{item.label}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.sub}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 mb-6">
          <Button
            variant="ghost"
            fullWidth
            className="text-white hover:text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 !h-14 !rounded-[24px] font-bold tracking-wide"
            icon={<LogOut size={20} />}
            onClick={() => setShowLogoutConfirm(true)}
          >
            Log Out
          </Button>

          <ConfirmationModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={() => {
              setShowLogoutConfirm(false);
              onNavigate('landing');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }}
            title="Konfirmasi Keluar"
            message="Apakah Anda yakin ingin keluar dari aplikasi SIERAAA?"
            confirmLabel="Ya, Keluar"
            cancelLabel="Kembali"
          />

          <div className="mt-8 text-center opacity-60">
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              ERT Gear System
            </p>
            <p className="text-[9px] text-slate-300 mt-1">
              v3.0.1 (Build 20240820)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};