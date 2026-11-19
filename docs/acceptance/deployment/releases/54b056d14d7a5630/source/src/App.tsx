import { useState, useEffect, useCallback } from 'react';
import type { Student, RideReservation, RideType } from './types';
import { ApiService } from './services/api';
import type { AppSession } from './services/api';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentPortal } from './components/ParentPortal';
import { GoogleSettings } from './components/GoogleSettings';
import { AddRideModal } from './components/AddRideModal';
import { AddTicketModal } from './components/AddTicketModal';
import { AddStudentModal } from './components/AddStudentModal';
import { TermsModal } from './components/TermsModal';

export function App() {
  const [session, setSession] = useState<AppSession | null>(ApiService.getSession);
  const [errorMessage, setErrorMessage] = useState('');
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
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy' | 'disclaimer'>('terms');

  const openTerms = (tab: 'terms' | 'privacy' | 'disclaimer') => {
    setTermsTab(tab);
    setIsTermsOpen(true);
  };

  // トースト通知
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const ended = () => {
      setSession(null); setStudents([]); setRides([]); setToastMessage(null);
      setIsAddRideOpen(false); setIsAddTicketOpen(false); setIsAddStudentOpen(false);
    };
    window.addEventListener('eigo-taxi-session-ended', ended);
    return () => window.removeEventListener('eigo-taxi-session-ended', ended);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async () => {
    const expectedSession = JSON.stringify(ApiService.getSession());
    try {
      const [studentsData, ridesData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getRides(),
      ]);
      if (JSON.stringify(ApiService.getSession()) === expectedSession) {
        setStudents(studentsData);
        setRides(ridesData);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'データを取得できませんでした');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([ApiService.getStudents(), ApiService.getRides()])
      .then(([studentsData, ridesData]) => {
        if (active) {
          setStudents(studentsData);
          setRides(ridesData);
        }
      })
      .catch((err) => {
        if (active) setErrorMessage(err instanceof Error ? err.message : 'データを取得できませんでした');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [session]);

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
    try {
      await ApiService.cancelReservation(rideId);
      await loadData();
      showToast('送迎予約のキャンセルが完了しました');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'キャンセルできませんでした');
    }
  };

  // 送迎完了＆チケット消化ハンドラ
  const handleCompleteRide = async (rideId: string) => {
    try {
    const res = await ApiService.completeRide(rideId);
    if (res.success) {
      await loadData();
      const consumed = res.consumedTickets ?? 1;
      showToast(`🎉 送迎が完了しました！チケットを${consumed}回分消化しました（残数: ${res.remainingBalance}回）`);
    } else setErrorMessage('この予約は完了処理できません');
    } catch (err) { setErrorMessage(err instanceof Error ? err.message : '完了処理できませんでした'); }
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

  if (!session) return <LoginScreen onLogin={next => {
    setIsLoading(true); setErrorMessage('');
    setCurrentTab(next.user.role === 'admin' ? 'teacher' : 'parent');
    setSession(next);
  }} />;
  const isAdmin = session.user.role === 'admin';
  const activeTab = isAdmin ? currentTab : 'parent';
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <Navbar currentTab={activeTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} />
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 pt-3 text-xs">
        <p>{session.mode === 'demo' ? 'デモ環境・架空データ（Google連携なし）' : '教室の連携環境'} / {session.user.name}</p>
        <button className="rounded-lg border bg-white px-3 py-2" onClick={()=>{
          ApiService.logout(); setStudents([]); setRides([]); setErrorMessage(''); setToastMessage(null); setSession(null);
          setIsAddRideOpen(false); setIsAddTicketOpen(false); setIsAddStudentOpen(false);
        }}>ログアウト</button>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {errorMessage && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{errorMessage}</p>}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'teacher' && isAdmin && (
              <TeacherDashboard
                students={students}
                rides={rides}
                onCompleteRide={handleCompleteRide}
                onCancelRide={handleCancelRide}
                onOpenAddRide={(studentId) => {
                  setAddRideStudentId(studentId);
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

            {activeTab === 'parent' && (
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

            {activeTab === 'settings' && isAdmin && <GoogleSettings />}
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-12 py-8 border-t border-slate-200/80 bg-white/60 backdrop-blur-sm text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600">
            © 2026 Mauro & Brenda English School. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => openTerms('terms')}
              className="text-slate-500 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline"
            >
              利用規約
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => openTerms('privacy')}
              className="text-slate-500 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline"
            >
              個人情報の取扱い
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => openTerms('disclaimer')}
              className="text-slate-500 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline"
            >
              免責事項
            </button>
          </div>
        </div>
      </footer>

      {/* トースト通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* モーダル群 */}
      <AddRideModal
        key={`ride-${isAddRideOpen}-${addRideStudentId || 'default'}`}
        isOpen={isAddRideOpen}
        onClose={() => setIsAddRideOpen(false)}
        students={students}
        initialStudentId={addRideStudentId}
        isTeacher={addRideIsTeacher}
        onSubmit={handleCreateRide}
      />

      <AddTicketModal
        key={`ticket-${isAddTicketOpen}-${addTicketStudentId || 'default'}`}
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

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        initialTab={termsTab}
      />
    </div>
  );
}

export default App;
