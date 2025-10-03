import React, { useState } from 'react';
import ChatBubble from './components/ChatBubble';
import ChatWindow from './components/ChatWindow';
import useLocalStorage from './hooks/useLocalStorage';
import type { ChatMessage } from './types';

const App: React.FC = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chatHistory', []);

    const handleClearHistory = () => {
        setMessages([]);
        // Optional: Beri notifikasi ke pengguna bahwa riwayat telah dihapus
        alert('Riwayat percakapan telah dihapus!');
    };

    return (
        <div className="h-screen w-screen bg-stone-50 text-stone-800">
            {/* Main Page Content */}
            <div className="container mx-auto h-full flex flex-col justify-center items-center text-center p-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Temukan <span className="text-amber-700">Ketenangan</span> dalam Secangkir Kopi
                    </h1>
                    <p className="text-lg md:text-xl text-stone-600 mb-8">
                        Bingung cari tempat ngopi yang nyaman di Bandung? Biarkan Barista AI kami membantumu. Mulai percakapan untuk mendapatkan rekomendasi instan.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Mulai Ngobrol
                        </button>
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearHistory}
                                className="text-stone-500 hover:text-stone-700 text-sm font-semibold transition-colors"
                            >
                                Hapus Riwayat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Components */}
            {!isChatOpen && <ChatBubble onClick={() => setIsChatOpen(true)} />}
            <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default App;