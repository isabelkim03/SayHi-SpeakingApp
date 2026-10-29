import React from 'react';
import { Avatar } from './Avatar';
import { CharacterCustomization, GenderType } from '../types';
import { SCENE_IMAGES, BASE_CHARACTERS } from '../data/dialogue';
import { soundEffects } from '../utils/audioEffects';
import { ShieldCheck, Sparkles, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StartScreenProps {
  studentName: string;
  setStudentName: (name: string) => void;
  customization: CharacterCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<CharacterCustomization>>;
  crayons: number;
  onStart: () => void;
  browserWarning: string | null;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  studentName,
  setStudentName,
  customization,
  setCustomization,
  crayons,
  onStart,
  browserWarning,
}) => {
  const characters = [BASE_CHARACTERS.boy, BASE_CHARACTERS.girl];

  const handleSelectGender = (gender: GenderType) => {
    soundEffects.playPop();
    setCustomization((prev) => ({
      ...prev,
      gender,
    }));
  };

  const handleStart = () => {
    soundEffects.playPop();
    onStart();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 max-w-4xl mx-auto">
      {/* Top Bar with Crayon Wallet (No Back button on Start page) */}
      <div className="w-full flex items-center justify-end mb-1">
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-xs">
          <span>🖍️ 내 크레용:</span>
          <span className="font-mono text-xs md:text-sm">{crayons}개</span>
        </div>
      </div>

      {/* Top Header */}
      <header className="text-center pt-1 pb-3">
        <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>First Day of School · 첫 등교 날의 두근두근 첫인사</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
          Say Hi! <span className="text-amber-500">—</span> First Day of School
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-600 max-w-lg mx-auto">
          함께 학교에 갈 내 캐릭터를 골라 주세요!
        </p>
      </header>

      {/* Browser Environment Notice if needed */}
      {browserWarning && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm">
            <p className="font-semibold">{browserWarning}</p>
          </div>
        </div>
      )}

      {/* Middle Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 md:p-8 flex flex-col items-center relative">
          {/* Sunny Hill Elementary Classroom Banner */}
          <div className="w-full h-32 md:h-40 rounded-2xl overflow-hidden relative mb-5 shadow-inner border border-slate-100">
            <img
              src={SCENE_IMAGES.classroomBackdrop}
              alt="Sunny Hill Elementary School"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
              <span className="text-white text-xs md:text-sm font-medium">
                🏫 Sunny Hill Elementary School · 3학년 첫날 교실
              </span>
            </div>
          </div>

          {/* Large Live Preview of the Selected Character (Updates Immediately) */}
          <div className="relative -mt-16 md:-mt-20 flex flex-col items-center mb-4">
            <div className="p-1.5 bg-white rounded-3xl shadow-xl border-4 border-amber-300">
              <Avatar customization={customization} size="lg" mood="happy" />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                선택된 캐릭터: {customization.gender === 'boy' ? '남자 캐릭터' : '여자 캐릭터'}
              </span>
            </div>
          </div>

          {/* Character Selection Section Title */}
          <div className="w-full max-w-md mt-2 mb-3 text-center">
            <h2 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <span>🎨 내 캐릭터 고르기 (Choose Character)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              함께 학교에 갈 내 캐릭터를 골라 주세요!
            </p>
          </div>

          {/* 2 Character Cards: 남자 캐릭터 / 여자 캐릭터 */}
          <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-5">
            {characters.map((char) => {
              const isSelected = customization.gender === char.gender;
              return (
                <button
                  key={char.gender}
                  onClick={() => handleSelectGender(char.gender)}
                  className={`p-3.5 rounded-2xl border-3 flex flex-col items-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-4 ring-amber-200 shadow-md scale-102'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Yellow border + Checkmark when selected */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 fill-amber-500 text-white" />
                    </div>
                  )}

                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm mb-2">
                    <img
                      src={char.image}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-sm md:text-base font-black text-slate-800">
                    {char.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {char.enName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Student Name Input */}
          <div className="w-full max-w-sm mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              <span>영어로 불릴 내 이름:</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value.trim() || '')}
              placeholder="예: Minho, Sua, Jenny..."
              maxLength={15}
              className="w-full px-4 py-2.5 text-base font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-center"
            />
          </div>

          {/* Start Button: 학교에 가요! (Start) */}
          <button
            onClick={handleStart}
            className="w-full max-w-sm py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-black text-base md:text-lg rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>학교에 가요! (Start)</span>
            <span className="text-xl">🎒</span>
          </button>

          {/* Introduction Text at Bottom of Container */}
          <p className="text-xs text-slate-500 mt-4 text-center font-medium">
            영어로 말하고, 크레용을 모아 마지막에 내 캐릭터를 꾸며 보세요!
          </p>
        </div>
      </main>

      {/* Footer Voice Processing Notice */}
      <footer className="pt-2 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] md:text-xs text-center max-w-md">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Your voice is processed to turn it into text and is not recorded or saved.
            <br />
            (음성은 텍스트 변환을 위해서만 브라우저에서 안전하게 처리되며 저장되거나 기록되지 않습니다.)
          </span>
        </div>
      </footer>
    </div>
  );
};
