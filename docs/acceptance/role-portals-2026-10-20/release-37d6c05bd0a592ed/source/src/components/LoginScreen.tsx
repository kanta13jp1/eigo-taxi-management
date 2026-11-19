import { useState } from 'react';
import type { AppSession } from '../services/api';
import { ApiService } from '../services/api';
import { DEMO_ENTRY_ID } from '../portal';
import type { PortalRoute } from '../portal';

export function LoginScreen({ onLogin, route }: { onLogin: (session: AppSession) => void; route: PortalRoute }) {
  const [endpoint, setEndpoint] = useState(ApiService.getGasApiUrl);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const role = route.kind === 'admin' ? 'admin' : 'parent';
  const entry = route.kind === 'admin' || route.kind === 'parent';
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-800">
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Mauro &amp; Brenda Taxi Link</h1>
        {!entry ? <>
          <h2 className="text-lg font-bold">{route.kind === 'invalid' ? 'URLを確認してください' : '教室の送迎サービス'}</h2>
          <p className="text-sm">生徒・保護者の方は、教室から届いたご家庭専用のURLまたはQRコードを開いてください。</p>
          <a className="block rounded-lg border p-3 text-center" href="#/parent">保護者の共通ログイン入口</a>
          <a className="block rounded-lg border p-3 text-center" href="#/admin">管理者専用の入口</a>
        </> : <>
          <h2 className="text-lg font-bold">{role === 'admin' ? '管理者専用ログイン' : '生徒・保護者専用ログイン'}</h2>
          <p className="text-sm">教室から案内された接続先と、ご本人専用のアクセスキーでログインしてください。</p>
          {route.kind === 'parent' && route.entryId && <p className="rounded-lg bg-emerald-50 p-3 text-sm">ご家庭専用の入口です。このURLに登録された方のキーで確認します。</p>}
          <form className="space-y-4" onSubmit={async event => {
            event.preventDefault(); setBusy(true); setError('');
            try { onLogin(await ApiService.login(endpoint, token, route)); setToken(''); }
            catch (err) { setError(err instanceof Error ? err.message : 'ログインできませんでした'); }
            finally { setBusy(false); }
          }}>
            <label className="block text-sm" htmlFor="login-endpoint">教室の接続先URL</label>
            <input id="login-endpoint" type="url" value={endpoint} onChange={e=>setEndpoint(e.target.value)} required className="w-full rounded-lg border p-3 text-sm" />
            <label className="block text-sm" htmlFor="login-key">ご本人専用のアクセスキー</label>
            <input id="login-key" type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required className="w-full rounded-lg border p-3 text-sm" />
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <button disabled={busy} type="submit" className="w-full rounded-lg bg-emerald-700 p-3 font-bold text-white disabled:opacity-50">{busy ? '確認中…' : 'ログイン'}</button>
          </form>
          {(route.kind === 'admin' || (route.kind === 'parent' && (!route.entryId || route.entryId === DEMO_ENTRY_ID))) && <section className="space-y-3 border-t pt-4">
            <h2 className="font-semibold">操作を体験する（架空データ）</h2>
            <p className="text-xs text-slate-600">デモの操作はこのブラウザ内だけに保存されます。</p>
            <button disabled={busy} onClick={()=>onLogin(ApiService.enterDemo(role))} className="rounded-lg border p-3 text-sm">{role === 'admin' ? '管理者デモを開く' : '保護者デモを開く'}</button>
          </section>}
        </>}
      </div>
    </main>
  );
}
