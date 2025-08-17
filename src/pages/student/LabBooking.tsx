import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, FlaskConical, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BookingService, ResourceService } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';
import { cn, formatDate, formatTime } from '../../lib/utils';
import { Room, EquipmentType, EquipmentUnit } from '../../lib/types';

interface BookingStep1Data {
  date: string;
  hour: string;
}

interface BookingStep2Data {
  room: string;
}

interface BookingStep3Data {
  equipmentType: string;
  equipmentUnit: string;
  notes: string;
}

const hours = Array.from({ length: 12 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function LabBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipmentUnits, setEquipmentUnits] = useState<EquipmentUnit[]>([]);

  const [step1Data, setStep1Data] = useState<BookingStep1Data>({
    date: '',
    hour: '',
  });

  const [step2Data, setStep2Data] = useState<BookingStep2Data>({
    room: '',
  });

  const [step3Data, setStep3Data] = useState<BookingStep3Data>({
    equipmentType: '',
    equipmentUnit: '',
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
    const loadData = async () => {
      try {
        const [roomsData, typesData] = await Promise.all([
          ResourceService.listRooms('lab'),
          ResourceService.listEquipmentTypes(),
        ]);
        setRooms(roomsData);
        setEquipmentTypes(typesData);
      } catch (error: any) {
        toast({
          title: 'Failed to load data',
          description: error.message,
          variant: 'destructive',
        });
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (step2Data.room && step1Data.date && step1Data.hour) {
      const loadUnits = async () => {
        try {
          const selectedRoom = rooms.find(r => r.id === step2Data.room);
          if (!selectedRoom) return;
          
          const startTime = `${step1Data.date}T${step1Data.hour}:00+06:00`;
          const endHour = parseInt(step1Data.hour.split(':')[0]) + 1;
          const endTime = `${step1Data.date}T${endHour.toString().padStart(2, '0')}:00:00+06:00`;
          
          const unitsData = await ResourceService.listAvailableEquipment(selectedRoom.code, startTime, endTime);
          setEquipmentUnits(unitsData);
        } catch (error: any) {
          toast({
            title: 'Failed to load equipment',
            description: error.message,
            variant: 'destructive',
          });
        }
      };
      loadUnits();
    }
  }, [step2Data.room, step1Data.date, step1Data.hour, rooms]);

  const selectedRoom = rooms.find(r => r.id === step2Data.room);
  const availableUnits = equipmentUnits.filter(u => u.status === 'available');

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step1Data.date) newErrors.date = 'Please select a date';
    if (!step1Data.hour) newErrors.hour = 'Please select an hour';

    // Check if selected date is Friday or Saturday
    if (step1Data.date) {
      const selectedDate = new Date(step1Data.date);
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        newErrors.date = 'Labs are closed on Friday and Saturday';
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
    
    if (!step2Data.room) newErrors.room = 'Please select a lab room';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!step3Data.equipmentType) newErrors.equipmentType = 'Please select equipment type';
    if (!step3Data.equipmentUnit) newErrors.equipmentUnit = 'Please select equipment unit';

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

  const handleConfirmBooking = async () => {
    if (!validateStep3() || !currentUser) return;

    setLoading(true);
    try {
      const bookingData = {
        date: step1Data.date,
        start_time: step1Data.hour,
        end_time: `${parseInt(step1Data.hour.split(':')[0]) + 1}:00`,
        room_id: step2Data.room,
        equipment_unit_id: step3Data.equipmentUnit,
        notes: step3Data.notes,
      };

      const booking = await BookingService.createLabBooking(bookingData, currentUser.id);
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      setGeneratedCode(booking.attendance_code);
      setShowSuccessModal(true);
      
      toast({
        title: 'Booking confirmed!',
        description: 'Your lab equipment has been reserved',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Book Lab Equipment</h1>
          <p className="text-slate-600">Reserve equipment for hands-on learning</p>
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
                {step === 2 && 'Choose Lab'}
                {step === 3 && 'Select Equipment'}
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
            <CardDescription>Choose your lab session date and time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="date">Lab Date</Label>
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
                Labs are open Sun-Thu, 08:00-19:00. Students can book up to 3 days ahead.
              </p>
            </div>

            <div>
              <Label>Select Hour (1-hour slots)</Label>
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

      {/* Step 2: Choose Lab Room */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Lab Room</CardTitle>
            <CardDescription>Choose which lab you want to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    step2Data.room === room.id
                      ? 'ring-2 ring-purple-500 bg-purple-50'
                      : 'hover:bg-slate-50'
                  )}
                  onClick={() => setStep2Data(prev => ({ ...prev, room: room.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{room.code}</h3>
                        <p className="text-sm text-slate-600 mb-2">{room.name}</p>
                        <div className="text-xs text-slate-500 space-y-1">
                          <p>Building: {room.building}</p>
                          <p>Capacity: {room.capacity} students</p>
                          <p>Hours: {room.available_hours}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.room && <p className="text-sm text-red-600 mt-1">{errors.room}</p>}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {step2Data.room && (
                <Button onClick={handleStep2Next}>
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Equipment */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Equipment</CardTitle>
              <CardDescription>Choose equipment type and specific unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="equipmentType">Equipment Type</Label>
                <select
                  id="equipmentType"
                  value={step3Data.equipmentType}
                  onChange={(e) => setStep3Data(prev => ({ 
                    ...prev, 
                    equipmentType: e.target.value,
                    equipmentUnit: '' // Reset unit selection
                  }))}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select equipment type</option>
                  {equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.category}
                    </option>
                  ))}
                </select>
                {errors.equipmentType && <p className="text-sm text-red-600 mt-1">{errors.equipmentType}</p>}
              </div>

              {step3Data.equipmentType && (
                <div>
                  <Label>Available Units</Label>
                  <div className="grid md:grid-cols-2 gap-3 mt-2">
                    {availableUnits.map((unit) => (
                      <Card
                        key={unit.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          step3Data.equipmentUnit === unit.id
                            ? 'ring-2 ring-purple-500 bg-purple-50'
                            : 'hover:bg-slate-50'
                        )}
                        onClick={() => setStep3Data(prev => ({ ...prev, equipmentUnit: unit.id }))}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{unit.asset_tag}</div>
                              <div className="text-xs text-slate-500">
                                {equipmentTypes.find(t => t.id === unit.equipment_type_id)?.name}
                              </div>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {availableUnits.length === 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                      No units available for this equipment type in the selected room.
                    </p>
                  )}
                  {errors.equipmentUnit && <p className="text-sm text-red-600 mt-1">{errors.equipmentUnit}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={step3Data.notes}
                  onChange={(e) => setStep3Data(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special requirements or notes"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lab Policy:</strong> One equipment type per hour. Equipment must be returned in the same condition.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your lab booking details</CardDescription>
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
                  <div className="text-sm text-slate-600 mb-1">Lab Room</div>
                  <div className="font-medium">{selectedRoom?.code} - {selectedRoom?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Equipment</div>
                  <div className="font-medium">
                    {equipmentTypes.find(t => t.id === step3Data.equipmentType)?.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Unit</div>
                  <div className="font-medium">
                    {equipmentUnits.find(u => u.id === step3Data.equipmentUnit)?.asset_tag}
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
              Your lab equipment has been successfully reserved. Here is your attendance code:
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