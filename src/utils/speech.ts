// Browser Speech Recognition & Synthesis utility

export interface BrowserEnvStatus {
  speechRecognitionSupported: boolean;
  speechSynthesisSupported: boolean;
  isInAppBrowser: boolean;
  warningMessage: string | null;
}

// Detect in-app browsers like KakaoTalk, Instagram, Line, Naver
export function checkBrowserEnvironment(): BrowserEnvStatus {
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  const isInApp = /KAKAOTALK|Instagram|FB_IAB|FBAN|FBAV|Line\/|NAVER|Daum/i.test(ua);

  const SpeechRecognition =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const speechRecognitionSupported = Boolean(SpeechRecognition);
  const speechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  let warningMessage: string | null = null;

  if (isInApp) {
    warningMessage =
      '카카오톡이나 인스타그램 인앱 브라우저에서는 마이크 사용이 제한될 수 있어요. 오른쪽 위 메뉴(⋮)를 눌러 "Chrome으로 열기"나 "기본 브라우저로 열기"를 선택해 주세요.';
  } else if (!speechRecognitionSupported) {
    warningMessage =
      '이 브라우저는 음성 인식을 지원하지 않아요. 원활한 대화 연습을 위해 구글 크롬(Google Chrome) 브라우저에서 열어 주세요! (Please open it in Chrome.)';
  }

  return {
    speechRecognitionSupported,
    speechSynthesisSupported,
    isInAppBrowser: isInApp,
    warningMessage,
  };
}

// Best en-US voice selection
let cachedEnVoice: SpeechSynthesisVoice | null = null;
export function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (cachedEnVoice && voices.includes(cachedEnVoice)) {
    return cachedEnVoice;
  }

  // Prioritize natural US English voices
  const usVoices = voices.filter(
    (v) => v.lang.startsWith('en-US') || v.lang === 'en_US'
  );

  const preferred =
    usVoices.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Zira')
    ) ||
    usVoices[0] ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];

  cachedEnVoice = preferred || null;
  return cachedEnVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getEnglishVoice();
  };
}

// Read aloud with word highlight tracking
let currentActiveUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentActiveUtterance = null;
  }
}

export function speakText(
  text: string,
  options: {
    rate?: number; // 0.9 normal, 0.7 slow
    pitch?: number;
    onWordBoundary?: (wordIndex: number) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  currentActiveUtterance = utterance;

  utterance.lang = 'en-US';
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1.05; // slightly friendly child-friendly pitch

  const voice = getEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  // Split words to track boundaries
  const words = text.split(/\s+/).filter(Boolean);

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onboundary = (event) => {
    if (event.name === 'word') {
      const charIndex = event.charIndex;
      // Find which word index corresponds to charIndex
      let cumulative = 0;
      let matchedIndex = 0;
      for (let i = 0; i < words.length; i++) {
        const nextLen = cumulative + words[i].length + 1;
        if (charIndex >= cumulative && charIndex < nextLen) {
          matchedIndex = i;
          break;
        }
        cumulative = nextLen;
      }
      options.onWordBoundary?.(matchedIndex);
    }
  };

  utterance.onend = () => {
    currentActiveUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    currentActiveUtterance = null;
    options.onError?.(e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

// Clean text for comparison (remove punctuation, lower case)
export function cleanWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '')
    .trim();
}

// Compare student speech with target words
export function evaluateStudentSpeech(
  targetSentence: string,
  recognizedText: string,
  keyWords: string[],
  studentName: string
): {
  isSuccess: boolean;
  allKeyWordsFound: boolean;
  matchedWordIndices: number[];
  wordsDetail: {
    word: string;
    clean: string;
    matched: boolean;
    isKeyWord: boolean;
    isNameSlot: boolean;
  }[];
  recognizedCleanWords: string[];
  missingCount: number;
} {
  const targetWords = targetSentence.split(/\s+/).filter(Boolean);
  const recognizedCleanWords = recognizedText
    .split(/\s+/)
    .map(cleanWord)
    .filter(Boolean);

  const cleanStudentName = cleanWord(studentName);
  const cleanKeyWords = keyWords.map(cleanWord);

  const matchedWordIndices: number[] = [];
  const recognizedPool = [...recognizedCleanWords];

  const wordsDetail = targetWords.map((word, index) => {
    const clean = cleanWord(word);
    const isNameSlot = word.toLowerCase().includes('[name]') || clean === cleanStudentName;
    const isKeyWord = cleanKeyWords.includes(clean);

    let matched = false;
    if (isNameSlot) {
      // If recognized text has the student's name, or any name variation
      const nameIndex = recognizedPool.indexOf(cleanStudentName);
      if (nameIndex !== -1) {
        matched = true;
        recognizedPool.splice(nameIndex, 1);
      } else if (recognizedPool.length > 0) {
        // In speech recognition, names can sometimes be heard as similar sounding words.
        // If they spoke something around "I'm", give benefit of the doubt
        matched = true;
      }
    } else {
      const matchIdx = recognizedPool.indexOf(clean);
      if (matchIdx !== -1) {
        matched = true;
        recognizedPool.splice(matchIdx, 1);
      }
    }

    if (matched) {
      matchedWordIndices.push(index);
    }

    return {
      word,
      clean,
      matched,
      isKeyWord,
      isNameSlot,
    };
  });

  // Success rule: Saying all key words counts as success
  const allKeyWordsFound = cleanKeyWords.every((kw) =>
    recognizedCleanWords.includes(kw)
  );

  const totalMatched = matchedWordIndices.length;
  const missingCount = targetWords.length - totalMatched;

  // PRD: Saying all key words counts as success
  const isSuccess = allKeyWordsFound;

  return {
    isSuccess,
    allKeyWordsFound,
    matchedWordIndices,
    wordsDetail,
    recognizedCleanWords,
    missingCount,
  };
}
