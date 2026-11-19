import { useState } from 'react';
import type { AppSession } from '../services/api';
import { ApiService } from '../services/api';

export function LoginScreen({ onLogin }: { onLogin: (session: AppSession) => void }) {
  const [endpoint, setEndpoint] = useState(ApiService.getGasApiUrl);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-800">
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Mauro &amp; Brenda Taxi Link</h1>
        <p className="text-sm">教室から案内された接続先と、ご本人専用のアクセスキーでログインしてください。</p>
        <form className="space-y-4" onSubmit={async event => {
          event.preventDefault(); setBusy(true); setError('');
          try { onLogin(await ApiService.login(endpoint, token)); setToken(''); }
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
        <section className="space-y-3 border-t pt-4">
          <h2 className="font-semibold">操作を体験する（架空データ）</h2>
          <p className="text-xs text-slate-600">デモの操作はこのブラウザ内だけに保存され、教室の台帳やカレンダーには送信されません。</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button disabled={busy} onClick={()=>onLogin(ApiService.enterDemo('admin'))} className="rounded-lg border p-3 text-sm">管理者デモを開く</button>
            <button disabled={busy} onClick={()=>onLogin(ApiService.enterDemo('parent'))} className="rounded-lg border p-3 text-sm">保護者デモを開く</button>
          </div>
        </section>
      </div>
    </main>
  );
}
