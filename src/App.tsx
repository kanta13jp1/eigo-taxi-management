import { useState, useEffect } from 'react';
import type { Student, RideReservation, RideType } from './types';
import { ApiService } from './services/api';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentPortal } from './components/ParentPortal';
import { GoogleSettings } from './components/GoogleSettings';
import { AddRideModal } from './components/AddRideModal';
import { AddTicketModal } from './components/AddTicketModal';
import { AddStudentModal } from './components/AddStudentModal';

export function App() {
  const [currentTab, setCurrentTab] = useState<'teacher' | 'parent' | 'settings'>('teacher');
  const [students, setStudents] = useState<Student[]>([]);
  const [rides, setRides] = useState<RideReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // モーダル管理
  const [isAddRideOpen, setIsAddRideOpen] = useState(false);
  const [addRideStudentId, setAddRideStudentId] = useState<string | undefined>();
  const [addRideIsTeacher, setAddRideIsTeacher] = useState(true);

  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [addTicketStudentId, setAddTicketStudentId] = useState<string | undefined>();

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // トースト通知
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    try {
      const [studentsData, ridesData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getRides(),
      ]);
      setStudents(studentsData);
      setRides(ridesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 送迎予約ハンドラ
  const handleCreateRide = async (data: {
    studentId: string;
    rideDate: string;
    rideTime: string;
    rideType: RideType;
    pickupLocation: string;
    note?: string;
    reservedBy: 'parent' | 'teacher';
  }) => {
    const newRide = await ApiService.createReservation(data);
    setRides((prev) => [newRide, ...prev]);
    showToast(`✅ ${newRide.studentName} さんの送迎予約（${newRide.rideDate} ${newRide.rideTime}）を登録しました`);
  };

  // 送迎キャンセルハンドラ
  const handleCancelRide = async (rideId: string) => {
    const success = await ApiService.cancelReservation(rideId);
    if (success) {
      setRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, status: 'cancelled' } : r))
      );
      showToast('ℹ️ 送迎予約をキャンセルしました（Googleカレンダーも更新されました）');
    }
  };

  // 送迎完了＆チケット消化ハンドラ
  const handleCompleteRide = async (rideId: string) => {
    const res = await ApiService.completeRide(rideId);
    if (res.success) {
      await loadData();
      showToast(`🎉 送迎が完了しました！チケットを1回分消化しました（残数: ${res.remainingBalance}回）`);
    }
  };

  // チケット追加ハンドラ
  const handleAddTickets = async (params: {
    studentId: string;
    ticketCount: number;
    amount: number;
    note?: string;
  }) => {
    const res = await ApiService.addTickets(params);
    if (res.success) {
      await loadData();
      showToast(`🎟️ チケットを+${params.ticketCount}回分追加しました！（新残高: ${res.newBalance}回）`);
    }
  };

  // 新規生徒追加ハンドラ
  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent = await ApiService.createStudent(studentData);
    setStudents((prev) => [...prev, newStudent]);
    showToast(`👤 新規生徒「${newStudent.name}」さんを登録しました`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {currentTab === 'teacher' && (
              <TeacherDashboard
                students={students}
                rides={rides}
                onCompleteRide={handleCompleteRide}
                onCancelRide={handleCancelRide}
                onOpenAddRide={() => {
                  setAddRideStudentId(undefined);
                  setAddRideIsTeacher(true);
                  setIsAddRideOpen(true);
                }}
                onOpenAddTicket={(studentId) => {
                  setAddTicketStudentId(studentId);
                  setIsAddTicketOpen(true);
                }}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
              />
            )}

            {currentTab === 'parent' && (
              <ParentPortal
                students={students}
                rides={rides}
                onOpenAddRide={(studentId) => {
                  setAddRideStudentId(studentId);
                  setAddRideIsTeacher(false);
                  setIsAddRideOpen(true);
                }}
                onCancelRide={handleCancelRide}
              />
            )}

            {currentTab === 'settings' && <GoogleSettings />}
          </>
        )}
      </main>

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* モーダル群 */}
      <AddRideModal
        isOpen={isAddRideOpen}
        onClose={() => setIsAddRideOpen(false)}
        students={students}
        initialStudentId={addRideStudentId}
        isTeacher={addRideIsTeacher}
        onSubmit={handleCreateRide}
      />

      <AddTicketModal
        isOpen={isAddTicketOpen}
        onClose={() => setIsAddTicketOpen(false)}
        students={students}
        initialStudentId={addTicketStudentId}
        onSubmit={handleAddTickets}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
}

export default App;
