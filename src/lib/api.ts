import { supabase } from './supabase';
import { 
  Booking, 
  Penalty, 
  Room, 
  LibraryTable, 
  LibrarySeat, 
  EquipmentType, 
  EquipmentUnit,
  UserProfile,
  LibraryBookingForm,
  LabBookingForm,
  RoomBookingForm,
  PaginatedResponse
} from './types';

export class BookingService {
  // TODO: Connect to Supabase
  static async listBookings(userId?: string): Promise<Booking[]> {
    try {
      // let query = supabase.from('bookings').select('*');
      // if (userId) query = query.eq('user_id', userId);
      // const { data, error } = await query.order('created_at', { ascending: false });
      // if (error) throw error;
      // return data || [];
      
      return [];
    } catch (error) {
      console.error('Failed to load bookings:', error);
      return [];
    }
  }

  static async createLibraryBooking(booking: LibraryBookingForm, userId: string): Promise<Booking | null> {
    try {
      // TODO: Connect to Supabase
      // const bookingData = {
      //   user_id: userId,
      //   resource_kind: 'library_seat',
      //   resource_id: booking.seat_ids[0],
      //   resource_details: {
      //     room_id: booking.room_id,
      //     table_id: booking.table_id,
      //     seat_ids: booking.seat_ids,
      //   },
      //   date: booking.date,
      //   start_time: booking.start_time,
      //   end_time: booking.end_time,
      //   status: 'confirmed',
      //   attendance_code: generateAttendanceCode(),
      //   friends: booking.friends.filter(f => f.trim()),
      //   notes: booking.notes,
      // };
      
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .insert(bookingData)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return data;
      
      return null;
    } catch (error) {
      console.error('Failed to create library booking:', error);
      return null;
    }
  }

  static async createLabBooking(booking: LabBookingForm, userId: string): Promise<Booking | null> {
    try {
      // TODO: Connect to Supabase
      return null;
    } catch (error) {
      console.error('Failed to create lab booking:', error);
      return null;
    }
  }

  static async createRoomBooking(booking: RoomBookingForm, userId: string): Promise<Booking | null> {
    try {
      // TODO: Connect to Supabase
      return null;
    } catch (error) {
      console.error('Failed to create room booking:', error);
      return null;
    }
  }

  static async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      // TODO: Connect to Supabase
      // const { error } = await supabase
      //   .from('bookings')
      //   .update({ status: 'cancelled' })
      //   .eq('id', bookingId);
      
      // if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return false;
    }
  }

  static async checkInWithCode(code: string): Promise<{ success: boolean; booking?: Booking }> {
    try {
      // TODO: Connect to Supabase
      // const { data: booking, error } = await supabase
      //   .from('bookings')
      //   .select('*')
      //   .eq('attendance_code', code)
      //   .eq('status', 'confirmed')
      //   .single();
      
      // if (error || !booking) return { success: false };
      
      // // Check if within check-in window (±15 minutes)
      // const now = new Date();
      // const bookingStart = new Date(`${booking.date}T${booking.start_time}`);
      // const diffMinutes = Math.abs((now.getTime() - bookingStart.getTime()) / (1000 * 60));
      
      // if (diffMinutes > 15) return { success: false };
      
      // // Update booking status to arrived
      // await supabase
      //   .from('bookings')
      //   .update({ status: 'arrived' })
      //   .eq('id', booking.id);
      
      // return { success: true, booking };
      
      return { success: false };
    } catch (error) {
      console.error('Failed to check in:', error);
      return { success: false };
    }
  }
}

export class ResourceService {
  static async listRooms(type?: string): Promise<Room[]> {
    try {
      // TODO: Connect to Supabase
      // let query = supabase.from('rooms').select('*');
      // if (type) query = query.eq('type', type);
      // const { data, error } = await query.order('code');
      // if (error) throw error;
      // return data || [];
      
      return [];
    } catch (error) {
      console.error('Failed to load rooms:', error);
      return [];
    }
  }

  static async listLibraryTables(roomId: string): Promise<LibraryTable[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load library tables:', error);
      return [];
    }
  }

  static async listLibrarySeats(tableId: string): Promise<LibrarySeat[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load library seats:', error);
      return [];
    }
  }

  static async listEquipmentTypes(): Promise<EquipmentType[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load equipment types:', error);
      return [];
    }
  }

  static async listEquipmentUnits(roomId?: string, typeId?: string): Promise<EquipmentUnit[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load equipment units:', error);
      return [];
    }
  }
}

export class PenaltyService {
  static async listPenalties(userId?: string): Promise<Penalty[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load penalties:', error);
      return [];
    }
  }

  static async waivePenalty(penaltyId: string): Promise<boolean> {
    try {
      // TODO: Connect to Supabase
      return true;
    } catch (error) {
      console.error('Failed to waive penalty:', error);
      return false;
    }
  }

  static async markPenaltyPaid(penaltyId: string): Promise<boolean> {
    try {
      // TODO: Connect to Supabase
      return true;
    } catch (error) {
      console.error('Failed to mark penalty as paid:', error);
      return false;
    }
  }
}

export class AdminService {
  static async listUsers(): Promise<UserProfile[]> {
    try {
      // TODO: Connect to Supabase
      return [];
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  static async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      // TODO: Connect to Supabase
      return true;
    } catch (error) {
      console.error('Failed to update user role:', error);
      return false;
    }
  }

  static async getStatistics(): Promise<any> {
    try {
      // TODO: Connect to Supabase
      return {
        activeUsers: 0,
        totalSeats: 0,
        totalEquipment: 0,
        totalRooms: 0,
        todayBookings: 0,
        todayNoShows: 0,
        thisWeekBookings: [0, 0, 0, 0, 0, 0, 0],
        thisWeekPenalties: [0, 0, 0, 0, 0, 0, 0],
        utilizationData: [],
      };
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return {};
    }
  }
}

// Utility functions
function generateAttendanceCode(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}