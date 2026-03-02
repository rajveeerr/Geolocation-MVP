/**
 * Confirm your address step - Airbnb style.
 * Prefilled from search result, fields for info we couldn't fetch.
 * Shows pin at bottom.
 */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { StoreLocationMap } from './StoreLocationMap';

interface StoreWizardData {
  address: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
  latitude?: number;
  longitude?: number;
  cityId?: number;
  [key: string]: unknown;
}

interface City {
  id: number;
  name: string;
  state: string;
}

interface StoreConfirmAddressStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: City[];
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function buildAddress(components: {
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
}): string {
  const parts = [
    components.addressStreet,
    components.addressCity,
    components.addressState,
    components.addressPostcode,
  ].filter(Boolean);
  return parts.join(', ') || '';
}

export const StoreConfirmAddressStep = ({ data, onUpdate }: StoreConfirmAddressStepProps) => {
  const handleComponentChange = (updates: Partial<StoreWizardData>) => {
    const next = { ...data, ...updates };
    const built = buildAddress(next);
    onUpdate({ ...updates, address: built || next.address || data.address });
  };
  const mapCenter =
    data.latitude != null && data.longitude != null
      ? { lat: data.latitude, lng: data.longitude }
      : DEFAULT_CENTER;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Confirm your address</h2>
        <p className="mt-1 text-neutral-600">
          Your address is only shared with customers after they save or check in to your deals.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm font-medium text-neutral-700">
            Street address
          </Label>
          <Input
            id="street"
            value={data.addressStreet ?? ''}
            onChange={(e) => handleComponentChange({ addressStreet: e.target.value })}
            placeholder="Flat, house number, building"
            className="h-12"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-neutral-700">
              City / Town
            </Label>
            <Input
              id="city"
              value={data.addressCity ?? ''}
              onChange={(e) => handleComponentChange({ addressCity: e.target.value })}
              placeholder="City or town"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-neutral-700">
              State / Region
            </Label>
            <Input
              id="state"
              value={data.addressState ?? ''}
              onChange={(e) => handleComponentChange({ addressState: e.target.value })}
              placeholder="State or region"
              className="h-12"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode" className="text-sm font-medium text-neutral-700">
            PIN / Postcode
          </Label>
          <Input
            id="postcode"
            value={data.addressPostcode ?? ''}
            onChange={(e) => handleComponentChange({ addressPostcode: e.target.value })}
            placeholder="PIN code or postal code"
            className="h-12"
          />
        </div>
      </div>

      {/* Map with pin */}
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-700">
          Your location on the map
        </p>
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <StoreLocationMap
            center={mapCenter}
            onLocationChange={(coords) =>
              onUpdate({ latitude: coords.lat, longitude: coords.lng })
            }
            draggable={true}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Drag the pin to adjust. You can fine-tune the exact spot in the next step.
        </p>
      </div>
    </div>
  );
}
