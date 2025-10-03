import React from 'react';
import { CoffeeCupIcon } from './icons';

interface ChatBubbleProps {
    onClick: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-amber-700 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-all transform hover:scale-110"
            aria-label="Open chat"
        >
            <CoffeeCupIcon />
        </button>
    );
};

export default ChatBubble;