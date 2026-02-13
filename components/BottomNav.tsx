import React from 'react';
import { Home, ClipboardList, Bot, History, User } from 'lucide-react';
import { ScreenName, NavItem } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inspection', label: 'Inspeksi', icon: ClipboardList, badge: '2' },
    { id: 'chat', label: 'Chat AI', icon: Bot, badge: true },
    { id: 'history', label: 'Riwayat', icon: History, badge: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full pb-safe z-50 pointer-events-none">
      {/* Gradient fade to hide content scrolling behind */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent pointer-events-none"></div>

      <div className="flex justify-center pb-6 px-6 pointer-events-auto">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-300/50 rounded-[32px] px-3 py-3 flex justify-between items-center w-full max-w-sm border border-white/60 ring-1 ring-white/50">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center justify-center w-14 h-14 rounded-[20px] transition-all duration-300 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105 rotate-1' : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-600'}`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Badges */}
                {item.badge && !isActive && (
                  <span className={`absolute top-2 right-2 flex items-center justify-center ${typeof item.badge === 'string' ? 'bg-red-500 min-w-[14px] h-[14px] px-1 text-[9px]' : 'bg-red-500 w-[8px] h-[8px]'} rounded-full text-white border-2 border-white`}>
                    {typeof item.badge === 'string' ? item.badge : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};