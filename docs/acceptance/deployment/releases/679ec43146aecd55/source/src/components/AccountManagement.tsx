import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import type { ManagedUsers, ManagedUserInput, ManagedUser } from '../services/api';
import type { Student } from '../types';

const empty: ManagedUserInput = { name:'',email:'',role:'parent',active:true,studentIds:[] };
export function AccountManagement({students}:{students:Student[]}) {
  const [directory,setDirectory]=useState<ManagedUsers|null>(null);
  const [form,setForm]=useState<ManagedUserInput>({...empty});
  const [confirm,setConfirm]=useState<'save'|'delete'|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const self=ApiService.getSession()?.user.id;
  const load=async()=>{const next=await ApiService.getManagedUsers();setDirectory(next);};
  useEffect(()=>{let active=true;ApiService.getManagedUsers().then(data=>{if(active)setDirectory(data);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
  const edit=(u:ManagedUser)=>{setForm({userId:u.id,name:u.name,email:u.email,role:u.role,active:u.active,studentIds:[...u.studentIds]});setConfirm(null);setMessage('');setError('');};
  const run=async()=>{
    if(!directory)return;setBusy(true);setError('');
    try {
      if(confirm==='delete')await ApiService.deleteManagedUser(form.userId!,directory.revision);
      else await ApiService.saveManagedUser(form,directory.revision);
      await load();setMessage(confirm==='delete'?'このシステムの利用登録を削除しました。':'利用登録を保存しました。');setForm({...empty});setConfirm(null);
    }catch(e){setError(e instanceof Error?e.message:'保存できませんでした');setConfirm(null);try{await load();}catch{/* Keep original error. */}}
    finally{setBusy(false);}
  };
  return <section className="mx-auto max-w-3xl space-y-5 rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-bold">アカウント管理</h2>
    <p className="text-sm">Googleアカウントのメールアドレス、役割、対象の生徒を登録します。本人の初回Googleログインで本人確認が完了します。Googleアカウント自体の作成・削除は行いません。</p>
    <p className="text-sm text-slate-600">停止・削除は次の通信から反映します。退会前に予約の確認を行ってください。自分自身の停止・削除はできません。</p>
    {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
    {message&&<p role="status" className="rounded-lg bg-emerald-50 p-3">{message}</p>}
    <button disabled={busy} className="rounded border px-3 py-2" onClick={()=>{setError('');load().catch(e=>setError(e.message));}}>一覧を再取得</button>
    {directory&&<>
      <ul className="space-y-2">{directory.users.map(u=><li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
        <div><strong>{u.name}</strong>{u.id===self?'（自分）':''}<p className="break-all text-sm">{u.email||'メール未登録（既存設定）'}</p><p className="text-xs">{u.role==='admin'?'管理者':'保護者'} / {u.active?'有効':'利用停止'} / {u.linked?'本人確認済み':'初回ログイン待ち'}</p></div>
        <button disabled={busy} className="rounded border px-3 py-2" onClick={()=>edit(u)}>編集：{u.name}</button>
      </li>)}</ul>
      <form className="space-y-4 border-t pt-4" onSubmit={e=>{e.preventDefault();setConfirm('save');setError('');}}>
        <h3 className="font-bold">{form.userId?'利用登録を編集':'新しく利用登録'}</h3>
        <label className="block">表示名<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full rounded border p-2" /></label>
        <label className="block">Googleメールアドレス<input required type="email" maxLength={254} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 w-full rounded border p-2" /></label>
        <p className="text-xs text-slate-600">メールを変更する場合は古い利用登録を停止し、新しいメールで登録してください。</p>
        <label className="block">役割<select disabled={form.userId===self} value={form.role} onChange={e=>setForm({...form,role:e.target.value as 'admin'|'parent',studentIds:[]})} className="ml-2 rounded border p-2"><option value="parent">生徒・保護者</option><option value="admin">管理者（全生徒とアカウントを管理）</option></select></label>
        {form.role==='parent'&&<fieldset className="space-y-2"><legend>対象の生徒（1名以上）</legend>{students.map(s=><label key={s.id} className="block"><input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={e=>setForm({...form,studentIds:e.target.checked?[...form.studentIds,s.id]:form.studentIds.filter(id=>id!==s.id)})} /> {s.name}</label>)}</fieldset>}
        <label className="block"><input type="checkbox" disabled={form.userId===self} checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> 利用を有効にする</label>
        {form.userId&&form.role==='parent'&&<label className="block"><input type="checkbox" checked={!!form.rotateEntry} onChange={e=>setForm({...form,rotateEntry:e.target.checked})} /> 個別URLを再発行する（以前のURLは使えなくなります）</label>}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className="rounded bg-emerald-700 px-4 py-2 text-white">内容を確認</button><button type="button" disabled={busy} className="rounded border px-4 py-2" onClick={()=>{setForm({...empty});setConfirm(null);}}>新規登録に戻る</button>{form.userId&&form.userId!==self&&<button type="button" disabled={busy} className="rounded border border-rose-400 px-4 py-2 text-rose-700" onClick={()=>setConfirm('delete')}>利用登録を削除</button>}</div>
      </form>
      {confirm&&<div role="dialog" aria-label="アカウント変更の確認" className="space-y-3 rounded-lg border-2 border-amber-400 p-4"><p>{form.name} / {form.email}</p><p>{confirm==='delete'?'このシステムの利用権限を削除します。生徒台帳・履歴・Googleアカウントは削除されません。':`${form.role==='admin'?'全生徒とアカウントを管理できる管理者':'選択した生徒のみ利用する保護者'}として${form.active?'有効':'停止'}で保存します。`}</p><button disabled={busy} className="mr-3 rounded bg-emerald-700 px-4 py-2 text-white" onClick={run}>{busy?'処理中…':confirm==='delete'?'削除を実行':'保存を実行'}</button><button disabled={busy} onClick={()=>setConfirm(null)}>戻る</button></div>}
    </>}
  </section>;
}
