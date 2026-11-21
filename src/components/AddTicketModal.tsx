import React, { useState } from 'react';
import type { Student } from '../types';
import { X, Ticket, PlusCircle } from 'lucide-react';

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  onSubmit: (params: {
    studentId: string;
    ticketCount: number;
    amount: number;
    note?: string;
  }) => Promise<void>;
}

export const AddTicketModal: React.FC<AddTicketModalProps> = (props) => {
  if (!props.isOpen) return null;
  const modalKey = props.initialStudentId || props.students[0]?.id || 'empty';
  return <AddTicketModalContent key={modalKey} {...props} />;
};

const AddTicketModalContent: React.FC<AddTicketModalProps> = ({
  onClose,
  students,
  initialStudentId,
  onSubmit,
}) => {
  const [studentId, setStudentId] = useState(initialStudentId || students[0]?.id || '');
  const [ticketCount, setTicketCount] = useState<number>(10);
  const [amountInput, setAmountInput] = useState('10000');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePresetSelect = (count: number, price: number, label: string) => {
    setTicketCount(count);
    setAmountInput(String(price));
    setNote(`${label}購入`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !Number.isSafeInteger(ticketCount) || ticketCount < 1 || ticketCount > 100) {
      setError('生徒と1〜100枚の整数を指定してください');
      return;
    }
    const amount = Number(amountInput);
    if (amountInput === '' || !Number.isSafeInteger(amount) || amount < 0) {
      setError('受取金額を0円以上の整数で入力してください');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        studentId,
        ticketCount,
        amount,
        note,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チケットを追加できませんでした');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === studentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">チケット購入・追加</h3>
              <p className="text-xs text-slate-500">生徒の回数券残数をチャージします</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {/* 対象生徒 */}
          <div>
            <label htmlFor="ticket-student" className="block text-xs font-semibold text-slate-600 mb-1">対象の生徒</label>
            <select
              id="ticket-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 text-sm"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}（現在: {student.ticketBalance}枚）
                </option>
              ))}
            </select>
            {selectedStudent && (
              <p className="text-xs text-slate-500 mt-1">
                現在の残数: <span className="font-bold text-slate-800">{selectedStudent.ticketBalance}枚</span> →
                追加後: <span className="font-bold text-emerald-600">{selectedStudent.ticketBalance + ticketCount}枚</span>
              </p>
            )}
          </div>

          {/* プリセット選択ボタン */}
          <div>
            <p className="block text-xs font-semibold text-slate-600 mb-1.5">よく使うセット</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect(5, 5000, '5回券')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  ticketCount === 5 ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                5回券 (¥5,000)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(10, 10000, '10回券')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  ticketCount === 10 ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                10回券 (¥10,000)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect(1, 1000, '単発1回')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  ticketCount === 1 ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                1回分 (¥1,000)
              </button>
            </div>
          </div>

          {/* 枚数と金額 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ticket-count" className="block text-xs font-semibold text-slate-600 mb-1">追加枚数（回）</label>
              <input
                id="ticket-count"
                type="number"
                min="1"
                max="100"
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label htmlFor="ticket-amount" className="block text-xs font-semibold text-slate-600 mb-1">受取金額 (円)</label>
              <input
                id="ticket-amount"
                type="number"
                min="0"
                step="1"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          {/* 備考 */}
          <div>
            <label htmlFor="ticket-note" className="block text-xs font-semibold text-slate-600 mb-1">メモ（任意）</label>
            <input
              id="ticket-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 現金受領 / 口座振込確認済み"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm"
            />
          </div>

          {/* アクションボタン */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              閉じる
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {isSubmitting ? '処理中...' : 'チケットを追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
