import { CoffeeShop } from '../types';

const getApiKey = (): string => {
    // Safely access process.env, which may not be defined in browser environments.
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
    if (!apiKey) {
        // Fallback or error for when the API key is not set.
        console.error("The API_KEY environment variable is not set.");
        return '';
    }
    return apiKey;
};

// Promise to ensure the Google Maps script is loaded only once
let googleMapsPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        // Check if the script is already present
        if ((window as any).google && (window as any).google.maps) {
            return resolve();
        }
        
        // This global callback is specifically for Google Maps auth errors.
        (window as any).gm_authFailure = () => {
             reject(new Error('Google Maps authentication failed. The API key is likely invalid or missing required permissions for Maps JavaScript API.'));
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
            googleMapsPromise = null; // Allow retry on failure
            reject(new Error('Failed to load Google Maps script.'));
        };
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

// A hidden div is required for the PlacesService constructor.
// We'll use a singleton pattern to create it only once.
let placesService: any = null; // Use 'any' for google.maps.places.PlacesService
const getPlacesService = (): any => {
    if (!placesService) {
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);
        placesService = new (window as any).google.maps.places.PlacesService(mapDiv);
    }
    return placesService;
};

export const getGoogleMapsPhotoUrl = async (shop: CoffeeShop): Promise<string | null> => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        await loadGoogleMapsScript(apiKey);
        
        const service = getPlacesService();
        const request = {
            query: `${shop.name}, ${shop.address}`,
            fields: ['photos', 'name']
        };

        return new Promise((resolve, reject) => {
            service.findPlaceFromQuery(request, (results: any[], status: string) => {
                if (status === 'OK' && results && results.length > 0) {
                    const place = results[0];
                    if (place.photos && place.photos.length > 0) {
                        // The getUrl() method provides a direct, valid URL to the image.
                        const photoUrl = place.photos[0].getUrl({ maxWidth: 400 });
                        resolve(photoUrl);
                    } else {
                        console.warn(`No photos found on Google Maps for "${shop.name}".`);
                        resolve(null);
                    }
                } else if (status === 'ZERO_RESULTS') {
                    console.warn(`Google Maps Find Place returned zero results for "${shop.name}".`);
                    resolve(null);
                } else {
                    reject(new Error(`Google Maps Find Place failed for "${shop.name}": ${status}`));
                }
            });
        });

    } catch (error) {
        console.error("Error fetching from Google Maps API:", error instanceof Error ? error.message : error);
        // Re-throw the error so the calling component can handle it.
        throw error;
    }
};