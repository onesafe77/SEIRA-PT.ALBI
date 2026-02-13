import React, { useState } from 'react';
import { User, Lock, ArrowLeft, Eye, EyeOff, Layout } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ScreenName } from '../types';
import { Logo } from '../components/Logo';
import { API_BASE_URL } from '../utils/api';

interface LoginProps {
  onNavigate: (screen: ScreenName) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting login at: ${API_BASE_URL}/api/login`);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Login gagal (${response.status})`);
      }

      const data = await response.json();

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onNavigate('home');
    } catch (err: any) {
      console.error('Login error detail:', err);
      setError(`${err.message} (URL: ${API_BASE_URL})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("/wallpaper.jpeg")' }}
    >
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white/10 p-6 rounded-[32px] border border-white/20 shadow-2xl backdrop-blur-md mb-8 animate-pulse">
            <Logo size="md" showText={false} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-t-blue-400 border-r-transparent border-b-blue-400/30 border-l-transparent rounded-full animate-spin"></div>
            <p className="text-white font-bold text-lg tracking-wide uppercase animate-pulse">Memuat...</p>
            <p className="text-slate-300 text-sm font-medium">Menyiapkan dashboard Anda</p>
          </div>
        </div>
      )}

      <div className={`relative z-10 flex flex-col flex-1 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-8 flex justify-center">
            <Logo size="lg" className="p-4 bg-white/10 backdrop-blur-md rounded-[32px] border border-white/20 shadow-xl" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Selamat Datang di Siera</h1>
          <p className="text-slate-200 mb-1 text-lg">Masuk untuk memulai aktivitas safety.</p>
          <p className="text-white/60 text-sm font-bold tracking-wider mb-10 uppercase">PT. Alam Lestari Baratamaindo</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-[32px] shadow-float border border-white">
            <Input
              label="ID Pegawai"
              placeholder="Contoh: 123456"
              icon={<User size={18} />}
              className="!bg-slate-50"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Kata Sandi"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                className="!bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-[40px] text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium select-none">
                <input type="checkbox" className="rounded-md border-slate-300 text-app-primary focus:ring-app-primary/30 w-5 h-5" />
                Ingat saya
              </label>
              <button type="button" className="text-app-primary hover:text-blue-700 font-bold">
                Lupa password?
              </button>
            </div>

            <Button type="submit" fullWidth isLoading={loading} className="mt-4 !rounded-[20px] shadow-blue-200">
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};