import React, { useState, useEffect } from 'react';
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

export const AddTicketModal: React.FC<AddTicketModalProps> = ({
  isOpen,
  onClose,
  students,
  initialStudentId,
  onSubmit,
}) => {
  const [studentId, setStudentId] = useState(initialStudentId || '');
  const [ticketCount, setTicketCount] = useState<number>(10);
  const [amount, setAmount] = useState<number>(10000);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialStudentId) {
      setStudentId(initialStudentId);
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
    }
  }, [initialStudentId, students]);

  if (!isOpen) return null;

  const handlePresetSelect = (count: number, price: number, label: string) => {
    setTicketCount(count);
    setAmount(price);
    setNote(`${label}購入`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || ticketCount <= 0) {
      alert('生徒と正しい枚数を指定してください');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        studentId,
        ticketCount,
        amount,
        note,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === studentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
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
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 対象生徒 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">対象の生徒</label>
            <select
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">よく使うセット</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">追加枚数（回）</label>
              <input
                type="number"
                min="1"
                max="100"
                value={ticketCount}
                onChange={(e) => setTicketCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">受取金額 (円)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          {/* 備考 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">メモ（任意）</label>
            <input
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
