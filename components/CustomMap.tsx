import React, { useState, useEffect } from 'react';
import type { CoffeeShop } from '../types';
import { MapPinIcon } from './icons';
import BandungMapIllustration from './BandungMapIllustration';

interface CustomMapProps {
    hotspots: CoffeeShop[];
    selectedShop: CoffeeShop | null;
    hoveredShop: CoffeeShop | null;
    onMarkerClick: (shop: CoffeeShop) => void;
    onMarkerHover: (shop: CoffeeShop | null) => void;
}

// Sub-component for individual pins to manage their own animations
const InteractivePin: React.FC<{
    shop: CoffeeShop;
    isSelected: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHover: (shop: CoffeeShop | null) => void;
}> = ({ shop, isSelected, isHovered, onClick, onHover }) => {
    const [position, setPosition] = useState({ top: '50%', left: '50%' });

    useEffect(() => {
        // Generate a stable, pseudo-random position based on the shop's name
        let hash = 0;
        for (let i = 0; i < shop.name.length; i++) {
            hash = shop.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const x = (Math.abs(hash) % 70) + 15; // 15% to 85% horizontal
        
        let hash2 = 0;
        for (let i = shop.name.length - 1; i >= 0; i--) {
            hash2 = shop.name.charCodeAt(i) + ((hash2 << 5) - hash2);
        }
        const y = (Math.abs(hash2) % 60) + 20; // 20% to 80% vertical

        setPosition({ top: `${y}%`, left: `${x}%` });
    }, [shop.name]);

    const zIndex = isSelected ? 30 : isHovered ? 20 : 10;
    const pinSize = isSelected ? 'h-14 w-14' : isHovered ? 'h-12 w-12' : 'h-10 w-10';
    const pinColor = isSelected ? 'text-red-600' : 'text-amber-800';

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300"
            style={{ ...position, zIndex }}
        >
            <button
                className="focus:outline-none relative group"
                onClick={onClick}
                onMouseEnter={() => onHover(shop)}
                onMouseLeave={() => onHover(null)}
                title={shop.name}
            >
                {/* Breathing glow effect */}
                <div className={`absolute inset-0 rounded-full ${pinColor} opacity-50 animate-ping`} style={{ animationDuration: '2s' }}></div>
                
                <MapPinIcon 
                    className={`relative ${pinSize} ${pinColor} drop-shadow-lg transition-all duration-300 ease-out`}
                />
                 <span 
                    className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg transition-all duration-200 origin-bottom pointer-events-none
                    ${isHovered && !isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    {shop.name}
                </span>
            </button>
        </div>
    );
};

const CustomMap: React.FC<CustomMapProps> = ({ hotspots, selectedShop, hoveredShop, onMarkerClick, onMarkerHover }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const mapRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapRef.current) return;
        const { left, top, width, height } = mapRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        setRotation({ x: -y * 10, y: x * 10 }); // Multiplier controls tilt intensity
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={mapRef}
            className="w-full h-full bg-stone-200 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: '1000px' }}
        >
            <div 
                className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.1)`,
                }}
            >
                <BandungMapIllustration className="absolute inset-0 w-full h-full object-cover" />
                
                {hotspots.map((shop) => (
                    <InteractivePin
                        key={shop.name}
                        shop={shop}
                        isSelected={selectedShop?.name === shop.name}
                        isHovered={hoveredShop?.name === shop.name}
                        onClick={() => onMarkerClick(shop)}
                        onHover={onMarkerHover}
                    />
                ))}
            </div>
        </div>
    );
};

export default CustomMap;