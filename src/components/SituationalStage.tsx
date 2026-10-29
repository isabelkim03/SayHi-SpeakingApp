import React from 'react';
import { DialogueTurn, CharacterCustomization, MicState } from '../types';
import { StandingCharacter } from './StandingCharacter';

interface SituationalStageProps {
  turn: DialogueTurn;
  studentName: string;
  customization: CharacterCustomization;
  micState: MicState;
  isPlayingModelAudio: boolean;
  isSuccess: boolean;
  isTurnTransitioning: boolean;
}

export const SituationalStage: React.FC<SituationalStageProps> = ({
  turn,
  studentName,
  customization,
  micState,
  isPlayingModelAudio,
  isSuccess,
  isTurnTransitioning,
}) => {
  const isBoy = customization.gender === 'boy';
  const resolvedTargetSentence = turn.studentTargetTemplate.replace(
    /\[name\]/g,
    studentName || 'Minho'
  );

  return (
    <div className="w-full h-84 sm:h-96 md:h-[430px] rounded-3xl overflow-hidden relative border-2 border-amber-200/90 shadow-md bg-amber-50 select-none">
      {/* 1. Environmental Clean Background (Warm Storybook Watercolor Scene) */}
      <img
        src={turn.situationImage}
        alt={turn.situationTitle}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover brightness-[0.98] transition-transform duration-700"
      />

      {/* Subtle Depth & Grounding Gradient (No heavy dark vignette) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15 pointer-events-none" />

      {/* 2. Top Location & Situation Title Tag */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-white/20">
          <span className="text-amber-300">📍 {turn.sceneName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-100 truncate max-w-[220px] sm:max-w-none">{turn.situationTitle}</span>
        </div>
      </div>

      {/* 3. Interactive Speech Bubbles (Positioned Directly Above Characters' Heads) */}
      <div className="absolute top-11 sm:top-12 left-2 right-2 flex items-start justify-between gap-2 z-30 pointer-events-none px-2 sm:px-6 md:px-10">
        {/* ================= RUBY'S SPEECH BUBBLE (Above Ruby's Head) ================= */}
        <div className="relative max-w-[48%] sm:max-w-[260px] md:max-w-[300px]">
          <div
            className={`bg-white/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl md:rounded-3xl shadow-lg border-2 transition-all pointer-events-auto ${
              isPlayingModelAudio
                ? 'border-amber-400 ring-4 ring-amber-300/50 scale-[1.02]'
                : 'border-amber-300/90'
            }`}
          >
            {/* Small Character Name Label inside Bubble */}
            <div className="text-[10px] sm:text-xs font-black text-amber-800 flex items-center gap-1.5 mb-0.5">
              <span>루비 (Ruby)</span>
              {isPlayingModelAudio && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  말하는 중
                </span>
              )}
            </div>
            {/* Question Text */}
            <p className="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-snug line-clamp-2">
              “{turn.partnerQuestion}”
            </p>
          </div>
          {/* Bubble Tail Pointing Down to Ruby's Head */}
          <div className="absolute -bottom-2 left-6 sm:left-10 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-amber-300/90 transform rotate-45" />
        </div>

        {/* ================= LEARNER'S SPEECH BUBBLE (Above Learner's Head) ================= */}
        <div className="relative max-w-[48%] sm:max-w-[260px] md:max-w-[300px] ml-auto">
          <div
            className={`bg-white/95 backdrop-blur-md px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl md:rounded-3xl shadow-lg border-2 transition-all pointer-events-auto ${
              micState === 'listening'
                ? 'border-rose-500 ring-4 ring-rose-300/50 scale-[1.02]'
                : isSuccess
                ? 'border-emerald-400 ring-4 ring-emerald-200/50'
                : 'border-indigo-300/90'
            }`}
          >
            {/* Small Character Name Label inside Bubble */}
            <div className="text-[10px] sm:text-xs font-black text-indigo-700 flex items-center justify-between gap-1 mb-0.5">
              <span className="truncate">
                {studentName || '나'} ({isBoy ? '남자' : '여자'})
              </span>
              {micState === 'listening' ? (
                <span className="text-[10px] text-rose-600 font-extrabold animate-pulse shrink-0">
                  🎤 말하는 중...
                </span>
              ) : isSuccess ? (
                <span className="text-[10px] text-emerald-600 font-bold shrink-0">
                  🌟 멋져요!
                </span>
              ) : null}
            </div>
            {/* Target Sentence Preview */}
            <p className="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-snug line-clamp-2">
              “{resolvedTargetSentence}”
            </p>
          </div>
          {/* Bubble Tail Pointing Down to Learner's Head */}
          <div className="absolute -bottom-2 right-6 sm:right-10 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-indigo-300/90 transform rotate-45" />
        </div>
      </div>

      {/* 4. Full-Body Characters Standing Directly on the Floor (No cards, No borders, No boxes) */}
      <div className="absolute inset-0 flex items-end justify-between px-3 sm:px-10 md:px-16 pb-2 z-10 pointer-events-none">
        {/* ================= LEFT: RUBY (Standing on Floor, Waving Hand) ================= */}
        <div className="relative flex flex-col items-center">
          <StandingCharacter
            isRuby={true}
            isSpeaking={isPlayingModelAudio}
            mood="happy"
            className="h-64 sm:h-76 md:h-88 w-44 sm:w-52 md:w-60"
          />
        </div>

        {/* ================= CENTER: SITUATIONAL PROPS (Ground-Level Interaction) ================= */}
        <div className="flex-1 flex flex-col items-center justify-end h-full pb-2 px-1 sm:px-4 pointer-events-none">
          {/* Turn 1: Welcome Friendship Sign */}
          {turn.no === 1 && (
            <div className="flex flex-col items-center animate-in fade-in duration-300 mb-1">
              <div className="bg-white/90 backdrop-blur-xs text-amber-900 border-2 border-amber-300 px-3 py-1 rounded-2xl text-[11px] md:text-xs font-bold shadow-md flex items-center gap-1.5">
                <span>🤝</span>
                <span>우리 오늘부터 친구야!</span>
              </div>
              <div className="w-24 sm:w-36 h-3 bg-black/20 rounded-full blur-[2px] mt-1" />
            </div>
          )}

          {/* Turn 2: Classroom Double Desk */}
          {turn.no === 2 && (
            <div className="flex flex-col items-center animate-in fade-in duration-300 mb-1">
              <div className="bg-amber-900/90 text-amber-100 border-2 border-amber-700 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2">
                <span className="text-sm">🪑</span>
                <span className="text-[11px] md:text-xs font-black">내 옆자리 (여기 앉아!)</span>
                <span className="text-sm">✏️</span>
              </div>
              <div className="w-28 sm:w-40 h-3 bg-black/25 rounded-full blur-[2px] mt-1" />
            </div>
          )}

          {/* Turn 3: Crayons & Drawing Sketchbook */}
          {turn.no === 3 && (
            <div className="flex flex-col items-center animate-in fade-in duration-300 mb-1">
              <div className="bg-white/95 text-slate-800 border-2 border-amber-400 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2">
                <span className="text-base">🖍️</span>
                <span className="text-[11px] md:text-xs font-black">그림 그리기 시간</span>
                <span className="text-base">🎨</span>
              </div>
              <div className="w-28 sm:w-40 h-3 bg-black/25 rounded-full blur-[2px] mt-1" />
            </div>
          )}

          {/* Turn 4: Playground Activity */}
          {turn.no === 4 && (
            <div className="flex flex-col items-center animate-in fade-in duration-300 mb-1">
              <div className="bg-emerald-600/90 text-white border-2 border-emerald-400 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2">
                <span className="text-sm">🛝</span>
                <span className="text-[11px] md:text-xs font-black">운동장 놀이터</span>
                <span className="text-sm">🏃</span>
              </div>
              <div className="w-28 sm:w-40 h-3 bg-black/25 rounded-full blur-[2px] mt-1" />
            </div>
          )}

          {/* Turn 5: Cafeteria Meal Trays */}
          {turn.no === 5 && (
            <div className="flex flex-col items-center animate-in fade-in duration-300 mb-1">
              <div className="bg-amber-800/90 text-amber-50 border-2 border-amber-600 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2">
                <span className="text-sm">🍱</span>
                <span className="text-[11px] md:text-xs font-black">맛있는 학교 급식</span>
                <span className="text-sm">🥛</span>
              </div>
              <div className="w-32 sm:w-44 h-3 bg-black/25 rounded-full blur-[2px] mt-1" />
            </div>
          )}
        </div>

        {/* ================= RIGHT: LEARNER (Standing on Floor, Facing Ruby) ================= */}
        <div className="relative flex flex-col items-center">
          <StandingCharacter
            customization={customization}
            flipHorizontal={true}
            isSpeaking={micState === 'listening'}
            mood={isSuccess ? 'cheering' : 'happy'}
            studentName={studentName}
            className="h-64 sm:h-76 md:h-88 w-44 sm:w-52 md:w-60"
          />
        </div>
      </div>

      {/* 5. Turn Transition Overlay */}
      {isTurnTransitioning && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300 z-40">
          <div className="text-5xl mb-2 animate-bounce">
            {turn.scene === 'classroom'
              ? '🤝'
              : turn.scene === 'playground'
              ? '🛝'
              : '🍱'}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-800">
            {turn.scene === 'classroom'
              ? '루비와 짝꿍이 되었어요!'
              : turn.scene === 'playground'
              ? '운동장에서 즐겁게 뛰어놀아요!'
              : '루비와 맛있는 점심을 먹어요!'}
          </h3>
          <p className="text-sm font-bold text-amber-700 mt-1">
            다음 상황으로 이동하는 중...
          </p>
        </div>
      )}
    </div>
  );
};
