/**
 * "Is the pin in the right spot?" - Airbnb style.
 * Drag the map to reposition the pin for precise placement.
 */
import { MapPin } from 'lucide-react';
import { StoreLocationMap } from './StoreLocationMap';

interface StoreWizardData {
  address?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface StorePinLocationStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export const StorePinLocationStep = ({ data, onUpdate }: StorePinLocationStepProps) => {
  const mapCenter =
    data.latitude != null && data.longitude != null
      ? { lat: data.latitude, lng: data.longitude }
      : DEFAULT_CENTER;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Is the pin in the right spot?</h2>
        <p className="mt-1 text-neutral-600">
          Your address is only shared with customers after they save or check in to your deals.
        </p>
      </div>

      {/* Address bar (Airbnb style) */}
      {data.address && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <MapPin className="h-5 w-5 flex-shrink-0 text-neutral-500" />
          <p className="text-sm font-medium text-neutral-800 line-clamp-2">{data.address}</p>
        </div>
      )}

      {/* Map with drag instruction */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200">
        <StoreLocationMap
          center={mapCenter}
          onLocationChange={(coords) =>
            onUpdate({ latitude: coords.lat, longitude: coords.lng })
          }
          draggable={true}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Drag the map to reposition the pin
        </div>
      </div>
    </div>
  );
}
