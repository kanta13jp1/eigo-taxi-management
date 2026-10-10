import { useState } from 'react';
import { X, Shield, FileText, AlertCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'disclaimer';
}

export function TermsModal({ isOpen, onClose, initialTab = 'terms' }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">規約・プライバシー保護・免責事項</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex border-b border-slate-100 px-6 pt-2 gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            利用規約
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            個人情報の取扱い
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'disclaimer'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            免責事項
          </button>
        </div>

        {/* 本文エリア */}
        <div className="p-6 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-base">送迎サービス利用規約</h4>
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
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-base">プライバシーポリシー（個人情報の取扱い）</h4>
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
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-base">免責事項</h4>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>天候の急変、自然災害、道路工事、事故等の交通渋滞により、送迎到着時刻が前後する場合がございます。あらかじめご了承ください。</li>
                <li>外部クラウド基盤（Google スプレッドシート、Google カレンダー等）の計画メンテナンスや一時的な通信障害等により、即座に同期が行われない場合がございます。</li>
                <li>本システムを利用したこと、または利用できなかったことにより生じるいかなる損害についても、教室の故意または重大な過失による場合を除き、一切の責任を負いかねます。</li>
              </ul>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
