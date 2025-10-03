import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import type { ChatMessage, CoffeeShop } from '../types';
import { getAiResponse } from '../services/geminiService';
import Header from './Header';
import CoffeeShopCard from './CoffeeShopCard';
import LoadingSpinner from './LoadingSpinner';
import useLocalStorage from '../hooks/useLocalStorage';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialMessage: ChatMessage = {
    id: 'init',
    sender: 'ai',
    text: 'Halo! Saya Barista AI, siap membantumu menemukan tempat ngopi paling cozy di Bandung. Mau cari rekomendasi sekarang?',
};

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chatHistory', []);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([initialMessage]);
        }
    }, [messages.length, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleRestart = () => {
        setMessages([initialMessage]);
        setInput('');
        setError(null);
        setIsLoading(false);
    };

    const handleSendMessage = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: input,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Saring pesan selamat datang awal dari riwayat yang dikirim ke API
            const historyForApi = messages.filter(msg => msg.id !== 'init');
            const aiResponseText = await getAiResponse(historyForApi, currentInput);

            const aiResponseJson = JSON.parse(aiResponseText);

            const recommendations = Array.isArray(aiResponseJson.recommendations)
                ? aiResponseJson.recommendations
                    .map((shop: unknown) => {
                        if (!shop || typeof shop !== 'object') {
                            return null;
                        }
                        const entry = shop as Record<string, unknown>;
                        const scoreValue = typeof entry.score === 'number'
                            ? entry.score
                            : typeof entry.score === 'string'
                                ? Number.parseFloat(entry.score)
                                : undefined;

                        return {
                            name: String(entry.name ?? ''),
                            address: String(entry.address ?? ''),
                            reason: String(entry.reason ?? ''),
                            score: Number.isFinite(scoreValue) ? Number(scoreValue) : undefined,
                        };
                    })
                    .filter((shop): shop is CoffeeShop => Boolean(shop?.name && shop?.address && shop?.reason))
                    .sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity))
                : [];

            const aiMessage: ChatMessage = {
                id: Date.now().toString() + '-ai',
                sender: 'ai',
                text: aiResponseJson.reply,
                coffeeShops: recommendations,
                rawAiResponse: aiResponseText,
            };

            setMessages([...newMessages, aiMessage]);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
            setError(errorMessage);
            const errorAiMessage: ChatMessage = {
                id: Date.now().toString() + '-ai-error',
                sender: 'ai',
                text: `Maaf, terjadi kesalahan: ${errorMessage}. Coba lagi ya.`,
            };
            setMessages(prev => [...prev, errorAiMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, setMessages]);

    return (
        <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out sm:bottom-6 sm:right-6 w-full h-full sm:w-[400px] sm:h-[calc(100vh-48px)] sm:max-h-[700px] flex flex-col bg-stone-100 rounded-none sm:rounded-2xl shadow-2xl ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <Header onClose={onClose} onRestart={handleRestart} />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-auto max-w-[90%] sm:max-w-xs lg:max-w-sm px-5 py-3 rounded-2xl shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-amber-700 text-white rounded-br-none' 
                                : 'bg-amber-100 text-amber-900 rounded-bl-none'
                            }`}>
                                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                {msg.coffeeShops && msg.coffeeShops.length > 0 && (
                                    <div className="space-y-4 mt-2">
                                        <div className="grid grid-cols-1 gap-4">
                                            {msg.coffeeShops.map((shop, index) => (
                                                <CoffeeShopCard key={`${shop.name}-${index}`} shop={shop} index={index} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-amber-100 rounded-2xl rounded-bl-none shadow-sm">
                                <LoadingSpinner />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {error && (
                <div className="text-center p-2 bg-red-100 text-red-700 text-sm flex-shrink-0">
                    <p>{error}</p>
                </div>
            )}

            <footer className="bg-white border-t border-stone-200 p-2 sm:p-4 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ketik pesanmu..."
                        disabled={isLoading}
                        className="flex-1 w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-amber-700 text-white rounded-full disabled:bg-stone-400 disabled:cursor-not-allowed hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-transform transform enabled:hover:scale-110"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWindow;