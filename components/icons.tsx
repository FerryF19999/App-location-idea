import React from 'react';

export const CoffeeCupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 20.25c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5h4.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5H10z" />
    <path d="M10 11.25V5.25a2.25 2.25 0 012.25-2.25h0a2.25 2.25 0 012.25 2.25v6" />
    <path d="M19.5 11.25h1.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25h-1.5" />
  </svg>
);

export const CupIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-amber-800"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20.25c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5h4.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5H10z" />
      <path d="M10 11.25V5.25a2.25 2.25 0 012.25-2.25h0a2.25 2.25 0 012.25 2.25v6" />
      <path d="M19.5 11.25h1.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25h-1.5" />
    </svg>
);

export const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.2-4.42-1.8-6.83.39-2.39 1.81-4.56 3.7-6.09 1.89-1.51 4.24-2.28 6.6-2.02.6.05 1.2.16 1.78.31V8.29c-.81-.31-1.65-.43-2.48-.33-1.66.19-3.22.89-4.32 2.05-1.03 1.07-1.52 2.45-1.52 3.96.01 1.54.55 3.01 1.63 4.09 1.29 1.26 3.11 1.93 4.96 1.91 1.86-.03 3.68-.78 4.96-2.05 1.07-1.07 1.58-2.5 1.58-4.06-.01-2.86-.01-5.71.01-8.57.02-1.68-.28-3.35-.91-4.83-.63-1.49-1.62-2.76-2.88-3.7-1.11-.83-2.39-1.34-3.76-1.47a4.6 4.6 0 00-.59-.02z"/>
    </svg>
);

export const HeartIcon: React.FC<{ isFilled: boolean; className?: string }> = ({ isFilled, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 transition-all duration-300 ease-in-out ${className}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill={isFilled ? "currentColor" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
);


export const CloseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const RestartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 inline-block shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

export const BackArrowIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);