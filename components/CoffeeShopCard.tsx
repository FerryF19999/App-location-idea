import React, { useState, useEffect } from 'react';
import type { CoffeeShop } from '../types';
import { MapPinIcon, TikTokIcon, HeartIcon } from './icons';

interface CoffeeShopCardProps {
  shop: CoffeeShop;
  index: number;
}

const CoffeeShopCard: React.FC<CoffeeShopCardProps> = ({ shop, index }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Animasi kemunculan kartu yang berurutan
    const timer = setTimeout(() => {
      setIsRendered(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`;
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(`${shop.name} bandung review`)}`;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-out transform hover:scale-105 ${isRendered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="relative">
        <img 
          src={`https://picsum.photos/400/250?random=${index}&grayscale&blur=1`} 
          alt={`Suasana di ${shop.name}`}
          className="w-full h-40 object-cover"
        />
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-sm rounded-full group focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={isFavorited ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
        >
          <HeartIcon
            isFilled={isFavorited}
            className={`transform group-hover:scale-110 ${isFavorited ? 'text-red-500 scale-110' : 'text-stone-600'}`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-amber-900 mb-2">{shop.name}</h3>
        {typeof shop.score === 'number' && (
          <p className="text-sm font-semibold text-amber-700 mb-2">Skor relevansi: {shop.score.toFixed(1)}</p>
        )}
        <p className="text-stone-500 mb-3 flex items-start text-sm">
            <span className="font-bold mr-2 text-stone-600 text-base">“</span>
            <span className="italic">{shop.reason}</span>
            <span className="font-bold ml-1 text-stone-600 text-base">”</span>
        </p>
        <p className="text-xs text-stone-600 mb-4">{shop.address}</p>
        
        <div className="flex flex-col space-y-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors duration-200"
          >
            <MapPinIcon />
            Google Maps
          </a>
          <a
            href={tiktokSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <TikTokIcon />
            Review TikTok
          </a>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopCard;