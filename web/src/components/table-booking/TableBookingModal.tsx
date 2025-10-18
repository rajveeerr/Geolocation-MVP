import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/Calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { useMerchantAvailability, useCreateBooking } from '@/hooks/useTableBooking';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: number;
  merchantName: string;
}

export const TableBookingModal = ({ isOpen, onClose, merchantId, merchantName }: TableBookingModalProps) => {
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
      setSelectedTimeSlotId(undefined);
      setSelectedTableId(undefined);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setSpecialRequests('');
    }
  }, [isOpen]);

  // Fetch availability for selected date
  const { data: availability, isLoading: isLoadingAvailability } = useMerchantAvailability(
    merchantId,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );

  // Create booking mutation
  const createBookingMutation = useCreateBooking();

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlotId || !selectedTableId) {
      toast.error('Please select a date, time slot, and table');
      return;
    }

    if (!contactName || !contactEmail || !contactPhone) {
      toast.error('Please fill in all contact information');
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        merchantId,
        tableId: selectedTableId,
        timeSlotId: selectedTimeSlotId,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        partySize,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || undefined,
      });

      toast.success('Booking created successfully!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  const isBookingLoading = createBookingMutation.isPending;

  // Get available tables for selected time slot
  const selectedTimeSlot = availability?.availableTimeSlots.find(
    slot => slot.timeSlotId === selectedTimeSlotId
  );

  const availableTables = selectedTimeSlot?.availableTables.filter(
    table => table.capacity >= partySize
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Book a Table at {merchantName}
          </DialogTitle>
          <DialogDescription>
            Select your preferred date, party size, and time slot to make a reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border"
            />
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label htmlFor="partySize">Party Size</Label>
            <Select 
              value={partySize.toString()} 
              onValueChange={(value) => setPartySize(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select party size" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} {size === 1 ? 'person' : 'people'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              {isLoadingAvailability ? (
                <div className="text-sm text-muted-foreground">Loading availability...</div>
              ) : availability?.availableTimeSlots.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {availability.availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.timeSlotId}
                      variant={selectedTimeSlotId === slot.timeSlotId ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedTimeSlotId(slot.timeSlotId);
                        setSelectedTableId(undefined); // Reset table selection
                      }}
                      className="justify-start"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.startTime} - {slot.endTime}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No available time slots for this date</div>
              )}
            </div>
          )}

          {/* Table Selection */}
          {selectedTimeSlotId && (
            <div className="space-y-2">
              <Label>Available Tables</Label>
              {availableTables.length ? (
                <div className="grid grid-cols-1 gap-2">
                  {availableTables.map((table) => (
                    <Button
                      key={table.tableId}
                      variant={selectedTableId === table.tableId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTableId(table.tableId)}
                      className="justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {table.tableName} (up to {table.capacity} people)
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No tables available for {partySize} people at this time
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
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

          {/* Booking Summary */}
          {selectedDate && selectedTimeSlotId && selectedTableId && (
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
                  <span>{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party Size:</span>
                  <span>{partySize} {partySize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table:</span>
                  <span>{availableTables.find(t => t.tableId === selectedTableId)?.tableName}</span>
                </div>
                {availability?.bookingSettings && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        {availability.bookingSettings.advanceBookingDays} days advance booking
                      </Badge>
                      <Badge variant="secondary">
                        {availability.bookingSettings.cancellationHours}h cancellation notice
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};