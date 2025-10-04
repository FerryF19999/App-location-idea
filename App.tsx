import React, { useState } from 'react';
import AgentInterface from './components/AgentInterface';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'agent'>('landing');

    const handleStart = () => {
        setView('agent');
    };

    const handleBack = () => {
        setView('landing');
    };

    return (
        <div className="h-screen w-screen bg-stone-100 text-stone-800 font-sans flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
                {view === 'landing' && <LandingPage onStart={handleStart} />}
                {view === 'agent' && <AgentInterface onBack={handleBack} />}
            </main>
        </div>
    );
};

export default App;