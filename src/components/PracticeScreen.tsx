import React, { useState, useEffect, useRef } from 'react';
import { DialogueTurn, CharacterCustomization, MicState } from '../types';
import { SCENE_IMAGES } from '../data/dialogue';
import { Avatar } from './Avatar';
import { SituationalStage } from './SituationalStage';
import {
  speakText,
  stopSpeaking,
  evaluateStudentSpeech,
} from '../utils/speech';
import { soundEffects } from '../utils/audioEffects';
import {
  Volume2,
  Mic,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  FastForward,
  Square,
} from 'lucide-react';

interface PracticeScreenProps {
  turn: DialogueTurn;
  turnIndex: number;
  totalTurns: number;
  studentName: string;
  customization: CharacterCustomization;
  crayons: number;
  setCrayons: React.Dispatch<React.SetStateAction<number>>;
  onEarnCrayons?: (amount: number) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onHome: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  turn,
  turnIndex,
  totalTurns,
  studentName,
  customization,
  crayons,
  setCrayons,
  onEarnCrayons,
  onNext,
  onSkip,
  onBack,
  onHome,
}) => {
  // Speech synthesis & playback states
  const [isPlayingModelAudio, setIsPlayingModelAudio] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Recognition & mic states
  const [micState, setMicState] = useState<MicState>('ready');
  const [recognizedTranscript, setRecognizedTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [noSpeechDetected, setNoSpeechDetected] = useState<boolean>(false);

  // Manual recording control refs
  const isRecordingRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');

  // Evaluation & Feedback states
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [rewardedIndices, setRewardedIndices] = useState<Set<number>>(new Set());
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ en: string; ko: string } | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  const [crayonsEarnedThisTurn, setCrayonsEarnedThisTurn] = useState<number>(0);
  const [showCrayonFloater, setShowCrayonFloater] = useState<number | null>(null);
  const [isTurnTransitioning, setIsTurnTransitioning] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Resolved target sentence with student's actual name
  const resolvedTargetSentence = turn.studentTargetTemplate.replace(
    /\[name\]/g,
    studentName || 'Minho'
  );
  const resolvedPartnerQuestion = turn.partnerQuestion;

  const targetWords = resolvedTargetSentence.split(/\s+/).filter(Boolean);

  // Read partner question on turn entry
  useEffect(() => {
    // Reset states for new turn
    isRecordingRef.current = false;
    accumulatedTranscriptRef.current = '';
    setRecognizedTranscript('');
    setInterimTranscript('');
    setAttemptCount(0);
    setNoSpeechDetected(false);
    setMatchedIndices([]);
    setRewardedIndices(new Set());
    setIsSuccess(false);
    setFeedback(null);
    setCrayonsEarnedThisTurn(0);
    setIsTurnTransitioning(false);
    setMicState('ready');

    // Read partner question aloud warmly
    const timer = setTimeout(() => {
      handlePlayPartnerAudio();
    }, 400);

    return () => {
      clearTimeout(timer);
      isRecordingRef.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [turn.no]);

  // Read Ruby's question aloud
  const handlePlayPartnerAudio = () => {
    if (isPlayingModelAudio) return;
    setIsPlayingModelAudio(true);
    soundEffects.playPop();

    speakText(resolvedPartnerQuestion, {
      rate: 0.9,
      pitch: 1.1,
      onStart: () => setIsPlayingModelAudio(true),
      onEnd: () => setIsPlayingModelAudio(false),
      onError: () => setIsPlayingModelAudio(false),
    });
  };

  // Play target sentence (normal rate 0.9 or slow rate 0.7)
  const handlePlayTargetAudio = (slow: boolean = false) => {
    if (isPlayingModelAudio) return;
    setIsPlayingModelAudio(true);
    soundEffects.playPop();

    speakText(resolvedTargetSentence, {
      rate: slow ? 0.7 : 0.9,
      pitch: 1.0,
      onStart: () => {
        setIsPlayingModelAudio(true);
        setActiveWordIndex(0);
      },
      onWordBoundary: (index) => {
        setActiveWordIndex(index);
      },
      onEnd: () => {
        setIsPlayingModelAudio(false);
        setActiveWordIndex(null);
      },
      onError: () => {
        setIsPlayingModelAudio(false);
        setActiveWordIndex(null);
      },
    });
  };

  // Manual Start Recording: User clicks "말하기 시작 (Start)"
  const handleStartRecording = () => {
    if (isPlayingModelAudio || micState === 'processing') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저에서 실행해 주세요. (Please open in Chrome)'
      );
      return;
    }

    // Stop speaking if currently active
    stopSpeaking();
    setIsPlayingModelAudio(false);

    // Reset previous recording contents and errors on retry
    setRecognizedTranscript('');
    setInterimTranscript('');
    accumulatedTranscriptRef.current = '';
    setFeedback(null);
    setMatchedIndices([]);
    setNoSpeechDetected(false);

    isRecordingRef.current = true;
    soundEffects.playMicStart();

    try {
      const recognizer = new SpeechRecognition();
      recognitionRef.current = recognizer;

      recognizer.lang = 'en-US';
      recognizer.interimResults = true;
      recognizer.maxAlternatives = 1;
      recognizer.continuous = true; // Keep listening continuously without auto-stop on silence

      recognizer.onstart = () => {
        if (isRecordingRef.current) {
          setMicState('listening');
        }
      };

      recognizer.onresult = (event: any) => {
        if (!isRecordingRef.current) return;
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const piece = event.results[i][0].transcript.trim();
            if (piece) {
              accumulatedTranscriptRef.current = (
                accumulatedTranscriptRef.current +
                ' ' +
                piece
              ).trim();
            }
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);
        setRecognizedTranscript(accumulatedTranscriptRef.current || interim);
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed') {
          isRecordingRef.current = false;
          setMicState('ready');
          setFeedback({
            en: 'Microphone permission was denied. Please allow microphone access in your browser settings.',
            ko: '마이크 사용 권한이 차단되어 있어요. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크 권한을 허용해 주세요.',
          });
        }
        // If event.error === 'no-speech', do NOT stop or evaluate while isRecordingRef.current is true!
      };

      recognizer.onend = () => {
        // If learner is still recording, auto-restart to prevent browser silence timeout
        if (isRecordingRef.current) {
          try {
            recognizer.start();
          } catch {
            setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch {}
              }
            }, 100);
          }
        }
      };

      recognizer.start();
      setMicState('listening');
    } catch (err) {
      console.error('Failed to start SpeechRecognition:', err);
      isRecordingRef.current = false;
      setMicState('ready');
    }
  };

  // Manual Stop Recording: User clicks "말하기 끝 (Stop)"
  const handleStopRecording = () => {
    if (!isRecordingRef.current && micState !== 'listening') return;

    isRecordingRef.current = false;
    setMicState('processing');
    soundEffects.playPop();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Give a brief window to collect the final transcript before evaluation
    setTimeout(() => {
      const finalSpeech = (
        accumulatedTranscriptRef.current +
        ' ' +
        interimTranscript
      ).trim();

      setInterimTranscript('');

      if (!finalSpeech) {
        // No speech detected
        setMicState('ready');
        setNoSpeechDetected(true);
        setRecognizedTranscript('');
        return;
      }

      setRecognizedTranscript(finalSpeech);
      setNoSpeechDetected(false);
      processEvaluation(finalSpeech);
    }, 350);
  };

  // Process evaluation of student speech against target sentence
  const processEvaluation = async (speechText: string) => {
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);

    const evalResult = evaluateStudentSpeech(
      resolvedTargetSentence,
      speechText,
      turn.keyWords,
      studentName
    );

    setMatchedIndices(evalResult.matchedWordIndices);

    // Calculate newly matched word positions for crayons reward
    let newlyEarnedCrayons = 0;
    const currentRewarded = new Set(rewardedIndices);

    evalResult.matchedWordIndices.forEach((idx) => {
      if (!currentRewarded.has(idx)) {
        currentRewarded.add(idx);
        newlyEarnedCrayons += 5; // +5 crayons per newly matched word position
      }
    });

    if (evalResult.isSuccess && !isSuccess) {
      newlyEarnedCrayons += 10; // +10 bonus crayons for reaching success!
      setIsSuccess(true);
      soundEffects.playSuccessFanfare();
    } else if (newlyEarnedCrayons > 0) {
      soundEffects.playCrayonEarned();
    } else if (evalResult.matchedWordIndices.length > 0) {
      soundEffects.playWordMatch();
    }

    if (newlyEarnedCrayons > 0) {
      setRewardedIndices(currentRewarded);
      setCrayonsEarnedThisTurn((prev) => prev + newlyEarnedCrayons);
      setCrayons((prev) => prev + newlyEarnedCrayons);
      onEarnCrayons?.(newlyEarnedCrayons);
      setShowCrayonFloater(newlyEarnedCrayons);
      setTimeout(() => setShowCrayonFloater(null), 2000);
    }

    // Call server API for Ruby's encouraging Section 7 pedagogical feedback
    setIsLoadingFeedback(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnNo: turn.no,
          targetSentence: resolvedTargetSentence,
          recognizedText: speechText,
          keyWords: turn.keyWords,
          attemptCount: nextAttempt,
          studentName: studentName || 'Friend',
          isSuccess: evalResult.isSuccess,
          allKeyWordsFound: evalResult.allKeyWordsFound,
          missingCount: evalResult.missingCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback({
          en: data.feedbackEnglish,
          ko: data.feedbackKorean,
        });

        // Warmly speak Ruby's encouraging English response
        speakText(data.feedbackEnglish, {
          rate: 0.9,
          pitch: 1.1,
          onStart: () => setIsPlayingModelAudio(true),
          onEnd: () => setIsPlayingModelAudio(false),
          onError: () => setIsPlayingModelAudio(false),
        });
      }
    } catch (err) {
      console.error('Feedback fetch error:', err);
    } finally {
      setIsLoadingFeedback(false);
      setMicState('done');
    }
  };

  const handleNextWithTransition = () => {
    soundEffects.playPop();
    setIsTurnTransitioning(true);
    setTimeout(() => {
      onNext();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-3 md:p-6 max-w-4xl mx-auto">
      {/* ================= Screen 2: TOP ZONE ================= */}
      <header className="w-full bg-white rounded-2xl border border-slate-200 p-3 md:p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Back Button */}
          <button
            onClick={() => {
              soundEffects.playPop();
              stopSpeaking();
              if (recognitionRef.current && micState === 'listening') {
                try {
                  recognitionRef.current.abort();
                } catch {}
              }
              onBack();
            }}
            aria-label="Back"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back</span>
          </button>

          {/* Progress (e.g. 1/5) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Question {turnIndex + 1} of {totalTurns}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalTurns }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 md:w-5 h-2 rounded-full transition-all ${
                    i === turnIndex
                      ? 'bg-amber-500 w-6 md:w-8'
                      : i < turnIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Crayon Balance with Animated Floater */}
          <div className="relative flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <span className="text-base">🖍️</span>
            <span className="text-sm font-extrabold text-amber-900 font-mono">
              {crayons}
            </span>
            {showCrayonFloater && (
              <span className="absolute -top-6 right-1 text-sm font-black text-amber-600 bg-white border border-amber-300 px-2 py-0.5 rounded-full shadow-md animate-bounce">
                +{showCrayonFloater} 🖍️!
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ================= Screen 2: MIDDLE ZONE ================= */}
      <main className="flex-1 flex flex-col justify-center my-1 relative">
        {/* Situational Stage showing Ruby and Learner with exact visual consistency */}
        <SituationalStage
          turn={turn}
          studentName={studentName}
          customization={customization}
          micState={micState}
          isPlayingModelAudio={isPlayingModelAudio}
          isSuccess={isSuccess}
          isTurnTransitioning={isTurnTransitioning}
        />

        {/* Classmate's Question + Korean Meaning (상황 그림 바로 아래에 배치) */}
        <div className="mt-3 bg-[#FFFDF5] border border-amber-200/90 rounded-2xl md:rounded-3xl p-3.5 md:p-4.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-900 bg-[#FEF3C7] border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                Ruby’s Question · 짝꿍 루비의 말
              </span>
            </div>
            <p className="text-base md:text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
              “{resolvedPartnerQuestion}”
            </p>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              {turn.partnerQuestionKo}
            </p>
          </div>

          <button
            onClick={handlePlayPartnerAudio}
            disabled={isPlayingModelAudio}
            title="루비 말 다시 듣기"
            className="p-2.5 md:p-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-200/90 shadow-sm transition-transform active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Target Sentence in Largest Text + Word Highlighting */}
        <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-xs font-bold text-indigo-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>내가 말할 문장 (Target Sentence)</span>
          </div>

          {/* Interactive Word Highlighting during Audio / Recognition */}
          <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3 py-2">
            {targetWords.map((word, idx) => {
              const isAudioActive = activeWordIndex === idx;
              const isWordMatched = matchedIndices.includes(idx);
              const isKeyWord = turn.keyWords.includes(word.toLowerCase().replace(/[^a-z]/g, ''));

              return (
                <span
                  key={idx}
                  className={`text-xl md:text-3xl font-extrabold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                    isAudioActive
                      ? 'bg-amber-400 text-slate-900 scale-110 shadow-md ring-2 ring-amber-500'
                      : isWordMatched
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                      : isKeyWord
                      ? 'text-slate-800 underline decoration-amber-400 decoration-4'
                      : 'text-slate-700'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Korean Translation */}
          <p className="text-sm md:text-base font-medium text-slate-500 mt-1">
            {turn.koreanMeaning.replace(/\[이름\]/g, studentName || '친구')}
          </p>

          {/* Listen Audio Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => handlePlayTargetAudio(false)}
              disabled={isPlayingModelAudio}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 Listen</span>
            </button>

            <button
              onClick={() => handlePlayTargetAudio(true)}
              disabled={isPlayingModelAudio}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-sm border border-amber-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>🐢 Slow (천천히)</span>
            </button>
          </div>
        </div>
      </main>

      {/* ================= Screen 2: BOTTOM ZONE ================= */}
      <footer className="mt-3 flex flex-col gap-3">
        {/* Student Voice Recognition Status & Live Transcript */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-5 shadow-sm flex flex-col items-center">
          {/* Recognized Speech Feedback or Guidance Prompt */}
          <div className="w-full text-center min-h-[3.25rem] flex flex-col items-center justify-center mb-2">
            {micState === 'listening' ? (
              <div className="flex flex-col items-center gap-1.5 animate-pulse">
                <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm md:text-base">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span>듣고 있어요. 다 말하면 ■ 버튼을 눌러 주세요!</span>
                </div>
                {interimTranscript && (
                  <p className="text-xs md:text-sm font-semibold text-slate-700 bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full">
                    “{interimTranscript}”
                  </p>
                )}
              </div>
            ) : micState === 'processing' ? (
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm md:text-base animate-pulse">
                <Clock className="w-4 h-4 animate-spin text-amber-600" />
                <span>확인하고 있어요… 잠시만 기다려 주세요!</span>
              </div>
            ) : noSpeechDetected ? (
              <div className="flex flex-col items-center gap-1 animate-in fade-in">
                <div className="bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold shadow-xs flex items-center gap-2">
                  <span>👂</span>
                  <span>목소리가 들리지 않았어요. 다시 말해 볼까요?</span>
                </div>
                <p className="text-xs text-slate-500">
                  아래 [말하기 시작 (Start)] 버튼을 눌러 다시 시도해 주세요.
                </p>
              </div>
            ) : recognizedTranscript ? (
              <div className="animate-in fade-in">
                <span className="text-xs text-slate-400 font-semibold block">
                  내가 말한 내용:
                </span>
                <p className="text-base md:text-lg font-bold text-slate-800">
                  “{recognizedTranscript}”
                </p>
              </div>
            ) : (
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                아래 [말하기 시작 (Start)] 버튼을 누르고 영어를 말해보세요!
              </p>
            )}
          </div>

          {/* Large Mic Button with 3 states:
              1. Before recording: Mic icon + '말하기 시작 (Start)'
              2. While recording: Stop icon (■) + '말하기 끝 (Stop)' (Red)
              3. Processing: Clock spinner + '확인하고 있어요…' (Disabled)
          */}
          <div className="flex items-center justify-center my-1.5">
            {micState === 'listening' ? (
              <button
                onClick={handleStopRecording}
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-500/40 ring-4 ring-rose-250 transition-all scale-105 cursor-pointer animate-pulse"
                title="말하기 끝 (Stop)"
              >
                <Square className="w-8 h-8 md:w-9 md:h-9 fill-current" />
                <span className="text-xs md:text-sm font-black mt-1">말하기 끝 (Stop)</span>
              </button>
            ) : micState === 'processing' ? (
              <button
                disabled
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-amber-400 text-white flex flex-col items-center justify-center shadow-lg opacity-90 cursor-not-allowed"
                title="확인하고 있어요…"
              >
                <Clock className="w-8 h-8 md:w-9 md:h-9 animate-spin" />
                <span className="text-xs md:text-sm font-black mt-1">확인하고 있어요…</span>
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={isPlayingModelAudio}
                className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full text-white flex flex-col items-center justify-center shadow-xl transition-all cursor-pointer ${
                  isPlayingModelAudio
                    ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                    : isSuccess
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 ring-4 ring-emerald-200 hover:scale-105 active:scale-95'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40 ring-4 ring-amber-200 hover:scale-105 active:scale-95'
                }`}
                title="말하기 시작 (Start)"
              >
                <Mic className="w-8 h-8 md:w-9 md:h-9" />
                <span className="text-xs md:text-sm font-black mt-1">
                  {isSuccess ? '다시 말하기' : '말하기 시작 (Start)'}
                </span>
              </button>
            )}
          </div>

          {/* Ruby's Pedagogical Feedback Bubble (Section 7: Praise first, recast/elicitation/chunking) */}
          {feedback && (
            <div
              className={`w-full max-w-lg mt-3 p-3.5 rounded-2xl border text-center transition-all animate-in fade-in ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wide mb-1 text-slate-700">
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ruby is Happy! 짝꿍 루비의 응원</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Ruby's Hint · 루비의 친절한 힌트</span>
                  </>
                )}
              </div>
              <p className="text-sm md:text-base font-extrabold">{feedback.en}</p>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">({feedback.ko})</p>
            </div>
          )}
        </div>

        {/* Action Controls: [Try Again] [Next →] [Skip] */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Try Again */}
          <button
            onClick={() => {
              soundEffects.playPop();
              setRecognizedTranscript('');
              setFeedback(null);
              setNoSpeechDetected(false);
              handleStartRecording();
            }}
            disabled={isPlayingModelAudio || micState === 'processing'}
            className="flex-1 py-3 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs md:text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {/* Skip (PRD: Always allow Next and Skip) */}
          <button
            onClick={() => {
              soundEffects.playPop();
              onSkip();
            }}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-semibold text-xs md:text-sm transition-colors cursor-pointer"
          >
            Skip (건너뛰기)
          </button>

          {/* Next Button */}
          <button
            onClick={handleNextWithTransition}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs md:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSuccess
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-300 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
            }`}
          >
            <span>{turnIndex === totalTurns - 1 ? '결과 & 선물 받기' : 'Next →'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
