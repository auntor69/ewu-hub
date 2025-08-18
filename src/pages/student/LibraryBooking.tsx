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
import { Room, LibraryTable, LibrarySeat, UserProfile } from '../../lib/types';

interface BookingStep1Data {
  date: string;
  hour: string;
  duration: number;
}

interface BookingStep2Data {
  selectedSeats: string[];
}

interface BookingStep3Data {
  friends: string[];
  notes: string;
}

const hours = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const durations = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' }
];
export function LibraryBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [seats, setSeats] = useState<LibrarySeat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [step1Data, setStep1Data] = useState<BookingStep1Data>({
    date: '',
    hour: '',
    duration: 1,
  });

  const [step2Data, setStep2Data] = useState<BookingStep2Data>({
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
    if (step1Data.date && step1Data.hour && step1Data.duration) {
      const loadSeats = async () => {
        setLoadingSeats(true);
        try {
          const startHour = parseInt(step1Data.hour.split(':')[0]);
          const endHour = startHour + step1Data.duration;
          
          // Fixed room: LIB-601
          const startTime = `${step1Data.date}T${step1Data.hour}:00+06:00`;
          const endTime = `${step1Data.date}T${endHour.toString().padStart(2, '0')}:00:00+06:00`;
          
          const seatsData = await ResourceService.listAvailableSeats('LIB-601', startTime, endTime);
          setSeats(seatsData);
        } catch (error: any) {
          toast({
            title: 'Failed to load seats',
            description: error.message,
            variant: 'destructive',
          });
          setSeats([]);
        } finally {
          setLoadingSeats(false);
        }
      };
      loadSeats();
    }
  }, [step1Data.date, step1Data.hour, step1Data.duration]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step1Data.date) newErrors.date = 'Please select a date';
    if (!step1Data.hour) newErrors.hour = 'Please select an hour';
    if (!step1Data.duration) newErrors.duration = 'Please select duration';

    // Check if selected date is Friday or Saturday
    if (step1Data.date) {
      const selectedDate = new Date(step1Data.date);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        newErrors.date = 'Library is closed on Friday and Saturday';
      }
    }

    // Check if end time is within opening hours
    if (step1Data.hour && step1Data.duration) {
      const startHour = parseInt(step1Data.hour.split(':')[0]);
      const endHour = startHour + step1Data.duration;
      if (endHour > 19) {
        newErrors.hour = 'Booking would extend beyond closing time (19:00)';
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
      const endHour = parseInt(step1Data.hour.split(':')[0]) + step1Data.duration;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      const bookingData = {
        date: step1Data.date,
        start_time: step1Data.hour,
        end_time: endTime,
        seat_ids: step2Data.selectedSeats,
        friends: step3Data.friends.filter(f => f.trim()),
        notes: step3Data.notes,
      };

      const booking = await BookingService.createLibraryBooking(bookingData, currentUser.id);
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Use the actual attendance code from the booking
      setGeneratedCode(booking.attendance_code);
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

  // Generate seat map (20 tables × 6 seats = 120 seats)
  const generateSeatMap = () => {
    const seatMap = [];
    for (let table = 1; table <= 20; table++) {
      for (let seat = 1; seat <= 6; seat++) {
        const seatId = `T${table}-S${seat}`;
        const isAvailable = seats.some(s => s.label === seatId);
        const isSelected = step2Data.selectedSeats.includes(seatId);
        
        seatMap.push({
          id: seatId,
          table,
          seat,
          available: isAvailable,
          selected: isSelected,
          occupied: !isAvailable && !isSelected
        });
      }
    }
    return seatMap;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Book Library</h1>
          <p className="text-slate-600">Reserve seats for individual or group study</p>
        </div>
        <div className="text-sm text-slate-500">
          Step {currentStep} of 3 • LIB-601 Main Library
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
                {step === 1 && 'Date, Time & Duration'}
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

      {/* Step 1: Select Date, Hour & Duration */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date, Time & Duration</CardTitle>
            <CardDescription>Choose your study session details</CardDescription>
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

            <div>
              <Label>Duration</Label>
              <div className="flex gap-3 mt-2">
                {durations.map((duration) => (
                  <Button
                    key={duration.value}
                    variant={step1Data.duration === duration.value ? 'default' : 'outline'}
                    onClick={() => setStep1Data(prev => ({ ...prev, duration: duration.value }))}
                    className="h-12"
                  >
                    {duration.label}
                  </Button>
                ))}
              </div>
              {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
              <p className="text-sm text-slate-500 mt-1">
                Library bookings must be exactly 1 or 2 hours
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleStep1Next} disabled={!step1Data.date || !step1Data.hour || !step1Data.duration}>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Choose Seats */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Library Seat Map - LIB-601</CardTitle>
            <CardDescription>
              Click seats to select (max 6) • {formatDate(step1Data.date)} at {formatTime(step1Data.hour)} for {step1Data.duration}h
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSeats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading seat availability...</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-6 gap-2 mb-6">
                  {generateSeatMap().map((seat) => (
                    <Button
                      key={seat.id}
                      variant={
                        seat.selected
                          ? 'default'
                          : seat.occupied
                          ? 'destructive'
                          : 'outline'
                      }
                      disabled={seat.occupied}
                      onClick={() => handleSeatToggle(seat.id)}
                      className="h-12 p-1 text-xs"
                      title={`Table ${seat.table}, Seat ${seat.seat}`}
                    >
                      <div className="text-center">
                        <div>{seat.id}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
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
                  <div className="p-3 bg-purple-50 rounded-lg mb-4">
                    <div className="text-sm font-medium text-purple-900 mb-1">
                      Selected: {step2Data.selectedSeats.length} seat(s)
                    </div>
                    <div className="text-xs text-purple-700">
                      Seats: {step2Data.selectedSeats.join(', ')}
                    </div>
                  </div>
                )}

                {errors.seats && <p className="text-sm text-red-600 mb-4">{errors.seats}</p>}

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
              </div>
            )}
          </CardContent>
        </Card>
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
                    {formatDate(step1Data.date)} at {formatTime(step1Data.hour)} ({step1Data.duration}h)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Location</div>
                  <div className="font-medium">
                    LIB-601 Main Library
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Selected Seats</div>
                  <div className="font-medium">
                    {step2Data.selectedSeats.join(', ')} ({step2Data.selectedSeats.length} seat{step2Data.selectedSeats.length !== 1 ? 's' : ''})
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
              Your library seats have been successfully reserved. Here is your attendance code:
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <div className="text-sm font-medium">Attendance Code</div>
              <div className="font-mono text-sm text-purple-900">{generatedCode}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyCode(generatedCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
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