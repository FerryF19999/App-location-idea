import React from 'react';
import { TrashIcon, BaristaLogoIcon, BackArrowIcon, PencilIcon } from './icons';

interface HeaderProps {
  onRestart?: () => void;
  onBack?: () => void;
  onNewSearch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onRestart, onBack, onNewSearch }) => {

  return (
    <header className="relative py-4 px-4 sm:px-8 bg-stone-100 flex-shrink-0">
      <div className="flex justify-center items-center gap-3 sm:gap-4 relative">
        {onBack && (
            <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <button
                    onClick={onBack}
                    className="text-stone-500 hover:text-amber-700 hover:bg-amber-100 p-2 rounded-full transition-colors"
                    aria-label="Back to landing page"
                    title="Kembali"
                >
                    <BackArrowIcon className="h-5 w-5" />
                </button>
            </div>
        )}
        <div className="inline-block p-2 sm:p-3 bg-amber-100 rounded-full">
            <BaristaLogoIcon className="h-8 w-8 text-amber-800" />
        </div>
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800 text-center">
                Barista AI
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 text-center">
                Kurator Kopi Personalmu
            </p>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center gap-2">
            {onNewSearch && (
                 <button
                    onClick={onNewSearch}
                    className="text-stone-500 hover:text-amber-700 hover:bg-amber-100 p-2 rounded-full transition-colors"
                    aria-label="Start new search"
                    title="Pencarian Baru"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
            )}
            {onRestart && (
                <button
                    onClick={onRestart}
                    className="text-stone-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors"
                    aria-label="Clear history"
                    title="Hapus Riwayat"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            )}
         </div>
      </div>
    </header>
  );
};

export default Header;