import React, { useState } from 'react';
import VercelAnalytics from './components/VercelAnalytics';
import AgentInterface from './components/AgentInterface';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import KalcerFeature from './components/KalcerFeature';

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'agent' | 'kalcer'>('landing');
    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

    const handleStart = (prompt?: string) => {
        setInitialPrompt(prompt || null);
        setView('agent');
    };

    const handleStartKalcer = () => setView('kalcer');
    const handleBack = () => setView('landing');

    const renderView = () => {
        switch (view) {
            case 'agent':
                return <AgentInterface onBack={handleBack} initialPrompt={initialPrompt} />;
            case 'kalcer':
                return <KalcerFeature onBack={handleBack} />;
            case 'landing':
            default:
                return <LandingPage onStart={handleStart} onStartKalcer={handleStartKalcer} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-stone-100 text-stone-800 font-sans flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
                {renderView()}
            </main>
            <VercelAnalytics />
        </div>
    );
};

export default App;
