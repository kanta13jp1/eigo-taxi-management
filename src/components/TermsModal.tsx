import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import { X, Shield, FileText, AlertCircle } from 'lucide-react';

const TABS: Array<'terms' | 'privacy' | 'disclaimer'> = ['terms', 'privacy', 'disclaimer'];

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'disclaimer';
}

export function TermsModal({ isOpen, onClose, initialTab = 'terms' }: TermsModalProps) {
  if (!isOpen) return null;
  return <TermsModalContent key={initialTab} onClose={onClose} initialTab={initialTab} />;
}

function TermsModalContent({ onClose, initialTab }: { onClose: () => void; initialTab: 'terms' | 'privacy' | 'disclaimer' }) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer'>(initialTab);
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialTabRef = useRef<HTMLButtonElement>(null);

  useModalDialog({
    isOpen: true,
    onClose,
    dialogRef,
    initialFocusRef: initialTabRef,
  });

  const handleTabKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.indexOf(activeTab);
    let nextTab: 'terms' | 'privacy' | 'disclaimer' | null = null;

    if (e.key === 'ArrowRight') {
      nextTab = TABS[(currentIndex + 1) % TABS.length];
    } else if (e.key === 'ArrowLeft') {
      nextTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
    } else if (e.key === 'Home') {
      nextTab = TABS[0];
    } else if (e.key === 'End') {
      nextTab = TABS[TABS.length - 1];
    }

    if (nextTab) {
      e.preventDefault();
      setActiveTab(nextTab);
      document.getElementById(`terms-tab-${nextTab}`)?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        tabIndex={-1}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] overscroll-contain"
      >
        {/* ヘッダー */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 id="terms-modal-title" className="font-bold text-slate-800 text-base sm:text-lg">規約・プライバシー保護・免責事項</h2>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div
          role="tablist"
          aria-label="規約タブ"
          onKeyDown={handleTabKeyDown}
          className="flex flex-wrap gap-x-4 gap-y-1 border-b border-slate-100 px-4 pt-2 text-sm font-medium sm:px-6"
        >
          <button
            ref={initialTab === 'terms' ? initialTabRef : undefined}
            type="button"
            role="tab"
            id="terms-tab-terms"
            aria-selected={activeTab === 'terms'}
            aria-controls="terms-panel-terms"
            tabIndex={activeTab === 'terms' ? 0 : -1}
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            利用規約
          </button>
          <button
            ref={initialTab === 'privacy' ? initialTabRef : undefined}
            type="button"
            role="tab"
            id="terms-tab-privacy"
            aria-selected={activeTab === 'privacy'}
            aria-controls="terms-panel-privacy"
            tabIndex={activeTab === 'privacy' ? 0 : -1}
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            個人情報の取扱い
          </button>
          <button
            ref={initialTab === 'disclaimer' ? initialTabRef : undefined}
            type="button"
            role="tab"
            id="terms-tab-disclaimer"
            aria-selected={activeTab === 'disclaimer'}
            aria-controls="terms-panel-disclaimer"
            tabIndex={activeTab === 'disclaimer' ? 0 : -1}
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t ${
              activeTab === 'disclaimer'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            免責事項
          </button>
        </div>

        {/* 本文エリア */}
        <div className="p-6 overflow-y-auto text-sm text-slate-600 leading-relaxed">
          <div
            role="tabpanel"
            id="terms-panel-terms"
            aria-labelledby="terms-tab-terms"
            hidden={activeTab !== 'terms'}
            tabIndex={activeTab === 'terms' ? 0 : -1}
            className="space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-base">送迎サービス利用規約</h3>
              <p>Mauro & Brenda 英語教室の送迎管理システム（以下、「本システム」）のご利用にあたり、以下の規約を定めます。</p>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <p className="font-semibold text-slate-700">1. 送迎チケットの消費</p>
                <p className="text-xs sm:text-sm">チケットは、片道1回の送迎運行が完了した時点で1回分が自動消費されます。事前予約を行なった段階ではチケットは減算されません。</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <p className="font-semibold text-slate-700">2. 予約およびキャンセル</p>
                <p className="text-xs sm:text-sm">送迎の予約およびキャンセルは本Webシステムより随時行っていただけます。当日の急なキャンセルや変更につきましては、直接講師までご連絡ください。</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                <p className="font-semibold text-slate-700">3. 乗降時の安全確保</p>
                <p className="text-xs sm:text-sm">指定の乗降場所にてお待ちいただきますようお願いいたします。交通安全上の理由により、安全に駐停車できる場所への変更をお願いする場合がございます。</p>
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id="terms-panel-privacy"
            aria-labelledby="terms-tab-privacy"
            hidden={activeTab !== 'privacy'}
            tabIndex={activeTab === 'privacy' ? 0 : -1}
            className="space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-base">プライバシーポリシー（個人情報の取扱い）</h3>
              <p>本教室は、生徒様および保護者様の個人情報を厳重に管理し、以下の通り適切に取り扱います。</p>
              <div className="space-y-2.5">
                <div>
                  <span className="font-semibold text-slate-700">【収集する情報】</span>
                  <p className="text-xs sm:text-sm mt-0.5">生徒氏名、保護者氏名、緊急時連絡先電話番号、送迎先住所、送迎に関する特記事項。</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">【利用目的】</span>
                  <p className="text-xs sm:text-sm mt-0.5">送迎運行の安全な遂行、送迎スケジュール管理、保護者様への緊急連絡、チケット残数管理にのみ使用します。</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">【第三者提供の禁止】</span>
                  <p className="text-xs sm:text-sm mt-0.5">法令に基づく場合を除き、取得した個人情報を事前の同意なく第三者に開示・提供することはありません。</p>
                </div>
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id="terms-panel-disclaimer"
            aria-labelledby="terms-tab-disclaimer"
            hidden={activeTab !== 'disclaimer'}
            tabIndex={activeTab === 'disclaimer' ? 0 : -1}
            className="space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-base">免責事項</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>天候の急変、自然災害、道路工事、事故等の交通渋滞により、送迎到着時刻が前後する場合がございます。あらかじめご了承ください。</li>
                <li>外部クラウド基盤（Google スプレッドシート、Google カレンダー等）の計画メンテナンスや一時的な通信障害等により、即座に同期が行われない場合がございます。</li>
                <li>本システムを利用したこと、または利用できなかったことにより生じるいかなる損害についても、教室の故意または重大な過失による場合を除き、一切の責任を負いかねます。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
