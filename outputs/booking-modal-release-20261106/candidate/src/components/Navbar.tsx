import React from 'react';
import { Car, ShieldCheck, Settings, QrCode } from 'lucide-react';

interface NavbarProps {
  currentTab: 'teacher' | 'invitations' | 'accounts' | 'settings';
  setCurrentTab: (tab: 'teacher' | 'invitations' | 'accounts' | 'settings') => void;
  selectedStudentName?: string;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, isAdmin }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-sm flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Mauro & Brenda Taxi Link</h1>
            <p className="text-xs text-slate-500 font-medium">{isAdmin ? '管理者専用ページ' : 'ご家庭専用ページ'}</p>
          </div>
        </div>

        {/* タブ切り替え */}
        {isAdmin && <nav aria-label="管理者メニュー" className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-sm font-medium w-full sm:w-auto justify-center">
          {isAdmin && <button
            onClick={() => setCurrentTab('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'teacher'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            管理者用 (Mauro・Brenda)
          </button>}
          <button
            onClick={() => setCurrentTab('invitations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'invitations'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            個別URL・QR
          </button>
          <button onClick={() => setCurrentTab('accounts')} className={`rounded-lg px-3 py-1.5 ${currentTab === 'accounts' ? 'bg-white text-emerald-700' : 'text-slate-600'}`}>アカウント管理</button>
          {isAdmin && <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'settings'
                ? 'bg-white text-emerald-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Google連携
          </button>}
        </nav>}
      </div>
    </header>
  );
};
