import { useState } from 'react';
import { CreateMenuPanel } from './CreateMenuPanel';
import { YourMenusPanel } from './YourMenusPanel';
import { StandardMenuCreationModal } from './StandardMenuCreationModal';
import { HappyHourMenuCreationModal } from './HappyHourMenuCreationModal';
import { SpecialEventPromptDialog } from './SpecialEventPromptDialog';
import type { MenuType, HappyHourPreset } from './types';
import type { ParsedMenuCollection } from '@/hooks/useStoreMenuCollections';

interface MenuTabContentProps {
  storeId: number | null;
}

export const MenuTabContent = ({ storeId }: MenuTabContentProps) => {
  // Standard menu modal
  const [standardModalOpen, setStandardModalOpen] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | null>(null);
  const [eventTheme, setEventTheme] = useState<string | undefined>();

  // Happy hour modal
  const [happyHourModalOpen, setHappyHourModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<HappyHourPreset | null>(null);

  // Special event prompt
  const [eventPromptOpen, setEventPromptOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState('');

  const handleCreateStandardMenu = (menuType: MenuType) => {
    setSelectedMenuType(menuType);
    setEventTheme(undefined);
    setStandardModalOpen(true);
  };

  const handleCreateHappyHour = (preset: HappyHourPreset) => {
    setSelectedPreset(preset);
    setHappyHourModalOpen(true);
  };

  const handleCreateEventMenu = (theme?: string) => {
    if (theme) {
      setPendingTheme(theme);
    } else {
      setPendingTheme('');
    }
    setEventPromptOpen(true);
  };

  const handleEventThemeConfirm = (theme: string) => {
    setEventPromptOpen(false);
    setSelectedMenuType('daily');
    setEventTheme(theme);
    setStandardModalOpen(true);
  };

  const handleEditMenu = (collection: ParsedMenuCollection) => {
    // For edit, we reopen the appropriate modal
    // For now, open standard modal as a generic editor
    const meta = collection.parsedMetadata;
    if (meta?.menuType === 'happy_hour' && meta.happyHourPreset) {
      setSelectedPreset(meta.happyHourPreset);
      setHappyHourModalOpen(true);
    } else if (meta?.menuType === 'special_event') {
      setSelectedMenuType('daily');
      setEventTheme(meta.eventTheme || collection.name);
      setStandardModalOpen(true);
    } else {
      setSelectedMenuType((meta?.menuType as MenuType) || 'daily');
      setEventTheme(undefined);
      setStandardModalOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CreateMenuPanel
          onCreateStandardMenu={handleCreateStandardMenu}
          onCreateHappyHour={handleCreateHappyHour}
          onCreateEventMenu={handleCreateEventMenu}
        />
        <YourMenusPanel storeId={storeId} onEditMenu={handleEditMenu} />
      </div>

      {/* Modals */}
      <StandardMenuCreationModal
        isOpen={standardModalOpen}
        onClose={() => setStandardModalOpen(false)}
        menuType={selectedMenuType}
        storeId={storeId}
        eventTheme={eventTheme}
      />

      <HappyHourMenuCreationModal
        isOpen={happyHourModalOpen}
        onClose={() => setHappyHourModalOpen(false)}
        preset={selectedPreset}
        storeId={storeId}
      />

      <SpecialEventPromptDialog
        isOpen={eventPromptOpen}
        onClose={() => setEventPromptOpen(false)}
        onConfirm={handleEventThemeConfirm}
        initialTheme={pendingTheme}
      />
    </>
  );
};
