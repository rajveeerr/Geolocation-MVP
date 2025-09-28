import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const TabSelector = ({ tabs, activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className="inline-flex items-center rounded-full bg-neutral-100 p-1.5"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none',
            activeTab === tab.id ? 'text-white' : 'text-neutral-600 hover:bg-white/60'
          )}
          // keep a minimum width so tabs feel balanced
          style={{ minWidth: 110 }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-brand-primary-600 rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
