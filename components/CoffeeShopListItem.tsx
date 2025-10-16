import React, { useState } from 'react';
import type { CoffeeShop } from '../types';
import { TikTokIcon, HeartIcon, MapPinIcon } from './icons';

interface CoffeeShopListItemProps {
  shop: CoffeeShop;
}

// Helper untuk mendapatkan inisial
const getInitials = (name: string): string => {
    const words = name.split(' ').filter(Boolean);
    if (words.length > 1) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return words.length > 0 ? words[0].substring(0, 2).toUpperCase() : '?';
};

// Komponen placeholder yang telah disempurnakan
const GenerativeImagePlaceholder: React.FC<{ shopName: string }> = ({ shopName }) => {
    const getHash = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        return hash;
    }

    const hue = Math.abs(getHash(shopName)) % 360;
    const initials = getInitials(shopName);

    return (
        <div 
            className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center text-white overflow-hidden rounded-full"
            style={{ backgroundColor: `hsl(${hue}, 40%, 30%)` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <span className="relative text-2xl font-playfair font-bold tracking-wider">{initials}</span>
        </div>
    );
};


const CoffeeShopListItem: React.FC<CoffeeShopListItemProps> = ({ shop }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`;
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${shop.name} bandung review`)}`;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-stone-200/80 transition-all duration-300 hover:shadow-lg hover:border-stone-300 hover:scale-[1.02] animate-fade-in-down">
      <div className="flex items-start gap-4">
        <GenerativeImagePlaceholder shopName={shop.name} />
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-stone-800 pr-2 flex-1">{shop.name}</h3>
                 <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="p-1.5 text-stone-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full"
                    aria-label={isFavorited ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
                >
                    <HeartIcon
                        isFilled={isFavorited}
                        className={`w-5 h-5 transition-all duration-200 ${isFavorited ? 'text-red-500' : ''}`}
                    />
                </button>
            </div>

            <p className="text-sm text-stone-600 mt-1 italic">"{shop.reason}"</p>
            
            <p className="flex items-start text-xs text-stone-500 mt-2">
                <MapPinIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{shop.address}</span>
            </p>

            <div className="flex items-center gap-2 mt-4">
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 bg-amber-700 text-white rounded-full text-xs font-semibold hover:bg-amber-600 transition-all transform hover:scale-105"
                >
                    Peta
                </a>
                <a
                    href={tiktokSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
                >
                    Review
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopListItem;
