

import React, { useState, useRef, useEffect, FormEvent } from 'react';
// FIX: Removed unused 'Source' type which is not exported from '../types'.
import type { CoffeeShop, ChatMessage } from '../types';
import {
    getAiResponse,
    resolveGeminiApiKey,
    storeGeminiApiKey,
    clearStoredGeminiApiKey,
    resetGeminiClient,
    type GeminiApiKeyResolution,
} from '../services/geminiService';
import Header from './Header';
import CoffeeShopCard from './CoffeeShopCard';
import useLocalStorage from '../hooks/useLocalStorage';
import { LinkIcon, TrashIcon } from './icons';
import AgentStatus from './AgentStatus';

type SearchStatus = 'idle' | 'loading' | 'results' | 'error';

interface AgentInterfaceProps {
    onBack: () => void;
}

const AgentInterface: React.FC<AgentInterfaceProps> = ({ onBack }) => {
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [query, setQuery] = useState('');
    const [input, setInput] = useState('');
    const [results, setResults] = useState<CoffeeShop[]>([]);
    const [introText, setIntroText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [apiKeyState, setApiKeyState] = useState<GeminiApiKeyResolution>(() => resolveGeminiApiKey());
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [apiKeyFeedback, setApiKeyFeedback] = useState<string | null>(null);
    // FIX: Use the ChatMessage[] type for chat history to enforce structure.
    const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []); // Keep history for context
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const refreshApiKeyState = () => {
        setApiKeyState(resolveGeminiApiKey());
    };

    const handleSaveApiKey = (event: FormEvent) => {
        event.preventDefault();
        const trimmedKey = apiKeyInput.trim();
        if (!trimmedKey) {
            setApiKeyFeedback('Masukkan Gemini API key yang valid.');
            return;
        }

        storeGeminiApiKey(trimmedKey);
        resetGeminiClient();
        setApiKeyFeedback('API key berhasil disimpan untuk browser ini.');
        setApiKeyInput('');
        refreshApiKeyState();
    };

    const handleClearApiKey = () => {
        clearStoredGeminiApiKey();
        resetGeminiClient();
        setApiKeyFeedback('API key lokal telah dihapus.');
        refreshApiKeyState();
    };

    useEffect(() => {
        setApiKeyFeedback(null);
    }, [apiKeyState.source]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [results, status]);

    const parseAiResponse = (text: string): { intro: string; coffeeShops: CoffeeShop[] } => {
        const shops: CoffeeShop[] = [];
        const shopPattern = /\*\*(?<name>.*?)\*\*\s*\*Alamat:\*\s*(?<address>.*?)\s*\*Alasan:\*\s*(?<reason>[\s\S]*?)(?=\n\*\*|$)/g;
        
        const listStartIndex = text.search(/\*\*1\./);
        const intro = listStartIndex === -1 ? text : text.substring(0, listStartIndex).trim();
        
        let match;
        while ((match = shopPattern.exec(text)) !== null) {
            if (match.groups) {
                shops.push({
                    name: match.groups.name.replace(/^\d+\.\s*/, '').trim(),
                    address: match.groups.address.trim(),
                    reason: match.groups.reason.trim(),
                });
            }
        }
        return { intro: shops.length > 0 ? intro : text, coffeeShops: shops };
    };

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setStatus('loading');
        setQuery(input);
        setResults([]);
        setError(null);
        setIntroText('');
        
        // FIX: Create a complete ChatMessage object with a unique ID for the user's message.
        const currentUserMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: input };
        const newHistory = [...chatHistory, currentUserMessage];
        setChatHistory(newHistory);

        const currentInput = input;
        setInput('');

        try {
            // FIX: Pass the full `chatHistory` to the AI service. The previous mapping was causing a type error by stripping required properties.
            const aiResponse = await getAiResponse(chatHistory, currentInput);

            const responseText = aiResponse.text;
            const { intro, coffeeShops } = parseAiResponse(responseText);

            // FIX: Create a complete ChatMessage object with a unique ID for the AI's response.
            setChatHistory([...newHistory, { id: `ai-${Date.now()}`, sender: 'ai', text: responseText, coffeeShops }]);
            
            setResults(coffeeShops);
            setIntroText(intro);
            setStatus('results');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
            setError(errorMessage);
            setStatus('error');
        }
    };

    const handleNewSearch = () => {
        setStatus('idle');
        setQuery('');
        setInput('');
        setResults([]);
        setError(null);
        setIntroText('');
    };
    
    const handleClearHistory = () => {
        setChatHistory([]);
        handleNewSearch();
    };

    const renderContent = () => {
        const hasApiKey = Boolean(apiKeyState.key);

        switch (status) {
            case 'idle':
                return (
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-stone-700 mb-2">Selamat Datang di Barista AI</h2>
                        <p className="text-stone-500">Katakan di mana Anda ingin mencari tempat ngopi yang nyaman di Bandung.</p>
                        <p className="text-stone-400 mt-4 text-sm">Contoh: "Jalan Braga", "Dago Atas", atau "dekat Gedung Sate"</p>
                    </div>
                );
            case 'loading':
                return <AgentStatus />;
            case 'results':
                return (
                    <div>
                        {introText && <p className="mb-6 text-stone-700 px-4 sm:px-0">{introText}</p>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((shop, index) => (
                                <CoffeeShopCard key={`${shop.name}-${index}`} shop={shop} index={index} />
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={handleNewSearch} className="bg-amber-700 text-white font-bold py-2 px-6 rounded-full hover:bg-amber-600 transition-colors">
                                Mulai Pencarian Baru
                            </button>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="space-y-4">
                        <div className="text-center p-8 bg-red-50 rounded-lg">
                            <h3 className="text-lg font-bold text-red-700">Oops, Terjadi Kesalahan</h3>
                            <p className="text-red-600 mt-2">{error}</p>
                            <button onClick={handleNewSearch} className="mt-4 bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors">
                                Coba Lagi
                            </button>
                        </div>
                        {!hasApiKey && (
                            <div className="p-6 bg-white border border-amber-200 rounded-xl shadow-sm text-left">
                                <h4 className="text-lg font-semibold text-stone-700">Belum ada Gemini API key</h4>
                                <p className="text-stone-600 mt-2">
                                    Masukkan kunci API Gemini Anda di bawah ini untuk mengaktifkan fitur AI secara lokal. Kunci akan disimpan dengan aman di browser ini saja.
                                </p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const renderApiKeySection = () => {
        const hasApiKey = Boolean(apiKeyState.key);
        const isEnvDriven = apiKeyState.source === 'vite' || apiKeyState.source === 'runtime';

        return (
            <section className="mb-6">
                <div className="p-5 bg-white border border-amber-100 rounded-xl shadow-sm">
                    <div className="flex flex-col gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-stone-700">Konfigurasi Gemini API Key</h3>
                            {hasApiKey ? (
                                <p className="text-sm text-stone-500 mt-1">
                                    {apiKeyState.source === 'localStorage' && 'Menggunakan API key yang disimpan di browser ini.'}
                                    {apiKeyState.source === 'window' && 'Menggunakan API key dari konfigurasi runtime halaman.'}
                                    {apiKeyState.source === 'vite' && 'Menggunakan API key dari variabel lingkungan build (import.meta.env).'}
                                    {apiKeyState.source === 'runtime' && 'Menggunakan API key dari variabel lingkungan Node.js (process.env).'}
                                </p>
                            ) : (
                                <p className="text-sm text-stone-500 mt-1">
                                    Masukkan kunci API yang valid agar Barista AI dapat menjawab pertanyaan Anda.
                                </p>
                            )}
                        </div>

                        {apiKeyFeedback && (
                            <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                {apiKeyFeedback}
                            </div>
                        )}

                        {!isEnvDriven && (
                            <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(event) => setApiKeyInput(event.target.value)}
                                    placeholder="Masukkan Gemini API key..."
                                    className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    autoComplete="off"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-3 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                                    >
                                        Simpan
                                    </button>
                                    {hasApiKey && (
                                        <button
                                            type="button"
                                            onClick={handleClearApiKey}
                                            className="px-4 py-3 border border-stone-300 text-stone-600 rounded-lg font-semibold hover:bg-stone-100 transition-colors"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        {isEnvDriven && (
                            <p className="text-xs text-stone-400">
                                Untuk mengganti kunci ini, perbarui variabel lingkungan <code>VITE_GEMINI_API_KEY</code> lalu muat ulang aplikasi.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        );
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto">
            <Header onRestart={handleClearHistory} onBack={onBack} />

            <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                {renderApiKeySection()}
                {renderContent()}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-white/80 backdrop-blur-sm border-t border-stone-200 p-3 sm:p-4 w-full sticky bottom-0">
                <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-3xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={status === 'loading' ? "Barista AI sedang bekerja..." : "Cari tempat kopi di Bandung..."}
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
            </footer>
        </div>
    );
};

export default AgentInterface;