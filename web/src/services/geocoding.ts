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
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`
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

export interface AddressSuggestion {
    place_id: number;
    display_name: string; // The full, formatted address string
    lat: string;
    lon: string;
}

// --- NEW FUNCTION for Address Autocomplete ---
export const searchAddresses = async (query: string, city: string): Promise<AddressSuggestion[]> => {
    if (query.trim().length < 3) {
        return []; // Don't search for very short queries
    }

    try {
        // We add the city to the query to make the search results more relevant.
        const fullQuery = `${query}, ${city}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=5`
        );
        if (!response.ok) throw new Error("Failed to fetch address suggestions");

        const data: AddressSuggestion[] = await response.json();
        return data;
    } catch (error) {
        console.error("Address search error:", error);
        return [];
    }
};
