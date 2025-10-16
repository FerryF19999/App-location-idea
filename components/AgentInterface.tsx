import React, { useState, useRef, useEffect, FormEvent } from 'react';
import type { CoffeeShop, ChatMessage, CoffeeCrawlRoute } from '../types';
import { getAiResponse } from '../services/geminiService';
import Header from './Header';
import CoffeeShopCard from './CoffeeShopCard';
import useLocalStorage from '../hooks/useLocalStorage';
import { ClockIcon, MapPinIcon, BaristaLogoIcon, HeartPulseIcon, InformationCircleIcon } from './icons';
import AgentStatus from './AgentStatus';

type SearchStatus = 'idle' | 'loading' | 'results' | 'error';
type AiMode = 'barista' | 'health';

interface AgentInterfaceProps {
    onBack: () => void;
    initialPrompt?: string | null;
}

// --- Health Advice Card Component ---
const HealthAdviceCard: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split('---');
    const advice = (parts[0]?.trim() ?? '').replace(/\*/g, '');
    const disclaimer = (parts[1]?.trim() ?? '').replace(/\*/g, '');

    if (!advice) {
        return null;
    }

    return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl shadow-md p-6 animate-fade-in-down max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-full">
                    <HeartPulseIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-emerald-800">Saran Kesehatan Kopi</h2>
            </div>
            <div className="text-emerald-700 space-y-3 whitespace-pre-wrap">
                {advice}
            </div>
            {disclaimer && (
                <div className="mt-6 border-t border-emerald-200 pt-4">
                    <div className="bg-emerald-100/70 p-4 rounded-lg flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-800">{disclaimer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Unified Coffee Crawl Route Display Component ---
const CoffeeCrawlRouteDisplay: React.FC<{ route: CoffeeCrawlRoute }> = ({ route }) => {
    return (
        <div className="relative animate-fade-in-down max-w-2xl mx-auto">
            {/* Vertical timeline */}
            <div className="absolute left-4 top-4 h-full w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300"></div>

            <div className="space-y-8">
                {route.stops.map((stop, index) => {
                    return (
                        <div key={index} className="relative pl-12">
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-3">
                                <div className="h-8 w-8 rounded-full bg-amber-500 border-4 border-stone-100 flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                            </div>
                            
                            {/* Time Badge */}
                            {stop.startTime && stop.endTime && (
                                <div className="flex items-center text-sm font-semibold text-amber-800 bg-amber-100 rounded-full px-3 py-1 mb-3 inline-flex border border-amber-200">
                                    <ClockIcon className="w-4 h-4 mr-1.5" />
                                    <span>{stop.startTime} - {stop.endTime}</span>
                                </div>
                            )}
                            
                            {/* Unified Coffee Shop Card */}
                            <CoffeeShopCard shop={stop} index={0} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


const AgentInterface: React.FC<AgentInterfaceProps> = ({ onBack, initialPrompt }) => {
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [query, setQuery] = useState('');
    const [input, setInput] = useState('');
    const [results, setResults] = useState<CoffeeShop[]>([]);
    const [route, setRoute] = useState<CoffeeCrawlRoute | null>(null);
    const [introText, setIntroText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []);
    const [aiMode, setAiMode] = useState<AiMode>('barista');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const parseAiResponse = (text: string): { intro: string; coffeeShops: CoffeeShop[]; route: CoffeeCrawlRoute | null } => {
        const routeRegex = /\[COFFEE_CRAWL_ROUTE\]([\s\S]*?)\[\/COFFEE_CRAWL_ROUTE\]/;
        const routeMatch = text.match(routeRegex);

        if (routeMatch && routeMatch[1]) {
            try {
                const routeJson = JSON.parse(routeMatch[1]);
                const intro = text.substring(0, routeMatch.index).trim();
                return { intro, coffeeShops: [], route: routeJson };
            } catch (e) {
                console.error("Gagal mem-parsing JSON rute:", e);
            }
        }
        
        const shops: CoffeeShop[] = [];
        const shopPattern = /\*\*(?<name>.*?)\*\*\s*\*Alamat:\*\s*(?<address>.*?)\s*\*Alasan:\*\s*(?<reason>[\s\S]*?)(?=\n\*\*|---|$)/g;
        
        const introParts: string[] = [];
        let lastIndex = 0;

        for (const match of text.matchAll(shopPattern)) {
             if (match.index !== undefined) {
                introParts.push(text.substring(lastIndex, match.index));
                lastIndex = match.index + match[0].length;
            }

            if (match.groups) {
                shops.push({
                    name: match.groups.name.replace(/^\d+\.\s*/, '').trim(),
                    address: match.groups.address.trim(),
                    reason: match.groups.reason.trim().replace(/\*/g, ''),
                });
            }
        }
        introParts.push(text.substring(lastIndex));
        
        const intro = introParts.join('').trim();
        
        return { intro, coffeeShops: shops, route: null };
    };

    const executeSearch = async (searchText: string) => {
        if (!searchText.trim()) return;

        setStatus('loading');
        setQuery(searchText);
        setResults([]);
        setRoute(null);
        setError(null);
        setIntroText('');
        
        const currentUserMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: searchText };
        const newHistory = [...chatHistory, currentUserMessage];
        setChatHistory(newHistory);

        try {
            const aiResponse = await getAiResponse(chatHistory, searchText, aiMode);
            
            const responseText = aiResponse.text;
            const { intro, coffeeShops, route } = parseAiResponse(responseText);

            setChatHistory([...newHistory, { id: `ai-${Date.now()}`, sender: 'ai', text: responseText, coffeeShops: coffeeShops.length > 0 ? coffeeShops : undefined, coffeeCrawlRoute: route ?? undefined }]);
            
            setResults(coffeeShops);
            setRoute(route);
            setIntroText(intro);
            setStatus('results');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
            setError(errorMessage);
            setStatus('error');
        }
    };
    
    useEffect(() => {
        if (initialPrompt) {
            executeSearch(initialPrompt);
        }
    }, [initialPrompt]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [results, route, status]);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        await executeSearch(input);
        setInput('');
    };

    const handleNewSearch = () => {
        setStatus('idle');
        setQuery('');
        setInput('');
        setResults([]);
        setRoute(null);
        setError(null);
        setIntroText('');
    };
    
    const handleClearHistory = () => {
        setChatHistory([]);
        handleNewSearch();
    };

    const handleModeChange = (newMode: AiMode) => {
        if (aiMode !== newMode) {
            setAiMode(newMode);
            if (status === 'results' || status === 'error') {
                handleNewSearch();
            }
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <div className="text-center p-8 animate-fade-in-down flex flex-col items-center justify-center h-full">
                        <div className="mb-4">
                            <div className="inline-block p-4 bg-amber-100 rounded-full">
                                <BaristaLogoIcon className="h-12 w-12 text-amber-800" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold font-playfair text-stone-800 mb-3">Racikan Sempurna Menantimu</h2>
                        <p className="text-stone-600 max-w-lg">
                            Pilih mode, lalu tanyakan apa saja. Saya akan memandu Anda menemukan surga kopi tersembunyi di Bandung.
                        </p>
                        <p className="text-stone-400 mt-6 text-sm italic">
                            Inspirasi: "Kedai kopi dengan suasana tenang di Dago" atau "Kopi apa yang rendah kafein?"
                        </p>
                    </div>
                );
            case 'loading':
                return <AgentStatus />;
            case 'results':
                const hasMeaningfulIntro = introText && (!introText.includes('---') || introText.split('---')[0].trim().length > 0);

                return (
                    <div>
                        {aiMode === 'health' && hasMeaningfulIntro && (
                             <HealthAdviceCard text={introText} />
                        )}

                        {aiMode === 'barista' && hasMeaningfulIntro && (
                            <p className="mb-6 text-stone-700 px-4 sm:px-0 whitespace-pre-wrap">{introText.replace(/\*/g, '')}</p>
                        )}
                        
                        <div className={hasMeaningfulIntro && (route || results.length > 0) ? 'mt-8' : ''}>
                            {route ? (
                                <>
                                    <div className="text-center mb-8 max-w-2xl mx-auto">
                                        <h2 className="text-3xl font-bold font-playfair text-amber-800">{route.title}</h2>
                                        <p className="text-stone-500 mt-1">Estimasi Durasi: {route.duration}</p>
                                    </div>
                                    <CoffeeCrawlRouteDisplay route={route} />
                                </>
                            ) : results.length > 0 ? (
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {results.map((shop, index) => (
                                        <CoffeeShopCard key={`${shop.name}-${index}`} shop={shop} index={index} />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center p-8 bg-red-50 rounded-lg">
                        <h3 className="text-lg font-bold text-red-700">Oops, Terjadi Kesalahan</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                        <button onClick={handleNewSearch} className="mt-4 bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors">
                            Coba Lagi
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto">
            <Header
                onRestart={handleClearHistory}
                onBack={onBack}
                onNewSearch={status === 'results' ? handleNewSearch : undefined}
            />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                {renderContent()}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-white/80 backdrop-blur-sm border-t border-stone-200 p-3 sm:p-4 w-full sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <button
                            onClick={() => handleModeChange('barista')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${aiMode === 'barista' ? 'bg-amber-700 text-white shadow' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                        >
                            <BaristaLogoIcon className="w-5 h-5" />
                            Barista AI
                        </button>
                        <button
                            onClick={() => handleModeChange('health')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${aiMode === 'health' ? 'bg-emerald-600 text-white shadow' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                        >
                            <HeartPulseIcon className="w-5 h-5" />
                            Konsultan Sehat
                        </button>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={status === 'loading' ? "AI sedang bekerja..." : (aiMode === 'barista' ? "Cari tempat atau minta rute..." : "Tanya soal kopi & kesehatan...")}
                            disabled={status === 'loading'}
                            className="flex-1 w-full px-5 py-3 bg-stone-50 border-2 border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                            aria-label="Chat input"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || !input.trim()}
                            className="p-3 bg-amber-700 text-white rounded-full disabled:bg-stone-400 disabled:cursor-not-allowed hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-transform transform enabled:hover:scale-110"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
};

export default AgentInterface;