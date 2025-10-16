import React from 'react';
import { BaristaLogoIcon } from './icons';

const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200/80 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                         <div className="inline-block p-2 bg-amber-100 rounded-full">
                            <BaristaLogoIcon className="h-6 w-6 text-amber-800" />
                        </div>
                        <span className="text-xl font-bold text-stone-800">
                            Barista AI
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;