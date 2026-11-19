import { useEffect, useState } from 'react';
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
  const item = items.find(i => i.publicEntryId === selected);
  const url = item ? invitationUrl(window.location.href, item.publicEntryId) : '';
  const qr = qrResult.url === url ? qrResult.data : '';
  useEffect(() => {
    let active = true;
    ApiService.getPortalInvitations().then(data => { if (active) { setItems(data); setSelected(data[0]?.publicEntryId || ''); } })
      .catch(err => { if (active) setError((err instanceof Error ? err.message : '取得できませんでした') + '。GASの最新版とご家庭の個別URL設定を管理担当者に確認してください。'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    if (url) QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 4, width: 512 }).then(data => { if (active) setQrResult({url,data}); })
      .catch(() => { if (active) setError('QRコードを作成できませんでした'); });
    return () => { active = false; };
  }, [url]);
  return <section className="mx-auto max-w-2xl space-y-5 rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-bold">ご家庭の個別URL・QR</h2>
    <p className="text-sm">登録済みのご家庭を選び、URLまたはQR画像を本人へ配布します。教室に登録されたGoogleアカウントでログインしてもらってください。</p>
    <p className="text-sm text-slate-600">QRには個別URLだけを含めます。氏名・生徒ID・認証情報は入りません。</p>
    {loading && <p>登録を確認しています…</p>}
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
    {!loading && !error && !items.length && <p>配布できる個別URLはまだ登録されていません。管理担当者がご家庭と生徒の紐付けを確認して登録します。</p>}
    {!!items.length && <>
      <label className="block text-sm font-semibold" htmlFor="invitation-family">配布先のご家庭</label>
      <select id="invitation-family" value={selected} onChange={e=>setSelected(e.target.value)} className="w-full rounded-lg border p-3">
        {items.map(i=><option key={i.publicEntryId} value={i.publicEntryId}>{i.name}</option>)}
      </select>
      <p className="break-all rounded-lg bg-slate-50 p-3 text-sm" data-testid="invitation-url">{url}</p>
      <button type="button" className="rounded-lg border px-4 py-2" onClick={async()=>{setError('');try{await navigator.clipboard.writeText(url);setCopiedUrl(url);}catch{setCopiedUrl('');setError('コピーできませんでした。表示されたURLを選択してコピーしてください。');}}}>{copiedUrl === url ? 'コピーしました' : 'URLをコピー'}</button>
      {copiedUrl === url && <p role="status" className="text-xs font-semibold text-emerald-700">配布用URLをクリップボードにコピーしました</p>}
      {qr && <div className="space-y-3">
        <img src={qr} alt="ご家庭専用のログインURLのQRコード" className="mx-auto w-64 max-w-full" />
        <a href={qr} download="taxi-link-invitation.png" className="block rounded-lg bg-emerald-700 p-3 text-center font-bold text-white">QR画像を保存</a>
      </div>}
      <p className="text-sm text-slate-600">配布前にご家庭名を確認してください。リンクの紛失時は「アカウント管理」で個別URLを再発行します。アカウント変更・退会時も管理者が利用登録を停止・変更します。</p>
    </>}
  </section>;
}
