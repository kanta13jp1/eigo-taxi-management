import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ApiService } from '../services/api';
import type { PortalInvitation } from '../services/api';
import { invitationUrl } from '../portal';

// @trace CODE-33 REQ-33
export function PortalInvitations() {
  const [items, setItems] = useState<PortalInvitation[]>([]);
  const [selected, setSelected] = useState('');
  const [qrResult, setQrResult] = useState({ url: '', data: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState('');
  const mountedRef = useRef(true);
  const item = items.find(i => i.publicEntryId === selected);
  const url = item ? invitationUrl(window.location.href, item.publicEntryId) : '';
  const qr = qrResult.url === url ? qrResult.data : '';
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    setCopiedUrl('');
    try {
      const data = await ApiService.getPortalInvitations();
      if (!mountedRef.current) return;
      setItems(data);
      setSelected(prev => (data.some(i => i.publicEntryId === prev) ? prev : (data[0]?.publicEntryId || '')));
    } catch (err) {
      if (mountedRef.current) {
        setError((err instanceof Error ? err.message : '取得できませんでした') + '。GASの最新版とご家庭の個別URL設定を管理担当者に確認してください。');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void reload();
    });
    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [reload]);
  useEffect(() => {
    let active = true;
    if (url) QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 4, width: 512 }).then(data => { if (active) setQrResult({url,data}); })
      .catch(() => { if (active) setError('QRコードを作成できませんでした'); });
    return () => { active = false; };
  }, [url]);
  return <section className="mx-auto max-w-2xl space-y-5 rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold">ご家庭の個別URL・QR</h2>
      <button type="button" disabled={loading} onClick={reload} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{loading ? '確認中…' : '一覧を再取得'}</button>
    </div>
    <p className="text-sm">登録済みのご家庭を選び、URLまたはQR画像を本人へ配布します。教室に登録されたGoogleアカウントでログインしてもらってください。</p>
    <p className="text-sm text-slate-600">QRには個別URLだけを含めます。氏名・生徒ID・認証情報は入りません。</p>
    {loading && <p role="status">登録を確認しています…</p>}
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
    {!loading && !error && !items.length && <p>配布できる個別URLはまだ登録されていません。管理担当者がご家庭と生徒の紐付けを確認して登録します。</p>}
    {!!items.length && <>
      <label className="block text-sm font-semibold" htmlFor="invitation-family">配布先のご家庭</label>
      <select id="invitation-family" value={selected} disabled={loading} onChange={e=>{setSelected(e.target.value);setError('');setCopiedUrl('');}} className="w-full rounded-lg border p-3 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
        {items.map(i=><option key={i.publicEntryId} value={i.publicEntryId}>{i.name}</option>)}
      </select>
      <p className="break-all select-all rounded-lg bg-slate-50 p-3 text-sm" data-testid="invitation-url">{url}</p>
      <button type="button" disabled={loading || !url} className="rounded-lg border px-4 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={async()=>{setError('');try{await navigator.clipboard.writeText(url);setCopiedUrl(url);}catch{setCopiedUrl('');setError('コピーできませんでした。表示されたURLを選択してコピーしてください。');}}}>{!!url && copiedUrl === url ? 'コピーしました' : 'URLをコピー'}</button>
      {!!url && copiedUrl === url && <p role="status" className="text-xs font-semibold text-emerald-700">配布用URLをクリップボードにコピーしました</p>}
      {!qr && !!url && !error && <p role="status" className="text-sm text-slate-500">QRコードを作成しています…</p>}
      {qr && <div className="space-y-3">
        <img src={qr} alt="ご家庭専用のログインURLのQRコード" className="mx-auto w-64 max-w-full" />
        <a href={qr} download={item ? `taxi-link-${item.name.replace(/[\\/:*?"<>|]/g, '_')}.png` : 'taxi-link-invitation.png'} className="block rounded-lg bg-emerald-700 p-3 text-center font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">QR画像を保存</a>
      </div>}
      <p className="text-sm text-slate-600">配布前にご家庭名を確認してください。リンクの紛失時は「アカウント管理」で個別URLを再発行します。アカウント変更・退会時も管理者が利用登録を停止・変更します。</p>
    </>}
  </section>;
}
