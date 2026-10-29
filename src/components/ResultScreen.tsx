import React from 'react';
import { CharacterCustomization } from '../types';
import { Avatar } from './Avatar';
import { soundEffects } from '../utils/audioEffects';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle2,
  Palette,
} from 'lucide-react';

interface ResultScreenProps {
  studentName: string;
  crayons: number;
  sessionCrayons: number;
  customization: CharacterCustomization;
  onGoToDressUp: () => void;
  onBack: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  studentName,
  crayons,
  sessionCrayons,
  customization,
  onGoToDressUp,
  onBack,
  onHome,
}) => {
  const handleDressUpClick = () => {
    soundEffects.playSuccessFanfare();
    onGoToDressUp();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 max-w-4xl mx-auto">
      {/* Top Bar with Back Button */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={() => {
            soundEffects.playPop();
            onBack();
          }}
          aria-label="Back"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-xs">
          <span>🖍️ 총 크레용:</span>
          <span className="font-mono text-sm font-extrabold">{crayons}개</span>
        </div>
      </div>

      {/* Main Result Card */}
      <main className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 flex flex-col items-center text-center max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1 rounded-full mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Activity Complete · 5개 첫날 대화 완료!</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            Fabulous speaking! 🌟
          </h1>

          <p className="text-base md:text-lg font-bold text-slate-700 mb-6">
            잘했어요! 모은 크레용으로 내 캐릭터를 꾸며 볼까요?
          </p>

          {/* Character Showcase */}
          <div className="p-3 bg-gradient-to-b from-amber-50 to-indigo-50/40 rounded-3xl border-3 border-amber-200 shadow-inner mb-6">
            <Avatar customization={customization} size="xl" mood="cheering" />
          </div>

          {/* Crayon Reward Stats */}
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-amber-700 block uppercase tracking-wide">
                이번 활동에서 얻은 크레용
              </span>
              <span className="text-2xl font-black text-amber-900 font-mono mt-0.5 block">
                +{sessionCrayons} 🖍️
              </span>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5">
              <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wide">
                현재 총 보유 크레용
              </span>
              <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                {crayons} 🖍️
              </span>
            </div>
          </div>

          {/* Primary CTA: 내 캐릭터 꾸미기 (Dress Up) */}
          <button
            onClick={handleDressUpClick}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white font-black text-lg md:text-xl rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
          >
            <Palette className="w-6 h-6 text-amber-100" />
            <span>내 캐릭터 꾸미기 (Dress Up)</span>
            <ArrowRight className="w-5 h-5 text-amber-200" />
          </button>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            soundEffects.playPop();
            onHome();
          }}
          className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs md:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>처음으로 (Home)</span>
        </button>
      </footer>
    </div>
  );
};
