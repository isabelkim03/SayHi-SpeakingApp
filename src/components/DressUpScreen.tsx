import React, { useState } from 'react';
import { CharacterCustomization, DressUpItem } from '../types';
import { DRESS_UP_ITEMS } from '../data/dressUpItems';
import { Avatar } from './Avatar';
import { soundEffects } from '../utils/audioEffects';
import {
  Sparkles,
  Check,
  RotateCcw,
  Home,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShoppingBag,
} from 'lucide-react';

interface DressUpScreenProps {
  studentName: string;
  crayons: number;
  setCrayons: React.Dispatch<React.SetStateAction<number>>;
  customization: CharacterCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<CharacterCustomization>>;
  onPlayAgain: () => void;
  onBack: () => void;
  onHome: () => void;
}

export const DressUpScreen: React.FC<DressUpScreenProps> = ({
  studentName,
  crayons,
  setCrayons,
  customization,
  setCustomization,
  onPlayAgain,
  onBack,
  onHome,
}) => {
  const [activeTab, setActiveTab] = useState<'hair' | 'outfit' | 'glasses' | 'bag'>('hair');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDoneModal, setShowDoneModal] = useState<boolean>(false);

  // Filter items by category
  const categoryItems = DRESS_UP_ITEMS.filter((item) => item.category === activeTab);

  const isItemOwned = (itemId: string) => customization.ownedItems.includes(itemId);

  const isItemEquipped = (item: DressUpItem) => {
    if (item.category === 'hair') return customization.hair === item.id;
    if (item.category === 'outfit') return customization.outfit === item.id;
    if (item.category === 'glasses') return customization.glasses === item.id;
    if (item.category === 'bag') return customization.bag === item.id;
    return false;
  };

  // Preview an item immediately when clicked
  const handleItemClick = (item: DressUpItem) => {
    soundEffects.playPop();

    // Immediately update preview in real-time
    setCustomization((prev) => {
      if (item.category === 'hair') return { ...prev, hair: item.id };
      if (item.category === 'outfit') return { ...prev, outfit: item.id };
      if (item.category === 'glasses') return { ...prev, glasses: item.id };
      if (item.category === 'bag') return { ...prev, bag: item.id };
      return prev;
    });

    if (isItemOwned(item.id)) {
      setToastMessage(`✨ ${item.nameKo}을(를) 착용했어요!`);
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  // Purchase an unowned item
  const handlePurchase = (item: DressUpItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();

    if (crayons < item.price) {
      setToastMessage(`🖍️ 크레용이 부족해요! (필요: ${item.price}개 / 보유: ${crayons}개)`);
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    // Deduct crayons and register item
    setCrayons((prev) => prev - item.price);
    soundEffects.playCrayonEarned();

    setCustomization((prev) => {
      const newOwned = [...prev.ownedItems, item.id];
      if (item.category === 'hair') return { ...prev, hair: item.id, ownedItems: newOwned };
      if (item.category === 'outfit') return { ...prev, outfit: item.id, ownedItems: newOwned };
      if (item.category === 'glasses') return { ...prev, glasses: item.id, ownedItems: newOwned };
      if (item.category === 'bag') return { ...prev, bag: item.id, ownedItems: newOwned };
      return { ...prev, ownedItems: newOwned };
    });

    setToastMessage(`🎉 ${item.nameKo} 구매 완료! 계속 무료로 착용할 수 있어요.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Done button handler
  const handleDone = () => {
    soundEffects.playSuccessFanfare();
    setShowDoneModal(true);
  };

  const tabs: { id: 'hair' | 'outfit' | 'glasses' | 'bag'; label: string; icon: string }[] = [
    { id: 'hair', label: '머리', icon: '🎀' },
    { id: 'outfit', label: '옷', icon: '👕' },
    { id: 'glasses', label: '안경', icon: '👓' },
    { id: 'bag', label: '가방', icon: '🎒' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-3 md:p-6 max-w-4xl mx-auto">
      {/* Top Header Bar */}
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
          <span>🖍️ 내 크레용:</span>
          <span className="font-mono text-sm font-extrabold">{crayons}개</span>
        </div>
      </div>

      {/* Title */}
      <header className="text-center py-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dress Up Studio · 캐릭터 꾸미기</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          내 캐릭터 꾸미기 (Dress Up)
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          아이템을 누르면 즉시 입어볼 수 있어요! 마음에 드는 아이템을 크레용으로 소장해 보세요.
        </p>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="w-full max-w-md mx-auto my-1 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs md:text-sm font-bold text-center shadow-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Middle Stage: Enlarged Character Preview + 4-Tab Wardrobe */}
      <main className="flex-1 my-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Enlarged Character Live Preview */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Character Preview
          </span>
          <h2 className="text-base font-black text-slate-800 mb-2">
            {studentName || '나의 캐릭터'} ({customization.gender === 'boy' ? '남자 캐릭터' : '여자 캐릭터'})
          </h2>

          <div className="p-3 bg-gradient-to-b from-amber-50 to-indigo-50/40 rounded-3xl border-3 border-amber-200 shadow-inner my-1">
            <Avatar customization={customization} size="xl" mood="cheering" />
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            선택한 머리, 옷, 안경, 가방이 실시간으로 입혀집니다!
          </p>
        </div>

        {/* Right Column: 4-Tab Wardrobe & Shop */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 md:p-5 shadow-sm flex flex-col">
          {/* Category Tabs: 머리 / 옷 / 안경 / 가방 */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveTab(tab.id);
                  }}
                  className={`py-2 px-1 text-xs md:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Item Grid for Current Category */}
          <div className="grid grid-cols-2 gap-3 max-h-84 overflow-y-auto pr-1">
            {categoryItems.map((item) => {
              const owned = isItemOwned(item.id);
              const equipped = isItemEquipped(item);
              const canAfford = crayons >= item.price;
              const isFree = item.price === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    equipped
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs"
                      style={{ backgroundColor: item.previewColor }}
                    >
                      {item.icon}
                    </div>

                    {/* Price Badge */}
                    <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      {isFree ? (
                        <span className="text-emerald-700 font-sans font-bold">무료</span>
                      ) : (
                        <>
                          <span>🖍️</span>
                          <span>{item.price}개</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Item Info */}
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-slate-800 leading-tight">
                      {item.nameKo}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Button: 착용 중 / 착용하기 / 구매하기 */}
                  <div className="mt-3">
                    {equipped ? (
                      <div className="w-full py-1.5 px-2 bg-amber-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>착용 중</span>
                      </div>
                    ) : owned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        입기 (Wear)
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handlePurchase(item, e)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                          canAfford
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer active:scale-95'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                            <span>구매하기 ({item.price} 🖍️)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>크레용 부족</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Area: 꾸미기 완료 (Done) Button */}
      <footer className="pt-2 flex flex-col items-center">
        <button
          onClick={handleDone}
          className="w-full max-w-md py-4 px-8 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-lg md:text-xl rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-100" />
          <span>꾸미기 완료 (Done)</span>
        </button>
      </footer>

      {/* Completion Modal: 나만의 캐릭터 완성! */}
      {showDoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              나만의 캐릭터 완성!
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 mb-4">
              멋지게 꾸민 내 캐릭터와 함께 첫 등교 대화를 다시 해볼까요?
            </p>

            {/* Character Showcase in Modal */}
            <div className="p-3 bg-gradient-to-b from-amber-50 to-indigo-50/40 rounded-3xl border-3 border-amber-300 shadow-inner mb-5">
              <Avatar customization={customization} size="xl" mood="cheering" />
            </div>

            {/* Modal Actions */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  soundEffects.playPop();
                  setShowDoneModal(false);
                  onPlayAgain();
                }}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 연습하기 (Play Again)</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playPop();
                  setShowDoneModal(false);
                  onHome();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>처음으로 (Home)</span>
              </button>

              <button
                onClick={() => setShowDoneModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 mt-1 cursor-pointer font-medium"
              >
                계속 꾸미기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
