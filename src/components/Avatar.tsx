import React from 'react';
import { CharacterCustomization } from '../types';
import { SCENE_IMAGES } from '../data/dialogue';

interface AvatarProps {
  customization?: CharacterCustomization;
  isRuby?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  mood?: 'happy' | 'talking' | 'listening' | 'cheering';
}

export const Avatar: React.FC<AvatarProps> = ({
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
  size = 'md',
  className = '',
  mood = 'happy',
}) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24 md:w-28 md:h-28',
    lg: 'w-36 h-36 md:w-44 md:h-44',
    xl: 'w-52 h-52 md:w-64 md:h-64',
    '2xl': 'w-64 h-64 md:w-80 md:h-80',
  };

  const isBoy = customization.gender === 'boy';
  const baseImage = isRuby
    ? SCENE_IMAGES.rubyAvatar
    : isBoy
    ? SCENE_IMAGES.baseBoy
    : SCENE_IMAGES.baseGirl;

  return (
    <div
      className={`relative select-none flex items-center justify-center rounded-3xl overflow-hidden bg-gradient-to-b from-amber-50/40 to-slate-50 border-2 border-amber-200/60 shadow-md ${sizeMap[size]} ${className}`}
    >
      {/* Base Character Illustration in Storybook Watercolor Style */}
      <img
        src={baseImage}
        alt={isRuby ? 'Ruby' : isBoy ? 'Boy' : 'Girl'}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isSpeaking
            ? 'scale-105 brightness-105'
            : mood === 'cheering'
            ? 'scale-105'
            : 'scale-100'
        }`}
      />

      {/* Speaking Soundwave Glow Effect */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-3xl border-4 border-amber-400 animate-pulse pointer-events-none" />
      )}

      {/* Cheering Sparkle Embellishment */}
      {mood === 'cheering' && (
        <div className="absolute top-2 right-2 text-xl md:text-2xl animate-bounce pointer-events-none drop-shadow">
          🌟
        </div>
      )}

      {/* SVG Layer for Layered Dress-Up: Glasses, Hats, Bags, Outfits */}
      {!isRuby && (
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
        >
          {/* 1. BAG LAYER */}
          {customization.bag === 'bag_green_explorer' && (
            <g id="layer-bag-green">
              {/* Backpack straps over shoulders */}
              <path d="M 64 88 C 60 110 58 135 64 150" stroke="#059669" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M 136 88 C 140 110 142 135 136 150" stroke="#059669" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* Side pouch with key charm */}
              <circle cx="154" cy="140" r="10" fill="#10B981" stroke="#047857" strokeWidth="2" />
              <polygon points="154,136 156,140 160,140 157,143 158,147 154,145 150,147 151,143 148,140 152,140" fill="#FBBF24" />
            </g>
          )}

          {customization.bag === 'bag_red_star' && (
            <g id="layer-bag-red">
              <path d="M 64 88 C 60 110 58 135 64 150" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M 136 88 C 140 110 142 135 136 150" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* Star badge on strap */}
              <polygon points="68,105 70,109 74,109 71,112 72,116 68,114 64,116 65,112 62,109 66,109" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            </g>
          )}

          {customization.bag === 'bag_crayon_pouch' && (
            <g id="layer-bag-pouch">
              {/* Diagonal cross strap */}
              <line x1="68" y1="84" x2="145" y2="155" stroke="#D97706" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
              {/* Pouch */}
              <rect x="135" y="145" width="22" height="18" rx="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              {/* Mini crayons */}
              <rect x="140" y="140" width="3" height="7" fill="#EF4444" />
              <rect x="145" y="139" width="3" height="8" fill="#3B82F6" />
              <rect x="150" y="141" width="3" height="6" fill="#10B981" />
            </g>
          )}

          {customization.bag === 'bag_dino' && (
            <g id="layer-bag-dino">
              <path d="M 64 88 C 60 110 58 135 64 150" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M 136 88 C 140 110 142 135 136 150" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
              {/* Dino Keychain */}
              <circle cx="152" cy="142" r="10" fill="#14B8A6" stroke="#0F766E" strokeWidth="2" />
              <circle cx="149" cy="140" r="1.5" fill="#FFFFFF" />
              <path d="M 148 145 Q 152 148 156 144" stroke="#0F766E" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {/* 2. OUTFIT OVERLAY LAYER */}
          {customization.outfit === 'outfit_overalls' && (
            <g id="layer-overalls" opacity="0.92">
              {/* Denim Overalls Front & Straps */}
              <rect x="80" y="90" width="8" height="35" rx="2" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1" />
              <rect x="112" y="90" width="8" height="35" rx="2" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1" />
              <circle cx="84" cy="120" r="3" fill="#FBBF24" />
              <circle cx="116" cy="120" r="3" fill="#FBBF24" />
              {/* Center bib */}
              <path d="M 78 116 L 122 116 L 126 150 L 74 150 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
              <rect x="90" y="124" width="20" height="14" rx="3" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
            </g>
          )}

          {customization.outfit === 'outfit_yellow_hoodie' && (
            <g id="layer-hoodie" opacity="0.92">
              <path d="M 75 92 Q 100 112 125 92 L 132 152 L 68 152 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              {/* Hoodie collar & pouch */}
              <path d="M 85 92 Q 100 106 115 92" stroke="#D97706" strokeWidth="3" fill="#FBBF24" />
              <rect x="84" y="128" width="32" height="16" rx="4" fill="#D97706" />
              {/* Drawstrings */}
              <line x1="94" y1="102" x2="93" y2="118" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="106" y1="102" x2="107" y2="118" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {customization.outfit === 'outfit_rainbow' && (
            <g id="layer-rainbow" opacity="0.92">
              <path d="M 74 92 L 126 92 L 130 152 L 70 152 Z" fill="#10B981" />
              <path d="M 73 105 Q 100 110 127 105" stroke="#F59E0B" strokeWidth="5" fill="none" />
              <path d="M 71 118 Q 100 123 129 118" stroke="#EF4444" strokeWidth="5" fill="none" />
              <path d="M 70 131 Q 100 136 130 131" stroke="#3B82F6" strokeWidth="5" fill="none" />
            </g>
          )}

          {customization.outfit === 'outfit_uniform' && (
            <g id="layer-uniform" opacity="0.95">
              {/* Navy vest panels */}
              <path d="M 72 90 L 92 90 L 96 150 L 70 150 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
              <path d="M 128 90 L 108 90 L 104 150 L 130 150 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
              {/* White collar & red tie */}
              <polygon points="98,90 102,90 104,115 100,126 96,115" fill="#DC2626" />
              <circle cx="94" cy="130" r="2.5" fill="#FBBF24" />
              <circle cx="94" cy="142" r="2.5" fill="#FBBF24" />
            </g>
          )}

          {/* 3. GLASSES LAYER */}
          {customization.glasses === 'glasses_round_blue' && (
            <g id="layer-glasses-blue">
              <circle cx="86" cy="46" r="13" fill="none" stroke="#2563EB" strokeWidth="3" />
              <circle cx="114" cy="46" r="13" fill="none" stroke="#2563EB" strokeWidth="3" />
              <line x1="99" y1="46" x2="101" y2="46" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
              {/* Lens shine */}
              <line x1="88" y1="39" x2="92" y2="43" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              <line x1="116" y1="39" x2="120" y2="43" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            </g>
          )}

          {customization.glasses === 'glasses_tortoise' && (
            <g id="layer-glasses-brown">
              <rect x="74" y="36" width="24" height="20" rx="6" fill="none" stroke="#78350F" strokeWidth="3.2" />
              <rect x="102" y="36" width="24" height="20" rx="6" fill="none" stroke="#78350F" strokeWidth="3.2" />
              <line x1="98" y1="44" x2="102" y2="44" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          )}

          {customization.glasses === 'glasses_star' && (
            <g id="layer-glasses-star">
              {/* Left Star Frame */}
              <polygon points="86,34 89,41 97,41 90,46 93,54 86,49 79,54 82,46 75,41 83,41" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              {/* Right Star Frame */}
              <polygon points="114,34 117,41 125,41 118,46 121,54 114,49 107,54 110,46 103,41 111,41" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              <line x1="96" y1="44" x2="104" y2="44" stroke="#F59E0B" strokeWidth="2.5" />
            </g>
          )}

          {/* 4. HAIR / HAT LAYER */}
          {customization.hair === 'hair_pigtails' && (
            <g id="layer-hair-pigtails">
              {/* Cute Ribbons */}
              <circle cx="56" cy="48" r="6" fill="#EC4899" />
              <polygon points="56,48 48,42 48,54" fill="#F472B6" />
              <circle cx="144" cy="48" r="6" fill="#EC4899" />
              <polygon points="144,48 152,42 152,54" fill="#F472B6" />
            </g>
          )}

          {customization.hair === 'hair_curly' && (
            <g id="layer-hair-curly" opacity="0.9">
              <circle cx="75" cy="22" r="10" fill="#78350F" />
              <circle cx="92" cy="18" r="11" fill="#78350F" />
              <circle cx="108" cy="18" r="11" fill="#78350F" />
              <circle cx="125" cy="22" r="10" fill="#78350F" />
            </g>
          )}

          {customization.hair === 'hair_cap' && (
            <g id="layer-hair-cap">
              {/* Sporty Cap Crown */}
              <path d="M 66 32 C 66 14 82 8 100 8 C 118 8 134 14 134 32 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
              {/* Visor */}
              <path d="M 60 32 C 68 28 92 26 128 26 C 146 26 154 32 150 36 C 130 40 74 38 60 32 Z" fill="#1D4ED8" />
              <circle cx="100" cy="8" r="3" fill="#FBBF24" />
            </g>
          )}

          {customization.hair === 'hair_beret' && (
            <g id="layer-hair-beret">
              <path d="M 58 28 C 60 8 96 6 138 12 C 154 15 158 26 144 32 C 122 36 68 36 58 28 Z" fill="#BE185D" stroke="#9D174D" strokeWidth="1.5" />
              <circle cx="98" cy="6" r="2.5" fill="#831843" />
            </g>
          )}

          {customization.hair === 'hair_crown' && (
            <g id="layer-hair-crown">
              <polygon points="72,26 76,8 88,18 100,4 112,18 124,8 128,26" fill="#F59E0B" stroke="#D97706" strokeWidth="1.8" />
              <circle cx="76" cy="8" r="2.5" fill="#EF4444" />
              <circle cx="100" cy="4" r="3" fill="#3B82F6" />
              <circle cx="124" cy="8" r="2.5" fill="#10B981" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
