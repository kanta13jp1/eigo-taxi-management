import React, { useEffect, useRef, useState } from 'react';
import type { Student, RideReservation, RideType } from '../types';
import { useModalDialog } from '../hooks/useModalDialog';
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
  const [cancelError, setCancelError] = useState('');
  const mountedRef = useRef(true);
  const cancellationInFlight = useRef(false);
  const cancelDialogRef = useRef<HTMLDivElement>(null);
  const cancelBackButtonRef = useRef<HTMLButtonElement>(null);
  const cancelTarget = upcomingRides.find(ride => ride.id === cancelRideId);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (cancelRideId && !cancelTarget && !cancellationInFlight.current) {
      setCancelRideId(null);
      setCancelError('');
    }
  }, [cancelRideId, cancelTarget, cancelPending]);
  const openCancelDialog = (rideId: string) => {
    if (cancellationInFlight.current) return;
    setCancelError('');
    setCancelRideId(rideId);
  };
  const dismissCancellation = () => {
    if (cancellationInFlight.current) return;
    setCancelError('');
    setCancelRideId(null);
  };
  useModalDialog({
    isOpen: Boolean(cancelTarget),
    onClose: dismissCancellation,
    isDismissDisabled: cancelPending,
    dialogRef: cancelDialogRef,
    initialFocusRef: cancelBackButtonRef,
  });
  const confirmCancellation = async () => {
    if (!cancelTarget || cancellationInFlight.current) return;
    const targetId = cancelTarget.id;
    cancellationInFlight.current = true;
    setCancelPending(true);
    setCancelError('');
    try {
      await onCancelRide(targetId);
      if (mountedRef.current) {
        setCancelRideId(null);
      }
    } catch (error) {
      if (mountedRef.current) {
        setCancelError(error instanceof Error ? error.message : 'キャンセルできませんでした');
      }
    } finally {
      cancellationInFlight.current = false;
      if (mountedRef.current) {
        setCancelPending(false);
      }
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
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <label htmlFor="parent-portal-student" className="text-xs font-bold text-slate-500 whitespace-nowrap">表示する生徒:</label>
        <select
          id="parent-portal-student"
          value={student.id}
          onChange={(e) => {
            setPreferredStudentId(e.target.value);
            if (!cancellationInFlight.current) {
              setCancelRideId(null);
              setCancelError('');
            }
          }}
          className="bg-slate-50 border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
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
          <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10">
              <Ticket aria-hidden="true" className="w-48 h-48" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white bg-emerald-950/35 px-2.5 py-1 rounded-full">
                    送迎チケット残高
                  </span>
                  <h2 className="text-lg font-bold mt-1.5">{student.name} さん</h2>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black tracking-tight">{student.ticketBalance}</span>
                  <span className="text-base font-bold ml-1 text-emerald-50">回分</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-emerald-50 flex items-start gap-1.5">
                <Sparkles aria-hidden="true" className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  <span className="block font-semibold">予約しただけでは残数は減りません。</span>
                  <span className="block">先生・管理者が「完了」にすると減ります。</span>
                  <span className="block">片道1回につきチケット1枚、往復は2枚です。</span>
                </span>
              </p>

              {student.ticketBalance <= 2 && (
                <div role="status" className="mt-4 bg-amber-950/45 border border-amber-300/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-50">
                  <AlertCircle aria-hidden="true" className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-100 block text-sm">
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
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-base transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <PlusCircle aria-hidden="true" className="w-5 h-5 text-emerald-400" />
            送迎の予約を申し込む（前日・当日可）
          </button>

          {/* 予約中の送迎（キャンセル可能） */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar aria-hidden="true" className="w-4 h-4 text-emerald-600" />
                現在予約中の送迎
              </h3>
              <span className="text-xs text-slate-600">{upcomingRides.length} 件</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              ※ 日時・送迎場所を変更する場合は、元の予約をキャンセルしてから新しくお申し込みください。
            </p>

            {upcomingRides.length === 0 ? (
              <div className="text-center py-6 text-slate-600 text-xs">
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
                            <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="min-w-0 [overflow-wrap:anywhere]">{ride.pickupLocation}</span>
                          </div>
                          {ride.note && (
                            <p className="break-words text-[11px] text-slate-600 mt-1 pl-4 border-l-2 border-slate-300">
                              {ride.note}
                            </p>
                          )}
                        </div>

                        {/* キャンセルボタン */}
                        <button
                          type="button"
                          aria-label={target + ' ' + ride.pickupLocation + ' の予約をキャンセル'}
                          aria-busy={cancelPending && cancelRideId === ride.id}
                          disabled={cancelPending}
                          onClick={() => openCancelDialog(ride.id)}
                          className="shrink-0 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 font-bold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <XCircle aria-hidden="true" className="w-3.5 h-3.5" />
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
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget && !cancelPending) dismissCancellation(); }}
            >
              <div
                ref={cancelDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="parent-cancel-heading"
                aria-describedby="parent-cancel-details parent-cancel-effect"
                tabIndex={-1}
                className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white text-slate-900 p-5 shadow-xl"
              >
                <h2 id="parent-cancel-heading" className="text-lg font-bold">予約取消の確認</h2>
                <div id="parent-cancel-details" className="mt-3 space-y-1 [overflow-wrap:anywhere]">
                  <p className="font-semibold">{student.name}</p>
                  <p>{cancelTarget.rideDate} {cancelTarget.rideTime}・{getRideTypeLabel(cancelTarget.rideType).text}</p>
                  <p>送迎先: {cancelTarget.pickupLocation}</p>
                  {cancelTarget.note && <p>備考: {cancelTarget.note}</p>}
                </div>
                <p id="parent-cancel-effect" className="mt-3 text-sm text-slate-700">{isDemo ? 'このブラウザ内のデモ予約を取り消します。教室の予定は変わりません。' : '台帳の予約を取消にし、対応するカレンダーの予定を削除します。'}</p>
                {cancelError && (
                  <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-800">{cancelError}</p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button ref={cancelBackButtonRef} type="button" disabled={cancelPending} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={dismissCancellation}>戻る</button>
                  <button type="button" aria-busy={cancelPending} disabled={cancelPending} className="rounded-lg bg-rose-700 hover:bg-rose-800 px-3 py-2 text-sm font-bold text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500" onClick={() => void confirmCancellation()}>{cancelPending ? '取消処理中…' : '取消を確定'}</button>
                </div>
              </div>
            </div>
          )}

          {/* これまでの利用履歴 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock aria-hidden="true" className="w-4 h-4 text-slate-500" />
                過去の利用履歴
              </h3>
              <span className="text-xs text-slate-600">{pastRides.length} 件</span>
            </div>

            {pastRides.length === 0 ? (
              <p className="text-center py-4 text-slate-600 text-xs">過去の利用履歴はありません</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {pastRides.map((ride) => (
                  <div key={ride.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {ride.rideDate} {ride.rideTime}
                      </span>
                      <span className="text-slate-600 ml-2">
                        {ride.rideType === 'pickup' ? 'お迎え' : ride.rideType === 'dropoff' ? '送り' : '往復'}
                      </span>
                    </div>
                    <div>
                      {ride.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" /> 送迎済 (-{ride.rideType === 'roundtrip' ? 2 : 1}回)
                        </span>
                      )}
                      {ride.status === 'cancelled' && (
                        <span className="text-slate-600 font-medium">キャンセル済</span>
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
            <p className="[overflow-wrap:anywhere]">送迎先: {student.address || '未登録'}</p>
            <p>緊急連絡先: {student.phone || '未登録'}</p>
            <p className="[overflow-wrap:anywhere]">送迎メモ: {student.pickupNote || '未登録'}</p>
            <p className="text-[11px] text-slate-600 mt-1">
              ※ 送迎場所の変更や連絡先変更は先生へ直接お知らせください。
            </p>
          </div>
        </>
      )}
    </div>
  );
};
