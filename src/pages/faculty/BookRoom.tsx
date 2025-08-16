import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BookingService, ResourceService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';
import { cn, formatDate, formatTime } from '../../lib/utils';
import { Room } from '../../lib/types';

interface BookingStep1Data {
  date: string;
  startTime: string;
}

interface BookingStep2Data {
  duration: number; // in minutes
}

interface BookingStep3Data {
  room: string;
  purpose: string;
  notes: string;
}

export function BookRoom() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [step1Data, setStep1Data] = useState<BookingStep1Data>({
    date: '',
    startTime: '',
  });

  const [step2Data, setStep2Data] = useState<BookingStep2Data>({
    duration: 60, // Default 60 minutes
  });

  const [step3Data, setStep3Data] = useState<BookingStep3Data>({
    room: '',
    purpose: '',
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
      const roomsData = await ResourceService.listRooms('classroom');
      setRooms(roomsData);
    };
    loadRooms();
  }, []);

  const selectedRoom = rooms.find(r => r.id === step3Data.room);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step1Data.date) newErrors.date = 'Please select a date';
    if (!step1Data.startTime) newErrors.startTime = 'Please select start time';

    // Check booking window (7 days ahead for faculty)
    if (step1Data.date) {
      const selectedDate = new Date(step1Data.date);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7);
      if (selectedDate > maxDate) {
        newErrors.date = 'Faculty can only book up to 7 days ahead';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (step2Data.duration < 45 || step2Data.duration > 75) {
      newErrors.duration = 'Duration must be between 45-75 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step3Data.room) newErrors.room = 'Please select a room';
    if (!step3Data.purpose.trim()) newErrors.purpose = 'Please specify the purpose';

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

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleConfirmBooking = async () => {
    if (!validateStep3() || !currentUser) return;

    setLoading(true);
    try {
      const endTime = calculateEndTime(step1Data.startTime, step2Data.duration);
      
      const bookingData = {
        date: step1Data.date,
        start_time: step1Data.startTime,
        end_time: endTime,
        room_id: step3Data.room,
        purpose: step3Data.purpose,
        notes: step3Data.notes,
      };

      const booking = await BookingService.createRoomBooking(bookingData, currentUser.id);
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      setGeneratedCode(code);
      setShowSuccessModal(true);
      
      toast({
        title: 'Room booked!',
        description: 'Your classroom has been reserved',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Please try again',
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
    navigate('/faculty/classes');
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  // Generate time slots in 15-minute increments
  const timeSlots = [];
  for (let hour = 8; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Book Room</h1>
          <p className="text-slate-600">Reserve additional classroom time</p>
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
                {step === 2 && 'Duration'}
                {step === 3 && 'Room & Purpose'}
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

      {/* Step 1: Select Date & Start Time */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Start Time</CardTitle>
            <CardDescription>Choose when you want to start your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="date">Class Date</Label>
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
                Faculty can book up to 7 days ahead
              </p>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <select
                id="startTime"
                value={step1Data.startTime}
                onChange={(e) => setStep1Data(prev => ({ ...prev, startTime: e.target.value }))}
                className="flex h-10 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select start time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
              {errors.startTime && <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>}
              <p className="text-sm text-slate-500 mt-1">
                Available in 15-minute increments from 8:00 AM to 7:00 PM
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleStep1Next} disabled={!step1Data.date || !step1Data.startTime}>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Duration */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Duration</CardTitle>
            <CardDescription>How long do you need the room?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="flex items-center space-x-4 mt-2">
                <input
                  id="duration"
                  type="range"
                  min="45"
                  max="75"
                  step="15"
                  value={step2Data.duration}
                  onChange={(e) => setStep2Data(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <div className="text-lg font-semibold text-purple-600 min-w-[80px]">
                  {step2Data.duration} min
                </div>
              </div>
              {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
              <p className="text-sm text-slate-500 mt-1">
                Faculty sessions can be 45-75 minutes long
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Session Preview</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p>Start: {step1Data.startTime ? formatTime(step1Data.startTime) : '--:--'}</p>
                <p>End: {step1Data.startTime ? formatTime(calculateEndTime(step1Data.startTime, step2Data.duration)) : '--:--'}</p>
                <p>Duration: {step2Data.duration} minutes</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleStep2Next}>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Room & Purpose */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Room & Purpose</CardTitle>
              <CardDescription>Choose your classroom and specify the purpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Available Rooms</Label>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  {rooms.map((room) => (
                    <Card
                      key={room.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        step3Data.room === room.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-slate-50'
                      )}
                      onClick={() => setStep3Data(prev => ({ ...prev, room: room.id }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{room.code}</h3>
                            <p className="text-sm text-slate-600 mb-2">{room.name}</p>
                            <div className="text-xs text-slate-500 space-y-1">
                              <p>Building: {room.building}</p>
                              <p>Floor: {room.floor}</p>
                              <p>Capacity: {room.capacity} students</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {errors.room && <p className="text-sm text-red-600 mt-1">{errors.room}</p>}
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={step3Data.purpose}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="e.g., CSE101 Extra Class, Makeup Lecture"
                />
                {errors.purpose && <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>}
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={step3Data.notes}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or requirements"
                />
              </div>

              <div className="flex justify-between">
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

          {/* Booking Summary */}
          {step3Data.room && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your room booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Date & Time</div>
                    <div className="font-medium">
                      {formatDate(step1Data.date)} at {formatTime(step1Data.startTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Duration</div>
                    <div className="font-medium">{step2Data.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Room</div>
                    <div className="font-medium">{selectedRoom?.code} - {selectedRoom?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Purpose</div>
                    <div className="font-medium">{step3Data.purpose}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Room Booked! 🎉</DialogTitle>
            <DialogDescription>
              Your classroom has been successfully reserved. Here is your attendance code:
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
              View My Classes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}