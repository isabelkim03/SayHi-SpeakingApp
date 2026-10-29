export interface DialogueTurn {
  no: number;
  partnerName: string;
  partnerQuestion: string;
  partnerQuestionKo: string;
  studentTargetTemplate: string; // e.g. "Hi! I’m [name]. Nice to meet you!"
  koreanMeaning: string;
  keyWords: string[]; // required keywords for success
  scene: 'classroom' | 'playground' | 'lunchroom';
  sceneName: string;
  situationTitle: string;
  situationImage: string;
  partnerAction: string; // e.g. "waving", "smiling", "inviting"
}

export interface WordMatchStatus {
  word: string;
  cleanWord: string;
  matched: boolean;
  isKeyWord: boolean;
  isNameSlot: boolean;
}

export type GenderType = 'boy' | 'girl';

export interface CharacterCustomization {
  gender: GenderType;
  hair: string; // e.g. 'hair_basic', 'hair_pigtails', 'hair_curly', 'hair_cap', 'hair_beret', 'hair_crown'
  outfit: string; // e.g. 'outfit_basic', 'outfit_overalls', 'outfit_yellow_hoodie', 'outfit_rainbow', 'outfit_uniform'
  glasses: string; // e.g. 'glasses_none', 'glasses_round_blue', 'glasses_tortoise', 'glasses_star'
  bag: string; // e.g. 'bag_none', 'bag_green_explorer', 'bag_red_star', 'bag_crayon_pouch', 'bag_dino'
  ownedItems: string[]; // list of item IDs owned by the user
}

export interface DressUpItem {
  id: string;
  category: 'hair' | 'outfit' | 'glasses' | 'bag';
  name: string;
  nameKo: string;
  price: number; // 0 for free basics, 2~5 for additional
  icon: string;
  previewColor: string;
  description: string;
}

export type MicState = 'ready' | 'listening' | 'processing' | 'done';
