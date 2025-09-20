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
