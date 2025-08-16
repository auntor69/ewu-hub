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
  updated_at: string;
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
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LibraryTable {
  id: string;
  room_id: string;
  table_number: number;
  seat_count: number;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LibrarySeat {
  id: string;
  table_id: string;
  seat_number: number;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentUnit {
  id: string;
  equipment_type_id: string;
  asset_tag: string;
  room_id: string;
  status: 'available' | 'in_use' | 'maintenance';
  created_at: string;
  updated_at: string;
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
  updated_at: string;
}

export interface Penalty {
  id: string;
  user_id: string;
  booking_id: string;
  amount: number;
  reason: string;
  status: PenaltyStatus;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  id: string;
  resource_type: 'library' | 'lab' | 'classroom';
  resource_id?: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  studentId?: string;
  facultyId?: string;
}

export interface LibraryBookingForm {
  date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  table_id: string;
  seat_ids: string[];
  friends: string[];
  notes?: string;
}

export interface LabBookingForm {
  date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  equipment_type_id: string;
  equipment_unit_id: string;
  notes?: string;
}

export interface RoomBookingForm {
  date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  purpose: string;
  notes?: string;
}