import React, { useEffect, useRef, useState } from 'react';
import type { Student, RideReservation, RideType } from '../types';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ParentPortalProps {
  isDemo: boolean;
  students: Student[];
  rides: RideReservation[];
  onOpenAddRide: (studentId: string) => void;
  onCancelRide: (rideId: string) => Promise<void>;
}

// @trace CODE-03 REQ-03
// @trace CODE-04 REQ-04
// @trace CODE-21 REQ-21
export const ParentPortal: React.FC<ParentPortalProps> = ({
  isDemo,
  students,
  rides,
  onOpenAddRide,
  onCancelRide,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeRides = Array.isArray(rides) ? rides : [];

  const [preferredStudentId, setPreferredStudentId] = useState('');
  const student = safeStudents.find((s) => s.id === preferredStudentId) ?? safeStudents[0];

  // この生徒の送迎データ
  const studentRides = safeRides.filter((r) => r.studentId === student?.id);
  const upcomingRides = studentRides
    .filter((r) => r.status === 'scheduled')
    .sort((a, b) => a.rideDate.localeCompare(b.rideDate)
      || a.rideTime.localeCompare(b.rideTime)
      || a.id.localeCompare(b.id));
  const pastRides = studentRides
    .filter((r) => r.status !== 'scheduled')
    .sort((a, b) => b.rideDate.localeCompare(a.rideDate)
      || b.rideTime.localeCompare(a.rideTime)
      || b.id.localeCompare(a.id));
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const cancellationInFlight = useRef(false);
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const cancelTarget = upcomingRides.find(ride => ride.id === cancelRideId);
  const activeCancelId = cancelTarget?.id;
  useEffect(() => {
    if (!activeCancelId) return;
    const dialog = cancelDialog.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, [activeCancelId]);
  const dismissCancellation = () => {
    cancelDialog.current?.close();
    setCancelRideId(null);
  };
  const confirmCancellation = async () => {
    if (!cancelTarget || cancellationInFlight.current) return;
    cancellationInFlight.current = true;
    setCancelPending(true);
    dismissCancellation();
    try {
      await onCancelRide(cancelTarget.id);
    } finally {
      cancellationInFlight.current = false;
      setCancelPending(false);
    }
  };

  const getRideTypeLabel = (type: RideType) => {
    switch (type) {
      case 'pickup':
        return { text: 'お迎え（教室へ）', color: 'bg-blue-100 text-blue-700' };
      case 'dropoff':
        return { text: '送り（ご自宅へ）', color: 'bg-indigo-100 text-indigo-700' };
      case 'roundtrip':
        return { text: '往復送迎', color: 'bg-purple-100 text-purple-700' };
    }
  };

  if (!student) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500">登録されている生徒がいません。先生側で登録を行ってください。</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-8">
      {/* 生徒選択バー（保護者が複数の兄弟姉妹を通わせている場合もスムーズに切替可能） */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <label htmlFor="parent-portal-student" className="text-xs font-bold text-slate-500 whitespace-nowrap">表示する生徒:</label>
        <select
          id="parent-portal-student"
          value={student.id}
          onChange={(e) => setPreferredStudentId(e.target.value)}
          className="bg-slate-50 border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full"
        >
          {safeStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} さん
            </option>
          ))}
        </select>
      </div>

      {student && (
        <>
          {/* チケット残数カード */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10">
              <Ticket className="w-48 h-48" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-100 bg-emerald-500/30 px-2.5 py-1 rounded-full">
                    送迎チケット残高
                  </span>
                  <h3 className="text-lg font-bold mt-1.5">{student.name} さん</h3>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tight">{student.ticketBalance}</span>
                  <span className="text-base font-bold ml-1 text-emerald-100">回分</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-emerald-100/90 flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  <span className="block font-semibold">予約しただけでは残数は減りません。</span>
                  <span className="block">先生・管理者が「完了」にすると減ります。</span>
                  <span className="block">片道1回につきチケット1枚、往復は2枚です。</span>
                </span>
              </p>

              {student.ticketBalance <= 2 && (
                <div className="mt-4 bg-amber-500/25 border border-amber-300/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-200 block text-sm">
                      ⚠️ チケットが無くなりそうです（残り{student.ticketBalance}回）
                    </span>
                    <span>Mauro・Brenda に連絡してね！ 次回のチケットをご用意します。</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 予約アクションボタン */}
          <button
            type="button"
            onClick={() => onOpenAddRide(student.id)}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-base transition-transform active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            送迎の予約を申し込む（前日・当日可）
          </button>

          {/* 予約中の送迎（キャンセル可能） */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                現在予約中の送迎
              </h4>
              <span className="text-xs text-slate-400">{upcomingRides.length} 件</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              ※ 日時・送迎場所を変更する場合は、元の予約をキャンセルしてから新しくお申し込みください。
            </p>

            {upcomingRides.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                現在予約されている送迎はありません。
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRides.map((ride) => {
                  const typeInfo = getRideTypeLabel(ride.rideType);
                  const target = [student.name, ride.rideDate, ride.rideTime, typeInfo.text].join(' ');
                  return (
                    <div
                      key={ride.id}
                      className="border border-slate-100 bg-slate-50/70 rounded-xl p-3.5 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-800 text-sm">
                              {ride.rideDate} {ride.rideTime}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                              {typeInfo.text}
                            </span>
                          </div>
                          <div className="min-w-0 flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="min-w-0 [overflow-wrap:anywhere]">{ride.pickupLocation}</span>
                          </div>
                          {ride.note && (
                            <p className="break-words text-[11px] text-slate-500 mt-1 pl-4 border-l-2 border-slate-300">
                              {ride.note}
                            </p>
                          )}
                        </div>

                        {/* キャンセルボタン */}
                        <button
                          type="button"
                          aria-label={target + ' ' + ride.pickupLocation + ' の予約をキャンセル'}
                          disabled={cancelPending}
                          onClick={() => setCancelRideId(ride.id)}
                          className="shrink-0 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          キャンセル
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cancelTarget && (
            <dialog ref={cancelDialog} aria-labelledby="parent-cancel-heading"
              aria-describedby="parent-cancel-details parent-cancel-effect" onCancel={dismissCancellation}
              className="m-auto w-11/12 max-w-md rounded-2xl p-5 shadow-xl backdrop:bg-slate-900/50">
              <h2 id="parent-cancel-heading" className="text-lg font-bold">予約取消の確認</h2>
              <div id="parent-cancel-details" className="mt-3 space-y-1 [overflow-wrap:anywhere]">
                <p className="font-semibold">{student.name}</p>
                <p>{cancelTarget.rideDate} {cancelTarget.rideTime}・{getRideTypeLabel(cancelTarget.rideType).text}</p>
                <p>送迎先: {cancelTarget.pickupLocation}</p>
                {cancelTarget.note && <p>備考: {cancelTarget.note}</p>}
              </div>
              <p id="parent-cancel-effect" className="mt-3 text-sm">{isDemo ? 'このブラウザ内のデモ予約を取り消します。教室の予定は変わりません。' : '台帳の予約を取消にし、対応するカレンダーの予定を削除します。'}</p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" className="rounded-lg border px-3 py-2" onClick={dismissCancellation}>戻る</button>
                <button type="button" className="rounded-lg bg-rose-700 px-3 py-2 font-bold text-white" onClick={confirmCancellation}>取消を確定</button>
              </div>
            </dialog>
          )}

          {/* これまでの利用履歴 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              過去の利用履歴
            </h4>

            {pastRides.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">過去の利用履歴はありません</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {pastRides.map((ride) => (
                  <div key={ride.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {ride.rideDate} {ride.rideTime}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {ride.rideType === 'pickup' ? 'お迎え' : ride.rideType === 'dropoff' ? '送り' : '往復'}
                      </span>
                    </div>
                    <div>
                      {ride.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 送迎済 (-{ride.rideType === 'roundtrip' ? 2 : 1}回)
                        </span>
                      )}
                      {ride.status === 'cancelled' && (
                        <span className="text-slate-400 font-medium">キャンセル済</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ご登録情報とお問い合わせ */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">登録済みのご住所・連絡先</p>
            <p>送迎先: {student.address}</p>
            <p>緊急連絡先: {student.phone || '未登録'}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              ※ 送迎場所の変更や連絡先変更は先生へ直接お知らせください。
            </p>
          </div>
        </>
      )}
    </div>
  );
};
