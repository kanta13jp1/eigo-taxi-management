import { useRef, useState } from 'react';
import { ApiService } from '../services/api';
import { getDeploymentConfig, SETUP_REQUIRED_MESSAGE } from '../deployment-config';
import { useModalDialog } from '../hooks/useModalDialog';

export function GoogleSettings() {
  const [confirmAction, setConfirmAction] = useState<'reset' | 'purge' | null>(null);
  const [busy, setBusy] = useState(false);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const demo=ApiService.getSession()?.mode==='demo';
  let configured = false;
  let environment: 'test' | 'production' | undefined;
  try { const config = getDeploymentConfig(); configured = Boolean(config.firebase); environment = config.environment; } catch { /* Fail closed. */ }
  useModalDialog({
    isOpen: confirmAction !== null,
    onClose: () => setConfirmAction(null),
    isDismissDisabled: busy,
    dialogRef: confirmDialogRef,
    initialFocusRef: cancelButtonRef,
  });
  return <>
    <div className="mx-auto max-w-3xl space-y-6">
      <section aria-labelledby="google-status-heading" className="space-y-3 rounded-2xl border bg-white p-6">
        <h2 id="google-status-heading" className="text-lg font-bold">Google連携の状態</h2>
        <p className="text-sm">接続と初期管理者の設定は開発担当者が行います。この画面でURLやキーを入力する必要はありません。利用者の追加・停止・削除、生徒の紐付けは「アカウント管理」で管理者が行います。</p>
        {configured
          ? <p role="status" className="text-sm text-emerald-800">{environment === 'test' ? '検証環境のGoogleログインが設定されています。' : '教室のGoogleログインが設定されています。'}</p>
          : <p role="alert" className="text-sm text-rose-800">{SETUP_REQUIRED_MESSAGE}</p>}
        <p className="text-sm">{demo ? '現在は架空データで操作を体験しています。' : 'ログインしたご本人の権限で利用しています。'}通信に失敗した場合は画面にエラーを表示します。</p>
      </section>
      {demo&&<section aria-labelledby="demo-data-heading" className="space-y-3 rounded-2xl border bg-white p-6">
        <h2 id="demo-data-heading" className="font-bold">このブラウザのデモデータ</h2>
        <p className="text-sm">以下は架空のデモ台帳だけを変更します。Google側のデータ初期化・移行とは別の操作です。</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            aria-haspopup="dialog"
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            onClick={() => setConfirmAction('reset')}
          >
            モック初期化
          </button>
          <button
            type="button"
            disabled={busy}
            aria-haspopup="dialog"
            className="rounded-lg border px-3 py-2 text-sm text-rose-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            onClick={() => setConfirmAction('purge')}
          >
            デモデータ消去
          </button>
        </div>
      </section>}
    </div>
    {demo && confirmAction && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && !busy) setConfirmAction(null);
        }}
      >
        <div
          ref={confirmDialogRef}
          id="demo-data-confirm-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-confirm-title"
          aria-describedby="demo-confirm-desc"
          tabIndex={-1}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border-2 border-amber-400 p-5 space-y-3"
        >
          <h2 id="demo-confirm-title" className="text-base font-bold text-slate-900">デモデータ操作の確認</h2>
          <p className="text-sm font-semibold">
            {confirmAction === 'reset'
              ? 'デモデータを初期状態に戻しますか？'
              : 'このブラウザのデモ台帳を空にしますか？'}
          </p>
          <p id="demo-confirm-desc" className="text-xs text-slate-600">
            {confirmAction === 'reset'
              ? 'ブラウザ内に保存されているデモ台帳を初期サンプル状態に戻し、画面を再読み込みします。'
              : 'ブラウザ内に保存されているデモ台帳を空にし、画面を再読み込みします。'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              aria-busy={busy}
              className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${confirmAction === 'purge' ? 'bg-rose-700 focus-visible:ring-rose-600' : 'bg-emerald-700 focus-visible:ring-emerald-600'}`}
              onClick={() => {
                setBusy(true);
                if (confirmAction === 'reset') ApiService.resetToMock();
                else ApiService.purgeAllData();
                location.reload();
              }}
            >
              {busy ? '処理中…' : confirmAction === 'reset' ? '初期化を実行' : '消去を実行'}
            </button>
            <button
              ref={cancelButtonRef}
              type="button"
              disabled={busy}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              onClick={() => setConfirmAction(null)}
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )}
  </>;
}
