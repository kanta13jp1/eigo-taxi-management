import { useEffect, useRef, useState } from 'react';
import { ApiService } from '../services/api';
import type { ManagedUsers, ManagedUserInput, ManagedUser, ManagedRole } from '../services/api';
import type { Student } from '../types';
import { useModalDialog } from '../hooks/useModalDialog';

const empty: ManagedUserInput = { name:'',email:'',role:'parent',active:true,studentIds:[] };
export function AccountManagement({students}:{students:Student[]}) {
  const session = ApiService.getSession();
  const isDemo = session?.mode === 'demo';
  const [directory,setDirectory]=useState<ManagedUsers|null>(null);
  const [loading,setLoading]=useState(!isDemo);
  const [form,setForm]=useState<ManagedUserInput>({...empty});
  const [confirm,setConfirm]=useState<'save'|'delete'|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [invalidFields, setInvalidFields] = useState<{ name?: boolean; email?: boolean; students?: boolean; role?: boolean }>({});
  const mountedRef=useRef(true);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const roleSelectRef = useRef<HTMLSelectElement>(null);
  const firstStudentCheckboxRef = useRef<HTMLInputElement>(null);
  const self=session?.user.id;
  const needsStudents=form.role==='parent'||form.role==='reviewer';
  const load=async()=>{const next=await ApiService.getManagedUsers();if(mountedRef.current)setDirectory(next);};
  useEffect(()=>{
    mountedRef.current=true;
    if (isDemo) {
      return () => { mountedRef.current = false; };
    }
    let active=true;
    ApiService.getManagedUsers()
      .then(data=>{if(active&&mountedRef.current)setDirectory(data);})
      .catch(e=>{if(active&&mountedRef.current)setError(e instanceof Error?e.message:'取得できませんでした');})
      .finally(()=>{if(active&&mountedRef.current)setLoading(false);});
    return()=>{active=false;mountedRef.current=false;};
  },[isDemo]);
  useModalDialog({
    isOpen: confirm !== null,
    onClose: () => setConfirm(null),
    isDismissDisabled: busy,
    dialogRef: confirmDialogRef,
    initialFocusRef: cancelButtonRef,
  });
  const edit=(u:ManagedUser)=>{setForm({userId:u.id,name:u.name,email:u.email,role:u.role,active:u.active,studentIds:[...u.studentIds]});setInvalidFields({});setConfirm(null);setMessage('');setError('');};
  const run=async()=>{
    if(!directory)return;setBusy(true);setError('');
    try {
      if(confirm==='delete')await ApiService.deleteManagedUser(form.userId!,directory.revision);
      else await ApiService.saveManagedUser(form,directory.revision);
      await load();if(!mountedRef.current)return;setMessage(confirm==='delete'?'このシステムの利用登録を削除しました。':'利用登録を保存しました。');setForm({...empty});setInvalidFields({});setConfirm(null);
    }catch(e){if(mountedRef.current){setError(e instanceof Error?e.message:'保存できませんでした');setConfirm(null);}try{await load();}catch{/* Keep original error. */}}
    finally{if(mountedRef.current)setBusy(false);}
  };
  return (
    <>
      <section className="mx-auto max-w-3xl space-y-5 rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="text-xl font-bold">アカウント管理</h2>
    <p className="text-sm">Googleアカウントのメールアドレス、役割、対象の生徒を登録します。本人の初回Googleログインで本人確認が完了します。Googleアカウント自体の作成・削除は行いません。</p>
    <p className="text-sm text-slate-600">停止・削除は次の通信から反映します。退会前に予約の確認を行ってください。自分自身の停止・削除はできません。</p>
    {isDemo ? (
      <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        デモモードではアカウント管理を利用できません。Googleログインした管理者アカウントでご利用ください。
      </p>
    ) : (
      <>
    {error&&<p id="account-form-error" role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
    {message&&<p role="status" className="rounded-lg bg-emerald-50 p-3">{message}</p>}
    <button type="button" disabled={busy||loading} aria-busy={loading} className="rounded border px-3 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={async()=>{setError('');setMessage('');setLoading(true);try{await load();}catch(e){if(mountedRef.current)setError(e instanceof Error?e.message:'取得できませんでした');}finally{if(mountedRef.current)setLoading(false);}}}>{loading?'読込中…':'一覧を再取得'}</button>
    {loading && !directory && <p role="status" className="text-sm text-slate-600">アカウント一覧を読み込んでいます…</p>}
    {directory&&<>
      <ul className="space-y-2">{directory.users.map(u=><li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
        <div><strong>{u.name}</strong>{u.id===self?'（自分）':''}<p className="break-all text-sm">{u.email||'メール未登録（既存設定）'}</p><p className="text-xs">{u.role==='admin'?'管理者':u.role==='reviewer'?'検証専用（指定した架空生徒のみ）':'保護者'} / {u.active?'有効':'利用停止'} / {u.linked?'本人確認済み':'初回ログイン待ち'}</p></div>
        <button type="button" disabled={busy} className="rounded border px-3 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={()=>edit(u)}>編集：{u.name}</button>
      </li>)}</ul>
      <form
        noValidate
        className="space-y-4 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmedName = form.name.trim();
          const trimmedEmail = form.email.trim();
          if (!trimmedName || !trimmedEmail) {
            setInvalidFields({ name: !trimmedName, email: !trimmedEmail });
            setError('表示名とGoogleメールアドレスを入力してください');
            (!trimmedName ? nameInputRef : emailInputRef).current?.focus();
            return;
          }
          if (emailInputRef.current?.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setInvalidFields({ email: true });
            setError('有効なGoogleメールアドレスを入力してください');
            emailInputRef.current?.focus();
            return;
          }
          setForm({ ...form, name: trimmedName, email: trimmedEmail });
          if (needsStudents && !form.studentIds.length) {
            setInvalidFields({ students: true });
            setError('対象の生徒を1名以上選択してください');
            firstStudentCheckboxRef.current?.focus();
            return;
          }
          if (form.role === 'reviewer' && directory.reviewModeAvailable !== true) {
            setInvalidFields({ role: true });
            setError('この接続先では検証専用アカウントを保存できません');
            roleSelectRef.current?.focus();
            return;
          }
          setInvalidFields({});
          setConfirm('save');
          setError('');
        }}
      >
        <h3 className="font-bold">{form.userId ? '利用登録を編集' : '新しく利用登録'}</h3>
        <label htmlFor="account-name" className="block">
          表示名
          <input
            ref={nameInputRef}
            id="account-name"
            required
            maxLength={100}
            disabled={busy}
            autoComplete="off"
            aria-invalid={invalidFields.name ? 'true' : undefined}
            aria-describedby={invalidFields.name ? 'account-form-error' : undefined}
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setInvalidFields((prev) => ({ ...prev, name: false }));
            }}
            className={`mt-1 w-full rounded border p-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${invalidFields.name ? 'border-rose-400 focus-visible:ring-rose-500' : 'focus-visible:ring-emerald-600'}`}
          />
        </label>
        <label htmlFor="account-email" className="block">
          Googleメールアドレス
          <input
            ref={emailInputRef}
            id="account-email"
            required
            type="email"
            maxLength={254}
            disabled={busy}
            autoComplete="off"
            aria-invalid={invalidFields.email ? 'true' : undefined}
            aria-describedby={invalidFields.email ? 'account-email-help account-form-error' : 'account-email-help'}
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setInvalidFields((prev) => ({ ...prev, email: false }));
            }}
            className={`mt-1 w-full rounded border p-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${invalidFields.email ? 'border-rose-400 focus-visible:ring-rose-500' : 'focus-visible:ring-emerald-600'}`}
          />
        </label>
        <p id="account-email-help" className="text-xs text-slate-600">メールを変更する場合は古い利用登録を停止し、新しいメールで登録してください。</p>
        <label className="block">
          役割
          <select
            ref={roleSelectRef}
            disabled={busy || form.userId === self}
            aria-invalid={invalidFields.role ? 'true' : undefined}
            aria-describedby={invalidFields.role ? 'account-form-error' : undefined}
            value={form.role}
            onChange={(e) => {
              setForm({ ...form, role: e.target.value as ManagedRole, studentIds: [] });
              setInvalidFields((prev) => ({ ...prev, role: false, students: false }));
            }}
            className={`ml-2 rounded border p-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${invalidFields.role ? 'border-rose-400 focus-visible:ring-rose-500' : 'focus-visible:ring-emerald-600'}`}
          >
            <option value="parent">生徒・保護者</option>
            <option value="admin">管理者（全生徒とアカウントを管理）</option>
            {(directory.reviewModeAvailable === true || form.role === 'reviewer') && (
              <option value="reviewer" disabled={directory.reviewModeAvailable !== true}>検証専用（指定した架空生徒のみ）</option>
            )}
          </select>
        </label>
        {form.role==='reviewer'&&<p className="rounded-lg bg-amber-50 p-3 text-sm">検証台帳専用です。同じGoogleアカウントで管理者用と保護者用の2つのURLを使えます。実際の生徒は選択しないでください。アカウント管理・教室設定・生徒追加は利用できません。{directory.reviewModeAvailable!==true?' 現在の接続先では保存できません。利用登録の削除、または通常の役割への変更は可能です。':''}</p>}
        {needsStudents && (
          <fieldset
            aria-invalid={invalidFields.students ? 'true' : undefined}
            aria-describedby={invalidFields.students ? 'account-form-error' : undefined}
            className={`space-y-2${invalidFields.students ? ' rounded-lg border border-rose-400 p-3' : ''}`}
          >
            <legend>{form.role === 'reviewer' ? '対象の架空生徒（1名以上）' : '対象の生徒（1名以上）'}</legend>
            {students.length === 0 ? (
              <p className="text-xs text-slate-500">登録済みの生徒がまだありません。先に「管理者用」で生徒を登録してください。</p>
            ) : (
              students.map((s, idx) => (
                <label key={s.id} className="block">
                  <input
                    ref={idx === 0 ? firstStudentCheckboxRef : undefined}
                    type="checkbox"
                    disabled={busy}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    checked={form.studentIds.includes(s.id)}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        studentIds: e.target.checked
                          ? [...form.studentIds, s.id]
                          : form.studentIds.filter((id) => id !== s.id),
                      });
                      setInvalidFields((prev) => ({ ...prev, students: false }));
                    }}
                  />{' '}
                  {s.name}
                </label>
              ))
            )}
          </fieldset>
        )}
        <label className="block"><input type="checkbox" disabled={busy||form.userId===self} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> 利用を有効にする</label>
        {form.userId&&needsStudents&&<label className="block"><input type="checkbox" disabled={busy} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" checked={!!form.rotateEntry} onChange={e=>setForm({...form,rotateEntry:e.target.checked})} /> 個別URLを再発行する（以前のURLは使えなくなります）</label>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">内容を確認</button>
          <button type="button" disabled={busy} className="rounded border px-4 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={()=>{setForm({...empty});setInvalidFields({});setConfirm(null);setError('');setMessage('');}}>新規登録に戻る</button>
          {form.userId&&form.userId!==self&&<button type="button" disabled={busy} className="rounded border border-rose-400 px-4 py-2 text-rose-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" onClick={()=>setConfirm('delete')}>利用登録を削除</button>}
        </div>
      </form>
    </>}
      </>
    )}
      </section>
      {directory && confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setConfirm(null);
          }}
        >
          <div
            ref={confirmDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-confirm-title"
            aria-describedby="account-confirm-desc"
            tabIndex={-1}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border-2 border-amber-400 p-5 space-y-3"
          >
            <h2 id="account-confirm-title" className="text-base font-bold text-slate-900">
              アカウント変更の確認
            </h2>
            <p>
              {form.name} / {form.email}
            </p>
            <p id="account-confirm-desc">
              {confirm === 'delete'
                ? 'このシステムの利用権限を削除します。生徒台帳・履歴・Googleアカウントは削除されません。'
                : `${form.role === 'admin' ? '全生徒とアカウントを管理できる管理者' : form.role === 'reviewer' ? '選択した架空生徒だけを両方の画面で検証する利用者' : '選択した生徒のみ利用する保護者'}として${form.active ? '有効' : '停止'}で保存します。`}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                aria-busy={busy}
                className={`rounded px-4 py-2 text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${confirm === 'delete' ? 'bg-rose-700' : 'bg-emerald-700'} ${confirm === 'delete' ? 'focus-visible:ring-rose-600' : 'focus-visible:ring-emerald-600'}`}
                onClick={run}
              >
                {busy ? '処理中…' : confirm === 'delete' ? '削除を実行' : '保存を実行'}
              </button>
              <button
                ref={cancelButtonRef}
                type="button"
                disabled={busy}
                className="rounded border px-4 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                onClick={() => setConfirm(null)}
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
