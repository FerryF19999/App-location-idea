import React from 'react';
import type { CoffeeShop } from '../types';
import { MapPinIcon, TikTokIcon } from './icons';

// --- Generative Art Component ---
const GenerativeArt: React.FC<{ name: string }> = ({ name }) => {
    // Simple hash function to get a number from a string
    const stringToHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    const hash = stringToHash(name);
    const colorHue = Math.abs(hash) % 360;
    const baseColor = `hsl(${colorHue}, 60%, 95%)`; // Light pastel background
    const strokeColor = `hsl(${colorHue}, 40%, 60%)`;

    const shapes = Array.from({ length: 15 }).map((_, i) => {
        const shapeType = Math.abs(stringToHash(name + i)) % 3;
        const size = Math.abs(stringToHash(name + 's' + i)) % 20 + 10;
        const x = Math.abs(stringToHash(name + 'x' + i)) % 100;
        const y = Math.abs(stringToHash(name + 'y' + i)) % 100;
        const rotation = Math.abs(stringToHash(name + 'r' + i)) % 360;
        
        if (shapeType === 0) { // Circle
            return <circle key={i} cx={x} cy={y} r={size / 2} fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.5" />;
        } else if (shapeType === 1) { // Rectangle
             return <rect key={i} x={x-size/2} y={y-size/2} width={size} height={size / 2} fill={strokeColor} opacity="0.3" transform={`rotate(${rotation} ${x} ${y})`} />;
        } else { // Line
            return <line key={i} x1={x} y1={y} x2={x + size} y2={y + size} stroke={strokeColor} strokeWidth="1.5" opacity="0.6" />;
        }
    });

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: baseColor }}>
            <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
                {shapes}
            </svg>
        </div>
    );
};


interface HotspotCardProps {
    shop: CoffeeShop;
    isSelected: boolean; // Kept for potential future use, but primarily for single display now
    onSelect: () => void;
    onHover: (shop: CoffeeShop | null) => void;
}

const HotspotCard: React.FC<HotspotCardProps> = ({ shop }) => {
    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200/50 animate-fade-in-down">
            <div className="relative h-48">
                <GenerativeArt name={shop.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                    <h2 className="text-3xl font-bold text-white leading-tight shadow-md">{shop.name}</h2>
                    <p className="text-sm text-white/90 font-medium mt-1 shadow-sm">{shop.address}</p>
                </div>
            </div>
            <div className="p-6">
                <p className="text-stone-600 text-lg italic mb-6 text-center border-l-4 border-amber-400 pl-4">
                    "{shop.reason}"
                </p>
                <div className="flex flex-col gap-3">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 bg-amber-700 text-white font-bold rounded-full hover:bg-amber-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <MapPinIcon className="w-5 h-5"/>
                        Buka di Google Maps
                    </a>
                    <a
                        href={`https://www.tiktok.com/search?q=${encodeURIComponent(`${shop.name} bandung review`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                    >
                        <TikTokIcon className="w-5 h-5"/>
                        Lihat Review di TikTok
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HotspotCard;