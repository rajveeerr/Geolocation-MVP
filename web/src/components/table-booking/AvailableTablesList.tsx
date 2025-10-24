import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, MapPin, Calendar } from 'lucide-react';
import { TableBookingModal } from './TableBookingModal';
import { useMerchantAvailability } from '@/hooks/useTableBooking';
import { format } from 'date-fns';

interface Table {
  tableId: number;
  tableName: string;
  capacity: number;
  location?: string;
  features?: string[];
}

interface AvailableTablesListProps {
  merchantId: number;
  merchantName: string;
  tables?: Table[];
}

export const AvailableTablesList = ({ merchantId, merchantName, tables }: AvailableTablesListProps) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate] = useState(new Date());

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  // Fetch availability from backend
  const { data: availability, isLoading } = useMerchantAvailability(
    merchantId,
    format(selectedDate, 'yyyy-MM-dd'),
    2 // Default party size
  );

  // Mock table data - fallback when no real data is available
  const mockTables: Table[] = [
    {
      tableId: 1,
      tableName: "Window Table",
      capacity: 4,
      location: "Near the window",
      features: ["Window view", "Quiet"]
    },
    {
      tableId: 2,
      tableName: "Booth #1",
      capacity: 6,
      location: "Main dining area",
      features: ["Private", "Comfortable seating"]
    },
    {
      tableId: 3,
      tableName: "Bar Table",
      capacity: 2,
      location: "Bar area",
      features: ["Bar view", "High-top seating"]
    },
    {
      tableId: 4,
      tableName: "Family Table",
      capacity: 8,
      location: "Center of restaurant",
      features: ["Large table", "Family-friendly"]
    },
    {
      tableId: 5,
      tableName: "Outdoor Table",
      capacity: 4,
      location: "Patio",
      features: ["Outdoor seating", "Fresh air"]
    }
  ];

  // Use real data from API if available, otherwise use mock data
  const tablesToShow = availability?.availableTables?.length > 0 
    ? availability.availableTables.map(table => ({
        tableId: table.id,
        tableName: table.name,
        capacity: table.capacity,
        location: "Restaurant",
        features: table.features || []
      }))
    : tables && tables.length > 0 
    ? tables 
    : mockTables;

  // Debug logging
  console.log('AvailableTablesList - merchantId:', merchantId);
  console.log('AvailableTablesList - availability:', availability);
  console.log('AvailableTablesList - availability.availableTables:', availability?.availableTables);
  console.log('AvailableTablesList - tablesToShow:', tablesToShow);
  console.log('AvailableTablesList - isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Available Tables</h3>
          <p className="text-sm text-neutral-600">Loading tables...</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-neutral-800 mb-1">Available Tables</h3>
          <p className="text-sm text-neutral-600">Select a table to make a reservation</p>
        </div>
        
        {tablesToShow.map((table) => (
          <div 
            key={table.tableId} 
            className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors duration-200"
            onClick={() => handleTableSelect(table)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-neutral-800 truncate">
                  {table.tableName}
                </h4>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  <Users className="h-3 w-3 mr-1" />
                  {table.capacity}
                </Badge>
              </div>
              {table.location && (
                <p className="text-xs text-neutral-600 truncate">
                  {table.location}
                </p>
              )}
              {table.features && table.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {table.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {table.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{table.features.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              className="ml-3 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleTableSelect(table);
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Book
            </Button>
          </div>
        ))}
        
        {tablesToShow.length === 0 && (
          <div className="text-center py-8">
            <div className="text-neutral-400 mb-2">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Tables Available</h3>
            <p className="text-sm text-neutral-500">
              {availability?.availableTables?.length === 0 
                ? "This restaurant hasn't set up table reservations yet. Please contact them directly."
                : "All tables are currently booked. Please try a different time or date."
              }
            </p>
          </div>
        )}
      </div>

      {selectedTable && (
        <TableBookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          merchantId={merchantId}
          merchantName={merchantName}
          preselectedTable={selectedTable}
        />
      )}
    </>
  );
};
