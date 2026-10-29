import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK if API key exists
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// Fallback lookup table per dialogue turn according to PRD Section 7
interface TurnFeedbackMap {
  [key: number]: {
    success: { en: string; ko: string };
    successMissingSmall: { en: string; ko: string };
    recast: { en: string; ko: string };
    elicitation: { en: string; ko: string };
    chunking: { en: string; ko: string };
  };
}

const FALLBACK_FEEDBACK: TurnFeedbackMap = {
  1: {
    success: {
      en: "Nice to meet you too! I'm glad we are friends.",
      ko: "나도 만나서 반가워! 친구가 되어 정말 기뻐.",
    },
    successMissingSmall: {
      en: "I understood you! “Hi! I’m [name]. Nice to meet you!”",
      ko: "무슨 말인지 알겠어! “안녕! 나는 [이름]이야. 만나서 반가워!”",
    },
    recast: {
      en: "Good try! “Hi! I’m [name]. Nice to meet you!”",
      ko: "잘 시도했어! “안녕! 나는 [이름]이야. 만나서 반가워!”",
    },
    elicitation: {
      en: "Good effort! Hi! I’m [name]. N___ to m___ you!",
      ko: "잘 노력했어! 빈칸의 '반가워'는 Nice, Meet으로 시작해.",
    },
    chunking: {
      en: "Good effort! Try these small parts: “Hi, I’m [name]!” / “Nice to meet you!”",
      ko: "잘 노력했어! 짧게 나누어 말해 보자: “안녕, 나는 [이름]이야!” / “만나서 반가워!”",
    },
  },
  2: {
    success: {
      en: "Nice job! You can sit next to me.",
      ko: "잘했어! 내 옆에 앉아도 돼.",
    },
    successMissingSmall: {
      en: "I understood you! “Can I sit here?”",
      ko: "무슨 말인지 알겠어! “여기 앉아도 돼?”",
    },
    recast: {
      en: "Good try! “Can I sit here?”",
      ko: "잘 시도했어! “여기 앉아도 돼?”",
    },
    elicitation: {
      en: "Good effort! Can I s___ here?",
      ko: "잘 노력했어! 빈칸에 들어갈 ‘앉다’는 s로 시작해.",
    },
    chunking: {
      en: "Good effort! Try these small parts: “Can I” / “sit here?”",
      ko: "잘 노력했어! 짧게 나누어 말해 보자: “내가” / “여기 앉아도 돼?”",
    },
  },
  3: {
    success: {
      en: "Awesome! I really love drawing colorful pictures too.",
      ko: "멋져! 나도 알록달록 그림 그리는 걸 정말 좋아해.",
    },
    successMissingSmall: {
      en: "I understood you! “I like drawing. What about you?”",
      ko: "무슨 말인지 알겠어! “나는 그림 그리는 걸 좋아해. 너는?”",
    },
    recast: {
      en: "Good try! “I like drawing. What about you?”",
      ko: "잘 시도했어! “나는 그림 그리는 걸 좋아해. 너는?”",
    },
    elicitation: {
      en: "Good effort! I l___ drawing. What a___ you?",
      ko: "잘 노력했어! '좋아하다'는 like, '너는?'은 about you야.",
    },
    chunking: {
      en: "Good effort! Try these small parts: “I like drawing.” / “What about you?”",
      ko: "잘 노력했어! 짧게 나누어 말해 보자: “나는 그림이 좋아.” / “너는 어때?”",
    },
  },
  4: {
    success: {
      en: "Yay! Let's go outside and play together right now!",
      ko: "야호! 지금 당장 나가서 같이 재미있게 놀자!",
    },
    successMissingSmall: {
      en: "I understood you! “Can I play with you?”",
      ko: "무슨 말인지 알겠어! “너랑 같이 놀아도 돼?”",
    },
    recast: {
      en: "Good try! “Can I play with you?”",
      ko: "잘 시도했어! “너랑 같이 놀아도 돼?”",
    },
    elicitation: {
      en: "Good effort! Can I p___ with you?",
      ko: "잘 노력했어! 빈칸에 들어갈 ‘놀다’는 p로 시작해.",
    },
    chunking: {
      en: "Good effort! Try these small parts: “Can I play” / “with you?”",
      ko: "잘 노력했어! 짧게 나누어 말해 보자: “놀아도 돼?” / “너랑 같이?”",
    },
  },
  5: {
    success: {
      en: "Yes, delicious! Let’s find a seat and eat lunch together!",
      ko: "응, 정말 맛있겠다! 같이 자리 잡고 점심 먹자!",
    },
    successMissingSmall: {
      en: "I understood you! “Let’s eat together!”",
      ko: "무슨 말인지 알겠어! “같이 먹자!”",
    },
    recast: {
      en: "Good try! “Let’s eat together!”",
      ko: "잘 시도했어! “같이 먹자!”",
    },
    elicitation: {
      en: "Good effort! Let’s e___ together!",
      ko: "잘 노력했어! 빈칸에 들어갈 ‘먹다’는 e로 시작해.",
    },
    chunking: {
      en: "Good effort! Try these small parts: “Let’s eat” / “together!”",
      ko: "잘 노력했어! 짧게 나누어 말해 보자: “먹자” / “함께!”",
    },
  },
};

// API Endpoint for generating Ruby's pedagogical feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const {
      turnNo = 1,
      targetSentence = '',
      recognizedText = '',
      keyWords = [],
      attemptCount = 1,
      studentName = 'Friend',
      isSuccess = false,
      allKeyWordsFound = false,
      missingCount = 0,
    } = req.body;

    const turnData = FALLBACK_FEEDBACK[turnNo] || FALLBACK_FEEDBACK[1];

    // Determine deterministic fallback according to Section 7
    let fallback = turnData.recast;
    if (!recognizedText || recognizedText.trim().length === 0) {
      fallback = {
        en: "Let’s try again! Tap the mic and speak when you’re ready.",
        ko: "다시 해 보자! 준비되면 마이크를 누르고 말해 줘.",
      };
    } else if (isSuccess || allKeyWordsFound) {
      if (missingCount > 0) {
        fallback = turnData.successMissingSmall;
      } else {
        fallback = turnData.success;
      }
    } else {
      if (attemptCount === 1) {
        fallback = turnData.recast;
      } else if (attemptCount === 2) {
        fallback = turnData.elicitation;
      } else {
        fallback = turnData.chunking;
      }
    }

    // Replace [name] with studentName if present in fallback
    const resolvedFallback = {
      en: fallback.en.replace(/\[name\]/g, studentName),
      ko: fallback.ko.replace(/\[이름\]/g, studentName),
    };

    // If Gemini AI is available, generate dynamically adhering strictly to Section 7 rules
    if (ai) {
      try {
        const prompt = `You are Ruby, an encouraging and patient 3rd-grade elementary school classmate in Korea.
A student named "${studentName}" just spoke English for Turn #${turnNo} of 5 on their first day of school.

Target sentence: "${targetSentence.replace(/\[name\]/g, studentName)}"
Key words required for success: ${JSON.stringify(keyWords)}
What student said: "${recognizedText || '(Nothing heard)'}"
Attempt number for this sentence: ${attemptCount}
All key words detected: ${allKeyWordsFound ? 'YES' : 'NO'}
Success status: ${isSuccess ? 'SUCCESS' : 'NEEDS PRACTICE'}

PEDAGOGICAL RULES (PRD Section 7):
1. Praise first and focus on ONE thing to improve.
2. Max 2 sentences total.
3. Keep English simple for CEFR A1-A2 (ages 8-10).
4. Include natural, warm Korean translation in parentheses for every sentence.
5. If success, celebrate warmly! If small non-key word was missing, praise that you understood!
6. If not yet successful:
   - Attempt 1: Recast gently (model the natural sentence, e.g. "Good try! ...")
   - Attempt 2: Elicitation with first-letter hint for a missing word (e.g. "Good effort! ... s___ ...")
   - Attempt 3+: Chunking (break into 2 small pieces, e.g. "Good effort! Try these small parts: ...")
7. NEVER say "wrong", NEVER show percentage or accuracy scores, NEVER explain tongue/mouth physical positions.
8. If nothing was said, warmly invite them: "Let’s try again! Tap the mic and speak when you’re ready. (다시 해 보자! 준비되면 마이크를 누르고 말해 줘.)"

Respond in JSON format:
{
  "en": "English feedback sentence(s)",
  "ko": "Korean translation matching the English"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawText = response.text?.trim();
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.en && parsed.ko) {
            return res.json({
              feedbackEnglish: parsed.en,
              feedbackKorean: parsed.ko,
              source: 'gemini',
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using Section 7 fallback:', geminiError);
      }
    }

    // Return fallback response
    return res.json({
      feedbackEnglish: resolvedFallback.en,
      feedbackKorean: resolvedFallback.ko,
      source: 'rule_engine',
    });
  } catch (error: any) {
    console.error('Server error in /api/feedback:', error);
    return res.status(500).json({
      feedbackEnglish: "Great effort! Tap the mic and try again.",
      feedbackKorean: "정말 잘했어! 마이크를 누르고 다시 해 보자.",
      error: error?.message,
    });
  }
});

// Production or Vite development mode
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
