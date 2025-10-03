import { GoogleGenAI, Type, Content } from "@google/genai";
import type { ChatMessage } from '../types';
import { coffeeShopReferences, type CoffeeShopReference } from '../data/coffeeShops';

let ai: GoogleGenAI;

const FALLBACK_API_KEY = 'AIzaSyBgaJwTn-S1amEYU0uW-F8eg5VVo5k6l4k';

function resolveApiKey(): string | undefined {
    let apiKey: string | undefined;

    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
        const importMetaEnv = (typeof import.meta !== 'undefined') ? import.meta.env : undefined;
        apiKey = importMetaEnv?.VITE_GEMINI_API_KEY || importMetaEnv?.GEMINI_API_KEY || importMetaEnv?.API_KEY;
    }

    if (!apiKey && typeof globalThis !== 'undefined') {
        const globalConfig = (globalThis as Record<string, unknown> | undefined)?.__APP_CONFIG__ as Record<string, string> | undefined;
        apiKey = globalConfig?.API_KEY || globalConfig?.GEMINI_API_KEY;
    }

    return apiKey || FALLBACK_API_KEY;
}

function getClient(): GoogleGenAI {
    if (!ai) {
        const apiKey = resolveApiKey();

        if (!apiKey) {
            throw new Error("The API_KEY environment variable is not set. Please configure it in your deployment environment to use the AI features.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

const coffeeShopSchema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "Jawaban teks biasa untuk sapaan, pertanyaan umum, atau sebagai pengantar untuk rekomendasi."
    },
    recommendations: {
      type: Type.ARRAY,
      description: "Daftar rekomendasi coffee shop, hanya jika pengguna secara eksplisit memintanya.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Nama coffee shop.' },
          address: { type: Type.STRING, description: 'Alamat lengkap coffee shop.' },
          reason: { type: Type.STRING, description: 'Alasan singkat mengapa tempat ini cozy atau nyaman.' },
        },
        required: ["name", "address", "reason"],
      },
    },
  },
  required: ["reply"]
};

const modelConfig = {
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: `Kamu adalah "Barista AI", barista virtual yang ramah dan ahli kopi di Bandung.
- Kamu akan menerima daftar referensi coffee shop yang sudah diverifikasi dari Google Maps. Gunakan nama dan alamat persis seperti yang ada di daftar itu ketika memberi rekomendasi.
- Selalu isi properti 'reply' dengan jawaban teks yang relevan dan ramah.
- Jika pengguna meminta rekomendasi, berikan tepat 5 entri di 'recommendations'. Prioritaskan kecocokan area/kawasan yang disebutkan pengguna dan usahakan tetap ada variasi suasana (work-friendly, outdoor, heritage, dll) selama masih relevan.
- Tulis setiap 'reason' maksimal dalam satu kalimat ringkas (±18 kata) yang menonjolkan nilai utama tempat tersebut.
- Jika pengguna tidak membutuhkan rekomendasi, kosongkan 'recommendations'.
- Selalu jawab dalam format JSON yang valid sesuai skema.`,
        responseMimeType: "application/json",
        responseSchema: coffeeShopSchema,
    },
};

const MAX_REFERENCE_COUNT = 12;

const TAG_DESCRIPTIONS: Record<string, string> = {
    "work-friendly": "nyaman untuk kerja atau nugas",
    "wifi": "punya wifi dan colokan",
    "quiet": "suasananya tenang",
    "view": "punya pemandangan bagus",
    "outdoor": "ada area outdoor atau garden",
    "nature": "dikelilingi suasana alam",
    "late-night": "buka sampai malam",
    "24 hours": "buka 24 jam",
    "instagrammable": "instagrammable untuk foto",
    "romantic": "cocok buat kencan",
    "family": "ramah keluarga",
    "brunch": "punya menu brunch atau makan berat",
    "restaurant": "menyediakan makanan lengkap",
    "manual brew": "unggul di manual brew",
    "roastery": "punya roastery sendiri",
    "community": "sering dipakai komunitas",
    "affordable": "harganya terjangkau",
    "mall": "berada di dalam mall",
    "pool": "memiliki area unik seperti pool",
    "dessert": "dessert atau pastry enak",
    "specialty coffee": "fokus specialty coffee",
};

const KEYWORD_TAG_RULES: Array<{ tags: string[]; patterns: RegExp[] }> = [
    { tags: ["work-friendly", "wifi"], patterns: [/kerja/i, /wfh/i, /laptop/i, /nugas/i, /skripsi/i, /deadline/i, /meeting/i, /kantor/i, /produktif/i, /cowork/i, /tugas/i] },
    { tags: ["quiet"], patterns: [/tenang/i, /sunyi/i, /sepi/i, /fokus/i, /focus/i] },
    { tags: ["late-night", "24 hours"], patterns: [/24\s*jam/i, /larut/i, /dini hari/i, /malam/i, /night owl/i] },
    { tags: ["view", "sunset", "night"], patterns: [/pemandangan/i, /view/i, /panorama/i, /city light/i, /sunset/i, /sunrise/i] },
    { tags: ["outdoor", "nature"], patterns: [/outdoor/i, /taman/i, /garden/i, /teras/i, /alam/i, /hutan/i, /segar/i, /adem/i] },
    { tags: ["instagrammable", "dessert"], patterns: [/instagram/i, /estetik/i, /foto/i, /fotogenik/i, /igable/i, /cantik/i] },
    { tags: ["family"], patterns: [/keluarga/i, /kids/i, /anak/i, /ramah anak/i, /family/i] },
    { tags: ["romantic"], patterns: [/romantis/i, /date/i, /pacar/i, /kencan/i] },
    { tags: ["brunch", "restaurant"], patterns: [/brunch/i, /sarapan/i, /makan/i, /food/i, /kuliner/i, /resto/i] },
    { tags: ["manual brew", "roastery"], patterns: [/manual brew/i, /v60/i, /filter/i, /single origin/i, /roastery/i] },
    { tags: ["community"], patterns: [/komunitas/i, /gathering/i, /meetup/i] },
    { tags: ["mall"], patterns: [/mall/i, /tsm/i, /trans studio/i] },
    { tags: ["affordable"], patterns: [/murah/i, /hemat/i, /budget/i, /terjangkau/i] },
];

interface QueryAnalysis {
    raw: string;
    normalized: string;
    matchedTags: Set<string>;
    matchedAreas: Set<string>;
    wantsRecommendation: boolean;
}

const normalize = (text: string): string => text.normalize("NFKD").toLowerCase();

const analyseQuery = (query: string): QueryAnalysis => {
    const normalized = normalize(query);
    const matchedTags = new Set<string>();

    KEYWORD_TAG_RULES.forEach((rule) => {
        if (rule.patterns.some((pattern) => pattern.test(normalized))) {
            rule.tags.forEach((tag) => matchedTags.add(tag));
        }
    });

    const matchedAreas = new Set<string>();
    coffeeShopReferences.forEach((shop) => {
        shop.areas.forEach((area) => {
            const areaNormalized = normalize(area);
            if (areaNormalized.length < 4) {
                return;
            }
            if (normalized.includes(areaNormalized)) {
                matchedAreas.add(area);
                return;
            }
            const tokens = areaNormalized.split(/[\s,]+/).filter((token) => token.length >= 4);
            if (tokens.some((token) => normalized.includes(token))) {
                matchedAreas.add(area);
            }
        });
    });

    const wantsRecommendation = /rekomendasi|saran|cari|dimana|mana ya|list|apa saja|tempat|cafe|kopi|coffee/.test(normalized)
        || matchedTags.size > 0
        || matchedAreas.size > 0;

    return {
        raw: query,
        normalized,
        matchedTags,
        matchedAreas,
        wantsRecommendation,
    };
};

const computeShopScore = (shop: CoffeeShopReference, analysis: QueryAnalysis): number => {
    const { normalized, matchedAreas, matchedTags, wantsRecommendation } = analysis;
    let score = 0.6 + shop.rating / 5;

    if (!normalized.trim()) {
        return score;
    }

    const nameNormalized = normalize(shop.name);
    if (normalized.includes(nameNormalized)) {
        score += 6;
    }

    shop.areas.forEach((area) => {
        const areaNormalized = normalize(area);
        if (normalized.includes(areaNormalized)) {
            score += 5;
        } else {
            const tokens = areaNormalized.split(/[\s,]+/).filter((token) => token.length >= 4);
            if (tokens.some((token) => normalized.includes(token))) {
                score += 2.5;
            }
        }

        matchedAreas.forEach((matchedArea) => {
            if (normalize(matchedArea) === areaNormalized) {
                score += 2.5;
            }
        });
    });

    shop.tags.forEach((tag) => {
        if (matchedTags.has(tag)) {
            score += 3;
        }
    });

    if (wantsRecommendation) {
        score += 0.6;
    }

    if (normalized.includes("murah") || normalized.includes("hemat") || normalized.includes("budget") || normalized.includes("terjangkau")) {
        if (shop.tags.includes("affordable")) {
            score += 2.8;
        }
    }

    if (normalized.includes("malam") || normalized.includes("larut")) {
        if (shop.tags.includes("late-night") || shop.tags.includes("24 hours") || shop.tags.includes("night")) {
            score += 2.4;
        }
    }

    if (normalized.includes("foto") || normalized.includes("instagram")) {
        if (shop.tags.includes("instagrammable")) {
            score += 2.2;
        }
    }

    if (normalized.includes("keluarga") || normalized.includes("anak")) {
        if (shop.tags.includes("family")) {
            score += 2.2;
        }
    }

    if (normalized.includes("alam") || normalized.includes("sejuk")) {
        if (shop.tags.includes("nature") || shop.tags.includes("outdoor") || shop.tags.includes("view")) {
            score += 2;
        }
    }

    if (normalized.includes("kerja") || normalized.includes("nugas") || normalized.includes("laptop")) {
        if (shop.tags.includes("work-friendly")) {
            score += 2.6;
        }
    }

    return score;
};

const selectReferenceShops = (analysis: QueryAnalysis): CoffeeShopReference[] => {
    const ranked = coffeeShopReferences
        .map((shop) => ({ shop, score: computeShopScore(shop, analysis) }))
        .sort((a, b) => b.score - a.score);

    const unique: CoffeeShopReference[] = [];
    const seen = new Set<string>();

    for (const { shop } of ranked) {
        if (seen.has(shop.name)) {
            continue;
        }
        unique.push(shop);
        seen.add(shop.name);
        if (unique.length >= MAX_REFERENCE_COUNT) {
            break;
        }
    }

    return unique;
};

const formatList = (items: string[]): string => {
    if (items.length === 0) {
        return "";
    }
    if (items.length === 1) {
        return items[0];
    }
    const [last, ...restReverse] = items.slice().reverse();
    const rest = restReverse.reverse();
    return `${rest.join(', ')} dan ${last}`;
};

const describeTags = (tags: string[]): string => {
    const descriptions = tags
        .map((tag) => TAG_DESCRIPTIONS[tag] || tag)
        .filter((value, index, array) => array.indexOf(value) === index);
    return formatList(descriptions);
};

const formatShopContext = (shop: CoffeeShopReference, index: number): string => {
    const areaText = shop.areas.join(', ');
    const tagsText = shop.tags.join(', ');
    return `${index + 1}. ${shop.name} | Alamat: ${shop.address} | Area: ${areaText} | Tag: ${tagsText} | Rating Google Maps: ${shop.rating.toFixed(1)} | Mood: ${shop.mood} | Highlight: ${shop.reason} | Pencarian Google Maps: ${shop.mapsQuery}`;
};

const buildGuidanceText = (analysis: QueryAnalysis): string => {
    const areaHighlights = Array.from(analysis.matchedAreas);
    const tagHighlights = Array.from(analysis.matchedTags);

    const guidanceParts: string[] = [];

    if (areaHighlights.length > 0) {
        guidanceParts.push(`Prioritaskan opsi yang berada di kawasan ${formatList(areaHighlights)}.`);
    }

    if (tagHighlights.length > 0) {
        const tagDescription = describeTags(tagHighlights);
        if (tagDescription) {
            guidanceParts.push(`Utamakan tempat yang ${tagDescription}.`);
        }
    }

    guidanceParts.push("Tetap usahakan pilihannya beragam supaya pengguna bisa membandingkan suasana yang berbeda.");

    return guidanceParts.join('\n');
};

const buildPrompt = (analysis: QueryAnalysis, references: CoffeeShopReference[]): string => {
    const guidanceText = buildGuidanceText(analysis);
    const referenceText = references.map((shop, index) => formatShopContext(shop, index)).join('\n');

    return [
        "Gunakan daftar referensi coffee shop Bandung di bawah ini. Semua data nama dan alamat bersumber dari Google Maps, jadi pakai persis seperti yang tertera ketika merekomendasikan.",
        guidanceText,
        "Daftar referensi:",
        referenceText,
        "---",
        `Pesan pengguna: ${analysis.raw}`,
        "Ingat: balas dengan JSON valid sesuai skema { reply: string, recommendations?: Array }.",
    ]
        .filter(Boolean)
        .join('\n\n');
};

const transformHistory = (history: ChatMessage[]): Content[] => {
    return history.map((msg): Content => {
        const text = msg.text || ""; 
        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text }],
        };
    });
};

export const getAiResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const aiClient = getClient();
        const fullHistory = transformHistory(history);
        const analysis = analyseQuery(newMessage);
        const referenceShops = selectReferenceShops(analysis);
        const prompt = buildPrompt(analysis, referenceShops);
        const contents = [...fullHistory, { role: 'user', parts: [{ text: prompt }] }];

        const response = await aiClient.models.generateContent({
            ...modelConfig,
            contents,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting response from Gemini API:", error);
        
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Gagal mendapatkan respons dari AI. Coba lagi nanti.";
            
        const errorResponse = {
            reply: `Maaf, terjadi kesalahan teknis: ${errorMessage}`,
            recommendations: [],
        };
        
        return JSON.stringify(errorResponse);
    }
};
