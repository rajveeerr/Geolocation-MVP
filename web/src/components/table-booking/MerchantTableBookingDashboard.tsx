import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  Settings, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  List,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  useMerchantTables, 
  useCreateTable, 
  useUpdateTable, 
  useDeleteTable,
  useMerchantTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  useMerchantBookings,
  useUpdateBookingStatus,
  useMerchantBookingSettings,
  useUpdateMerchantBookingSettings,
  useFilteredMerchantBookings
} from '@/hooks/useTableBooking';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { WeeklyScheduleGrid } from './WeeklyScheduleGrid';
import { BookingCalendarView } from './BookingCalendarView';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const MerchantTableBookingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);
  
  // Booking filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'table' | 'calendar'>('table');

  // Get merchant ID
  const { data: merchantData } = useMerchantStatus();
  const merchantId = merchantData?.data?.merchant?.id;

  // Table management
  const { data: tablesData, isLoading: isLoadingTables } = useMerchantTables(merchantId);
  const tables = tablesData?.tables || [];
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();

  // Time slot management
  const { data: timeSlotsData, isLoading: isLoadingTimeSlots } = useMerchantTimeSlots();
  const timeSlots = timeSlotsData?.timeSlots || [];
  const createTimeSlotMutation = useCreateTimeSlot();
  const updateTimeSlotMutation = useUpdateTimeSlot();
  const deleteTimeSlotMutation = useDeleteTimeSlot();

  // Booking management
  const { data: bookings, isLoading: isLoadingBookings } = useFilteredMerchantBookings(
    merchantId || 0,
    {
      status: statusFilter === 'all' ? undefined : statusFilter,
      startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    }
  );
  const updateBookingStatusMutation = useUpdateBookingStatus();

  // Settings management
  const { data: settings, isLoading: isLoadingSettings } = useMerchantBookingSettings();
  const updateSettingsMutation = useUpdateMerchantBookingSettings();

  // Table form state
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: 2,
    description: '',
  });

  // Time slot form state
  const [timeSlotForm, setTimeSlotForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    duration: 60, // Default 60 minutes
    maxBookings: 1, // Default 1 booking per slot
  });

  // Calculate stats
  const todayBookings = bookings?.bookings?.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }) || [];

  const upcomingBookings = bookings?.bookings?.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return bookingDate >= today && bookingDate <= nextWeek;
  }) || [];

  const pendingBookings = bookings?.bookings?.filter(booking => booking.status === 'PENDING') || [];

  const stats = {
    todayBookings: todayBookings.length,
    upcomingBookings: upcomingBookings.length,
    pendingBookings: pendingBookings.length,
    totalBookings: bookings?.bookings?.length || 0,
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    advanceBookingDays: 30,
    cancellationHours: 24,
    maxPartySize: 20,
    minPartySize: 1,
    autoConfirmBookings: false,
    requireDeposit: false,
    depositAmount: 0,
    depositPercentage: 0,
  });

  // Initialize settings form when data loads
  useState(() => {
    if (settings) {
      setSettingsForm({
        advanceBookingDays: settings.advanceBookingDays,
        cancellationHours: settings.cancellationHours,
        maxPartySize: settings.maxPartySize,
        minPartySize: settings.minPartySize,
        isBookingEnabled: settings.isBookingEnabled,
        autoConfirmBookings: settings.autoConfirmBookings,
        requireDeposit: settings.requireDeposit,
        depositAmount: settings.depositAmount || 0,
        depositPercentage: settings.depositPercentage || 0,
      });
    }
  }, [settings]);

  const handleCreateTable = async () => {
    try {
      await createTableMutation.mutateAsync(tableForm);
      setTableForm({ name: '', capacity: 2, description: '' });
      setIsTableDialogOpen(false);
      toast.success('Table created successfully');
    } catch (error) {
      toast.error('Failed to create table');
    }
  };

  const handleUpdateTable = async () => {
    if (!editingTable) return;
    try {
      await updateTableMutation.mutateAsync({
        tableId: editingTable.id,
        data: tableForm,
      });
      setEditingTable(null);
      setTableForm({ name: '', capacity: 2, description: '' });
      setIsTableDialogOpen(false);
      toast.success('Table updated successfully');
    } catch (error) {
      toast.error('Failed to update table');
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTableMutation.mutateAsync(tableId);
        toast.success('Table deleted successfully');
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  const handleCreateTimeSlot = async () => {
    try {
      await createTimeSlotMutation.mutateAsync(timeSlotForm);
      setTimeSlotForm({ 
        dayOfWeek: 1, 
        startTime: '09:00', 
        endTime: '17:00',
        duration: 60,
        maxBookings: 1
      });
      setIsTimeSlotDialogOpen(false);
      toast.success('Time slot created successfully');
    } catch (error) {
      toast.error('Failed to create time slot');
    }
  };

  const handleUpdateTimeSlot = async () => {
    if (!editingTimeSlot) return;
    try {
      await updateTimeSlotMutation.mutateAsync({
        timeSlotId: editingTimeSlot.id,
        data: timeSlotForm,
      });
      setEditingTimeSlot(null);
      setTimeSlotForm({ 
        dayOfWeek: 1, 
        startTime: '09:00', 
        endTime: '17:00',
        duration: 60,
        maxBookings: 1
      });
      setIsTimeSlotDialogOpen(false);
      toast.success('Time slot updated successfully');
    } catch (error) {
      toast.error('Failed to update time slot');
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId: number) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      try {
        await deleteTimeSlotMutation.mutateAsync(timeSlotId);
        toast.success('Time slot deleted successfully');
      } catch (error) {
        toast.error('Failed to delete time slot');
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await updateBookingStatusMutation.mutateAsync({
        bookingId,
        data: { status: status as any },
      });
      toast.success('Booking status updated successfully');
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(settingsForm);
      setIsSettingsDialogOpen(false);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: AlertCircle, label: 'Pending' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmed' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, label: 'Cancelled' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      no_show: { variant: 'destructive' as const, icon: XCircle, label: 'No Show' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Table Booking Management</h1>
          <p className="text-muted-foreground">
            Manage your tables, time slots, bookings, and settings
          </p>
        </div>
        <Button onClick={() => setIsSettingsDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="time-slots">Time Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
                    <p className="text-2xl font-bold">{stats.todayBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming (7 days)</p>
                    <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tables</p>
                    <p className="text-2xl font-bold">{tables.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {todayBookings.length > 0 ? (
                <div className="space-y-3">
                  {todayBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</p>
                          <p className="text-sm text-muted-foreground">{booking.table.name} • {booking.partySize} people</p>
                        </div>
                      </div>
                      <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No bookings scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => setActiveTab('tables')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Table
                </Button>
                <Button onClick={() => setActiveTab('time-slots')} variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Configure Time Slots
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookings?.bookings?.slice(0, 3).map(booking => (
                    <div key={booking.id} className="text-sm">
                      <p className="font-medium">{booking.table.name}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.bookingDate), 'MMM dd')} at {booking.timeSlot.startTime}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tables</CardTitle>
                  <CardDescription>
                    Manage your restaurant tables and their capacities
                  </CardDescription>
                </div>
                <Button onClick={() => setIsTableDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTables ? (
                <div className="text-center py-8">Loading tables...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables?.map((table) => (
                      <TableRow key={table.id}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {table.capacity}
                          </div>
                        </TableCell>
                        <TableCell>{table.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={table.isActive ? 'default' : 'secondary'}>
                            {table.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTable(table);
                                setTableForm({
                                  name: table.name,
                                  capacity: table.capacity,
                                  description: table.description || '',
                                });
                                setIsTableDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTable(table.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Slots Tab */}
        <TabsContent value="time-slots" className="space-y-4">
          <WeeklyScheduleGrid
            timeSlots={timeSlots}
            onEdit={(slot) => {
              setEditingTimeSlot(slot);
              setTimeSlotForm({
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                duration: slot.duration,
                maxBookings: slot.maxBookings,
              });
              setIsTimeSlotDialogOpen(true);
            }}
            onDelete={handleDeleteTimeSlot}
            onCreate={(dayOfWeek, time) => {
              setTimeSlotForm({
                dayOfWeek,
                startTime: time,
                endTime: time, // Will be set in dialog
                duration: 60,
                maxBookings: 1,
              });
              setIsTimeSlotDialogOpen(true);
            }}
          />
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />

            <Button variant="outline" onClick={() => {/* Export functionality */}}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={view === 'table' ? 'default' : 'outline'}
              onClick={() => setView('table')}
            >
              <List className="h-4 w-4 mr-2" />
              Table View
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              onClick={() => setView('calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div>

          {/* Table View */}
          {view === 'table' && (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.bookings?.map(booking => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</div>
                            <div className="text-sm text-muted-foreground">{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.contactName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{booking.contactEmail || booking.contactPhone || 'No contact info'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.partySize}
                          </div>
                        </TableCell>
                        <TableCell>{booking.table.name}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Calendar View */}
          {view === 'calendar' && (
            <BookingCalendarView
              bookings={bookings?.bookings || []}
              onDateClick={(date) => {
                // Handle date click - could filter bookings for that date
                console.log('Date clicked:', date);
              }}
              onBookingClick={(booking) => {
                // Handle booking click - could open booking details
                console.log('Booking clicked:', booking);
              }}
            />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Configure your booking policies and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Advance Booking Settings */}
              <div>
                <Label>Advance Booking Days</Label>
                <Input
                  type="number"
                  value={settingsForm.advanceBookingDays}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, advanceBookingDays: parseInt(e.target.value) || 30 }))}
                />
                <p className="text-sm text-muted-foreground">
                  How many days in advance customers can book
                </p>
              </div>

              {/* Party Size Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Party Size</Label>
                  <Input 
                    type="number" 
                    value={settingsForm.minPartySize}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, minPartySize: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Max Party Size</Label>
                  <Input 
                    type="number" 
                    value={settingsForm.maxPartySize}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, maxPartySize: parseInt(e.target.value) || 20 }))}
                  />
                </div>
              </div>

              {/* Cancellation Policy */}
              <div>
                <Label>Cancellation Hours</Label>
                <Input
                  type="number"
                  value={settingsForm.cancellationHours}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, cancellationHours: parseInt(e.target.value) || 24 }))}
                />
                <p className="text-sm text-muted-foreground">
                  Hours before booking when cancellation is allowed
                </p>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Confirm Bookings</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically confirm without manual approval
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.autoConfirmBookings}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, autoConfirmBookings: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">
                      Require a deposit for bookings
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.requireDeposit}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, requireDeposit: checked }))}
                  />
                </div>
              </div>

              <Button onClick={() => {/* Save settings */}}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </DialogTitle>
            <DialogDescription>
              {editingTable ? 'Update table information' : 'Create a new table for your restaurant'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={tableForm.name}
                onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                placeholder="e.g., Table 1, Window Table, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableCapacity">Capacity</Label>
              <Input
                id="tableCapacity"
                type="number"
                min="1"
                max="20"
                value={tableForm.capacity}
                onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableDescription">Description (Optional)</Label>
              <Textarea
                id="tableDescription"
                value={tableForm.description}
                onChange={(e) => setTableForm({ ...tableForm, description: e.target.value })}
                placeholder="e.g., Near the window, quiet corner, etc."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsTableDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={editingTable ? handleUpdateTable : handleCreateTable}
                className="flex-1"
                disabled={!tableForm.name || tableForm.capacity < 1}
              >
                {editingTable ? 'Update Table' : 'Create Table'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Slot Dialog */}
      <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTimeSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
            </DialogTitle>
            <DialogDescription>
              {editingTimeSlot ? 'Update time slot information' : 'Create a new time slot for bookings'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={timeSlotForm.dayOfWeek.toString()}
                onValueChange={(value) => setTimeSlotForm({ ...timeSlotForm, dayOfWeek: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={timeSlotForm.startTime}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={timeSlotForm.endTime}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={timeSlotForm.duration}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, duration: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBookings">Max Bookings per Slot</Label>
                <Input
                  id="maxBookings"
                  type="number"
                  min="1"
                  max="10"
                  value={timeSlotForm.maxBookings}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, maxBookings: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsTimeSlotDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={editingTimeSlot ? handleUpdateTimeSlot : handleCreateTimeSlot}
                className="flex-1"
                disabled={!timeSlotForm.startTime || !timeSlotForm.endTime || !timeSlotForm.duration || !timeSlotForm.maxBookings}
              >
                {editingTimeSlot ? 'Update Time Slot' : 'Create Time Slot'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Settings</DialogTitle>
            <DialogDescription>
              Configure your table booking preferences and policies
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                <Input
                  id="advanceBookingDays"
                  type="number"
                  min="1"
                  max="365"
                  value={settingsForm.advanceBookingDays}
                  onChange={(e) => setSettingsForm({ ...settingsForm, advanceBookingDays: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationHours">Cancellation Hours</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  min="1"
                  max="168"
                  value={settingsForm.cancellationHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cancellationHours: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPartySize">Minimum Party Size</Label>
                <Input
                  id="minPartySize"
                  type="number"
                  min="1"
                  max="20"
                  value={settingsForm.minPartySize}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minPartySize: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPartySize">Maximum Party Size</Label>
                <Input
                  id="maxPartySize"
                  type="number"
                  min="1"
                  max="50"
                  value={settingsForm.maxPartySize}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxPartySize: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isBookingEnabled">Enable Bookings</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to book tables
                  </p>
                </div>
                <Switch
                  id="isBookingEnabled"
                  checked={settingsForm.isBookingEnabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, isBookingEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoConfirmBookings">Auto-Confirm Bookings</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically confirm bookings without manual approval
                  </p>
                </div>
                <Switch
                  id="autoConfirmBookings"
                  checked={settingsForm.autoConfirmBookings}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoConfirmBookings: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireDeposit">Require Deposit</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a deposit for bookings
                  </p>
                </div>
                <Switch
                  id="requireDeposit"
                  checked={settingsForm.requireDeposit}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, requireDeposit: checked })}
                />
              </div>
            </div>
            {settingsForm.requireDeposit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settingsForm.depositAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, depositAmount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.depositPercentage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, depositPercentage: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings} className="flex-1">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
