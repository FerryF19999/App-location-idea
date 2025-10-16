import React from 'react';

const BandungMapIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 800 600" 
        preserveAspectRatio="xMidYMid slice"
        {...props}
    >
        <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 1 }} />
            </linearGradient>
            <pattern id="roadPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" style={{ stroke: '#cbd5e1', strokeWidth: 0.5 }} />
            </pattern>
        </defs>

        {/* Base Land Mass */}
        <rect width="800" height="600" fill="#f1f5f9" />

        {/* Stylized River/Water Body */}
        <path 
            d="M 100 0 C 120 200, 250 150, 200 300 S 300 500, 250 600" 
            stroke="#93c5fd" 
            strokeWidth="20" 
            fill="url(#waterGradient)"
        />

        {/* Main Roads - Stylized */}
        <path d="M 50 150 Q 300 100 550 200 T 750 300" stroke="#e2e8f0" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M 400 0 V 600" stroke="#e2e8f0" strokeWidth="12" fill="none" />
        <path d="M 600 50 L 500 300 L 650 550" stroke="#e2e8f0" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M 150 500 H 700" stroke="#e2e8f0" strokeWidth="8" fill="none" />

        {/* Green Areas / Parks */}
        <circle cx="500" cy="150" r="50" fill="#dcfce7" opacity="0.8" />
        <ellipse cx="250" cy="450" rx="80" ry="40" fill="#dcfce7" opacity="0.8" />
        <rect x="650" y="400" width="100" height="150" rx="20" fill="#dcfce7" opacity="0.8" />

        {/* Central Landmark Area */}
        <g transform="translate(400, 300)">
            <circle cx="0" cy="0" r="30" fill="#fef9c3" />
            <path d="M 0 -20 L 10 0 L 0 20 L -10 0 Z" fill="#fcd34d" />
        </g>
    </svg>
);

export default BandungMapIllustration;
