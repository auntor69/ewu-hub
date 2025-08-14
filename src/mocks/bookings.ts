import { Booking } from '../lib/types';

const generateAttendanceCode = (): string => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    user_id: '1',
    resource_kind: 'library_seat',
    resource_id: 'seat-table-lib201-1-1',
    resource_details: { room: 'LIB-201', table: 'T1', seat: 'S1' },
    date: '2025-01-20',
    start_time: '09:00',
    end_time: '11:00',
    status: 'confirmed',
    attendance_code: generateAttendanceCode(),
    created_at: '2025-01-18T10:00:00Z',
  },
  {
    id: 'booking-2', 
    user_id: '1',
    resource_kind: 'equipment_unit',
    resource_id: 'unit-1',
    resource_details: { room: 'LAB-E1', equipment: 'Digital Oscilloscope', unit: 'OSC-001' },
    date: '2025-01-21',
    start_time: '14:00',
    end_time: '15:00',
    status: 'pending',
    attendance_code: generateAttendanceCode(),
    created_at: '2025-01-19T15:30:00Z',
  },
  {
    id: 'booking-3',
    user_id: '3',
    resource_kind: 'room',
    resource_id: 'room-5',
    resource_details: { room: 'CLS-101', capacity: 50 },
    date: '2025-01-22',
    start_time: '10:15',
    end_time: '11:30',
    status: 'confirmed',
    attendance_code: generateAttendanceCode(),
    notes: 'CSE101 lecture',
    created_at: '2025-01-17T12:00:00Z',
  },
  {
    id: 'booking-4',
    user_id: '1',
    resource_kind: 'library_seat',
    resource_id: 'seat-table-lib201-2-3',
    resource_details: { room: 'LIB-201', table: 'T2', seat: 'S3' },
    date: '2025-01-15',
    start_time: '13:00',
    end_time: '15:00',
    status: 'no_show',
    attendance_code: generateAttendanceCode(),
    created_at: '2025-01-13T09:00:00Z',
  },
];

export let mockBookingsState = [...mockBookings];

export const updateBookingStatus = (id: string, status: Booking['status']) => {
  const index = mockBookingsState.findIndex(b => b.id === id);
  if (index !== -1) {
    mockBookingsState[index] = { ...mockBookingsState[index], status };
  }
};

export const addBooking = (booking: Omit<Booking, 'id' | 'created_at'>) => {
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  mockBookingsState.push(newBooking);
  return newBooking;
};