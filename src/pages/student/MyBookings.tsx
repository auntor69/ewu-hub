import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Copy, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { BookingService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { Booking } from '../../lib/types';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatTime } from '../../lib/utils';

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<Booking | null>(null);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      if (!currentUser) return;
      
      try {
        const data = await BookingService.listBookings(currentUser.id);
        setBookings(data);
      } catch (error) {
        toast({
          title: 'Failed to load bookings',
          description: error instanceof Error ? error.message : 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentUser]);

  const handleCancelBooking = async (booking: Booking) => {
    try {
      const success = await BookingService.cancelBooking(booking.id);
      
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));
      setShowCancelDialog(null);
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been successfully cancelled',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const copyAttendanceCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Attendance code copied to clipboard',
      variant: 'success',
    });
  };

  const getResourceDisplay = (booking: Booking) => {
    switch (booking.resource_kind) {
      case 'library_seat':
        return {
          type: 'Library Seat',
          details: `${booking.resource_details.table} - ${booking.resource_details.seat || booking.resource_details.seats?.join(', ')}`,
          location: booking.resource_details.room,
        };
      case 'equipment_unit':
        return {
          type: 'Lab Equipment',
          details: `${booking.resource_details.equipment} (${booking.resource_details.unit})`,
          location: booking.resource_details.room,
        };
      case 'room':
        return {
          type: 'Room Booking',
          details: `Capacity: ${booking.resource_details.capacity}`,
          location: booking.resource_details.room,
        };
      default:
        return {
          type: 'Resource',
          details: '',
          location: '',
        };
    }
  };

  const columns: Column<Booking>[] = [
    {
      key: 'resource_kind',
      header: 'Type',
      render: (booking) => getResourceDisplay(booking).type,
    },
    {
      key: 'resource_details',
      header: 'Location',
      render: (booking) => getResourceDisplay(booking).location,
    },
    {
      key: 'resource_details',
      header: 'Details',
      render: (booking) => getResourceDisplay(booking).details,
    },
    {
      key: 'date',
      header: 'Date',
      render: (booking) => formatDate(booking.date),
      sortable: true,
    },
    {
      key: 'start_time',
      header: 'Time',
      render: (booking) => `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'attendance_code',
      header: 'Code',
      render: (booking) => (
        booking.status === 'confirmed' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyAttendanceCode(booking.attendance_code)}
            className="font-mono text-xs"
          >
            {booking.attendance_code}
            <Copy className="h-3 w-3 ml-1" />
          </Button>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        )
      ),
    },
  ];

  const getFilteredBookings = (filter: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => 
          (b.date > today || (b.date === today && b.start_time > now.toTimeString().substring(0, 5))) &&
          ['confirmed', 'pending'].includes(b.status)
        );
      case 'past':
        return bookings.filter(b => 
          b.date < today || 
          (b.date === today && b.start_time <= now.toTimeString().substring(0, 5)) ||
          ['completed', 'cancelled', 'no_show'].includes(b.status)
        );
      default:
        return bookings;
    }
  };

  const renderActions = (booking: Booking) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setSelectedBooking(booking)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {booking.status === 'confirmed' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCancelDialog(booking)}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

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
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-600">View and manage your reservations</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            data={getFilteredBookings('all')}
            columns={columns}
            actions={renderActions}
            emptyState={
              <EmptyState
                icon={Calendar}
                title="No bookings yet"
                description="Start by reserving a library seat or lab equipment."
                action={{
                  label: 'Book Library',
                  onClick: () => window.location.href = '/student/library'
                }}
              />
            }
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <DataTable
            data={getFilteredBookings('upcoming')}
            columns={columns}
            actions={renderActions}
            emptyState={
              <EmptyState
                icon={Calendar}
                title="No upcoming bookings"
                description="All your current bookings are in the past."
                action={{
                  label: 'Book Library',
                  onClick: () => window.location.href = '/student/library'
                }}
              />
            }
          />
        </TabsContent>

        <TabsContent value="past">
          <DataTable
            data={getFilteredBookings('past')}
            columns={columns}
            actions={renderActions}
            emptyState={
              <EmptyState
                icon={Clock}
                title="No past bookings"
                description="Your booking history will appear here."
              />
            }
          />
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your reservation
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Type</div>
                  <div className="font-medium">{getResourceDisplay(selectedBooking).type}</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Status</div>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Date</div>
                  <div className="font-medium">{formatDate(selectedBooking.date)}</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Time</div>
                  <div className="font-medium">
                    {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-600 mb-1">Location</div>
                  <div className="font-medium">{getResourceDisplay(selectedBooking).location}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-600 mb-1">Details</div>
                  <div className="font-medium">{getResourceDisplay(selectedBooking).details}</div>
                </div>
              </div>

              {selectedBooking.status === 'confirmed' && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">Attendance Code</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-900">{selectedBooking.attendance_code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAttendanceCode(selectedBooking.attendance_code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedBooking.friends && selectedBooking.friends.length > 0 && (
                <div>
                  <div className="text-slate-600 mb-2">Friends</div>
                  <div className="space-y-1">
                    {selectedBooking.friends.map((friend, index) => (
                      <div key={index} className="text-sm bg-slate-50 rounded px-2 py-1">
                        {friend}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <div className="text-slate-600 mb-1">Notes</div>
                  <div className="text-sm bg-slate-50 rounded p-2">{selectedBooking.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!showCancelDialog} onOpenChange={() => setShowCancelDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {showCancelDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <div className="font-medium">{getResourceDisplay(showCancelDialog).type}</div>
                <div className="text-slate-600">
                  {formatDate(showCancelDialog.date)} at {formatTime(showCancelDialog.start_time)}
                </div>
                <div className="text-slate-600">{getResourceDisplay(showCancelDialog).location}</div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCancelDialog(null)}>
                  Keep Booking
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleCancelBooking(showCancelDialog)}
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}