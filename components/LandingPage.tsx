import React from 'react';
import { MapPinIcon, TikTokIcon, RouteIcon, ZodiacIcon } from './icons';

interface LandingPageProps {
    onStart: (prompt?: string) => void;
    onStartKalcer: () => void;
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

const zodiacs = [
    { name: 'Aries', sign: 'aries' as const }, { name: 'Taurus', sign: 'taurus' as const }, { name: 'Gemini', sign: 'gemini' as const },
    { name: 'Cancer', sign: 'cancer' as const }, { name: 'Leo', sign: 'leo' as const }, { name: 'Virgo', sign: 'virgo' as const },
    { name: 'Libra', sign: 'libra' as const }, { name: 'Scorpio', sign: 'scorpio' as const }, { name: 'Sagittarius', sign: 'sagittarius' as const },
    { name: 'Capricorn', sign: 'capricorn' as const }, { name: 'Aquarius', sign: 'aquarius' as const }, { name: 'Pisces', sign: 'pisces' as const }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onStartKalcer }) => {
    return (
        <div className="w-full bg-stone-50">
            {/* Hero Section */}
            <section className="relative text-center py-20 sm:py-32 px-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(245, 245, 244, 0.8), rgba(245, 245, 244, 1)), url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2070&auto=format&fit=crop')"}}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-800 tracking-tight">
                        Temukan Surga Kopi <span className="text-amber-700">Tersembunyi</span> di Bandung
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
                        Gunakan AI untuk mendapatkan rekomendasi, merancang rute petualangan kopi, atau jelajahi hotspot kopi di peta interaktif.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => onStart()}
                            className="w-full sm:w-auto px-8 py-4 bg-amber-700 text-white font-bold text-lg rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
                        >
                            Tanya Barista AI
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-stone-800 mb-12">Mengapa Memilih Barista AI?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<RouteIcon />} title="Rute Kopi Kustom">
                            Minta AI untuk membuatkan itinerary "coffee crawl" yang dipersonalisasi sesuai keinginan dan durasi Anda.
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
            
            {/* Zodiac Section */}
            <section className="py-20 px-4 bg-stone-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4">Takdir Kopimu Tertulis di Bintang</h2>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-10">
                        Pilih zodiakmu dan biarkan Barista AI menemukan kedai kopi yang paling cocok dengan kepribadian kosmikmu.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {zodiacs.map((z) => (
                            <button
                                key={z.sign}
                                onClick={() => onStart(`Rekomendasikan satu tempat kopi di Bandung yang cocok untuk zodiak ${z.name}`)}
                                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 border border-stone-200 group"
                                title={`Rekomendasi untuk ${z.name}`}
                            >
                                <ZodiacIcon sign={z.sign} className="w-10 h-10 text-stone-400 group-hover:text-amber-600 transition-colors" />
                                <span className="mt-2 text-sm font-semibold text-stone-700">{z.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kalcer Test Section */}
            <section className="py-20 px-4 bg-stone-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-4 text-4xl">✨</div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Seberapa Kalcer Kamu?</h2>
                    <p className="text-lg text-stone-300 max-w-2xl mx-auto mb-8">
                        Ikuti kuis singkat yang dibuat oleh AI untuk mengetahui seberapa dalam pengetahuanmu tentang tren terkini di Bandung.
                    </p>
                    <button
                        onClick={onStartKalcer}
                        className="px-8 py-4 bg-amber-500 text-stone-900 font-bold text-lg rounded-full shadow-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                        Cek Tingkat Kekalceranmu
                    </button>
                </div>
            </section>
            
            <footer className="text-center py-6 bg-stone-200">
                <p className="text-sm text-stone-600">&copy; {new Date().getFullYear()} Barista AI. Dipersembahkan oleh Gemini.</p>
            </footer>
        </div>
    );
};

export default LandingPage;