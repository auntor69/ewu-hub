import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BookingService } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Booking } from '../../lib/types';
import { formatTime, formatDate } from '../../lib/utils';

export function CheckinPortal() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; booking?: Booking } | null>(null);
  const { toast } = useToast();

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await BookingService.checkInWithCode(code.trim().toUpperCase());
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Check-in successful!',
          description: 'Attendance confirmed. Have a productive session!',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Check-in failed',
          description: 'Code not valid in the current check-in window.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Check-in error',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Check-in Portal</h1>
        <p className="text-slate-600 mt-2">Verify student attendance with booking codes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Attendance Code</CardTitle>
          <CardDescription>
            Students provide their booking code to confirm attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <Label htmlFor="code">Attendance Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter 10-16 character code"
                  maxLength={16}
                  className="font-mono text-center text-lg"
                  autoFocus
                />
                <p className="text-sm text-slate-500 mt-1">
                  Valid within ±15 minutes of booking start time
                </p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={loading || !code.trim()} className="flex-1">
                  {loading ? 'Checking...' : 'Check In'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="flex items-center space-x-2"
                  title="Coming soon"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Scan QR</span>
                </Button>
              </div>
            </form>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      Attendance Confirmed!
                    </h3>
                    <p className="text-green-700">Have a productive session!</p>
                  </div>

                  {result.booking && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                      <h4 className="font-semibold text-green-900 mb-3">Booking Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-green-700 font-medium">Type</div>
                          <div className="text-green-900">{getResourceDisplay(result.booking).type}</div>
                        </div>
                        <div>
                          <div className="text-green-700 font-medium">Location</div>
                          <div className="text-green-900">{getResourceDisplay(result.booking).location}</div>
                        </div>
                        <div>
                          <div className="text-green-700 font-medium">Date</div>
                          <div className="text-green-900">{formatDate(result.booking.date)}</div>
                        </div>
                        <div>
                          <div className="text-green-700 font-medium">Time</div>
                          <div className="text-green-900">
                            {formatTime(result.booking.start_time)} - {formatTime(result.booking.end_time)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-green-700 font-medium">Details</div>
                          <div className="text-green-900">{getResourceDisplay(result.booking).details}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-1">
                      Check-in Failed
                    </h3>
                    <p className="text-red-700">Code not valid in the current check-in window.</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-red-900 mb-2">Possible reasons:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Code is incorrect or expired</li>
                      <li>• Check-in window has passed (±15 minutes)</li>
                      <li>• Booking was cancelled or modified</li>
                      <li>• Student already checked in</li>
                    </ul>
                  </div>
                </div>
              )}

              <Button onClick={handleReset} variant="outline" className="w-full">
                Check Another Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-purple-600">1</span>
            </div>
            <div>
              <p className="font-medium">Ask for attendance code</p>
              <p className="text-slate-600">Students show their booking confirmation with the attendance code</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-purple-600">2</span>
            </div>
            <div>
              <p className="font-medium">Enter the code</p>
              <p className="text-slate-600">Type or scan the 10-16 character alphanumeric code</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-purple-600">3</span>
            </div>
            <div>
              <p className="font-medium">Confirm attendance</p>
              <p className="text-slate-600">System validates and marks the student as arrived</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}