import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCalendar } from './EnhancedCalendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, MapPin, Phone, Mail, User, MessageSquare, Calendar } from 'lucide-react';
import { useMerchantAvailability, useCreateBooking } from '@/hooks/useTableBooking';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Table {
  tableId: number;
  tableName: string;
  capacity: number;
  location?: string;
  features?: string[];
}

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: number;
  merchantName: string;
  preselectedTable?: Table;
  preselectedTimeSlot?: any;
}

export const TableBookingModal = ({ isOpen, onClose, merchantId, merchantName, preselectedTable, preselectedTimeSlot }: TableBookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | undefined>();
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setPartySize(2);
      setSelectedTimeSlotId(preselectedTimeSlot?.id);
      setSelectedTableId(preselectedTable?.tableId);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setSpecialRequests('');
    }
  }, [isOpen, preselectedTable, preselectedTimeSlot]);

  // Fetch availability for selected date
  const { data: availability, isLoading: isLoadingAvailability } = useMerchantAvailability(
    merchantId,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );


  // Create booking mutation
  const createBookingMutation = useCreateBooking();

  const handleBooking = async () => {
    try {
      if (!selectedDate || !selectedTimeSlotId || !selectedTableId) {
        toast.error('Please select a date, time slot, and table');
        return;
      }

      if (!contactName || !contactEmail || !contactPhone) {
        toast.error('Please fill in all contact information');
        return;
      }

      if (!merchantId) {
        toast.error('Merchant information is missing');
        return;
      }

      await createBookingMutation.mutateAsync({
        tableId: selectedTableId,
        timeSlotId: selectedTimeSlotId,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        partySize,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || undefined,
      });

      toast.success('Booking created successfully!');
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  const isBookingLoading = createBookingMutation.isPending;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Book a Table at {merchantName}
          </DialogTitle>
          <DialogDescription>
            Select your preferred date, party size, and time slot to make a reservation.
          </DialogDescription>
        </DialogHeader>

          {/* Top Bar - Always Visible Parameters */}
          <div className="bg-white z-10 border-b p-4">
          <div className="flex gap-4 items-center">
            {/* Party Size */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                className="h-8 w-8 p-0 hover:bg-neutral-100 disabled:opacity-50"
                disabled={partySize <= 1}
              >
                -
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {partySize} {partySize === 1 ? 'guest' : 'guests'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                className="h-8 w-8 p-0 hover:bg-neutral-100 disabled:opacity-50"
                disabled={partySize >= 20}
              >
                +
              </Button>
            </div>
            
            {/* Selected Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-600" />
              <span className="text-sm font-medium">
                {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select date'}
              </span>
              <div className="flex flex-col">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-3 w-3 p-0 hover:bg-neutral-200"
                  onClick={() => {
                    if (selectedDate) {
                      const nextDay = new Date(selectedDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setSelectedDate(nextDay);
                      setSelectedTimeSlotId(undefined);
                    }
                  }}
                >
                  ▲
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-3 w-3 p-0 hover:bg-neutral-200"
                  onClick={() => {
                    if (selectedDate) {
                      const prevDay = new Date(selectedDate);
                      prevDay.setDate(prevDay.getDate() - 1);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (prevDay >= today) {
                        setSelectedDate(prevDay);
                        setSelectedTimeSlotId(undefined);
                      }
                    }
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>
            
            {/* Selected Time (if any) */}
            {selectedTimeSlotId && availability?.availableTimeSlots && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-600" />
                <span className="text-sm font-medium">
                  {(() => {
                    const selectedSlot = availability.availableTimeSlots.find(slot => slot.id === selectedTimeSlotId);
                    return selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Select time';
                  })()}
                </span>
                <div className="flex flex-col">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-3 w-3 p-0 hover:bg-neutral-200"
                    onClick={() => {
                      if (availability?.availableTimeSlots && availability.availableTimeSlots.length > 0) {
                        const currentIndex = availability.availableTimeSlots.findIndex(slot => slot.id === selectedTimeSlotId);
                        let nextIndex;
                        if (currentIndex === -1) {
                          nextIndex = 0;
                        } else {
                          nextIndex = (currentIndex + 1) % availability.availableTimeSlots.length;
                        }
                        setSelectedTimeSlotId(availability.availableTimeSlots[nextIndex].id);
                        setSelectedTableId(undefined);
                      }
                    }}
                    disabled={!availability?.availableTimeSlots || availability.availableTimeSlots.length === 0}
                  >
                    ▲
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-3 w-3 p-0 hover:bg-neutral-200"
                    onClick={() => {
                      if (availability?.availableTimeSlots && availability.availableTimeSlots.length > 0) {
                        const currentIndex = availability.availableTimeSlots.findIndex(slot => slot.id === selectedTimeSlotId);
                        let prevIndex;
                        if (currentIndex === -1) {
                          prevIndex = availability.availableTimeSlots.length - 1;
                        } else {
                          prevIndex = currentIndex === 0 ? availability.availableTimeSlots.length - 1 : currentIndex - 1;
                        }
                        setSelectedTimeSlotId(availability.availableTimeSlots[prevIndex].id);
                        setSelectedTableId(undefined);
                      }
                    }}
                    disabled={!availability?.availableTimeSlots || availability.availableTimeSlots.length === 0}
                  >
                    ▼
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Step 1: Calendar (Primary) */}
          <section>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Select Date</h3>
            <EnhancedCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSelectedTimeSlotId(undefined);
                setSelectedTableId(undefined);
              }}
              disabledDates={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="w-full"
            />
          </section>

          {/* Step 2: Time Slots (Auto-show when date selected) */}
          {selectedDate && (
            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Available Time Slots</h3>
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-neutral-500">Loading availability...</div>
                </div>
              ) : availability?.availableTimeSlots.length ? (
                <div className="grid grid-cols-3 gap-3">
                  {availability.availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlotId === slot.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedTimeSlotId(slot.id);
                        setSelectedTableId(undefined); // Reset table selection
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 h-12 text-sm font-medium",
                        selectedTimeSlotId === slot.id 
                          ? "bg-orange-600 text-white hover:bg-orange-700" 
                          : "hover:bg-orange-50 border-orange-200"
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{slot.startTime}</span>
                        <span className="text-xs text-neutral-500">{slot.availableSpots} spots</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                  <p>No time slots available for this date</p>
                </div>
              )}
            </section>
          )}

          {/* Step 3: Table Selection (Auto-show when time selected) */}
          {selectedTimeSlotId && availability?.availableTables && (
            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Choose Your Table</h3>
              {(() => {
                const availableTables = availability.availableTables.filter(
                  table => table.capacity >= partySize
                );
                
                return availableTables.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {availableTables.map((table) => (
                      <Button
                        key={table.id}
                        variant={selectedTableId === table.id ? "default" : "outline"}
                        onClick={() => setSelectedTableId(table.id)}
                        className={cn(
                          "flex items-center justify-start gap-3 h-16 text-sm font-medium",
                          selectedTableId === table.id 
                            ? "bg-orange-600 text-white hover:bg-orange-700" 
                            : "hover:bg-orange-50 border-orange-200"
                        )}
                      >
                        <Users className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{table.name}</span>
                          <span className="text-xs text-neutral-500">Up to {table.capacity} people</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                    <p>No tables available for {partySize} people at this time</p>
                  </div>
                );
              })()}
            </section>
          )}

          {/* Step 4: Contact Info (Collapsible Card) */}
          {selectedTableId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>
                  We'll use this information to confirm your booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests or dietary requirements?"
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Booking Summary */}
          {selectedDate && selectedTimeSlotId && selectedTableId && contactName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{(() => {
                    const selectedSlot = availability?.availableTimeSlots?.find(slot => slot.id === selectedTimeSlotId);
                    return selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '';
                  })()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party Size:</span>
                  <span>{partySize} {partySize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table:</span>
                  <span>{availability?.availableTables?.find(t => t.id === selectedTableId)?.name}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border-t p-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={isBookingLoading || !selectedTimeSlotId || !selectedTableId || !contactName || !contactEmail || !contactPhone}
            className="flex-1"
          >
            {isBookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};