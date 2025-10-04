import React from 'react';
import { MapPinIcon, TikTokIcon } from './icons';

interface LandingPageProps {
    onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-md border border-stone-200/50">
        <div className="flex items-center mb-3">
            <div className="p-2 bg-amber-200 text-amber-800 rounded-full mr-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-stone-800">{title}</h3>
        </div>
        <p className="text-stone-600 text-sm">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="w-full bg-stone-50">
            {/* Hero Section */}
            <section className="relative text-center py-20 sm:py-32 px-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(245, 245, 244, 0.8), rgba(245, 245, 244, 1)), url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2070&auto=format&fit=crop')"}}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-800 tracking-tight">
                        Temukan Surga Kopi <span className="text-amber-700">Tersembunyi</span> di Bandung
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
                        Dengan Barista AI, dapatkan rekomendasi kedai kopi <i>cozy</i> yang dipersonalisasi, lengkap dengan integrasi peta dan ulasan TikTok.
                    </p>
                    <button
                        onClick={onStart}
                        className="mt-10 px-8 py-4 bg-amber-700 text-white font-bold text-lg rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                        Mulai Petualangan Kopi Anda
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-stone-800 mb-12">Mengapa Memilih Barista AI?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<BrainIcon />} title="Rekomendasi Cerdas">
                            AI kami memahami preferensi "nyaman" Anda dan mencari tempat terbaik menggunakan data web terbaru.
                        </FeatureCard>
                        <FeatureCard icon={<MapPinIcon />} title="Integrasi Peta">
                            Langsung lihat lokasi dan arah ke kedai kopi pilihan Anda dengan sekali klik melalui Google Maps.
                        </FeatureCard>
                        <FeatureCard icon={<TikTokIcon />} title="Ulasan TikTok">
                            Lihat suasana dan review nyata dari para kreator konten langsung dari aplikasi TikTok.
                        </FeatureCard>
                    </div>
                </div>
            </section>
            
            <footer className="text-center py-6 bg-stone-200">
                <p className="text-sm text-stone-600">&copy; {new Date().getFullYear()} Barista AI. Dipersembahkan oleh Gemini.</p>
            </footer>
        </div>
    );
};

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 12c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5" />
        <path d="M14 9.5c-2.5 0-4.5-2-4.5-4.5S11.5.5 14 .5s4.5 2 4.5 4.5" />
        <path d="M4.5 14c-2.5 0-4.5-2-4.5-4.5S2 5 4.5 5s4.5 2 4.5 4.5" />
        <path d="M9.5 19c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5-2-4.5-4.5-4.5" />
        <path d="M14 14.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5" />
        <path d="M4.5 9.5C2 9.5.5 11.5.5 14s1.5 4.5 4 4.5 4.5-2 4.5-4.5" />
    </svg>
);


export default LandingPage;
