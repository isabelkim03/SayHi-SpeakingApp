import React, { useState, useEffect } from 'react';
import { DIALOGUE_TURNS } from './data/dialogue';
import { CharacterCustomization } from './types';
import { StartScreen } from './components/StartScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { ResultScreen } from './components/ResultScreen';
import { DressUpScreen } from './components/DressUpScreen';
import { checkBrowserEnvironment } from './utils/speech';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'practice' | 'result' | 'dressup'>('start');
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [sessionCrayons, setSessionCrayons] = useState<number>(0);

  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('sayhi_student_name') || 'Minho';
  });

  const [crayons, setCrayons] = useState<number>(() => {
    const saved = localStorage.getItem('sayhi_crayons');
    return saved !== null ? parseInt(saved, 10) : 15; // 15 starter crayons
  });

  const [customization, setCustomization] = useState<CharacterCustomization>(() => {
    const saved = localStorage.getItem('sayhi_customization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gender) {
          return {
            gender: parsed.gender || 'boy',
            hair: parsed.hair || 'hair_basic',
            outfit: parsed.outfit || 'outfit_basic',
            glasses: parsed.glasses || 'glasses_none',
            bag: parsed.bag || 'bag_none',
            ownedItems: parsed.ownedItems || ['hair_basic', 'outfit_basic', 'glasses_none', 'bag_none'],
          };
        }
      } catch {}
    }
    return {
      gender: 'boy',
      hair: 'hair_basic',
      outfit: 'outfit_basic',
      glasses: 'glasses_none',
      bag: 'bag_none',
      ownedItems: ['hair_basic', 'outfit_basic', 'glasses_none', 'bag_none'],
    };
  });

  const [browserWarning, setBrowserWarning] = useState<string | null>(null);

  // Check browser environment on mount
  useEffect(() => {
    const env = checkBrowserEnvironment();
    if (env.warningMessage) {
      setBrowserWarning(env.warningMessage);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sayhi_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('sayhi_crayons', crayons.toString());
  }, [crayons]);

  useEffect(() => {
    localStorage.setItem('sayhi_customization', JSON.stringify(customization));
  }, [customization]);

  // Screen Transitions
  const handleStartPractice = () => {
    setCurrentTurnIndex(0);
    setSessionCrayons(0);
    setCurrentScreen('practice');
  };

  const handleEarnCrayons = (amount: number) => {
    setSessionCrayons((prev) => prev + amount);
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < DIALOGUE_TURNS.length - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      setCurrentScreen('result');
    }
  };

  const handleSkipTurn = () => {
    if (currentTurnIndex < DIALOGUE_TURNS.length - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      setCurrentScreen('result');
    }
  };

  const handleBackFromPractice = () => {
    if (currentTurnIndex > 0) {
      setCurrentTurnIndex((prev) => prev - 1);
    } else {
      setCurrentScreen('start');
    }
  };

  const handleGoToDressUp = () => {
    setCurrentScreen('dressup');
  };

  const handleBackFromResult = () => {
    setCurrentTurnIndex(DIALOGUE_TURNS.length - 1);
    setCurrentScreen('practice');
  };

  const handleBackFromDressUp = () => {
    setCurrentScreen('result');
  };

  const handlePlayAgain = () => {
    setCurrentTurnIndex(0);
    setSessionCrayons(0);
    setCurrentScreen('practice');
  };

  const handleGoHome = () => {
    setCurrentScreen('start');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      {currentScreen === 'start' && (
        <StartScreen
          studentName={studentName}
          setStudentName={setStudentName}
          customization={customization}
          setCustomization={setCustomization}
          crayons={crayons}
          onStart={handleStartPractice}
          browserWarning={browserWarning}
        />
      )}

      {currentScreen === 'practice' && (
        <PracticeScreen
          turn={DIALOGUE_TURNS[currentTurnIndex]}
          turnIndex={currentTurnIndex}
          totalTurns={DIALOGUE_TURNS.length}
          studentName={studentName}
          customization={customization}
          crayons={crayons}
          setCrayons={setCrayons}
          onEarnCrayons={handleEarnCrayons}
          onNext={handleNextTurn}
          onSkip={handleSkipTurn}
          onBack={handleBackFromPractice}
          onHome={handleGoHome}
        />
      )}

      {currentScreen === 'result' && (
        <ResultScreen
          studentName={studentName}
          crayons={crayons}
          sessionCrayons={sessionCrayons}
          customization={customization}
          onGoToDressUp={handleGoToDressUp}
          onBack={handleBackFromResult}
          onHome={handleGoHome}
        />
      )}

      {currentScreen === 'dressup' && (
        <DressUpScreen
          studentName={studentName}
          crayons={crayons}
          setCrayons={setCrayons}
          customization={customization}
          setCustomization={setCustomization}
          onPlayAgain={handlePlayAgain}
          onBack={handleBackFromDressUp}
          onHome={handleGoHome}
        />
      )}
    </div>
  );
}
