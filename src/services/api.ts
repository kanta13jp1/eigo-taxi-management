import type { Student, RideReservation, TicketPurchase, RideType } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'eigo_taxi_students',
  RIDES: 'eigo_taxi_rides',
  PURCHASES: 'eigo_taxi_purchases',
  GAS_API_URL: 'eigo_taxi_gas_api_url',
};

// 初期モックデータ
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-001',
    name: '田中 陽菜 (ひな)',
    parentName: '田中 美咲',
    phone: '090-1111-2222',
    address: '東京都世田谷区桜新町1-10-5 パークサイド201',
    pickupNote: 'エントランス前。到着時インターホンかLINE',
    ticketBalance: 7,
    createdAt: '2026-09-01',
  },
  {
    id: 'STU-002',
    name: '山本 颯太 (そうた)',
    parentName: '山本 健一',
    phone: '080-3333-4444',
    address: '東京都世田谷区用賀2-5-12',
    pickupNote: '正面道路沿いで待機しています',
    ticketBalance: 1, // 残少
    createdAt: '2026-09-10',
  },
  {
    id: 'STU-003',
    name: '高橋 莉子 (りこ)',
    parentName: '高橋 智子',
    phone: '090-5555-6666',
    address: '東京都世田谷区弦巻3-8-1',
    pickupNote: '自宅玄関先までお越しください',
    ticketBalance: 0, // 残りなし
    createdAt: '2026-09-15',
  },
];

const INITIAL_RIDES: RideReservation[] = [
  {
    id: 'RIDE-101',
    studentId: 'STU-001',
    studentName: '田中 陽菜 (ひな)',
    rideDate: new Date().toISOString().split('T')[0], // 今日
    rideTime: '16:00',
    rideType: 'pickup',
    pickupLocation: '東京都世田谷区桜新町1-10-5 パークサイド201',
    status: 'scheduled',
    calendarEventId: 'mock-cal-101',
    note: 'レッスン前のお迎え',
    reservedBy: 'parent',
  },
  {
    id: 'RIDE-102',
    studentId: 'STU-002',
    studentName: '山本 颯太 (そうた)',
    rideDate: new Date().toISOString().split('T')[0], // 今日
    rideTime: '17:30',
    rideType: 'dropoff',
    pickupLocation: '英語教室 → 東京都世田谷区用賀2-5-12',
    status: 'scheduled',
    calendarEventId: 'mock-cal-102',
    note: 'レッスン後のご自宅送り',
    reservedBy: 'teacher',
  },
  {
    id: 'RIDE-103',
    studentId: 'STU-001',
    studentName: '田中 陽菜 (ひな)',
    rideDate: '2026-10-06',
    rideTime: '16:00',
    rideType: 'roundtrip',
    pickupLocation: '東京都世田谷区桜新町1-10-5 パークサイド201',
    status: 'completed',
    completedAt: '2026-10-06 17:45',
    note: '送迎完了済み',
    reservedBy: 'parent',
  },
];

const INITIAL_PURCHASES: TicketPurchase[] = [
  {
    id: 'PUR-001',
    studentId: 'STU-001',
    studentName: '田中 陽菜 (ひな)',
    purchaseDate: '2026-09-01',
    ticketCount: 10,
    amount: 10000,
    note: '初回購入 (10回券)',
  },
  {
    id: 'PUR-002',
    studentId: 'STU-002',
    studentName: '山本 颯太 (そうた)',
    purchaseDate: '2026-09-10',
    ticketCount: 5,
    amount: 5000,
    note: '5回券購入',
  },
];

// LocalStorageヘルパー
function getStored<T>(key: string, defaultVal: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

export const ApiService = {
  getGasApiUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.GAS_API_URL) || '';
  },

  setGasApiUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.GAS_API_URL, url.trim());
  },

  // 生徒一覧取得
  async getStudents(): Promise<Student[]> {
    const gasUrl = this.getGasApiUrl();
    if (gasUrl) {
      try {
        const res = await fetch(`${gasUrl}?action=getStudents`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      } catch (e) {
        console.warn('GAS API connection failed, fallback to local storage:', e);
      }
    }
    return getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  // 生徒詳細取得
  async getStudentById(id: string): Promise<Student | undefined> {
    const students = await this.getStudents();
    return students.find((s) => s.id === id);
  },

  // 生徒新規登録
  async createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    const students = await this.getStudents();
    const newStudent: Student = {
      ...student,
      id: `STU-${String(students.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    students.push(newStudent);
    setStored(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },

  // 送迎予約一覧取得
  async getRides(): Promise<RideReservation[]> {
    const gasUrl = this.getGasApiUrl();
    if (gasUrl) {
      try {
        const res = await fetch(`${gasUrl}?action=getRides`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((r: any) => {
            let rideDate = String(r.rideDate || '');
            const dateMatch = rideDate.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
              rideDate = dateMatch[0];
            } else {
              const d = new Date(r.rideDate);
              if (!isNaN(d.getTime())) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                rideDate = `${y}-${m}-${day}`;
              }
            }

            let rideTime = String(r.rideTime || '');
            const timeMatch = rideTime.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              rideTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
            }

            return {
              ...r,
              rideDate,
              rideTime,
            };
          }).sort((a: any, b: any) => `${b.rideDate} ${b.rideTime}`.localeCompare(`${a.rideDate} ${a.rideTime}`));
        }
      } catch (e) {
        console.warn('GAS API connection failed, fallback to local storage:', e);
      }
    }

    let rides = getStored<RideReservation[]>(STORAGE_KEYS.RIDES, INITIAL_RIDES);
    const todayStr = new Date().toISOString().split('T')[0];

    // デモ用: 本日の送迎予定（未完了）が1件もない場合は、RIDE-101とRIDE-102を本日の日付・未完了に自動更新
    const hasTodayScheduled = rides.some((r) => r.rideDate === todayStr && r.status === 'scheduled');
    if (!hasTodayScheduled) {
      rides = rides.map((r) => {
        if (r.id === 'RIDE-101') return { ...r, rideDate: todayStr, status: 'scheduled', completedAt: undefined };
        if (r.id === 'RIDE-102') return { ...r, rideDate: todayStr, status: 'scheduled', completedAt: undefined };
        return r;
      });
      setStored(STORAGE_KEYS.RIDES, rides);
    }

    return rides.sort((a, b) => `${b.rideDate} ${b.rideTime}`.localeCompare(`${a.rideDate} ${a.rideTime}`));
  },

  // 送迎予約の登録（保護者または先生）
  async createReservation(params: {
    studentId: string;
    rideDate: string;
    rideTime: string;
    rideType: RideType;
    pickupLocation: string;
    note?: string;
    reservedBy: 'parent' | 'teacher';
  }): Promise<RideReservation> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === params.studentId);
    const rides = await this.getRides();
    const gasUrl = this.getGasApiUrl();
    const studentName = student?.name || '受講生徒';
    const generatedRideId = `RIDE-${Date.now()}`;
    let gasResult: { id?: string; calendarEventId?: string } | undefined;
    if (gasUrl) {
      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'createReservation',
            rideId: generatedRideId,
            studentName,
            ...params,
          }),
        });
        const json = await res.json();
        if (json.success) {
          gasResult = json.data;
        }
      } catch (e) {
        console.warn('GAS API connection failed, fallback to local storage:', e);
      }
    }

    const newRide: RideReservation = {
      id: gasResult?.id || generatedRideId,
      studentId: params.studentId,
      studentName: studentName,
      rideDate: params.rideDate,
      rideTime: params.rideTime,
      rideType: params.rideType,
      pickupLocation: params.pickupLocation,
      status: 'scheduled',
      calendarEventId: gasResult?.calendarEventId || `cal-${Date.now()}`,
      note: params.note || '',
      reservedBy: params.reservedBy,
    };

    rides.unshift(newRide);
    setStored(STORAGE_KEYS.RIDES, rides);
    return newRide;
  },

  // 送迎予約のキャンセル（保護者または先生）
  async cancelReservation(rideId: string): Promise<boolean> {
    const rides = await this.getRides();
    const index = rides.findIndex((r) => r.id === rideId);
    if (index === -1) return false;
    const targetRide = rides[index];

    const gasUrl = this.getGasApiUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'cancelReservation',
            rideId,
            studentId: targetRide.studentId,
            studentName: targetRide.studentName,
            rideDate: targetRide.rideDate,
            rideTime: targetRide.rideTime,
            calendarEventId: targetRide.calendarEventId,
          }),
        });
      } catch (e) {
        console.warn('GAS API cancel failed:', e);
      }
    }

    rides[index].status = 'cancelled';
    setStored(STORAGE_KEYS.RIDES, rides);
    return true;
  },

  // 送迎完了＆チケット消化（先生が当日実行）
  async completeRide(rideId: string, consumeTickets: number = 1): Promise<{ success: boolean; remainingBalance?: number }> {
    const rides = await this.getRides();
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return { success: false };

    const students = await this.getStudents();
    const studentIndex = students.findIndex((s) => s.id === ride.studentId);
    if (studentIndex === -1) return { success: false };

    // チケット残数を減算
    students[studentIndex].ticketBalance = Math.max(0, students[studentIndex].ticketBalance - consumeTickets);
    ride.status = 'completed';
    ride.completedAt = new Date().toLocaleString('ja-JP');

    setStored(STORAGE_KEYS.STUDENTS, students);
    setStored(STORAGE_KEYS.RIDES, rides);

    const gasUrl = this.getGasApiUrl();
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'completeRide', rideId, consumeTickets }),
        });
      } catch (e) {
        console.warn('GAS API connection failed:', e);
      }
    }

    return { success: true, remainingBalance: students[studentIndex].ticketBalance };
  },

  // チケット購入・追加（先生が実行）
  async addTickets(params: {
    studentId: string;
    ticketCount: number;
    amount: number;
    note?: string;
  }): Promise<{ success: boolean; newBalance: number }> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === params.studentId);
    if (!student) return { success: false, newBalance: 0 };

    student.ticketBalance += params.ticketCount;
    setStored(STORAGE_KEYS.STUDENTS, students);

    // 購入履歴追加
    const purchases = getStored<TicketPurchase[]>(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    const newPurchase: TicketPurchase = {
      id: `PUR-${Date.now().toString().slice(-5)}`,
      studentId: params.studentId,
      studentName: student.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      ticketCount: params.ticketCount,
      amount: params.amount,
      note: params.note || '',
    };
    purchases.unshift(newPurchase);
    setStored(STORAGE_KEYS.PURCHASES, purchases);

    return { success: true, newBalance: student.ticketBalance };
  },

  // リセット（初期モックデータに戻す）
  resetToMock(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.RIDES);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
  },
};
