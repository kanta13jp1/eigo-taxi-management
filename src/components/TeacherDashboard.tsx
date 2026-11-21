import React, { useEffect, useRef, useState } from 'react';
import type { Student, RideReservation, RideType } from '../types';
import { getLocalDateString } from '../services/api';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Ticket,
  UserPlus,
  Phone,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface TeacherDashboardProps {
  isDemo: boolean;
  students: Student[];
  rides: RideReservation[];
  onCompleteRide: (rideId: string) => Promise<void>;
  onCancelRide: (rideId: string) => Promise<void>;
  onOpenAddRide: (studentId?: string) => void;
  onOpenAddTicket: (studentId?: string) => void;
  onOpenAddStudent: () => void;
  reviewOnly?: boolean;
}

// @trace CODE-12 REQ-12
export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  isDemo,
  students,
  rides,
  onCompleteRide,
  onCancelRide,
  onOpenAddRide,
  onOpenAddTicket,
  onOpenAddStudent,
  reviewOnly = false,
}) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeRides = Array.isArray(rides) ? rides : [];

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [completionError, setCompletionError] = useState('');
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const cancelTarget = safeRides.find(ride => ride.id === cancelRideId && ride.status === 'scheduled');
  const activeCancelId = cancelTarget?.id;
  useEffect(() => {
    if (!activeCancelId) return;
    const dialog = cancelDialog.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, [activeCancelId]);
  const dismissCancellation = () => {
    cancelDialog.current?.close();
    setCancelRideId(null);
  };
  const inFlightCompletions = useRef(new Set<string>());
  const [pendingRideIds, setPendingRideIds] = useState<ReadonlySet<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'today' | 'allRides' | 'students'>(() => reviewOnly ? 'allRides' : 'today');

  // 予約日と同じ端末の暦日を使用し、画面を開いたままでも翌日に切り替える。
  const [todayStr, setTodayStr] = useState(() => getLocalDateString());
  useEffect(() => {
    let timer: number;
    const syncDate = () => {
      window.clearTimeout(timer);
      const now = new Date();
      setTodayStr(getLocalDateString(now));
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = window.setTimeout(syncDate, midnight.getTime() - now.getTime());
    };
    syncDate();
    document.addEventListener('visibilitychange', syncDate);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', syncDate);
    };
  }, []);
  const todayRides = safeRides.filter((r) => r.rideDate === todayStr);
  const todayPendingRides = todayRides.filter((r) => r.status === 'scheduled');
  const todayCompletedRides = todayRides.filter((r) => r.status === 'completed');

  // チケット残少・ゼロの生徒
  const lowTicketStudents = safeStudents.filter((s) => s.ticketBalance <= 2);

  // フィルタ済み送迎
  const filteredRides = safeRides.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const getRideTypeLabel = (type: RideType) => {
    switch (type) {
      case 'pickup':
        return { text: 'お迎え', color: 'bg-blue-100 text-blue-700 border-blue-200', consume: 1 };
      case 'dropoff':
        return { text: '送り', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', consume: 1 };
      case 'roundtrip':
        return { text: '往復', color: 'bg-purple-100 text-purple-700 border-purple-200', consume: 2 };
    }
  };

  const completionLabel = (ride: RideReservation) => {
    const { text, consume } = getRideTypeLabel(ride.rideType);
    const action = pendingRideIds.has(ride.id) ? '完了処理中' : `送迎完了（${consume}回消費）`;
    return `${action} ${ride.studentName} ${ride.rideDate} ${ride.rideTime} ${text}`;
  };

  const completeRide = async (ride: RideReservation) => {
    const inFlight = inFlightCompletions.current;
    if (inFlight.has(ride.id)) return;
    inFlight.add(ride.id);
    setPendingRideIds(new Set(inFlight));
    setCompletionError('');
    try {
      await onCompleteRide(ride.id);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '完了処理できませんでした';
      setCompletionError(`${ride.studentName}（${ride.rideDate} ${ride.rideTime}）: ${reason}`);
    } finally {
      inFlight.delete(ride.id);
      setPendingRideIds(new Set(inFlight));
    }
  };

  return (
    <div className="space-y-6">
      {completionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{completionError}</p>}
      {/* 管理者バナー */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{reviewOnly ? '検証専用画面' : '管理者画面'}</span>
          <span>{reviewOnly ? '指定した架空生徒の送迎・チケットだけを確認できます' : 'Mauro・Brenda 先生用管理ダッシュボード'}</span>
        </div>
        <p className="text-xs text-emerald-700 font-medium">
          ※完全予約制対応：送迎完了時に「送迎完了」を押すと片道1枚（往復は2枚）が自動消化されます
        </p>
      </div>

      {/* 上部サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">本日の送迎</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">
                {todayPendingRides.length} <span className="text-sm font-normal text-slate-500">件 予定</span>
              </span>
              {todayCompletedRides.length > 0 && (
                <span className="text-xs text-emerald-600 font-medium">({todayCompletedRides.length}件 完了)</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">チケット残り2枚以下</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-black ${
                  lowTicketStudents.length > 0 ? 'text-amber-600' : 'text-slate-800'
                }`}
              >
                {lowTicketStudents.length} <span className="text-sm font-normal text-slate-500">名</span>
              </span>
            </div>
          </div>
          <div
            className={`p-3 rounded-xl ${
              lowTicketStudents.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">登録生徒数</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">
                {students.length} <span className="text-sm font-normal text-slate-500">名</span>
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* サブナビゲーション & アクションボタン */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            aria-pressed={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            本日の送迎 ({todayRides.length})
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'allRides'}
            onClick={() => setActiveTab('allRides')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'allRides' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            送迎スケジュール一覧 ({rides.length})
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            生徒・チケット管理 ({students.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddRide()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            送迎予定を追加
          </button>
          <button
            type="button"
            onClick={() => onOpenAddTicket()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Ticket className="w-4 h-4 text-emerald-600" />
            チケット追加
          </button>
        </div>
      </div>

      {/* タブ1: 本日の送迎 */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              本日（{todayStr}）の送迎予定
            </h2>
            <span className="text-xs text-slate-500">{isDemo ? 'デモの予定はこのブラウザ内にだけ保存されます' : 'Googleカレンダー・シートと自動同期'}</span>
          </div>

          {todayRides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">本日の送迎予定はありません</p>
              <p className="text-xs text-slate-400 mt-1">
                右上の「送迎予定を追加」ボタンから急な送迎もすぐに追加できます。
              </p>
              <button
                type="button"
                onClick={() => onOpenAddRide()}
                className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                送迎予定を登録する
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayRides.map((ride) => {
                const typeInfo = getRideTypeLabel(ride.rideType);
                const student = students.find((s) => s.id === ride.studentId);
                const isScheduled = ride.status === 'scheduled';
                const isCompleted = ride.status === 'completed';

                return (
                  <div
                    key={ride.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                      isCompleted ? 'border-slate-200 bg-slate-50/60 opacity-80' : 'border-emerald-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800 flex items-center gap-1">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          {ride.rideTime}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                          {typeInfo.text}
                        </span>
                      </div>
                      <div>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 送迎完了 (-{typeInfo.consume}回消化済)
                          </span>
                        )}
                        {ride.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> キャンセル
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-bold text-slate-800 text-base">{ride.studentName}</h4>
                      {student && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          保護者: {student.parentName}（残チケット:{' '}
                          <span
                            className={`font-bold ${
                              student.ticketBalance <= 2 ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {student.ticketBalance}枚
                          </span>
                          ）
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-600 mb-3 border border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-all">{ride.pickupLocation}</span>
                      </div>
                      {ride.note && (
                        <div className="text-slate-500 border-t border-slate-200/60 pt-1 text-[11px]">
                          💬 メモ: {ride.note}
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          ride.pickupLocation
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        地図アプリ
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {isScheduled && (
                        <button
                          type="button"
                          onClick={() => completeRide(ride)}
                          disabled={pendingRideIds.has(ride.id)}
                          aria-label={completionLabel(ride)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {pendingRideIds.has(ride.id) ? '完了処理中' : `送迎完了（${typeInfo.consume}回消費）`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* タブ2: 送迎スケジュール全件一覧 */}
      {activeTab === 'allRides' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-800">全送迎スケジュール・履歴</h2>

            {/* ステータスフィルター */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="all">すべてのステータス</option>
                <option value="scheduled">予定中のみ</option>
                <option value="completed">完了済みのみ</option>
                <option value="cancelled">キャンセルのみ</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">日時</th>
                    <th className="py-3 px-4">生徒名</th>
                    <th className="py-3 px-4">区分</th>
                    <th className="py-3 px-4">送迎場所</th>
                    <th className="py-3 px-4">予約者</th>
                    <th className="py-3 px-4">ステータス</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRides.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        該当する送迎データはありません
                      </td>
                    </tr>
                  ) : (
                    filteredRides.map((ride) => {
                      const typeInfo = getRideTypeLabel(ride.rideType);
                      return (
                        <tr key={ride.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {ride.rideDate} {ride.rideTime}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {ride.studentName}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                              {typeInfo.text}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{ride.pickupLocation}</td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {ride.reservedBy === 'parent' ? '保護者予約' : '先生登録'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {ride.status === 'scheduled' && (
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                予定中
                              </span>
                            )}
                            {ride.status === 'completed' && (
                              <div className="inline-flex flex-col gap-0.5">
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px] w-fit">
                                  完了済 (-{typeInfo.consume}回)
                                </span>
                                {ride.completedAt && (
                                  <span className="text-[10px] text-slate-400">{ride.completedAt}</span>
                                )}
                              </div>
                            )}
                            {ride.status === 'cancelled' && (
                              <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px]">
                                取消
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {ride.status === 'scheduled' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => completeRide(ride)}
                                  disabled={pendingRideIds.has(ride.id)}
                                  aria-label={completionLabel(ride)}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-lg"
                                >
                                  {pendingRideIds.has(ride.id) ? '完了処理中' : '完了'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCancelRideId(ride.id)}
                                  disabled={pendingRideIds.has(ride.id)}
                                  aria-label={`${ride.studentName} ${ride.rideDate} ${ride.rideTime} ${typeInfo.text} の予約を取消`}
                                  className="text-xs text-rose-600 hover:bg-rose-50 py-1 px-2 rounded-lg font-bold transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <dialog ref={cancelDialog} aria-labelledby="admin-cancel-heading"
          onCancel={() => setCancelRideId(null)}
          className="m-auto w-11/12 max-w-md rounded-2xl p-5 shadow-xl backdrop:bg-slate-900/50">
          <h2 id="admin-cancel-heading" className="text-lg font-bold">予約取消の確認</h2>
          <p className="mt-3 font-semibold">{cancelTarget.studentName}</p>
          <p>{cancelTarget.rideDate} {cancelTarget.rideTime}・{getRideTypeLabel(cancelTarget.rideType).text}</p>
          <p className="mt-3 text-sm">{isDemo ? 'このブラウザ内のデモ予約を取り消します。教室の予定は変わりません。' : '台帳の予約を取消にし、対応するカレンダーの予定を削除します。'}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="rounded-lg border px-3 py-2" onClick={dismissCancellation}>戻る</button>
            <button type="button" className="rounded-lg bg-rose-700 px-3 py-2 font-bold text-white" onClick={() => {
              dismissCancellation();
              void onCancelRide(cancelTarget.id);
            }}>取消を確定</button>
          </div>
        </dialog>
      )}

      {/* タブ3: 生徒台帳＆チケット管理 */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">生徒台帳・チケット残数状況</h2>
            {!reviewOnly && <button
              type="button"
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              新規生徒を登録
            </button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => {
              const isZero = student.ticketBalance === 0;
              // Same threshold as the "チケット残り2枚以下" summary card and the booking form.
              const isLow = student.ticketBalance > 0 && student.ticketBalance <= 2;

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{student.id}</span>
                        <h4 className="font-bold text-slate-900 text-base">{student.name}</h4>
                        <p className="text-xs text-slate-500">保護者: {student.parentName || '未設定'}</p>
                      </div>

                      {/* チケット残数バッジ */}
                      <div className="text-right">
                        <span
                          className={`text-xl font-black px-2.5 py-1 rounded-xl inline-block ${
                            isZero
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {student.ticketBalance}
                          <span className="text-xs font-normal ml-0.5">回</span>
                        </span>
                        {isZero && <p className="text-[10px] font-bold text-rose-600 mt-0.5">チケット切れ</p>}
                        {isLow && <p className="text-[10px] font-bold text-amber-600 mt-0.5">残り{student.ticketBalance}回</p>}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 mb-3">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.phone ? (
                          <a href={`tel:${student.phone}`} className="hover:underline">
                            {student.phone}
                          </a>
                        ) : (
                          <span>電話番号未登録</span>
                        )}
                      </div>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{student.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAddTicket(student.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center justify-center gap-1 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      チケット追加
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAddRide(student.id)}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                    >
                      予約登録
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
