import React, { useEffect, useRef, useState } from 'react';
import type { Student } from '../types';
import type { StudentProfileUpdate } from '../services/api';
import { useModalDialog } from '../hooks/useModalDialog';
import { X, Pencil, MapPin, Phone, User } from 'lucide-react';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSubmit: (student: StudentProfileUpdate) => Promise<void>;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = (props) => {
  if (!props.isOpen || !props.student) return null;
  return <EditStudentModalContent {...props} student={props.student} />;
};

const EditStudentModalContent: React.FC<Omit<EditStudentModalProps, 'student'> & { student: Student }> = ({
  isOpen,
  student,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(student.name ?? '');
  const [parentName, setParentName] = useState(student.parentName ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [address, setAddress] = useState(student.address ?? '');
  const [pickupNote, setPickupNote] = useState(student.pickupNote ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<{
    name?: boolean;
    address?: boolean;
  }>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useModalDialog({
    isOpen,
    onClose,
    isDismissDisabled: isSubmitting,
    dialogRef,
    initialFocusRef: nameInputRef,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName || !trimmedAddress) {
      setInvalidFields({ name: !trimmedName, address: !trimmedAddress });
      setError('生徒氏名と送迎場所・ご自宅住所を入力してください');
      (!trimmedName ? nameInputRef : addressInputRef).current?.focus();
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    setError('');
    setInvalidFields({});
    try {
      await onSubmit({
        id: student.id,
        name: trimmedName,
        parentName: parentName.trim(),
        phone: phone.trim(),
        address: trimmedAddress,
        pickupNote: pickupNote.trim(),
      });
      if (mountedRef.current) {
        onClose();
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : '生徒情報を更新できませんでした');
      }
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-student-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-slate-100"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Pencil className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="edit-student-modal-title" className="font-bold text-slate-800 text-base">生徒情報の編集</h2>
              <p className="text-xs text-slate-600">氏名・連絡先・住所・送迎メモを更新します</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <span>
              生徒ID: <strong className="font-mono text-slate-900">{student.id}</strong>
            </span>
            <span>
              現在のチケット残数: <strong className="text-emerald-800">{student.ticketBalance}回</strong>
              <span className="text-slate-600">（残数は「チケット追加」で変更）</span>
            </span>
          </div>

          {error && <p id="edit-student-error" role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-student-name" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                生徒氏名 (ふりがな)
              </label>
              <input
                ref={nameInputRef}
                id="edit-student-name"
                type="text"
                maxLength={100}
                autoComplete="off"
                disabled={isSubmitting}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setInvalidFields((prev) => ({ ...prev, name: false }));
                }}
                aria-invalid={invalidFields.name ? 'true' : undefined}
                aria-describedby={invalidFields.name ? 'edit-student-error' : undefined}
                className={`w-full px-3 py-2 border ${
                  invalidFields.name
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                } rounded-xl focus:outline-none focus:ring-2 text-slate-800 text-sm disabled:opacity-50`}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-student-parent" className="block text-xs font-semibold text-slate-600 mb-1">保護者氏名</label>
              <input
                id="edit-student-parent"
                type="text"
                maxLength={100}
                autoComplete="off"
                disabled={isSubmitting}
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-student-phone" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              緊急連絡先 (電話番号)
            </label>
            <input
              id="edit-student-phone"
              type="tel"
              maxLength={30}
              autoComplete="off"
              disabled={isSubmitting}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="edit-student-address" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              送迎場所・ご自宅住所
            </label>
            <input
              ref={addressInputRef}
              id="edit-student-address"
              type="text"
              maxLength={200}
              autoComplete="off"
              disabled={isSubmitting}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setInvalidFields((prev) => ({ ...prev, address: false }));
              }}
              aria-invalid={invalidFields.address ? 'true' : undefined}
              aria-describedby={invalidFields.address ? 'edit-student-error' : undefined}
              className={`w-full px-3 py-2 border ${
                invalidFields.address
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500'
              } rounded-xl focus:outline-none focus:ring-2 text-slate-800 text-sm disabled:opacity-50`}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-student-note" className="block text-xs font-semibold text-slate-600 mb-1">送迎時の注意メモ</label>
            <input
              id="edit-student-note"
              type="text"
              maxLength={300}
              disabled={isSubmitting}
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              placeholder="例: マンション正面入口前に停車 / 到着時インターホン"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              閉じる
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
              {isSubmitting ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
