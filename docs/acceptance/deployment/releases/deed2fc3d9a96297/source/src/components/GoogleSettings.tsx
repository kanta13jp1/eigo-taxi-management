import { useState } from 'react';
import { ApiService } from '../services/api';
import GAS_CODE from '../../gas/Code.gs?raw';

export function GoogleSettings() {
  const [apiUrl,setApiUrl]=useState(ApiService.getGasApiUrl);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const demo=ApiService.getSession()?.mode==='demo';
  return <div className="mx-auto max-w-3xl space-y-6">
    <section className="space-y-3 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-bold">Google連携の設定</h2>
      <p className="text-sm">教室の環境は、接続先とご本人専用アクセスキーでログインした場合だけ利用します。接続できない場合はエラーを表示し、デモへの自動切替や成功扱いをしません。</p>
      <label htmlFor="gas-url" className="block text-sm">Google Apps Script WebアプリURL</label>
      <input id="gas-url" type="url" value={apiUrl} onChange={e=>setApiUrl(e.target.value)} className="w-full rounded-lg border p-3 text-sm" />
      <button onClick={()=>{setMessage('');setError('');try{ApiService.setGasApiUrl(apiUrl);setMessage(demo?'接続先を保存しました。教室の環境へはログアウト後にアクセスキーでログインしてください。':'設定を保存しました');}catch(err){setError(err instanceof Error?err.message:'保存できませんでした');}}} className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white">設定を保存</button>
      {message&&<p role="status" className="text-sm text-emerald-800">{message}</p>}
      {error&&<p role="alert" className="text-sm text-rose-800">{error}</p>}
    </section>
    <section className="space-y-3 rounded-2xl border bg-white p-6">
      <h2 className="font-bold">導入担当者向けセットアップ</h2>
      <ol className="list-inside list-decimal space-y-2 text-sm">
        <li>専用スプレッドシートに下記のCode.gsを配置し、initSpreadsheetを実行します。</li>
        <li>GASのスクリプトプロパティAUTH_USERS_JSONに、利用者ごとのキーのSHA-256、権限、保護者が利用できる生徒IDを登録します。詳細はリポジトリのdocs/GAS_AUTH_SETUP.mdを参照してください。</li>
        <li>ウェブアプリを更新デプロイし、接続先と各人専用のアクセスキーを本人へ個別に案内します。</li>
        <li>専用のテスト台帳・カレンダーで管理者2名と保護者の予約・取消・完了・権限を確認してから運用に移行します。</li>
      </ol>
      <button className="rounded-lg border px-3 py-2 text-sm" onClick={async()=>{try{await navigator.clipboard.writeText(GAS_CODE);setMessage('スクリプトをコピーしました');}catch{setError('コピーできませんでした');}}}>スクリプトをコピー</button>
      <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-200">{GAS_CODE}</pre>
    </section>
    {demo&&<section className="space-y-3 rounded-2xl border bg-white p-6">
      <h2 className="font-bold">このブラウザのデモデータ</h2>
      <p className="text-sm">以下は架空のデモ台帳だけを変更します。Google側のデータ初期化・移行とは別の操作です。</p>
      <button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>{if(confirm('デモデータを初期状態に戻しますか？')){ApiService.resetToMock();location.reload();}}}>モック初期化</button>
      <button className="ml-2 rounded-lg border px-3 py-2 text-sm text-rose-700" onClick={()=>{if(confirm('このブラウザのデモ台帳を空にしますか？')){ApiService.purgeAllData();location.reload();}}}>デモデータ消去</button>
    </section>}
  </div>;
}
