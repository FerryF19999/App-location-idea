import React, { useState, useEffect, useRef } from 'react';
import { generateKalcerQuiz, evaluateKalcerAnswers } from '../services/geminiService';
import type { KalcerQuestion, KalcerResult } from '../types';
import Header from './Header';
import { RestartIcon, DownloadIcon, GedungSateIcon } from './icons';

// --- Loading Component ---
const LoadingComponent: React.FC<{ text: string }> = ({ text }) => (
    <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in-down">
        <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-lg font-semibold text-stone-600">{text}</p>
    </div>
);

// --- Quiz Component ---
interface QuizProps {
    question: KalcerQuestion;
    onAnswer: (answer: string) => void;
    questionNumber: number;
    totalQuestions: number;
}
const QuizComponent: React.FC<QuizProps> = ({ question, onAnswer, questionNumber, totalQuestions }) => {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (option: string) => {
        setSelected(option);
        setTimeout(() => {
            onAnswer(option);
            setSelected(null);
        }, 300); // Short delay for feedback
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in-down">
            <div className="text-center mb-6">
                <p className="text-sm font-semibold text-amber-600">Pertanyaan {questionNumber} dari {totalQuestions}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mt-2">{question.question}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(question.options || []).map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        className={`p-4 text-left font-semibold rounded-lg border-2 transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                        ${selected === option ? 'bg-amber-500 border-amber-500 text-white scale-105' : 'bg-white border-stone-200 hover:bg-amber-50 hover:border-amber-400'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2.5 mt-8">
                <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
            </div>
        </div>
    );
};


// --- Result Component ---
interface ResultProps {
    result: KalcerResult;
    onRestart: () => void;
}
declare const html2canvas: any;

const ArtDecoSeparator: React.FC = () => (
    <div className="flex items-center justify-center my-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-700 to-transparent"></div>
        <div className="w-2 h-2 rotate-45 bg-yellow-600 mx-2"></div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-700 to-transparent"></div>
    </div>
);


const ResultComponent: React.FC<ResultProps> = ({ result, onRestart }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const getScoreColors = (score: number) => {
        if (score >= 80) return { stroke: '#22c55e', text: '#22c55e' }; // green-500
        if (score >= 50) return { stroke: '#eab308', text: '#eab308' }; // yellow-500
        return { stroke: '#ef4444', text: '#ef4444' }; // red-500
    };
    const scoreColors = getScoreColors(result.score);

    const handleDownload = () => {
        if (cardRef.current && typeof html2canvas !== 'undefined') {
            setIsDownloading(true);
            html2canvas(cardRef.current, {
                backgroundColor: '#1c1917', // Corresponds to bg-stone-900
                scale: 2.5, // Increase scale for higher resolution
                useCORS: true,
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'kartu-kalcer-bandung-ultra.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsDownloading(false);
            }).catch((err: any) => {
                console.error("Gagal mengunduh kartu:", err);
                setIsDownloading(false);
            });
        } else {
            console.error("html2canvas tidak ditemukan atau referensi kartu tidak tersedia.");
        }
    };

    const titleMatch = result.title.match(/(.*) '(\d{2})$/);
    const mainTitle = titleMatch ? titleMatch[1].trim() : result.title;
    const year = titleMatch ? `'${titleMatch[2]}` : null;

    return (
        <div className="w-full max-w-sm mx-auto animate-fade-in-down">
            <div 
                ref={cardRef} 
                className="relative bg-stone-800 text-stone-50 rounded-lg shadow-2xl overflow-hidden border-2 border-yellow-900/50 p-2"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a16207\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
            >
                <div className="relative border border-yellow-800/60 rounded p-6">
                    <GedungSateIcon className="absolute inset-0 w-full h-full text-white/5 opacity-50 z-0 scale-125" />
                    
                    <div className="relative z-10 text-center">
                        <p className="font-semibold text-sm text-yellow-500 tracking-widest">LEVEL KALCER BANDUNG</p>
                        <h2 className="font-playfair text-4xl font-bold text-white leading-tight mt-2">
                            {mainTitle}
                            {year && <span className="block text-3xl font-semibold opacity-80">{year}</span>}
                        </h2>
                    </div>

                    <div className="my-6 flex justify-center z-10 relative">
                       <svg viewBox="0 0 100 100" className="w-36 h-36">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#a16207" strokeWidth="2" opacity="0.5"/>
                          <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              strokeWidth="4"
                              stroke={scoreColors.stroke}
                              strokeDasharray="283"
                              strokeDashoffset={283 - (283 * result.score) / 100}
                              transform="rotate(-90 50 50)"
                              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                          />
                          <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="text-5xl font-bold"
                              fill={scoreColors.text}
                          >
                              {result.score}
                          </text>
                      </svg>
                    </div>
                    
                    <ArtDecoSeparator />

                    <p className="text-stone-300 text-sm text-center leading-relaxed z-10 relative">{result.description}</p>
                    
                    <div className="border-t border-yellow-900/50 mt-6 pt-4 text-center text-xs text-yellow-700/80 z-10 relative">
                        Kartu Kalcer Bandung &copy; 2025
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-stretch gap-4">
                <button 
                    onClick={onRestart}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-stone-700 text-stone-200 font-semibold rounded-full hover:bg-stone-600 transition-colors duration-200 border border-stone-500"
                >
                    <RestartIcon className="h-5 w-5"/>
                    Ulangi
                </button>
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-stone-900 font-bold rounded-full hover:bg-yellow-500 transition-colors duration-200 border border-yellow-400 disabled:bg-stone-500 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="h-5 w-5"/>
                    {isDownloading ? 'Mengunduh...' : 'Unduh Story'}
                </button>
            </div>
        </div>
    );
};


// --- Main Feature Component ---
const KalcerFeature: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [status, setStatus] = useState<'loading-quiz' | 'quiz' | 'evaluating' | 'result' | 'error'>('loading-quiz');
    const [questions, setQuestions] = useState<KalcerQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<KalcerResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchQuiz = async () => {
        setStatus('loading-quiz');
        setAnswers([]);
        setCurrentQuestionIndex(0);
        try {
            const quizQuestions = await generateKalcerQuiz();
            if(!quizQuestions || quizQuestions.length === 0) {
                throw new Error("AI tidak dapat membuat kuis saat ini. Coba lagi.");
            }
            setQuestions(quizQuestions);
            setStatus('quiz');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat kuis.');
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, []);

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            submitForEvaluation(newAnswers);
        }
    };
    
    const submitForEvaluation = async (finalAnswers: string[]) => {
        setStatus('evaluating');
        try {
            const evaluationResult = await evaluateKalcerAnswers(questions, finalAnswers);
            setResult(evaluationResult);
            setStatus('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengevaluasi jawaban.');
            setStatus('error');
        }
    };

    const renderContent = () => {
        switch(status) {
            case 'loading-quiz':
                return <LoadingComponent text="Menyiapkan Kuis Kekalceran..." />;
            case 'quiz':
                return questions.length > 0 ? <QuizComponent question={questions[currentQuestionIndex]} onAnswer={handleAnswer} questionNumber={currentQuestionIndex + 1} totalQuestions={questions.length} /> : null;
            case 'evaluating':
                return <LoadingComponent text="Menganalisis Jawabanmu..." />;
            case 'result':
                return result ? <ResultComponent result={result} onRestart={fetchQuiz} /> : null;
            case 'error':
                 return (
                    <div className="text-center p-8 bg-red-50 rounded-lg max-w-md mx-auto">
                        <h3 className="text-lg font-bold text-red-700">Oops, Terjadi Kesalahan</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                        <button onClick={fetchQuiz} className="mt-4 bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors">
                            Coba Lagi
                        </button>
                    </div>
                );
        }
    }

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto">
            <Header onBack={onBack} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
                 {renderContent()}
            </main>
        </div>
    );
};

export default KalcerFeature;
