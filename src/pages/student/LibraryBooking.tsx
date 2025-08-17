import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BookingService, ResourceService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';
import { cn, formatDate, formatTime } from '../../lib/utils';
import { Room, LibraryTable, LibrarySeat } from '../../lib/types';

interface BookingStep1Data {
  date: string;
  hour: string;
}

interface BookingStep2Data {
  room: string;
  table: string;
  selectedSeats: string[];
}

interface BookingStep3Data {
  friends: string[];
  notes: string;
}

const hours = Array.from({ length: 12 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function LibraryBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<LibraryTable[]>([]);
  const [seats, setSeats] = useState<LibrarySeat[]>([]);

  const [step1Data, setStep1Data] = useState<BookingStep1Data>({
    date: '',
    hour: '',
  });

  const [step2Data, setStep2Data] = useState<BookingStep2Data>({
    room: '',
    table: '',
    selectedSeats: [],
  });

  const [step3Data, setStep3Data] = useState<BookingStep3Data>({
    friends: [''],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await ResourceService.listRooms('library_zone');
        setRooms(roomsData);
      } catch (error: any) {
        toast({
          title: 'Failed to load rooms',
          description: error.message,
          variant: 'destructive',
        });
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (step2Data.room) {
      const loadTables = async () => {
        try {
          const tablesData = await ResourceService.listLibraryTables(step2Data.room);
          setTables(tablesData);
        } catch (error: any) {
          toast({
            title: 'Failed to load tables',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
      loadTables();
    }
  }, [step2Data.room]);

  useEffect(() => {
    if (step2Data.table) {
      const loadSeats = async () => {
        try {
          const selectedRoom = rooms.find(r => r.id === step2Data.room);
          if (!selectedRoom) return;
          
          const startTime = `${step1Data.date}T${step1Data.hour}:00+06:00`;
          const endHour = parseInt(step1Data.hour.split(':')[0]) + (step1Data.duration || 1);
          const endTime = `${step1Data.date}T${endHour.toString().padStart(2, '0')}:00:00+06:00`;
          
          const seatsData = await ResourceService.listAvailableSeats(selectedRoom.code, startTime, endTime);
          setSeats(seatsData);
        } catch (error: any) {
          toast({
            title: 'Failed to load seats',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
      loadSeats();
    }
  }, [step2Data.table, step1Data.date, step1Data.hour, step2Data.room, rooms]);

  const selectedRoom = rooms.find(r => r.id === step2Data.room);
  const availableTables = tables.filter(t => t.room_id === step2Data.room);
  const selectedTableSeats = seats.filter(s => s.table_id === step2Data.table);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step1Data.date) newErrors.date = 'Please select a date';
    if (!step1Data.hour) newErrors.hour = 'Please select an hour';

    // Check if selected date is Friday or Saturday
    if (step1Data.date) {
      const selectedDate = new Date(step1Data.date);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        newErrors.date = 'Library is closed on Friday and Saturday';
      }
    }

    // Check booking window (3 days ahead for students)
    if (step1Data.date) {
      const selectedDate = new Date(step1Data.date);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 3);
      if (selectedDate > maxDate) {
        newErrors.date = 'Students can only book up to 3 days ahead';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step2Data.room) newErrors.room = 'Please select a room';
    if (!step2Data.table) newErrors.table = 'Please select a table';
    if (step2Data.selectedSeats.length === 0) newErrors.seats = 'Please select at least one seat';
    if (step2Data.selectedSeats.length > 6) newErrors.seats = 'Maximum 6 seats allowed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    const nonEmptyFriends = step3Data.friends.filter(f => f.trim());

    if (nonEmptyFriends.length + 1 > step2Data.selectedSeats.length) {
      newErrors.friends = 'Number of people cannot exceed selected seats';
    }

    // Validate student ID format
    nonEmptyFriends.forEach((friend, index) => {
      if (friend && !/^[a-zA-Z0-9]{8,12}$/.test(friend)) {
        newErrors[`friend-${index}`] = 'Student ID must be 8-12 alphanumeric characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Next = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSeatToggle = (seatId: string) => {
    setStep2Data(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.includes(seatId)
        ? prev.selectedSeats.filter(id => id !== seatId)
        : prev.selectedSeats.length < 6
        ? [...prev.selectedSeats, seatId]
        : prev.selectedSeats
    }));
  };

  const addFriendField = () => {
    if (step3Data.friends.length < 5) {
      setStep3Data(prev => ({
        ...prev,
        friends: [...prev.friends, '']
      }));
    }
  };

  const updateFriendId = (index: number, value: string) => {
    setStep3Data(prev => ({
      ...prev,
      friends: prev.friends.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFriendField = (index: number) => {
    setStep3Data(prev => ({
      ...prev,
      friends: prev.friends.filter((_, i) => i !== index)
    }));
  };

  const handleConfirmBooking = async () => {
    if (!validateStep3() || !currentUser) return;

    setLoading(true);
    try {
      const endHour = parseInt(step1Data.hour.split(':')[0]) + (step1Data.duration || 1);
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      const bookingData = {
        date: step1Data.date,
        start_time: step1Data.hour,
        end_time: endTime,
        room_id: step2Data.room,
        table_id: step2Data.table,
        seat_ids: step2Data.selectedSeats,
        friends: step3Data.friends.filter(f => f.trim()),
        notes: step3Data.notes,
      };

      const booking = await BookingService.createLibraryBooking(bookingData, currentUser.id);
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Use the actual attendance code from the booking
      setGeneratedCodes([booking.attendance_code]);
      setShowSuccessModal(true);
      
      toast({
        title: 'Booking confirmed!',
        description: 'Your library seats have been reserved',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
      variant: 'success',
    });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/student/bookings');
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const isDateDisabled = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Book Library</h1>
          <p className="text-slate-600">Reserve seats for individual or group study</p>
        </div>
        <div className="text-sm text-slate-500">
          Step {currentStep} of 3
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
              step <= currentStep
                ? 'bg-purple-600 text-white'
                : 'bg-slate-200 text-slate-600'
            )}>
              {step}
            </div>
            <div className="ml-3 text-sm">
              <div className={cn(
                'font-medium',
                step <= currentStep ? 'text-purple-600' : 'text-slate-500'
              )}>
                {step === 1 && 'Date & Time'}
                {step === 2 && 'Choose Seats'}
                {step === 3 && 'Review & Confirm'}
              </div>
            </div>
            {step < 3 && (
              <div className={cn(
                'w-16 h-0.5 mx-4',
                step < currentStep ? 'bg-purple-600' : 'bg-slate-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Date & Hour */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Hour</CardTitle>
            <CardDescription>Choose your study date and time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="date">Study Date</Label>
              <Input
                id="date"
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                value={step1Data.date}
                onChange={(e) => setStep1Data(prev => ({ ...prev, date: e.target.value }))}
                className="max-w-xs"
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
              <p className="text-sm text-slate-500 mt-1">
                Library is open Sun-Thu, 08:00-19:00. Students can book up to 3 days ahead.
              </p>
            </div>

            <div>
              <Label>Select Hour</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant={step1Data.hour === hour ? 'default' : 'outline'}
                    onClick={() => setStep1Data(prev => ({ ...prev, hour }))}
                    className="h-12"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {formatTime(hour)}
                  </Button>
                ))}
              </div>
              {errors.hour && <p className="text-sm text-red-600 mt-1">{errors.hour}</p>}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleStep1Next} disabled={!step1Data.date || !step1Data.hour}>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Zone/Table/Seat */}
      {currentStep === 2 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Room & Table</CardTitle>
              <CardDescription>Choose your study location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="room">Library Room</Label>
                <select
                  id="room"
                  value={step2Data.room}
                  onChange={(e) => setStep2Data(prev => ({ ...prev, room: e.target.value, table: '', selectedSeats: [] }))}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.name} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
                {errors.room && <p className="text-sm text-red-600 mt-1">{errors.room}</p>}
              </div>

              {step2Data.room && (
                <div>
                  <Label htmlFor="table">Table</Label>
                  <select
                    id="table"
                    value={step2Data.table}
                    onChange={(e) => setStep2Data(prev => ({ ...prev, table: e.target.value, selectedSeats: [] }))}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select a table</option>
                    {availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        Table T{table.table_number} ({table.seat_count} seats)
                      </option>
                    ))}
                  </select>
                  {errors.table && <p className="text-sm text-red-600 mt-1">{errors.table}</p>}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                {step2Data.selectedSeats.length > 0 && (
                  <Button onClick={handleStep2Next}>
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seat Map</CardTitle>
              <CardDescription>Click seats to select (max 6)</CardDescription>
            </CardHeader>
            <CardContent>
              {step2Data.table && selectedTableSeats.length > 0 ? (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {selectedTableSeats.map((seat) => (
                      <Button
                        key={seat.id}
                        variant={
                          step2Data.selectedSeats.includes(seat.id)
                            ? 'default'
                            : seat.status === 'occupied'
                            ? 'destructive'
                            : 'outline'
                        }
                        disabled={seat.status === 'occupied'}
                        onClick={() => handleSeatToggle(seat.id)}
                        className="h-16 p-2"
                      >
                        <div className="text-center">
                          <div className="text-xs">S{seat.seat_number}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {seat.status === 'occupied' ? 'Occupied' : 
                             step2Data.selectedSeats.includes(seat.id) ? 'Selected' : 'Available'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Legend</div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-slate-300 rounded bg-white"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Occupied</span>
                      </div>
                    </div>
                  </div>

                  {step2Data.selectedSeats.length > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-900 mb-1">
                        Selected: {step2Data.selectedSeats.length} seat(s)
                      </div>
                      <div className="text-xs text-purple-700">
                        Seats: {step2Data.selectedSeats.map(seatId => {
                          const seat = selectedTableSeats.find(s => s.id === seatId);
                          return `S${seat?.seat_number}`;
                        }).join(', ')}
                      </div>
                    </div>
                  )}

                  {errors.seats && <p className="text-sm text-red-600 mt-2">{errors.seats}</p>}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a room and table to view seat map</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Add Friends & Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Friends (Optional)</CardTitle>
              <CardDescription>Add up to 5 friends to your booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step3Data.friends.map((friend, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`friend-${index}`}>Friend {index + 1} Student ID</Label>
                    <Input
                      id={`friend-${index}`}
                      value={friend}
                      onChange={(e) => updateFriendId(index, e.target.value)}
                      placeholder="e.g., 2021160001"
                      maxLength={12}
                    />
                    {errors[`friend-${index}`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`friend-${index}`]}</p>
                    )}
                  </div>
                  {step3Data.friends.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFriendField(index)}
                      className="mt-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              {step3Data.friends.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFriendField}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Another Friend
                </Button>
              )}

              {errors.friends && <p className="text-sm text-red-600">{errors.friends}</p>}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={step3Data.notes}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special notes or requirements"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Date & Time</div>
                  <div className="font-medium">
                    {formatDate(step1Data.date)} at {formatTime(step1Data.hour)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Location</div>
                  <div className="font-medium">
                    {selectedRoom?.code} - Table T{availableTables.find(t => t.id === step2Data.table)?.table_number}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Selected Seats</div>
                  <div className="font-medium">
                    {step2Data.selectedSeats.map(seatId => {
                      const seat = selectedTableSeats.find(s => s.id === seatId);
                      return `S${seat?.seat_number}`;
                    }).join(', ')} ({step2Data.selectedSeats.length} seat{step2Data.selectedSeats.length !== 1 ? 's' : ''})
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Total People</div>
                  <div className="font-medium">
                    {1 + step3Data.friends.filter(f => f.trim()).length} person{1 + step3Data.friends.filter(f => f.trim()).length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Confirmed! 🎉</DialogTitle>
            <DialogDescription>
              Your library seats have been successfully reserved. Here are your attendance codes:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {generatedCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">
                    {index === 0 ? 'You' : `Friend ${index}`}
                  </div>
                  <div className="font-mono text-sm text-purple-900">{code}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button onClick={handleSuccessModalClose}>
              View My Bookings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}