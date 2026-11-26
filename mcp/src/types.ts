export type RideType = 'pickup' | 'dropoff' | 'roundtrip';
export type RideStatus = 'scheduled' | 'completed' | 'cancelled';
export type ReservedBy = 'parent' | 'teacher';
export type PortalRole = 'admin' | 'parent';
export type ManagedRole = 'admin' | 'parent' | 'reviewer';
export type McpMode = 'demo' | 'live-gas';

export interface Student {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  address: string;
  pickupNote: string;
  ticketBalance: number;
  createdAt: string;
}

export interface RideReservation {
  id: string;
  studentId: string;
  studentName?: string;
  rideDate: string; // YYYY-MM-DD
  rideTime: string; // HH:mm
  rideType: RideType;
  pickupLocation: string;
  status: RideStatus;
  calendarEventId?: string;
  note?: string;
  reservedBy: ReservedBy;
  completedAt?: string;
}

export interface TicketPurchase {
  id: string;
  studentId: string;
  studentName?: string;
  purchaseDate: string;
  ticketCount: number;
  amount: number;
  note?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: PortalRole;
  studentIds: string[];
  publicEntryId?: string;
  reviewOnly?: boolean;
}

export interface PortalInvitation {
  userId: string;
  name: string;
  publicEntryId: string;
  portalUrl?: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedRole;
  active: boolean;
  studentIds: string[];
  publicEntryId?: string;
  linked: boolean;
}

export interface ManagedUsers {
  users: ManagedUser[];
  revision: string;
  reviewModeAvailable?: boolean;
}

export interface GasHealthResult {
  checkedAt: string;
  reachable: boolean;
  message: string;
}

export interface ServiceStatus {
  mode: McpMode;
  role: PortalRole;
  reviewOnly: boolean;
  readonly: boolean;
  gasApiUrl: string;
  portalBaseUrl: string;
  authConfigured: boolean;
  authVerified?: boolean;
  authError?: string;
  entryIdConfigured: boolean;
  stateFile?: string;
  gasHealth?: GasHealthResult;
  releasePolicy: {
    release: 'HOLD';
    customerAcceptance: 'NOT_RUN (0/6)';
    thirdPartyPassed: 0;
  };
}

export interface DashboardSummary {
  totalStudents: number;
  lowTicketStudents: number;
  zeroTicketStudents: number;
  todayRidesTotal: number;
  todayScheduledCount: number;
  allScheduledCount: number;
}

export interface DashboardSnapshot {
  status: ServiceStatus;
  today: string;
  summary: DashboardSummary;
  students: Student[];
  todayRides: RideReservation[];
  rides: RideReservation[];
  purchases: TicketPurchase[];
  invitations?: PortalInvitation[];
  selectedDate?: string;
  selectedStudentId?: string;
  activeTab?: 'today' | 'all' | 'students' | 'book';
}

export interface CreateStudentInput {
  id?: string;
  name: string;
  parentName?: string;
  phone?: string;
  address: string;
  pickupNote?: string;
  ticketBalance?: number;
}

export interface CreateReservationInput {
  rideId?: string;
  studentId: string;
  rideDate: string;
  rideTime: string;
  rideType: RideType;
  pickupLocation: string;
  note?: string;
}

export interface AddTicketsInput {
  purchaseId?: string;
  studentId: string;
  ticketCount: number;
  amount: number;
  note?: string;
}

export interface CompleteRideResult {
  success: boolean;
  replayed?: boolean;
  remainingBalance?: number;
  consumedTickets?: number;
}

export interface CancelReservationResult {
  cancelled: boolean;
  replayed?: boolean;
}

export interface AddTicketsResult {
  success: boolean;
  replayed?: boolean;
  newBalance: number;
}
