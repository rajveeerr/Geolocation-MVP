import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, MapPin, Calendar, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../common/Button';
import { Input } from '../ui/input';
import { useEffect } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchSchema = z.object({
  query: z.string().min(1, 'Please enter a search term'),
  date: z.string(), // For now, a simple string. Can be replaced with a date picker.
  guests: z.number().min(1),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      guests: 1,
    }
  });

  const onSubmit = (data: SearchFormValues) => {
    console.log('Search Submitted:', data);
    // Here you would typically trigger the search, e.g., navigate to a search results page
    // For now, we'll just log it and close the modal.
    onClose();
  };

  // Effect to handle the 'Escape' key to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl"
            // Stop clicks inside the modal from closing it
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-800">Find a Deal</h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full hover:bg-neutral-100"
                  aria-label="Close search modal"
                >
                  <X className="w-6 h-6 text-neutral-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* What */}
                <div>
                  <label className="text-sm font-semibold">What are you looking for?</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input {...register('query')} placeholder="e.g., Tacos, Happy Hour, Pizza" className="pl-10 h-12" />
                    {errors.query && <p className="text-red-500 text-xs mt-1">{errors.query.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* When */}
                  <div>
                    <label className="text-sm font-semibold">When?</label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <Input {...register('date')} placeholder="Select a date" className="pl-10 h-12" />
                    </div>
                  </div>
                  {/* Who */}
                  <div>
                    <label className="text-sm font-semibold">How many guests?</label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <Input {...register('guests', { valueAsNumber: true })} type="number" min="1" className="pl-10 h-12" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};