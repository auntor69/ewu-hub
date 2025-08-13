export type Role = 'student' | 'faculty' | 'admin' | 'staff';
export type ResourceKind = 'library_seat' | 'equipment_unit' | 'room';
export type BookingStatus = 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
export type PenaltyStatus = 'pending' | 'waived' | 'paid';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  facultyId?: string;
  created_at: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'classroom' | 'lab' | 'library_zone';
  available_hours: string;
}

export interface LibraryTable {
  id: string;
  room_id: string;
  table_number: number;
  seat_count: number;
}

export interface LibrarySeat {
  id: string;
  table_id: string;
  seat_number: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface EquipmentType {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface EquipmentUnit {
  id: string;
  equipment_type_id: string;
  asset_tag: string;
  room_id: string;
  status: 'available' | 'in_use' | 'maintenance';
}

export interface Booking {
  id: string;
  user_id: string;
  resource_kind: ResourceKind;
  resource_id: string;
  resource_details: any;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  attendance_code: string;
  friends?: string[];
  notes?: string;
  created_at: string;
}

export interface Penalty {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  reason: string;
  status: PenaltyStatus;
  created_at: string;
}