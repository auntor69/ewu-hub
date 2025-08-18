import { supabase, getCurrentUserId, handleSupabaseError } from './supabase'
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
} from './types'

// Fallback fetch function if supabase client is not available
const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}${endpoint}`
  const headers = {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  }
  
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw error
  }
  return response.json()
}
export class BookingService {
  static async listBookings(userId?: string): Promise<Booking[]> {
    try {
      if (!supabase) {
        const endpoint = userId 
          ? `/rest/v1/bookings?or=(booked_by.eq.${userId},booked_for.eq.${userId})&select=*,resources(*)`
          : '/rest/v1/bookings?select=*,resources(*)'
        const data = await supabaseFetch(endpoint)
        return data || []
      }
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          resources(*)
        `)
        .order('start_ts', { ascending: false })
      
      if (userId) {
        query = query.or(`booked_by.eq.${userId},booked_for.eq.${userId}`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load bookings:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async createLibraryBooking(booking: LibraryBookingForm, userId: string): Promise<Booking | null> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/rpc/create_group_booking', {
          method: 'POST',
          body: JSON.stringify({
            p_user_id: userId,
            p_resource_ids: booking.seat_ids,
            p_start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
            p_end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
            p_friends: booking.friends.filter(f => f.trim()),
            p_notes: booking.notes
          })
        })
        return data?.[0] || null
      }
      
      // Create group booking using RPC
      const { data, error } = await supabase.rpc('create_group_booking', {
        p_user_id: userId,
        p_resource_ids: booking.seat_ids,
        p_start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
        p_end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
        p_friends: booking.friends.filter(f => f.trim()),
        p_notes: booking.notes
      })
      
      if (error) throw error
      
      // Return the first booking (main user's booking)
      return data?.[0] || null
    } catch (error: any) {
      console.error('Failed to create library booking:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async createLabBooking(booking: LabBookingForm, userId: string): Promise<Booking | null> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/bookings', {
          method: 'POST',
          body: JSON.stringify({
            booked_by: userId,
            booked_for: userId,
            resource_id: booking.equipment_unit_id,
            start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
            end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
            status: 'confirmed'
          })
        })
        return data?.[0] || null
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          booked_by: userId,
          booked_for: userId,
          resource_id: booking.equipment_unit_id,
          start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
          end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
          status: 'confirmed'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Failed to create lab booking:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async createRoomBooking(booking: RoomBookingForm, userId: string): Promise<Booking | null> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/bookings', {
          method: 'POST',
          body: JSON.stringify({
            booked_by: userId,
            booked_for: userId,
            resource_id: booking.room_id,
            start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
            end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
            status: 'confirmed'
          })
        })
        return data?.[0] || null
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          booked_by: userId,
          booked_for: userId,
          resource_id: booking.room_id,
          start_ts: `${booking.date}T${booking.start_time}:00+06:00`,
          end_ts: `${booking.date}T${booking.end_time}:00+06:00`,
          status: 'confirmed'
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Failed to create room booking:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      if (!supabase) {
        await supabaseFetch(`/rest/v1/bookings?id=eq.${bookingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' })
        })
        return true
      }
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
      
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Failed to cancel booking:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async checkInWithCode(code: string): Promise<{ success: boolean; booking?: Booking }> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/rpc/check_in', {
          method: 'POST',
          body: JSON.stringify({ p_code: code })
        })
        return {
          success: data?.success || false,
          booking: data?.booking
        }
      }
      
      const { data, error } = await supabase.rpc('check_in', {
        p_code: code
      })
      
      if (error) throw error
      
      return {
        success: data?.success || false,
        booking: data?.booking
      }
    } catch (error: any) {
      console.error('Failed to check in:', error)
      return { success: false }
    }
  }
}

export class ResourceService {
  static async listRooms(type?: string): Promise<Room[]> {
    try {
      if (!supabase) {
        const endpoint = type 
          ? `/rest/v1/rooms?type=eq.${type}&select=*,locations(*)`
          : '/rest/v1/rooms?select=*,locations(*)'
        const data = await supabaseFetch(endpoint)
        return data || []
      }
      
      let query = supabase
        .from('rooms')
        .select(`
          *,
          locations(*)
        `)
        .order('code')
      
      if (type) {
        query = query.eq('type', type)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load rooms:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async listAvailableSeats(roomCode: string, startTime: string, endTime: string): Promise<LibrarySeat[]> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/rpc/list_available_seats', {
          method: 'POST',
          body: JSON.stringify({
            p_room_code: roomCode,
            p_start: startTime,
            p_end: endTime
          })
        })
        return data || []
      }
      
      const { data, error } = await supabase.rpc('list_available_seats', {
        p_room_code: roomCode,
        p_start: startTime,
        p_end: endTime
      })
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load available seats:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async listAvailableEquipment(roomCode: string, startTime: string, endTime: string): Promise<EquipmentUnit[]> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/rpc/list_available_equipment', {
          method: 'POST',
          body: JSON.stringify({
            p_room_code: roomCode,
            p_start: startTime,
            p_end: endTime
          })
        })
        return data || []
      }
      
      const { data, error } = await supabase.rpc('list_available_equipment', {
        p_room_code: roomCode,
        p_start: startTime,
        p_end: endTime
      })
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load available equipment:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async listLibraryTables(roomId: string): Promise<LibraryTable[]> {
    try {
      if (!supabase) {
        const data = await supabaseFetch(`/rest/v1/library_tables?room_id=eq.${roomId}`)
        return data || []
      }
      
      const { data, error } = await supabase
        .from('library_tables')
        .select('*')
        .eq('room_id', roomId)
        .order('label')
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load library tables:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async listEquipmentTypes(): Promise<EquipmentType[]> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/equipment_types')
        return data || []
      }
      
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load equipment types:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async listEquipmentUnits(roomId?: string, typeId?: string): Promise<EquipmentUnit[]> {
    try {
      if (!supabase) {
        let endpoint = '/rest/v1/equipment_units?select=*,equipment_types(*),rooms(*)'
        const params = []
        if (roomId) params.push(`room_id=eq.${roomId}`)
        if (typeId) params.push(`equipment_type_id=eq.${typeId}`)
        if (params.length > 0) endpoint += `&${params.join('&')}`
        
        const data = await supabaseFetch(endpoint)
        return data || []
      }
      
      let query = supabase
        .from('equipment_units')
        .select(`
          *,
          equipment_types(*),
          rooms(*)
        `)
        .order('asset_tag')
      
      if (roomId) {
        query = query.eq('room_id', roomId)
      }
      
      if (typeId) {
        query = query.eq('equipment_type_id', typeId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load equipment units:', error)
      throw new Error(handleSupabaseError(error))
    }
  }
}

export class PenaltyService {
  static async listPenalties(userId?: string): Promise<Penalty[]> {
    try {
      if (!supabase) {
        let endpoint = '/rest/v1/penalties?select=*,bookings(*)'
        if (userId) {
          endpoint += `&booking_id=in.(select id from bookings where booked_for=eq.${userId})`
        }
        const data = await supabaseFetch(endpoint)
        return data || []
      }
      
      let query = supabase
        .from('penalties')
        .select(`
          *,
          bookings(*)
        `)
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('booking_id', supabase
          .from('bookings')
          .select('id')
          .eq('booked_for', userId)
        )
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load penalties:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async waivePenalty(penaltyId: string): Promise<boolean> {
    try {
      if (!supabase) {
        await supabaseFetch(`/rest/v1/penalties?id=eq.${penaltyId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'waived' })
        })
        return true
      }
      
      const { error } = await supabase
        .from('penalties')
        .update({ status: 'waived' })
        .eq('id', penaltyId)
      
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Failed to waive penalty:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async markPenaltyPaid(penaltyId: string): Promise<boolean> {
    try {
      if (!supabase) {
        await supabaseFetch(`/rest/v1/penalties?id=eq.${penaltyId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'paid' })
        })
        return true
      }
      
      const { error } = await supabase
        .from('penalties')
        .update({ status: 'paid' })
        .eq('id', penaltyId)
      
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Failed to mark penalty as paid:', error)
      throw new Error(handleSupabaseError(error))
    }
  }
}

export class AdminService {
  static async listUsers(): Promise<UserProfile[]> {
    try {
      if (!supabase) {
        const data = await supabaseFetch('/rest/v1/profiles')
        return data || []
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to load users:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      if (!supabase) {
        await supabaseFetch(`/rest/v1/profiles?user_id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ role })
        })
        return true
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId)
      
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Failed to update user role:', error)
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getStatistics(): Promise<any> {
    try {
      if (!supabase) {
        // Get today's bookings
        const today = new Date().toISOString().split('T')[0]
        const todayBookings = await supabaseFetch(
          `/rest/v1/bookings?start_ts=gte.${today}T00:00:00+06:00&start_ts=lt.${today}T23:59:59+06:00`
        )
        
        // Get penalties
        const penalties = await supabaseFetch('/rest/v1/penalties?status=eq.pending')
        
        // Get resource counts
        const [seats, equipment, rooms, users] = await Promise.all([
          supabaseFetch('/rest/v1/library_seats?select=count'),
          supabaseFetch('/rest/v1/equipment_units?select=count'),
          supabaseFetch('/rest/v1/rooms?select=count'),
          supabaseFetch('/rest/v1/profiles?select=count')
        ])
        
        return {
          activeUsers: users?.length || 0,
          totalSeats: seats?.length || 0,
          totalEquipment: equipment?.length || 0,
          totalRooms: rooms?.length || 0,
          todayBookings: todayBookings?.length || 0,
          todayNoShows: todayBookings?.filter((b: any) => b.status === 'no_show').length || 0,
          pendingPenalties: penalties?.length || 0,
          thisWeekBookings: [0, 0, 0, 0, 0, 0, 0],
          thisWeekPenalties: [0, 0, 0, 0, 0, 0, 0],
          utilizationData: [],
        }
      }
      
      // Get today's bookings
      const today = new Date().toISOString().split('T')[0]
      
      const { data: todayBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_ts', `${today}T00:00:00+06:00`)
        .lt('start_ts', `${today}T23:59:59+06:00`)
      
      if (bookingsError) throw bookingsError
      
      // Get penalties
      const { data: penalties, error: penaltiesError } = await supabase
        .from('penalties')
        .select('*')
        .eq('status', 'pending')
      
      if (penaltiesError) throw penaltiesError
      
      // Get resource counts
      const { count: seatsCount } = await supabase
        .from('library_seats')
        .select('*', { count: 'exact', head: true })
      
      const { count: equipmentCount } = await supabase
        .from('equipment_units')
        .select('*', { count: 'exact', head: true })
      
      const { count: roomsCount } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
      
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      return {
        activeUsers: usersCount || 0,
        totalSeats: seatsCount || 0,
        totalEquipment: equipmentCount || 0,
        totalRooms: roomsCount || 0,
        todayBookings: todayBookings?.length || 0,
        todayNoShows: todayBookings?.filter(b => b.status === 'no_show').length || 0,
        pendingPenalties: penalties?.length || 0,
        thisWeekBookings: [0, 0, 0, 0, 0, 0, 0], // TODO: Calculate weekly data
        thisWeekPenalties: [0, 0, 0, 0, 0, 0, 0], // TODO: Calculate weekly data
        utilizationData: [], // TODO: Calculate utilization
      }
    } catch (error: any) {
      console.error('Failed to load statistics:', error)
      throw new Error(handleSupabaseError(error))
    }
  }
}