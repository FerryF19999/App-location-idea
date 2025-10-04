import React, { useState, useEffect } from 'react';

// Copywriting yang universal dan tematik untuk langkah-langkah pemuatan.
const ThinkingSteps = [
    "Menganalisis permintaan...",
    "Menyeduh data dari seluruh web...",
    "Memilih biji informasi terbaik...",
    "Menyajikan racikan jawaban untukmu...",
];

const BeanLoaderAnimation = () => (
    <div className="w-full max-w-[120px] mx-auto mb-6 animate-bean-pulse">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <title>Animasi biji kopi sedang memproses</title>
            <defs>
                <clipPath id="beanClip">
                    <path d="M50,5 C25,5 5,25 5,50 C5,75 25,95 50,95 C75,95 95,75 95,50 C95,25 75,5 50,5 Z" />
                </clipPath>
            </defs>
            
            {/* Bean background */}
            <path d="M50,5 C25,5 5,25 5,50 C5,75 25,95 50,95 C75,95 95,75 95,50 C95,25 75,5 50,5 Z" fill="#44403C" />
            
            {/* Filling animation */}
            <g clipPath="url(#beanClip)">
                <rect x="0" y="0" width="100" height="100" fill="#CA8A04" className="animate-bean-fill" />
            </g>
            
            {/* Crack in the middle */}
            <path d="M50,15 C55,40 55,60 50,85" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
    </div>
);


// Komponen tidak lagi memerlukan prop 'query' karena teksnya sekarang universal.
const AgentStatus: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prevStep) => (prevStep + 1) % ThinkingSteps.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <BeanLoaderAnimation />
            <h2 className="text-lg font-semibold text-stone-700 mt-2">
                Barista AI sedang meracik jawaban...
            </h2>
            <div className="w-full max-w-sm h-6 mt-2 overflow-hidden">
                 <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${step * 1.5}rem)` }}>
                    {ThinkingSteps.map((text, index) => (
                        <p key={index} className="text-stone-500 h-6">
                            {text}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentStatus;