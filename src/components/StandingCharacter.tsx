import React from 'react';
import { CharacterCustomization } from '../types';
import { SCENE_IMAGES } from '../data/dialogue';

interface StandingCharacterProps {
  customization?: CharacterCustomization;
  isRuby?: boolean;
  isSpeaking?: boolean;
  mood?: 'happy' | 'talking' | 'listening' | 'cheering';
  studentName?: string;
  flipHorizontal?: boolean;
  className?: string;
}

export const StandingCharacter: React.FC<StandingCharacterProps> = ({
  customization = {
    gender: 'boy',
    hair: 'hair_basic',
    outfit: 'outfit_basic',
    glasses: 'glasses_none',
    bag: 'bag_none',
    ownedItems: ['hair_basic', 'outfit_basic', 'glasses_none', 'bag_none'],
  },
  isRuby = false,
  isSpeaking = false,
  mood = 'happy',
  flipHorizontal = false,
  className = '',
}) => {
  const isBoy = customization.gender === 'boy';
  const characterImage = isRuby
    ? SCENE_IMAGES.rubyCutout
    : isBoy
    ? SCENE_IMAGES.boyCutout
    : SCENE_IMAGES.girlCutout;

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-end ${
        flipHorizontal ? '-scale-x-100' : ''
      } ${className}`}
    >
      {/* 1. Transparent Cutout Image of Full-Body Standing Watercolor Child */}
      <div className="relative w-full h-full flex items-end justify-center">
        <img
          src={characterImage}
          alt={isRuby ? 'Ruby' : isBoy ? 'Boy' : 'Girl'}
          referrerPolicy="no-referrer"
          className={`h-full w-auto max-w-full object-contain pointer-events-none select-none transition-transform duration-300 ${
            isSpeaking ? 'scale-[1.03] -translate-y-1' : mood === 'cheering' ? 'scale-[1.03] -translate-y-1.5' : ''
          }`}
          style={{
            filter: isSpeaking
              ? isRuby
                ? 'drop-shadow(0 4px 14px rgba(245, 158, 11, 0.45))'
                : 'drop-shadow(0 4px 14px rgba(244, 63, 94, 0.45))'
              : mood === 'cheering'
              ? 'drop-shadow(0 4px 14px rgba(16, 185, 129, 0.45))'
              : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12))',
          }}
        />

        {/* 2. Live SVG Dress-Up Layers for Learner Character (Calibrated for 1024x1024 Standing Cutout) */}
        {!isRuby && (
          <svg
            viewBox="0 0 1024 1024"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ================= A. BAG LAYER ================= */}
            {customization.bag === 'bag_green_explorer' && (
              <g id="standing-bag-green">
                {/* Backpack straps over shoulders */}
                <path d="M 430 330 C 410 420 395 520 425 610" stroke="#059669" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                <path d="M 594 330 C 614 420 629 520 599 610" stroke="#059669" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                {/* Side Pouch with Explorer Key Charm */}
                <circle cx="680" cy="560" r="42" fill="#10B981" stroke="#047857" strokeWidth="6" />
                <polygon points="680,540 688,555 705,555 692,568 696,584 680,576 664,584 668,568 655,555 672,555" fill="#FBBF24" />
              </g>
            )}

            {customization.bag === 'bag_red_star' && (
              <g id="standing-bag-red">
                <path d="M 430 330 C 410 420 395 520 425 610" stroke="#DC2626" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                <path d="M 594 330 C 614 420 629 520 599 610" stroke="#DC2626" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                {/* Star Emblem on Shoulder Strap */}
                <polygon points="435,420 443,435 460,435 447,448 451,464 435,456 419,464 423,448 410,435 427,435" fill="#FBBF24" stroke="#B45309" strokeWidth="3" />
              </g>
            )}

            {customization.bag === 'bag_crayon_pouch' && (
              <g id="standing-bag-pouch">
                {/* Diagonal Crossbody Strap */}
                <line x1="430" y1="320" x2="650" y2="600" stroke="#D97706" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
                {/* Pouch */}
                <rect x="610" y="550" width="90" height="75" rx="20" fill="#F59E0B" stroke="#B45309" strokeWidth="6" />
                {/* Crayon Sticks peeking out */}
                <rect x="630" y="530" width="12" height="30" rx="3" fill="#EF4444" />
                <rect x="650" y="525" width="12" height="35" rx="3" fill="#3B82F6" />
                <rect x="670" y="532" width="12" height="28" rx="3" fill="#10B981" />
              </g>
            )}

            {customization.bag === 'bag_dino' && (
              <g id="standing-bag-dino">
                <path d="M 430 330 C 410 420 395 520 425 610" stroke="#0284C7" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                <path d="M 594 330 C 614 420 629 520 599 610" stroke="#0284C7" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.95" />
                {/* Dino Badge */}
                <circle cx="680" cy="560" r="42" fill="#14B8A6" stroke="#0F766E" strokeWidth="6" />
                <circle cx="670" cy="550" r="6" fill="#FFFFFF" />
                <path d="M 665 570 Q 680 585 695 565" stroke="#0F766E" strokeWidth="6" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* ================= B. OUTFIT LAYER ================= */}
            {customization.outfit === 'outfit_overalls' && (
              <g id="standing-outfit-overalls" opacity="0.94">
                {/* Denim bib straps */}
                <rect x="420" y="340" width="30" height="130" rx="6" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="4" />
                <rect x="574" y="340" width="30" height="130" rx="6" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="4" />
                <circle cx="435" cy="455" r="9" fill="#FBBF24" />
                <circle cx="589" cy="455" r="9" fill="#FBBF24" />
                {/* Center Denim Bib */}
                <path d="M 410 440 L 614 440 L 626 580 L 398 580 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="5" />
                <rect x="470" y="470" width="84" height="60" rx="12" fill="#1E40AF" stroke="#60A5FA" strokeWidth="4" />
              </g>
            )}

            {customization.outfit === 'outfit_yellow_hoodie' && (
              <g id="standing-outfit-hoodie" opacity="0.95">
                <path d="M 380 340 Q 512 410 644 340 L 664 590 L 360 590 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="6" />
                {/* Warm collar & front pocket */}
                <path d="M 430 340 Q 512 390 594 340" stroke="#D97706" strokeWidth="10" fill="#FBBF24" />
                <rect x="430" y="490" width="164" height="65" rx="16" fill="#D97706" />
                {/* White drawstrings */}
                <line x1="480" y1="370" x2="475" y2="440" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
                <line x1="544" y1="370" x2="549" y2="440" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              </g>
            )}

            {customization.outfit === 'outfit_rainbow' && (
              <g id="standing-outfit-rainbow" opacity="0.95">
                <path d="M 378 340 L 646 340 L 660 590 L 364 590 Z" fill="#10B981" />
                <path d="M 374 395 Q 512 415 650 395" stroke="#F59E0B" strokeWidth="20" fill="none" />
                <path d="M 368 450 Q 512 470 656 450" stroke="#EF4444" strokeWidth="20" fill="none" />
                <path d="M 364 505 Q 512 525 660 505" stroke="#3B82F6" strokeWidth="20" fill="none" />
              </g>
            )}

            {customization.outfit === 'outfit_uniform' && (
              <g id="standing-outfit-uniform" opacity="0.95">
                {/* School Uniform Navy Vest */}
                <path d="M 370 335 L 465 335 L 480 580 L 360 580 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                <path d="M 654 335 L 559 335 L 544 580 L 664 580 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                {/* White Shirt V & Red Tie */}
                <polygon points="502,335 522,335 530,420 512,460 494,420" fill="#DC2626" />
                <circle cx="490" cy="480" r="8" fill="#FBBF24" />
                <circle cx="490" cy="530" r="8" fill="#FBBF24" />
              </g>
            )}

            {/* ================= C. GLASSES LAYER ================= */}
            {customization.glasses === 'glasses_round_blue' && (
              <g id="standing-glasses-blue">
                <circle cx="460" cy="230" r="50" fill="none" stroke="#2563EB" strokeWidth="11" />
                <circle cx="564" cy="230" r="50" fill="none" stroke="#2563EB" strokeWidth="11" />
                <line x1="508" y1="230" x2="516" y2="230" stroke="#2563EB" strokeWidth="11" strokeLinecap="round" />
                {/* Lens reflection glint */}
                <line x1="468" y1="205" x2="480" y2="217" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
                <line x1="572" y1="205" x2="584" y2="217" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
              </g>
            )}

            {customization.glasses === 'glasses_tortoise' && (
              <g id="standing-glasses-brown">
                <rect x="410" y="195" width="94" height="74" rx="22" fill="none" stroke="#78350F" strokeWidth="12" />
                <rect x="520" y="195" width="94" height="74" rx="22" fill="none" stroke="#78350F" strokeWidth="12" />
                <line x1="504" y1="225" x2="520" y2="225" stroke="#78350F" strokeWidth="12" strokeLinecap="round" />
              </g>
            )}

            {customization.glasses === 'glasses_star' && (
              <g id="standing-glasses-star">
                {/* Star Frames */}
                <polygon points="460,185 470,212 498,212 475,230 484,258 460,240 436,258 445,230 422,212 450,212" fill="none" stroke="#F59E0B" strokeWidth="10" />
                <polygon points="564,185 574,212 602,212 579,230 588,258 564,240 540,258 549,230 526,212 554,212" fill="none" stroke="#F59E0B" strokeWidth="10" />
                <line x1="496" y1="225" x2="528" y2="225" stroke="#F59E0B" strokeWidth="10" />
              </g>
            )}

            {/* ================= D. HAIR / HAT LAYER ================= */}
            {customization.hair === 'hair_pigtails' && (
              <g id="standing-hair-pigtails">
                <circle cx="340" cy="235" r="24" fill="#EC4899" />
                <polygon points="340,235 310,210 310,260" fill="#F472B6" />
                <circle cx="684" cy="235" r="24" fill="#EC4899" />
                <polygon points="684,235 714,210 714,260" fill="#F472B6" />
              </g>
            )}

            {customization.hair === 'hair_curly' && (
              <g id="standing-hair-curly" opacity="0.92">
                <circle cx="410" cy="130" r="38" fill="#78350F" />
                <circle cx="475" cy="115" r="42" fill="#78350F" />
                <circle cx="545" cy="115" r="42" fill="#78350F" />
                <circle cx="610" cy="130" r="38" fill="#78350F" />
              </g>
            )}

            {customization.hair === 'hair_cap' && (
              <g id="standing-hair-cap">
                <path d="M 380 160 C 380 90 440 60 512 60 C 584 60 644 90 644 160 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="6" />
                <path d="M 355 160 C 390 145 480 140 620 140 C 690 140 720 160 705 175 C 630 190 410 185 355 160 Z" fill="#1D4ED8" />
                <circle cx="512" cy="60" r="10" fill="#FBBF24" />
              </g>
            )}

            {customization.hair === 'hair_beret' && (
              <g id="standing-hair-beret">
                <path d="M 350 150 C 360 70 500 60 660 85 C 720 95 735 140 685 160 C 600 175 390 175 350 150 Z" fill="#BE185D" stroke="#9D174D" strokeWidth="6" />
                <circle cx="505" cy="60" r="10" fill="#831843" />
              </g>
            )}

            {customization.hair === 'hair_crown' && (
              <g id="standing-hair-crown">
                <polygon points="400,150 415,75 465,115 512,60 560,115 610,75 624,150" fill="#F59E0B" stroke="#D97706" strokeWidth="7" />
                <circle cx="415" cy="75" r="10" fill="#EF4444" />
                <circle cx="512" cy="60" r="12" fill="#3B82F6" />
                <circle cx="610" cy="75" r="10" fill="#10B981" />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* 3. Soft Realistic Ground Shadow directly touching the classroom/playground floor */}
      <div className="w-28 sm:w-36 md:w-44 h-3.5 bg-black/35 rounded-full blur-[2.5px] -mt-1.5 pointer-events-none" />
    </div>
  );
};
