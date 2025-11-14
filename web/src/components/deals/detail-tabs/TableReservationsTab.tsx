// web/src/components/deals/detail-tabs/TableReservationsTab.tsx
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, ChefHat, UtensilsCrossed, Building2, User, Mail, Phone, MessageSquare } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { useMerchantAvailability, useCreateBooking } from '@/hooks/useTableBooking';
import { format } from 'date-fns';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/useAuth';

interface TableReservationsTabProps {
  deal: DetailedDeal;
}

const EXPERIENCE_OPTIONS = [
  { id: 'standard', label: 'Standard', description: 'Main dining room', icon: UtensilsCrossed },
  { id: 'bar', label: 'Bar Seating', description: 'Watch our chefs in action', icon: ChefHat },
  { id: 'patio', label: 'Patio', description: 'Outdoor dining with city views', icon: Building2 },
  { id: 'chefs-table', label: "Chef's Table", description: 'Exclusive 6-course tasting menu', price: '$150/person', icon: ChefHat },
];

export const TableReservationsTab = ({ deal }: TableReservationsTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [partySize, setPartySize] = useState(2);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedExperience, setSelectedExperience] = useState('standard');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const merchantId = deal.merchant.id;
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: availability, isLoading: isLoadingAvailability } = useMerchantAvailability(
    merchantId,
    dateString,
    partySize
  );

  const createBookingMutation = useCreateBooking();

  // Pre-fill contact information from user profile if available
  useEffect(() => {
    if (user) {
      if (user.name && !contactName) {
        setContactName(user.name);
      }
      if (user.email && !contactEmail) {
        setContactEmail(user.email);
      }
      // Note: Phone number is not typically in user profile, so we leave it empty
    }
  }, [user, contactName, contactEmail]);

  const handleCompleteReservation = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to make a reservation',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTimeSlotId || !selectedTableId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a date, time slot, and table',
        variant: 'destructive',
      });
      return;
    }

    if (!contactEmail || !contactPhone) {
      toast({
        title: 'Contact Information Required',
        description: 'Please fill in email and phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createBookingMutation.mutateAsync({
        tableId: selectedTableId,
        timeSlotId: selectedTimeSlotId,
        bookingDate: dateString,
        partySize,
        contactEmail,
        contactPhone,
        specialRequests: specialRequests || undefined,
      });

      toast({
        title: 'Reservation Complete!',
        description: result.message || `Booking confirmed! Confirmation code: ${result.booking?.confirmationCode || 'N/A'}. You'll earn 100 loyalty coins!`,
      });

      // Reset form after successful booking
      setSelectedTimeSlotId(null);
      setSelectedTableId(null);
      setSelectedDate(new Date());
      setPartySize(2);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setSpecialRequests('');
    } catch (error) {
      toast({
        title: 'Reservation Failed',
        description: error instanceof Error ? error.message : 'Failed to create reservation',
        variant: 'destructive',
      });
    }
  };

  // Generate calendar days
  const today = new Date();
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  // Get day of week name
  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };

  // Get month name
  const getMonthName = (date: Date) => {
    return format(date, 'MMM yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date & Party Size */}
        <div className="space-y-6">
          {/* Select Date */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="text-center mb-4">
                <p className="text-sm text-neutral-600">{getMonthName(selectedDate)}</p>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-neutral-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.slice(0, 35).map((date, idx) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                  const isPast = date < today && !isToday;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isPast) {
                          setSelectedDate(date);
                          setSelectedTimeSlotId(null); // Reset time when date changes
                          setSelectedTableId(null); // Reset table when date changes
                        }
                      }}
                      disabled={isPast}
                      className={cn(
                        'aspect-square rounded-lg text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-black text-white'
                          : isPast
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Party Size */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Party Size</h3>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPartySize(size);
                    // Reset table selection if current table can't accommodate new party size
                    if (selectedTableId) {
                      const selectedTable = availability?.availableTables.find(t => t.id === selectedTableId);
                      if (selectedTable && selectedTable.capacity < size) {
                        setSelectedTableId(null);
                      }
                    }
                  }}
                  className={cn(
                    'py-3 rounded-lg font-semibold transition-colors',
                    partySize === size
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Time Slots & Experience */}
        <div className="space-y-6">
          {/* Available Times */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Available Times
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              {format(selectedDate, 'EEEE, MMMM d')}
            </p>
            {isLoadingAvailability ? (
              <div className="text-center py-8 text-neutral-500">Loading availability...</div>
            ) : availability?.availableTimeSlots && availability.availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {availability.availableTimeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedTimeSlotId(slot.id);
                      setSelectedTableId(null); // Reset table selection when time changes
                    }}
                    className={cn(
                      'py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-colors',
                      selectedTimeSlotId === slot.id
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                    )}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No available time slots for this date
              </div>
            )}
          </div>

          {/* Choose Your Table */}
          {selectedTimeSlotId && availability?.availableTables && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Table</h3>
              {(() => {
                const availableTables = availability.availableTables.filter(
                  table => table.capacity >= partySize
                );
                
                return availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {availableTables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-colors',
                          selectedTableId === table.id
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          <div>
                            <p className="font-semibold">{table.name}</p>
                            <p className="text-sm opacity-80">Up to {table.capacity} people</p>
                            {table.features && table.features.length > 0 && (
                              <p className="text-xs opacity-60 mt-1">{table.features.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                    <p>No tables available for {partySize} people at this time</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Choose Your Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Your Experience</h3>
            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((exp) => {
                const Icon = exp.icon;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExperience(exp.id)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-colors',
                      selectedExperience === exp.id
                        ? 'border-black bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-neutral-600" />
                        <div>
                          <p className="font-semibold text-neutral-900">{exp.label}</p>
                          <p className="text-sm text-neutral-600">{exp.description}</p>
                          {exp.price && (
                            <p className="text-sm font-semibold text-neutral-900 mt-1">{exp.price}</p>
                          )}
                        </div>
                      </div>
                      {selectedExperience === exp.id && (
                        <Check className="h-5 w-5 text-black" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - Show when table is selected */}
      {selectedTableId && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <p className="text-sm text-neutral-600 mb-6">
            We'll use this information to confirm your booking
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-semibold">
                Full Name <span className="text-neutral-400 text-xs">(Optional)</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
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
              <Label htmlFor="contactEmail" className="text-sm font-semibold">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-semibold">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="text-sm font-semibold">
                Special Requests
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or dietary requirements?"
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Summary */}
      <div className="bg-neutral-900 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Reservation Summary</h3>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-neutral-400">Date:</span>
            <span className="font-semibold">{format(selectedDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Time:</span>
            <span className="font-semibold">
              {selectedTimeSlotId
                ? availability?.availableTimeSlots.find((s) => s.id === selectedTimeSlotId)?.startTime || 'Not selected'
                : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Table:</span>
            <span className="font-semibold">
              {selectedTableId
                ? availability?.availableTables.find((t) => t.id === selectedTableId)?.name || 'Not selected'
                : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Party Size:</span>
            <span className="font-semibold">{partySize} guests</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Experience:</span>
            <span className="font-semibold">
              {EXPERIENCE_OPTIONS.find((e) => e.id === selectedExperience)?.label || 'Standard'}
            </span>
          </div>
        </div>
        <Button
          onClick={handleCompleteReservation}
          disabled={
            !selectedTimeSlotId || 
            !selectedTableId || 
            !contactEmail || 
            !contactPhone || 
            createBookingMutation.isPending
          }
          className="w-full bg-white text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {createBookingMutation.isPending ? 'Processing...' : 'Complete Reservation'}
        </Button>
        <p className="text-sm text-neutral-400 text-center mt-3">
          You'll earn 100 loyalty coins for this reservation!
        </p>
      </div>
    </div>
  );
};

