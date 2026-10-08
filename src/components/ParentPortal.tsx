import React, { useState } from 'react';
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
  students: Student[];
  rides: RideReservation[];
  onOpenAddRide: (studentId: string) => void;
  onCancelRide: (rideId: string) => Promise<void>;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  rides,
  onOpenAddRide,
  onCancelRide,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );

  const student = students.find((s) => s.id === selectedStudentId);

  // この生徒の送迎データ
  const studentRides = rides.filter((r) => r.studentId === selectedStudentId);
  const upcomingRides = studentRides.filter((r) => r.status === 'scheduled');
  const pastRides = studentRides.filter((r) => r.status !== 'scheduled');

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

  if (students.length === 0) {
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
        <label className="text-xs font-bold text-slate-500 whitespace-nowrap">表示する生徒:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="bg-slate-50 border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full"
        >
          {students.map((s) => (
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

              {student.ticketBalance <= 2 ? (
                <div className="mt-4 bg-amber-500/25 border border-amber-300/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-200 block text-sm">
                      ⚠️ チケットが無くなりそうです（残り{student.ticketBalance}回）
                    </span>
                    <span>Mauro・Brenda に連絡してね！ 次回のチケットをご用意します。</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-emerald-100/90 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>片道1回につきチケット1枚消費です。当日の送迎完了後に引かれるため、キャンセル時も安心です。</span>
                </p>
              )}
            </div>
          </div>

          {/* 予約アクションボタン */}
          <button
            onClick={() => onOpenAddRide(student.id)}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-base transition-transform active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            送迎の予約を申し込む（前日・当日可）
          </button>

          {/* 予約中の送迎（キャンセル可能） */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                現在予約中の送迎
              </h4>
              <span className="text-xs text-slate-400">{upcomingRides.length} 件</span>
            </div>

            {upcomingRides.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                現在予約されている送迎はありません。
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRides.map((ride) => {
                  const typeInfo = getRideTypeLabel(ride.rideType);
                  return (
                    <div
                      key={ride.id}
                      className="border border-slate-100 bg-slate-50/70 rounded-xl p-3.5 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-sm">
                              {ride.rideDate} {ride.rideTime}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                              {typeInfo.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ride.pickupLocation}</span>
                          </div>
                          {ride.note && (
                            <p className="text-[11px] text-slate-500 mt-1 pl-4 border-l-2 border-slate-300">
                              {ride.note}
                            </p>
                          )}
                        </div>

                        {/* キャンセルボタン */}
                        <button
                          onClick={() => {
                            if (window.confirm('この送迎予約をキャンセルしますか？（先生のカレンダーからも自動で削除されます）')) {
                              onCancelRide(ride.id);
                            }
                          }}
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> 送迎済 (-1回)
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
            <p>緊急連絡先: {student.phone}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              ※ 送迎場所の変更や連絡先変更は先生へ直接お知らせください。
            </p>
          </div>
        </>
      )}
    </div>
  );
};
