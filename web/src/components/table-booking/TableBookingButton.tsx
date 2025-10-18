import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { TableBookingModal } from './TableBookingModal';

interface TableBookingButtonProps {
  merchantId: number;
  merchantName: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const TableBookingButton = ({ 
  merchantId, 
  merchantName, 
  variant = 'default',
  size = 'default',
  className,
  children
}: TableBookingButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        onClick={handleOpenModal} 
        variant={variant}
        size={size}
        className={className}
      >
        {children || (
          <>
            <Calendar className="h-4 w-4 mr-2" />
            Book a Table
          </>
        )}
      </Button>
      
      <TableBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        merchantId={merchantId}
        merchantName={merchantName}
      />
    </>
  );
};