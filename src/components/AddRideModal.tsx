import React, { useEffect, useState } from 'react';
import type { Student, RideType } from '../types';
import { getLocalDateString } from '../services/api';
import { X, Calendar, Clock, MapPin, FileText, CheckCircle2 } from 'lucide-react';

interface AddRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialStudentId?: string;
  isTeacher?: boolean;
  onSubmit: (data: {
    studentId: string;
    rideDate: string;
    rideTime: string;
    rideType: RideType;
    pickupLocation: string;
    note?: string;
    reservedBy: 'parent' | 'teacher';
  }) => Promise<void>;
}

// @trace CODE-09 REQ-09
export const AddRideModal: React.FC<AddRideModalProps> = (props) => {
  if (!props.isOpen) return null;
  const modalKey = props.initialStudentId || props.students[0]?.id || 'empty';
  return <AddRideModalContent key={modalKey} {...props} />;
};

const AddRideModalContent: React.FC<AddRideModalProps> = ({
  onClose,
  students,
  initialStudentId,
  isTeacher = false,
  onSubmit,
}) => {
  const defaultStudent = students.find((s) => s.id === initialStudentId) || students[0];
  const [studentId, setStudentId] = useState(defaultStudent?.id || '');
  const [rideDate, setRideDate] = useState(() => getLocalDateString());
  const [rideTime, setRideTime] = useState('16:00');
  const [rideType, setRideType] = useState<RideType>('pickup');
  const [pickupLocation, setPickupLocation] = useState(defaultStudent?.address || '');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStudentChange = (id: string) => {
    setStudentId(id);
    const student = students.find((s) => s.id === id);
    if (student) {
      setPickupLocation(student.address);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLocation = pickupLocation.trim();
    if (!studentId || !rideDate || !rideTime || !trimmedLocation) {
      setError('必須項目をすべて入力してください');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        studentId,
        rideDate,
        rideTime,
        rideType,
        pickupLocation: trimmedLocation,
        note: note.trim(),
        reservedBy: isTeacher ? 'teacher' : 'parent',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予約できませんでした');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === studentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ride-modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div>
            <h3 id="add-ride-modal-title" className="font-bold text-slate-800 text-lg">送迎予定の登録</h3>
            <p className="text-xs text-slate-500">
              {isTeacher ? '先生側からのスケジュール追加' : '生徒・保護者からの送迎予約'}
            </p>
          </div>
          <button
            type="button"
            aria-label="閉じる"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          {/* 生徒選択 */}
          <div>
            <label htmlFor="ride-student" className="block text-xs font-semibold text-slate-600 mb-1">生徒</label>
            <select
              id="ride-student"
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              disabled={!isTeacher && Boolean(initialStudentId)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}（残チケット: {student.ticketBalance}枚）
                </option>
              ))}
            </select>
            {selectedStudent && selectedStudent.ticketBalance <= 2 && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                ⚠️ 現在のチケット残数が残り {selectedStudent.ticketBalance} 枚です。
              </p>
            )}
          </div>

          {/* 日付＆時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ride-date" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                送迎日
              </label>
              <input
                id="ride-date"
                type="date"
                value={rideDate}
                onChange={(e) => setRideDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label htmlFor="ride-time" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {rideType === 'dropoff' ? 'お送り時間' : 'お迎え時間'}
              </label>
              <input
                id="ride-time"
                type="time"
                value={rideTime}
                onChange={(e) => setRideTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                required
              />
            </div>
          </div>

          {/* 送迎タイプ */}
          <fieldset>
            <legend className="block text-xs font-semibold text-slate-600 mb-1.5 flex w-full items-center justify-between">
              <span>送迎区分（フレックス予約）</span>
              <span className="text-[11px] text-emerald-600 font-medium">片道1回＝チケット1枚</span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs cursor-pointer transition-all focus-within:ring-2 focus-within:ring-emerald-700 focus-within:ring-offset-2 ${
                  rideType === 'pickup'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="rideType"
                  value="pickup"
                  checked={rideType === 'pickup'}
                  onChange={() => setRideType('pickup')}
                  className="sr-only"
                />
                <span>行き（お迎え）</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">チケット1枚</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs cursor-pointer transition-all focus-within:ring-2 focus-within:ring-emerald-700 focus-within:ring-offset-2 ${
                  rideType === 'dropoff'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="rideType"
                  value="dropoff"
                  checked={rideType === 'dropoff'}
                  onChange={() => setRideType('dropoff')}
                  className="sr-only"
                />
                <span>帰り（送り）</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">チケット1枚</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs cursor-pointer transition-all focus-within:ring-2 focus-within:ring-emerald-700 focus-within:ring-offset-2 ${
                  rideType === 'roundtrip'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="rideType"
                  value="roundtrip"
                  checked={rideType === 'roundtrip'}
                  onChange={() => setRideType('roundtrip')}
                  className="sr-only"
                />
                <span>往復</span>
                <span className="text-[10px] text-amber-600 font-semibold mt-0.5">チケット2枚</span>
              </label>
            </div>
            <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-600">
              予約時にはチケットは減りません。先生・管理者の「完了」操作で、片道1枚・往復2枚を消費します。
            </p>
          </fieldset>

          {/* 送迎場所 */}
          <div>
            <label htmlFor="ride-location" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              送迎場所・住所
            </label>
            <input
              id="ride-location"
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="例: 東京都世田谷区... または エントランス前"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm"
              required
            />
          </div>

          {/* 連絡メモ */}
          <div>
            <label htmlFor="ride-note" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              連絡事項・メモ（任意）
            </label>
            <textarea
              id="ride-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 今日は雨のため傘を持って行きます / 到着5分前に連絡ください"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm"
            />
          </div>

          {/* 送信ボタン */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? '登録中...' : '送迎予定を登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
