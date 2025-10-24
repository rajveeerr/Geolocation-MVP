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
  MoreHorizontal
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
  useUpdateMerchantBookingSettings
} from '@/hooks/useTableBooking';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const MerchantTableBookingDashboard = () => {
  const [activeTab, setActiveTab] = useState('tables');
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<any>(null);

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
  const { data: bookings, isLoading: isLoadingBookings } = useMerchantBookings(merchantId);
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

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    advanceBookingDays: 30,
    cancellationHours: 24,
    maxPartySize: 20,
    minPartySize: 1,
    isBookingEnabled: true,
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
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="time-slots">Time Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Slots</CardTitle>
                  <CardDescription>
                    Manage your available booking time slots
                  </CardDescription>
                </div>
                <Button onClick={() => setIsTimeSlotDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTimeSlots ? (
                <div className="text-center py-8">Loading time slots...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots?.map((timeSlot) => (
                      <TableRow key={timeSlot.id}>
                        <TableCell className="font-medium">
                          {getDayName(timeSlot.dayOfWeek)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={timeSlot.isActive ? 'default' : 'secondary'}>
                            {timeSlot.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTimeSlot(timeSlot);
                                setTimeSlotForm({
                                  dayOfWeek: timeSlot.dayOfWeek,
                                  startTime: timeSlot.startTime,
                                  endTime: timeSlot.endTime,
                                  duration: timeSlot.duration || 60,
                                  maxBookings: timeSlot.maxBookings || 1,
                                });
                                setIsTimeSlotDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTimeSlot(timeSlot.id)}
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

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bookings</CardTitle>
                  <CardDescription>
                    Manage customer bookings and reservations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Party Size</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.bookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.contactName}</div>
                            <div className="text-sm text-muted-foreground">{booking.contactEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.partySize}
                          </div>
                        </TableCell>
                        <TableCell>{booking.table.name}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="no_show">No Show</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
