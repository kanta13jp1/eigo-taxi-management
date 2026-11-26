import { useState, useEffect, useCallback } from 'react';
import type { Student, RideReservation, RideType } from './types';
import { ApiService, InactiveReservationError } from './services/api';
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
import { PortalInvitations } from './components/PortalInvitations';
import { AccountManagement } from './components/AccountManagement';
import { WebMcpBridge } from './components/WebMcpBridge';
import { assertPortal, parsePortal, portalHash } from './portal';

// @trace CODE-22 REQ-22
// @trace CODE-29 REQ-29
export function App() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [route, setRoute] = useState(() => parsePortal(window.location.hash));
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTab, setCurrentTab] = useState<'teacher' | 'invitations' | 'accounts' | 'settings'>('teacher');
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
  const isAdmin = session?.user.role === 'admin';
  const reviewOnly = session?.user.reviewOnly === true;
  const isFullAdmin = isAdmin && !reviewOnly;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let pageTitle: string;
    if (checkingSession) {
      pageTitle = '確認中';
    } else if (!session) {
      if (route.kind === 'admin') {
        pageTitle = '管理者専用ログイン';
      } else if (route.kind === 'parent') {
        pageTitle = '生徒・保護者専用ログイン';
      } else if (route.kind === 'invalid') {
        pageTitle = 'URL確認';
      } else {
        pageTitle = '送迎サービス入口';
      }
    } else if (!isAdmin) {
      pageTitle = '保護者ポータル';
    } else if (currentTab === 'invitations' && isFullAdmin) {
      pageTitle = 'ご家庭の個別URL・QR';
    } else if (currentTab === 'accounts' && isFullAdmin) {
      pageTitle = 'アカウント管理';
    } else if (currentTab === 'settings' && isFullAdmin) {
      pageTitle = 'Google連携';
    } else {
      pageTitle = '管理者ダッシュボード';
    }
    document.title = `${pageTitle} | Mauro & Brenda Taxi Link`;
  }, [checkingSession, session, route, currentTab, isAdmin, isFullAdmin]);

  useEffect(() => {
    const changed = () => {
      setSession(null); setStudents([]); setRides([]); setToastMessage(null); setErrorMessage('');
      setIsAddRideOpen(false); setIsAddTicketOpen(false); setIsAddStudentOpen(false); setIsTermsOpen(false);
      setRequiresLogin(false); setCheckingSession(true); setRoute(parsePortal(window.location.hash));
    };
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);

  useEffect(() => {
    let active = true;
    const stored = ApiService.getSession();
    if (route.kind === 'home' && stored) {
      window.location.replace(portalHash(stored.user));
      return;
    }
    if (!stored || route.kind === 'invalid' || route.kind === 'home') {
      Promise.resolve().then(() => { if (active) setCheckingSession(false); });
      return () => { active = false; };
    }
    ApiService.verifySession(route).then(next => {
      if (active) { setIsLoading(true); setSession(next); setCheckingSession(false); }
    }).catch(() => {
      if (active) { ApiService.logout(); setRequiresLogin(stored.mode === 'live'); setSession(null); setCheckingSession(false); }
    });
    return () => { active = false; };
  }, [route]);

  useEffect(() => {
    const ended = (event: Event) => {
      setRequiresLogin(event instanceof CustomEvent && event.detail === 'reauthenticate');
      setSession(null); setStudents([]); setRides([]); setToastMessage(null);
      setIsAddRideOpen(false); setIsAddTicketOpen(false); setIsAddStudentOpen(false); setIsTermsOpen(false);
    };
    window.addEventListener('eigo-taxi-session-ended', ended);
    return () => window.removeEventListener('eigo-taxi-session-ended', ended);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timerId = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => {
      if (typeof clearTimeout === 'function') clearTimeout(timerId);
    };
  }, [toastMessage]);

  const loadData = useCallback(async (rethrow = false) => {
    const expectedSession = JSON.stringify(ApiService.getSession());
    try {
      const [studentsData, ridesData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getRides(),
      ]);
      if (JSON.stringify(ApiService.getSession()) === expectedSession) {
        setStudents(studentsData);
        setRides(ridesData);
        setErrorMessage('');
        return ridesData;
      }
      if (rethrow) throw new Error('ログイン状態が変わりました');
    } catch (err) {
      if (JSON.stringify(ApiService.getSession()) === expectedSession) {
        setErrorMessage(err instanceof Error ? err.message : 'データを取得できませんでした');
      }
      if (rethrow) throw err instanceof Error ? err : new Error('データを取得できませんでした');
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
    setRides(prev => {
      // A delayed creation response can arrive after a cancellation or completion was read back.
      const terminalRide = prev.find(ride => ride.id === newRide.id && ride.status !== 'scheduled');
      const confirmedRide = newRide.status === 'scheduled' && terminalRide ? terminalRide : newRide;
      return [confirmedRide, ...prev.filter(ride => ride.id !== newRide.id)];
    });
    showToast(`✅ ${newRide.studentName} さんの送迎予約（${newRide.rideDate} ${newRide.rideTime}）の登録結果を確認しました`);
  };

  // 送迎キャンセルハンドラ
  const handleCancelRide = async (rideId: string, rethrow = false) => {
    const expectedSession = JSON.stringify(ApiService.getSession());
    setToastMessage(null);
    try {
      await ApiService.cancelReservation(rideId);
      if (JSON.stringify(ApiService.getSession()) !== expectedSession) {
        if (rethrow) throw new Error('ログイン状態が変わりました');
        return;
      }
      const refreshed = await loadData(rethrow);
      if (JSON.stringify(ApiService.getSession()) !== expectedSession) {
        if (rethrow) throw new Error('ログイン状態が変わりました');
        return;
      }
      if (refreshed?.find(ride => ride.id === rideId)?.status !== 'cancelled') {
        const msg = '予約の取消結果を確認できませんでした。台帳を再取得して、対象の予約の状態を確認してください。';
        setErrorMessage(msg);
        if (rethrow) throw new Error(msg);
        return;
      }
      showToast('送迎予約のキャンセルが完了しました');
    } catch (e) {
      if (JSON.stringify(ApiService.getSession()) === expectedSession) {
        setErrorMessage(e instanceof Error ? e.message : 'キャンセルできませんでした');
      }
      if (rethrow) throw e instanceof Error ? e : new Error('キャンセルできませんでした');
    }
  };

  // 送迎完了＆チケット消化ハンドラ
  const handleCompleteRide = async (rideId: string) => {
    let res;
    try {
      res = await ApiService.completeRide(rideId);
      if (!res.success) throw new InactiveReservationError('この予約は完了処理できません');
    } catch (error) {
      if (error instanceof InactiveReservationError) await loadData();
      throw error;
    }
    await loadData();
    const consumed = res.consumedTickets ?? 1;
    showToast(`🎉 送迎が完了しました！チケットを${consumed}回分消化しました（残数: ${res.remainingBalance}回）`);
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
    if (!isFullAdmin) throw new Error('生徒の登録には通常の管理者権限が必要です');
    const newStudent = await ApiService.createStudent(studentData);
    setStudents((prev) => [...prev, newStudent]);
    showToast(`👤 新規生徒「${newStudent.name}」さんを登録しました`);
  };

  const handleEnterDemoFromMcp = (role: 'admin' | 'parent') => {
    const targetHash = role === 'admin' ? '#/admin' : '#/parent';
    const nextSession = ApiService.enterDemo(role);
    if (window.location.hash !== targetHash) {
      if (typeof window.history?.replaceState === 'function') {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname || '/'}${window.location.search || ''}${targetHash}`,
        );
        setRoute(parsePortal(targetHash));
      } else {
        window.location.hash = targetHash;
      }
    }
    setCheckingSession(false);
    setRequiresLogin(false);
    setIsLoading(true);
    setErrorMessage('');
    setCurrentTab('teacher');
    setSession(nextSession);
  };

  if (checkingSession) return <main className="p-12 text-center"><p role="status">ログイン状態を確認しています…</p></main>;
  const activeTab = isAdmin ? (reviewOnly ? 'teacher' : currentTab) : 'parent';
  const visibleStudents = students.filter(student => !reviewOnly || session?.user.studentIds.includes(student.id));
  const visibleRides = rides.filter(ride => !reviewOnly || session?.user.studentIds.includes(ride.studentId));
  const webMcpBridge = (
    <WebMcpBridge
      session={session}
      route={route}
      students={visibleStudents}
      rides={visibleRides}
      currentTab={currentTab}
      isAdmin={isAdmin}
      reviewOnly={reviewOnly}
      isFullAdmin={isFullAdmin}
      onEnterDemo={handleEnterDemoFromMcp}
      onCreateRide={handleCreateRide}
      onCancelRide={(rideId) => handleCancelRide(rideId, true)}
      onCompleteRide={handleCompleteRide}
      onAddTickets={handleAddTickets}
      onAddStudent={handleAddStudent}
      onSwitchTab={setCurrentTab}
      onRefreshData={() => loadData(true)}
    />
  );
  if (!session) return <>
    {webMcpBridge}
    <LoginScreen key={JSON.stringify(route)} route={route} requiresLogin={requiresLogin} onLogin={next => {
      try { assertPortal(parsePortal(window.location.hash),next.user); }
      catch (error) { ApiService.logout(); throw error; }
      setRequiresLogin(false); setIsLoading(true); setErrorMessage('');
      setCurrentTab('teacher');
      setSession(next);
    }} />
  </>;
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {webMcpBridge}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById('main-content');
          main?.focus();
          main?.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        メインコンテンツへスキップ
      </a>
      <Navbar currentTab={reviewOnly ? 'teacher' : currentTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} reviewOnly={reviewOnly} />
      <section aria-label="ログイン状態" className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pt-3 text-xs">
        <p>{session.mode === 'demo' ? 'デモ環境・架空データ（Google連携なし）' : reviewOnly ? '検証専用・指定した架空生徒のみ' : '教室の連携環境'} / {session.user.name}</p>
        <button type="button" className="rounded-lg border bg-white px-3 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" onClick={()=>{
          ApiService.logout(); setStudents([]); setRides([]); setErrorMessage(''); setToastMessage(null); setSession(null);
          setIsAddRideOpen(false); setIsAddTicketOpen(false); setIsAddStudentOpen(false); setIsTermsOpen(false);
        }}>ログアウト</button>
      </section>

      {/* メインコンテンツ */}
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {errorMessage && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{errorMessage}</p>}
          {errorMessage ? (
            <button type="button" disabled={isLoading} aria-busy={isLoading} className="rounded-xl border px-4 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:opacity-50" onClick={() => { setIsLoading(true); void loadData(); }}>台帳を再取得する</button>
          ) : isLoading ? (
          <div role="status" className="flex items-center justify-center py-20">
            <div aria-hidden="true" className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="sr-only">台帳を読み込んでいます…</span>
          </div>
        ) : (
          <>
            {activeTab === 'teacher' && isAdmin && (
              <TeacherDashboard
                isDemo={session.mode === 'demo'}
                students={visibleStudents}
                rides={visibleRides}
                reviewOnly={reviewOnly}
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
                onOpenAddStudent={() => { if (isFullAdmin) setIsAddStudentOpen(true); }}
              />
            )}

            {activeTab === 'parent' && !isAdmin && (
              <ParentPortal
                isDemo={session.mode === 'demo'}
                students={visibleStudents}
                rides={visibleRides}
                onOpenAddRide={(studentId) => {
                  setAddRideStudentId(studentId);
                  setAddRideIsTeacher(false);
                  setIsAddRideOpen(true);
                }}
                onCancelRide={handleCancelRide}
              />
            )}

            {activeTab === 'settings' && isFullAdmin && <GoogleSettings />}
            {activeTab === 'invitations' && isFullAdmin && <PortalInvitations />}
            {activeTab === 'accounts' && isFullAdmin && <AccountManagement students={visibleStudents} />}
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-12 py-8 border-t border-slate-200/80 bg-white/60 backdrop-blur-sm text-center text-xs text-slate-600">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600">
            © 2026 Mauro & Brenda English School. All rights reserved.
          </p>
          <nav aria-label="規約・法務リンク" className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => openTerms('terms')}
              className="text-slate-600 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              利用規約
            </button>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => openTerms('privacy')}
              className="text-slate-600 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              個人情報の取扱い
            </button>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => openTerms('disclaimer')}
              className="text-slate-600 hover:text-indigo-600 transition-colors underline-offset-4 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              免責事項
            </button>
          </nav>
        </div>
      </footer>

      {/* トースト通知 */}
      {toastMessage && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          {toastMessage}
        </div>
      )}

      {/* モーダル群 */}
      <AddRideModal
        key={`ride-${isAddRideOpen}-${addRideStudentId || 'default'}`}
        isOpen={isAddRideOpen}
        onClose={() => setIsAddRideOpen(false)}
        students={visibleStudents}
        initialStudentId={addRideStudentId}
        isTeacher={addRideIsTeacher}
        onSubmit={handleCreateRide}
      />

      {isAdmin && <AddTicketModal
        key={`ticket-${isAddTicketOpen}-${addTicketStudentId || 'default'}`}
        isOpen={isAddTicketOpen}
        onClose={() => setIsAddTicketOpen(false)}
        students={visibleStudents}
        initialStudentId={addTicketStudentId}
        onSubmit={handleAddTickets}
      />}

      {isFullAdmin && <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSubmit={handleAddStudent}
      />}

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        initialTab={termsTab}
      />
    </div>
  );
}

export default App;
