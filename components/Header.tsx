import React from 'react';
import { CoffeeCupIcon, CloseIcon, RestartIcon } from './icons';

interface HeaderProps {
  onClose?: () => void;
  onRestart?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClose, onRestart }) => {
  const CupIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20.25c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5h4.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5H10z" />
        <path d="M10 11.25V5.25a2.25 2.25 0 012.25-2.25h0a2.25 2.25 0 012.25 2.25v6" />
        <path d="M19.5 11.25h1.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25h-1.5" />
      </svg>
  );

  return (
    <header className="relative py-4 px-4 border-b border-stone-200 bg-stone-50 shadow-sm flex-shrink-0">
      <div className="flex justify-center items-center gap-3 sm:gap-4">
        <div className="inline-block p-2 sm:p-3 bg-amber-100 rounded-full">
            <CupIcon />
        </div>
        <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800 text-center">
                Pencari Kopi Cozy
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 text-center">
                Chat dengan Barista AI
            </p>
        </div>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center space-x-2">
        {onRestart && (
            <button
            onClick={onRestart}
            className="text-stone-500 hover:text-stone-800 transition-colors"
            aria-label="Restart chat"
            >
            <RestartIcon className="h-5 w-5" />
            </button>
        )}
        {onClose && (
            <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 transition-colors"
            aria-label="Close chat"
            >
            <CloseIcon />
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
