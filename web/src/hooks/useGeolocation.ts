import { useState, useEffect, useCallback } from 'react';
import { reverseGeocodeCoordinates } from '@/services/geocoding';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
}

interface UseGeolocationReturn {
  location: GeoLocation | null;
  isLoading: boolean;
  error: string | null;
  detect: () => void;
}

/**
 * Hook to auto-detect user location via the browser Geolocation API
 * + reverse-geocode it to a city name using Nominatim (OpenStreetMap).
 *
 * On mount it fires automatically (if `autoDetect` is true).
 * Also exposes a manual `detect()` for retry / re-trigger.
 */
export function useGeolocation(autoDetect = true): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(() => {
    // Hydrate from sessionStorage so we don't hit the API every mount
    try {
      const cached = sessionStorage.getItem('yohop_geo');
      if (cached) return JSON.parse(cached) as GeoLocation;
    } catch {
      /* ignore */
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 5 * 60 * 1000, // Cache for 5 min
          }),
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city
      const address = await reverseGeocodeCoordinates({
        lat: latitude,
        lng: longitude,
      });

      const geo: GeoLocation = {
        latitude,
        longitude,
        city: address?.city || '',
        state: address?.state || '',
        country: address?.country || '',
      };

      setLocation(geo);

      // Persist to sessionStorage
      try {
        sessionStorage.setItem('yohop_geo', JSON.stringify(geo));
      } catch {
        /* quota exceeded — fine */
      }
    } catch (err: any) {
      if (err?.code === 1) {
        setError('Location permission denied.');
      } else if (err?.code === 3) {
        setError('Location request timed out.');
      } else {
        setError('Unable to detect your location.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-detect on first mount only if we have nothing cached
    if (autoDetect && !location) {
      detect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { location, isLoading, error, detect };
}
