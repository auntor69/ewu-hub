import React from 'react';
import { Calendar, Clock, MapPin, Copy } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { formatDate, formatTime } from '../lib/utils';
import { Booking } from '../lib/types';
import { useToast } from '../hooks/useToast';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onCancel?: (id: string) => void;
}

export function BookingCard({ booking, showActions = false, onCancel }: BookingCardProps) {
  const { toast } = useToast();

  const copyAttendanceCode = () => {
    navigator.clipboard.writeText(booking.attendance_code);
    toast({
      title: 'Copied!',
      description: 'Attendance code copied to clipboard',
      variant: 'success',
    });
  };

  const getStatusColor = (status: Booking['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-purple-100 text-purple-800',
      arrived: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
      no_show: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  const getResourceDisplay = () => {
    switch (booking.resource_kind) {
      case 'library_seat':
        return {
          type: 'Library Seat',
          details: `${booking.resource_details.table} - ${booking.resource_details.seat}`,
          location: booking.resource_details.room,
        };
      case 'equipment_unit':
        return {
          type: 'Equipment',
          details: booking.resource_details.unit,
          location: booking.resource_details.room,
        };
      case 'room':
        return {
          type: 'Room',
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

  const resource = getResourceDisplay();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">{resource.type}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-600">{resource.details}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4" />
            <span>{resource.location}</span>
          </div>
        </div>

        {booking.status === 'confirmed' && (
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg mb-3">
            <div>
              <p className="text-xs text-purple-600 font-medium">Attendance Code</p>
              <p className="text-sm font-mono text-purple-900">{booking.attendance_code}</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyAttendanceCode}
              className="text-purple-600"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showActions && booking.status === 'confirmed' && onCancel && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onCancel(booking.id)}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}