// web/src/services/geocoding.ts

// Define the structure of the address object we expect back
export interface ReverseGeocodeResult {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

// This function uses the free Nominatim (OpenStreetMap) API.
// It's rate-limited, so we should be careful not to call it excessively.
export const reverseGeocodeCoordinates = async (coords: { lat: number; lng: number }): Promise<ReverseGeocodeResult | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
            { headers: { 'User-Agent': 'Yohop-Geolocation-MVP/1.0' } }
        );
        if (!response.ok) throw new Error("Failed to fetch address");
        
        const data = await response.json();
        
        if (data && data.address) {
            const addr = data.address;
            return {
                street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                zip: addr.postcode || '',
                country: addr.country || '',
            };
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
};

export interface AddressComponents {
    street?: string;
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    state_district?: string;
    postcode?: string;
    country?: string;
}

export interface AddressSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: AddressComponents;
}

/** Extract city name from Nominatim address object */
export function getCityFromAddress(addr: AddressComponents | undefined): string {
    if (!addr) return '';
    return addr.city || addr.town || addr.village || '';
}

/** Extract state from Nominatim address object */
export function getStateFromAddress(addr: AddressComponents | undefined): string {
    if (!addr) return '';
    return addr.state || addr.state_district || '';
}

/** Check if address city/state matches a whitelisted city (case-insensitive) */
export function addressMatchesCity(
    addr: AddressComponents | undefined,
    cityName: string,
    cityState: string
): boolean {
    const addrCity = getCityFromAddress(addr)?.toLowerCase().trim();
    const addrState = getStateFromAddress(addr)?.toLowerCase().trim();
    const cName = cityName?.toLowerCase().trim();
    const cState = cityState?.toLowerCase().trim();
    return (
        (!!addrCity && addrCity === cName && (!cState || addrState === cState)) ||
        (!!addrCity && addrCity.includes(cName) && (!cState || addrState.includes(cState)))
    );
}

export const searchAddresses = async (query: string, city: string): Promise<AddressSuggestion[]> => {
    if (query.trim().length < 3) return [];

    try {
        const fullQuery = city ? `${query}, ${city}` : query;
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(fullQuery)}`;
        const response = await fetch(url, {
            headers: { Accept: 'application/json', 'User-Agent': 'Yohop-Geolocation-MVP/1.0' },
        });
        if (!response.ok) throw new Error("Failed to fetch address suggestions");

        const raw = await response.json();
        return raw.map((p: any) => ({
            place_id: p.place_id,
            display_name: p.display_name || '',
            lat: String(p.lat),
            lon: String(p.lon),
            address: p.address,
        }));
    } catch (error) {
        console.error("Address search error:", error);
        return [];
    }
};
