import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpecialEventPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (theme: string) => void;
  initialTheme?: string;
}

export const SpecialEventPromptDialog = ({ isOpen, onClose, onConfirm, initialTheme = '' }: SpecialEventPromptDialogProps) => {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const handleConfirm = () => {
    if (theme.trim()) {
      onConfirm(theme.trim());
      setTheme('');
    }
  };

  const handleClose = () => {
    setTheme('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="border-neutral-700 bg-neutral-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Enter event theme (e.g., "March Madness", "Valentine's Day"):
          </DialogTitle>
        </DialogHeader>
        <Input
          className="border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500"
          placeholder="Enter theme name..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-neutral-400" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm} disabled={!theme.trim()}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
