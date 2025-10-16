import React, { useState, useEffect, useRef } from 'react';
import { generateMapHotspots } from '../services/geminiService';
import type { CoffeeShop } from '../types';
import Header from './Header';
import CustomMap from './CustomMap';
import LoadingSpinner from './LoadingSpinner';
import CoffeeShopCard from './CoffeeShopCard';
import { XMarkIcon } from './icons';

interface MapExploreProps {
    onBack: () => void;
}

const MapExplore: React.FC<MapExploreProps> = ({ onBack }) => {
    const [hotspots, setHotspots] = useState<CoffeeShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
    const [hoveredShop, setHoveredShop] = useState<CoffeeShop | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        const fetchHotspots = async () => {
            try {
                setLoading(true);
                setError(null);
                const spots = await generateMapHotspots();
                setHotspots(spots);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data peta.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchHotspots();
    }, []);

    const handleSelectShop = (shop: CoffeeShop | null) => {
        if (shop && shop.name === selectedShop?.name) {
            // Deselect and close panel
            setSelectedShop(null);
            setIsPanelOpen(false);
        } else if (shop) {
            // Select new shop and open panel
            setSelectedShop(shop);
            setIsPanelOpen(true);
        } else {
            // Close panel without selection
            setSelectedShop(null);
            setIsPanelOpen(false);
        }
    };
    
    const handleClosePanel = () => {
        setSelectedShop(null);
        setIsPanelOpen(false);
    }

    const renderMainContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                    <p className="text-stone-600 mt-2 font-semibold">Membangun Atlas Kopi Bandung...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-50 rounded-lg m-auto max-w-md">
                    <h3 className="text-lg font-bold text-red-700">Gagal Memuat Peta</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                </div>
            );
        }

        return (
            <CustomMap
                hotspots={hotspots}
                selectedShop={selectedShop}
                hoveredShop={hoveredShop}
                onMarkerClick={handleSelectShop}
                onMarkerHover={setHoveredShop}
            />
        );
    };

    return (
        <div className="flex flex-col h-full bg-stone-100">
            <Header onBack={onBack} />
            <main className="flex-1 overflow-hidden relative">
                {renderMainContent()}
                
                {/* Detail Panel */}
                <div className={`absolute top-0 left-0 h-full w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl border-r border-stone-200/80 transition-transform duration-500 ease-in-out
                    ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    
                    <div className="h-full flex flex-col">
                         <div className="p-4 flex justify-between items-center border-b border-stone-200 flex-shrink-0">
                            <h2 className="text-xl font-bold text-stone-800">Detail Hotspot</h2>
                            <button 
                                onClick={handleClosePanel}
                                className="p-2 rounded-full hover:bg-stone-200 transition-colors"
                                aria-label="Tutup panel"
                            >
                                <XMarkIcon className="w-5 h-5 text-stone-600" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6">
                            {selectedShop ? (
                                <CoffeeShopCard shop={selectedShop} index={0} />
                            ) : (
                                <div className="text-center p-8 text-stone-500">
                                    <p>Pilih pin di peta untuk melihat detail.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MapExplore;