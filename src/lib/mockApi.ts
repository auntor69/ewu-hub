import { mockBookingsState, addBooking, updateBookingStatus } from '../mocks/bookings';
import { mockPenaltiesState, updatePenaltyStatus } from '../mocks/penalties';
import { mockUsers } from '../mocks/users';
import { mockRooms } from '../mocks/rooms';
import { mockLibraryTables, mockLibrarySeats } from '../mocks/library';
import { mockEquipmentTypes, mockEquipmentUnits } from '../mocks/equipment';
import { Booking, Penalty, UserProfile } from './types';
import { generateAttendanceCode, isTimeWithinWindow } from './utils';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth
  async signIn(email: string, password: string): Promise<UserProfile> {
    // TODO: connect to Supabase auth
    await delay();
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  async signUp(userData: Omit<UserProfile, 'id' | 'created_at'>): Promise<UserProfile> {
    // TODO: connect to Supabase auth
    await delay();
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return newUser;
  },

  // Bookings
  async listBookings(userId?: string): Promise<Booking[]> {
    // TODO: connect to Supabase
    await delay();
    return userId 
      ? mockBookingsState.filter(b => b.user_id === userId)
      : mockBookingsState;
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'attendance_code'>): Promise<Booking> {
    // TODO: connect to Supabase
    await delay();
    const newBooking = addBooking({
      ...booking,
      attendance_code: generateAttendanceCode(),
    });
    return newBooking;
  },

  async cancelBooking(bookingId: string): Promise<void> {
    // TODO: connect to Supabase
    await delay();
    updateBookingStatus(bookingId, 'cancelled');
  },

  async checkInWithCode(code: string): Promise<{ success: boolean; booking?: Booking }> {
    // TODO: connect to Supabase
    await delay();
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5);

    const booking = mockBookingsState.find(b => 
      b.attendance_code === code &&
      b.date === today &&
      b.status === 'confirmed' &&
      isTimeWithinWindow(b.start_time)
    );

    if (booking) {
      updateBookingStatus(booking.id, 'arrived');
      return { success: true, booking };
    }

    return { success: false };
  },

  // Resources
  async listRooms(): Promise<typeof mockRooms> {
    // TODO: connect to Supabase
    await delay();
    return mockRooms;
  },

  async listLibraryTables(roomId?: string): Promise<typeof mockLibraryTables> {
    // TODO: connect to Supabase
    await delay();
    return roomId 
      ? mockLibraryTables.filter(t => t.room_id === roomId)
      : mockLibraryTables;
  },

  async listLibrarySeats(tableId?: string): Promise<typeof mockLibrarySeats> {
    // TODO: connect to Supabase
    await delay();
    return tableId 
      ? mockLibrarySeats.filter(s => s.table_id === tableId)
      : mockLibrarySeats;
  },

  async listEquipmentTypes(): Promise<typeof mockEquipmentTypes> {
    // TODO: connect to Supabase
    await delay();
    return mockEquipmentTypes;
  },

  async listEquipmentUnits(roomId?: string, typeId?: string): Promise<typeof mockEquipmentUnits> {
    // TODO: connect to Supabase
    await delay();
    let units = mockEquipmentUnits;
    
    if (roomId) {
      units = units.filter(u => u.room_id === roomId);
    }
    
    if (typeId) {
      units = units.filter(u => u.equipment_type_id === typeId);
    }
    
    return units;
  },

  // Penalties
  async listPenalties(userId?: string): Promise<Penalty[]> {
    // TODO: connect to Supabase
    await delay();
    return userId 
      ? mockPenaltiesState.filter(p => p.user_id === userId)
      : mockPenaltiesState;
  },

  async waivePenalty(penaltyId: string): Promise<void> {
    // TODO: connect to Supabase
    await delay();
    updatePenaltyStatus(penaltyId, 'waived');
  },

  async markPenaltyPaid(penaltyId: string): Promise<void> {
    // TODO: connect to Supabase
    await delay();
    updatePenaltyStatus(penaltyId, 'paid');
  },

  // Users (Admin)
  async listUsers(): Promise<UserProfile[]> {
    // TODO: connect to Supabase
    await delay();
    return mockUsers;
  },

  // Statistics (mock data for dashboards)
  async getStatistics(): Promise<any> {
    // TODO: connect to Supabase
    await delay();
    return {
      activeUsers: 1250,
      totalSeats: 108,
      totalEquipment: 25,
      totalRooms: 6,
      todayBookings: 45,
      todayNoShows: 3,
      thisWeekBookings: [12, 18, 22, 19, 25, 15, 8],
      thisWeekPenalties: [2, 1, 3, 0, 2, 1, 0],
      utilizationData: [
        { hour: '08:00', value: 20 },
        { hour: '09:00', value: 45 },
        { hour: '10:00', value: 67 },
        { hour: '11:00', value: 78 },
        { hour: '12:00', value: 45 },
        { hour: '13:00', value: 56 },
        { hour: '14:00', value: 89 },
        { hour: '15:00', value: 92 },
        { hour: '16:00', value: 78 },
        { hour: '17:00', value: 56 },
        { hour: '18:00', value: 34 },
      ],
    };
  },
};