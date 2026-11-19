export type RideType = 'pickup' | 'dropoff' | 'roundtrip';
export type RideStatus = 'scheduled' | 'completed' | 'cancelled';
export type ReservedBy = 'parent' | 'teacher';

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
