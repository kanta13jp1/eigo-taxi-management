import React, { useRef, useState } from 'react';
import type { Student } from '../types';
import { useModalDialog } from '../hooks/useModalDialog';
import { X, UserPlus, MapPin, Phone, User } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <AddStudentModalContent {...props} />;
};

const AddStudentModalContent: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [ticketBalance, setTicketBalance] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useModalDialog({
    isOpen,
    onClose,
    isDismissDisabled: isSubmitting,
    dialogRef,
    initialFocusRef: nameInputRef,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName || !trimmedAddress) {
      setError('生徒名と送迎場所を入力してください');
      return;
    }
    const initialBalance = Number(ticketBalance);
    if (!ticketBalance.trim() || !Number.isSafeInteger(initialBalance) || initialBalance < 0) {
      setError('初期チケット枚数は0以上の整数で入力してください');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        name: trimmedName,
        parentName: parentName.trim(),
        phone: phone.trim(),
        address: trimmedAddress,
        pickupNote: pickupNote.trim(),
        ticketBalance: initialBalance,
      });
      // リセット
      setName('');
      setParentName('');
      setPhone('');
      setAddress('');
      setPickupNote('');
      setTicketBalance('10');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒を登録できませんでした');
    } finally {
      setIsSubmitting(false);
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
        aria-labelledby="add-student-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-slate-100"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <UserPlus className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="add-student-modal-title" className="font-bold text-slate-800 text-base">新規生徒の登録</h2>
              <p className="text-xs text-slate-500">送迎対象の生徒と保護者情報を登録します</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                生徒氏名 (ふりがな)
              </label>
              <input
                ref={nameInputRef}
                id="student-name"
                type="text"
                maxLength={100}
                autoComplete="name"
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 佐藤 陽菜 (ひな)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="student-parent" className="block text-xs font-semibold text-slate-600 mb-1">保護者氏名</label>
              <input
                id="student-parent"
                type="text"
                maxLength={100}
                autoComplete="name"
                disabled={isSubmitting}
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="例: 佐藤 美咲"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="student-phone" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                緊急連絡先 (電話番号)
              </label>
              <input
                id="student-phone"
                type="tel"
                maxLength={30}
                autoComplete="tel"
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例: 090-1234-5678"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="student-balance" className="block text-xs font-semibold text-slate-600 mb-1">初期チケット枚数</label>
              <input
                id="student-balance"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                required
                disabled={isSubmitting}
                value={ticketBalance}
                onChange={(e) => setTicketBalance(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="student-address" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              送迎場所・ご自宅住所
            </label>
            <input
              id="student-address"
              type="text"
              maxLength={200}
              autoComplete="street-address"
              disabled={isSubmitting}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 東京都世田谷区桜新町1-2-3 ○○マンション101"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="student-note" className="block text-xs font-semibold text-slate-600 mb-1">送迎時の注意メモ</label>
            <input
              id="student-note"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              {isSubmitting ? '登録中...' : '登録を完了する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
