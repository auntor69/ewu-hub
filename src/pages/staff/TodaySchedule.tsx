import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { StatusBadge } from '../../components/StatusBadge';
import { BookingService } from '../../lib/api';
import { Booking } from '../../lib/types';
import { useToast } from '../../hooks/useToast';
import { formatTime, formatDate } from '../../lib/utils';

export function TodaySchedule() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadTodayBookings = async () => {
      try {
        const allBookings = await BookingService.listBookings();
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = allBookings.filter(b => b.date === today);
        setBookings(todayBookings);
      } catch (error) {
        console.error('Failed to load today\'s bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayBookings();
  }, []);

  const handleMarkArrived = async (booking: Booking) => {
    try {
      // TODO: Connect to Supabase
      // Update booking status to arrived
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: 'arrived' } : b
      ));
      
      toast({
        title: 'Marked as arrived',
        description: 'Student attendance has been confirmed',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const getResourceDisplay = (booking: Booking) => {
    switch (booking.resource_kind) {
      case 'library_seat':
        return {
          type: 'Library',
          location: booking.resource_details?.room || 'N/A',
          details: `${booking.resource_details?.table} - ${booking.resource_details?.seat || booking.resource_details?.seats?.join(', ')}`,
          icon: <MapPin className="h-4 w-4" />,
        };
      case 'equipment_unit':
        return {
          type: 'Lab',
          location: booking.resource_details?.room || 'N/A',
          details: `${booking.resource_details?.equipment} (${booking.resource_details?.unit})`,
          icon: <MapPin className="h-4 w-4" />,
        };
      case 'room':
        return {
          type: 'Classroom',
          location: booking.resource_details?.room || 'N/A',
          details: `Capacity: ${booking.resource_details?.capacity || 'N/A'}`,
          icon: <MapPin className="h-4 w-4" />,
        };
      default:
        return {
          type: 'Unknown',
          location: 'N/A',
          details: 'N/A',
          icon: <MapPin className="h-4 w-4" />,
        };
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (locationFilter === 'all') return true;
    const resource = getResourceDisplay(booking);
    return resource.type.toLowerCase() === locationFilter;
  });

  // Group bookings by hour
  const bookingsByHour = filteredBookings.reduce((acc, booking) => {
    const hour = booking.start_time.substring(0, 2);
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return hour.toString().padStart(2, '0');
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Today's Schedule</h1>
        <p className="text-slate-600">Monitor all bookings for {formatDate(new Date().toISOString().split('T')[0])}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter bookings by location type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={locationFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('all')}
            >
              All ({bookings.length})
            </Button>
            <Button
              variant={locationFilter === 'library' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('library')}
            >
              Library ({bookings.filter(b => b.resource_kind === 'library_seat').length})
            </Button>
            <Button
              variant={locationFilter === 'lab' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('lab')}
            >
              Lab ({bookings.filter(b => b.resource_kind === 'equipment_unit').length})
            </Button>
            <Button
              variant={locationFilter === 'classroom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocationFilter('classroom')}
            >
              Classroom ({bookings.filter(b => b.resource_kind === 'room').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Schedule</CardTitle>
          <CardDescription>Click on any booking to view details and manage attendance</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings today</h3>
              <p className="text-slate-500">There are no bookings scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hours.map(hour => {
                const hourBookings = bookingsByHour[hour] || [];
                return (
                  <div key={hour} className="border-l-4 border-purple-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {formatTime(`${hour}:00`)}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {hourBookings.length} booking{hourBookings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {hourBookings.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No bookings this hour</p>
                    ) : (
                      <div className="grid gap-2">
                        {hourBookings.map(booking => {
                          const resource = getResourceDisplay(booking);
                          return (
                            <Sheet key={booking.id}>
                              <SheetTrigger asChild>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                          {resource.icon}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">
                                            {resource.location}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            {resource.details}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <StatusBadge status={booking.status} />
                                        <span className="text-xs text-slate-500">
                                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </SheetTrigger>
                              
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Booking Details</SheetTitle>
                                  <SheetDescription>
                                    Manage this booking and update attendance
                                  </SheetDescription>
                                </SheetHeader>
                                
                                <div className="space-y-6 mt-6">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div className="text-slate-600 mb-1">Type</div>
                                      <div className="font-medium">{resource.type}</div>
                                    </div>
                                    <div>
                                      <div className="text-slate-600 mb-1">Status</div>
                                      <StatusBadge status={booking.status} />
                                    </div>
                                    <div>
                                      <div className="text-slate-600 mb-1">Location</div>
                                      <div className="font-medium">{resource.location}</div>
                                    </div>
                                    <div>
                                      <div className="text-slate-600 mb-1">Time</div>
                                      <div className="font-medium">
                                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <div className="text-slate-600 mb-1">Details</div>
                                      <div className="font-medium">{resource.details}</div>
                                    </div>
                                  </div>

                                  {booking.attendance_code && (
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                      <div className="text-sm text-purple-600 font-medium mb-1">
                                        Attendance Code
                                      </div>
                                      <div className="font-mono text-purple-900">
                                        {booking.attendance_code}
                                      </div>
                                    </div>
                                  )}

                                  {booking.friends && booking.friends.length > 0 && (
                                    <div>
                                      <div className="text-slate-600 mb-2">Friends</div>
                                      <div className="space-y-1">
                                        {booking.friends.map((friend, index) => (
                                          <div key={index} className="text-sm bg-slate-50 rounded px-2 py-1">
                                            {friend}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {booking.notes && (
                                    <div>
                                      <div className="text-slate-600 mb-1">Notes</div>
                                      <div className="text-sm bg-slate-50 rounded p-2">{booking.notes}</div>
                                    </div>
                                  )}

                                  {booking.status === 'confirmed' && (
                                    <Button
                                      onClick={() => handleMarkArrived(booking)}
                                      className="w-full"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark as Arrived
                                    </Button>
                                  )}
                                </div>
                              </SheetContent>
                            </Sheet>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}