import { Plus, Clock } from 'lucide-react';
import { HAPPY_HOUR_TEMPLATES } from './constants';
import type { HappyHourPreset } from './types';

interface HappyHourMenuCardsProps {
  onCreateHappyHour: (preset: HappyHourPreset) => void;
}

const presetColors: Record<HappyHourPreset, string> = {
  early_morning: 'bg-orange-500/20 border-orange-500/30',
  evening: 'bg-red-500/20 border-red-500/30',
  late_night: 'bg-purple-500/20 border-purple-500/30',
};

const presetIconColors: Record<HappyHourPreset, string> = {
  early_morning: 'text-orange-400',
  evening: 'text-red-400',
  late_night: 'text-purple-400',
};

export const HappyHourMenuCards = ({ onCreateHappyHour }: HappyHourMenuCardsProps) => {
  return (
    <div className="space-y-3">
      {HAPPY_HOUR_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onCreateHappyHour(template.id)}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all hover:brightness-110 ${presetColors[template.id]}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800/50">
            <Clock className={`h-6 w-6 ${presetIconColors[template.id]}`} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-white">{template.name}</h4>
            <p className="text-sm text-neutral-400">{template.description}</p>
          </div>
          <Plus className="h-5 w-5 text-neutral-400" />
        </button>
      ))}
    </div>
  );
};
