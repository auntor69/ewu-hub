import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Copy, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DataTable, Column } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { BookingService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { Booking } from '../../lib/types';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatTime } from '../../lib/utils';

export function MyClasses() {
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
        // Filter for room bookings only
        const roomBookings = data.filter(b => b.resource_kind === 'room');
        setBookings(roomBookings);
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
        title: 'Class cancelled',
        description: 'Your room booking has been successfully cancelled',
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

  const columns: Column<Booking>[] = [
    {
      key: 'resource_details',
      header: 'Room',
      render: (booking) => booking.resource_details?.room || 'N/A',
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
      key: 'resource_details',
      header: 'Duration',
      render: (booking) => {
        const start = new Date(`2000-01-01T${booking.start_time}:00`);
        const end = new Date(`2000-01-01T${booking.end_time}:00`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        return `${duration} min`;
      },
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
        <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
        <p className="text-slate-600">View and manage your room bookings</p>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        actions={renderActions}
        emptyState={
          <EmptyState
            icon={Calendar}
            title="No classes booked"
            description="You haven't booked any rooms yet. Reserve additional classroom time for extended sessions."
            action={{
              label: 'Book Room',
              onClick: () => window.location.href = '/faculty/book'
            }}
          />
        }
      />

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              Complete information about your room booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Room</div>
                  <div className="font-medium">{selectedBooking.resource_details?.room}</div>
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
                  <div className="text-slate-600 mb-1">Purpose</div>
                  <div className="font-medium">{selectedBooking.resource_details?.purpose || 'N/A'}</div>
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
            <DialogTitle>Cancel Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this room booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {showCancelDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <div className="font-medium">Room: {showCancelDialog.resource_details?.room}</div>
                <div className="text-slate-600">
                  {formatDate(showCancelDialog.date)} at {formatTime(showCancelDialog.start_time)}
                </div>
                <div className="text-slate-600">Purpose: {showCancelDialog.resource_details?.purpose}</div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCancelDialog(null)}>
                  Keep Booking
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleCancelBooking(showCancelDialog)}
                >
                  Cancel Class
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}