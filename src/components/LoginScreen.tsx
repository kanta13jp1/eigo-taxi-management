import { useEffect, useState } from 'react';
import type { AppSession } from '../services/api';
import { ApiService } from '../services/api';
import { DEMO_ENTRY_ID, isPortalMismatch } from '../portal';
import type { PortalRoute } from '../portal';
import { getDeploymentConfig, SETUP_REQUIRED_MESSAGE } from '../deployment-config';
import { prepareGoogleSignIn } from '../services/google-auth';

// @trace CODE-01 REQ-01
export function LoginScreen({ onLogin, route, requiresLogin }: { requiresLogin?: boolean; onLogin: (session: AppSession) => void; route: PortalRoute }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [setupFailed, setSetupFailed] = useState(false);
  const role = route.kind === 'admin' ? 'admin' : 'parent';
  const entry = route.kind === 'admin' || route.kind === 'parent';
  const demoEntry = route.kind === 'parent' && route.entryId === DEMO_ENTRY_ID;
  let configured = false;
  try { configured = Boolean(getDeploymentConfig().firebase); } catch { /* Setup errors fail closed. */ }
  useEffect(() => {
    let active = true;
    if (configured && entry && !demoEntry) {
      prepareGoogleSignIn().then(() => { if (active) { setGoogleReady(true); setSetupFailed(false); } })
        .catch(err => { if (active) { setSetupFailed(true); setError(err instanceof Error ? err.message : 'ログインを準備できませんでした。'); } });
    }
    return () => { active = false; };
  }, [configured, entry, demoEntry]);
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-800">
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Mauro &amp; Brenda Taxi Link</h1>
        {!entry ? <>
          <h2 className="text-lg font-bold">{route.kind === 'invalid' ? 'URLを確認してください' : '教室の送迎サービス'}</h2>
          <p className="text-sm">生徒・保護者の方は、教室から届いたご家庭専用のURLまたはQRコードを開いてください。</p>
          <a className="block rounded-lg border p-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" href="#/parent">保護者の共通ログイン入口</a>
          <a className="block rounded-lg border p-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" href="#/admin">管理者専用の入口</a>
        </> : <>
          <h2 className="text-lg font-bold">{role === 'admin' ? '管理者専用ログイン' : '生徒・保護者専用ログイン'}</h2>
          {requiresLogin && !demoEntry && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm">ログイン状態を確認できませんでした。教室に登録したGoogleアカウントでもう一度ログインしてください。</p>}
          {demoEntry ? <p className="rounded-lg bg-amber-50 p-3 text-sm">こちらは架空データで試す体験用の入口です。実際の予約には、教室から届いたご家庭専用URLを開いてください。</p> : <>
            <p className="text-sm">教室に登録したGoogleアカウントでログインしてください。初期設定は開発担当者が行います。</p>
            {route.kind === 'parent' && route.entryId && <p className="rounded-lg bg-emerald-50 p-3 text-sm">ご家庭専用の入口です。登録されたご本人のアカウントで確認します。</p>}
            <button type="button" disabled={busy || !configured || !googleReady} aria-busy={busy} onClick={async () => {
              setBusy(true); setError('');
              try { onLogin(await ApiService.loginWithGoogle(route)); }
              catch (err) {
                // The API clears the Firebase session after a failed login.
                // Require fresh preparation before allowing another popup.
                setGoogleReady(false); setSetupFailed(true);
                setError(err instanceof Error ? err.message : 'ログインできませんでした');
              }
              finally { setBusy(false); }
            }} className="w-full rounded-lg border border-slate-300 bg-white p-3 font-bold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{busy ? '確認中…' : 'Googleでログイン'}</button>
            {configured && !googleReady && !setupFailed && !busy && <p role="status" className="text-xs text-slate-600">Googleログインを準備しています…</p>}
            {!configured && <p role="alert" className="text-sm text-rose-700">{SETUP_REQUIRED_MESSAGE}</p>}
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            {error && isPortalMismatch(error) && <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm">
              {role === 'parent' ? <>
                <p>このGoogleアカウントは、保護者用の入口には登録されていません。保護者の方は、教室から届いたご家庭専用のURLまたはQRコードを開いてください。</p>
                <p>先生・管理者の方は、管理者専用の入口からログインしてください。</p>
              </> : <p>このGoogleアカウントは、管理者用の入口には登録されていません。生徒・保護者の方は、教室から届いたご家庭専用のURLまたはQRコードを開いてください。</p>}
              {role === 'parent' && <a href="#/admin" className="inline-block rounded-lg border border-slate-300 bg-white p-2 font-bold">管理者専用の入口を開く</a>}
            </div>}
            {configured && setupFailed && <button type="button" disabled={busy} onClick={async () => {
              setBusy(true); setError('');
              try { await prepareGoogleSignIn(); setGoogleReady(true); setSetupFailed(false); }
              catch (err) { setError(err instanceof Error ? err.message : 'ログインを準備できませんでした。'); }
              finally { setBusy(false); }
            }} className="rounded-lg border p-3 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">ログインの準備を再試行</button>}
            <p className="text-xs text-slate-600">ログインできない場合は、使用するGoogleアカウントを教室の担当者にご確認ください。</p>
          </>}
          {(route.kind === 'admin' || (route.kind === 'parent' && (!route.entryId || route.entryId === DEMO_ENTRY_ID))) && <section className="space-y-3 border-t pt-4">
            <h2 className="font-semibold">操作を体験する（架空データ）</h2>
            <p className="text-xs text-slate-600">デモの操作はこのブラウザ内だけに保存されます。</p>
            <button type="button" disabled={busy} onClick={()=>onLogin(ApiService.enterDemo(role))} className="rounded-lg border p-3 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{role === 'admin' ? '管理者デモを開く' : '保護者デモを開く'}</button>
          </section>}
        </>}
      </div>
    </main>
  );
}
