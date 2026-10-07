import React from 'react';
import { Car, UserCheck, ShieldCheck, Settings } from 'lucide-react';

interface NavbarProps {
  currentTab: 'teacher' | 'parent' | 'settings';
  setCurrentTab: (tab: 'teacher' | 'parent' | 'settings') => void;
  selectedStudentName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('teacher')}>
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-sm flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Eigo Taxi Link</h1>
            <p className="text-xs text-slate-500 font-medium">英語教室 送迎チケット管理</p>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-medium w-full sm:w-auto justify-center">
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'teacher'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            先生用管理画面
          </button>
          <button
            onClick={() => setCurrentTab('parent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'parent'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            保護者ポータル
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'settings'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Google連携
          </button>
        </div>
      </div>
    </header>
  );
};
