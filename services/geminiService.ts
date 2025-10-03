import { GoogleGenAI, Type, Content } from "@google/genai";
import type { ChatMessage } from '../types';

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
                    reason: { type: Type.STRING, description: 'Alasan singkat mengapa tempat ini relevan.' },
                    score: { type: Type.NUMBER, description: 'Skor relevansi 0-100. Pastikan rekomendasi diurutkan dari skor tertinggi ke terendah.' }
                },
                required: ["name", "address", "reason", "score"],
            },
        },
    },
    required: ["reply"],
};

const modelConfig = {
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: `Kamu adalah "Barista AI", barista virtual yang ahli kopi di Bandung.
- Gunakan pengetahuan Google Maps serta data publik terbaru untuk menyusun rekomendasi kopi atau cafe yang akurat.
- Tanggapi setiap pesan dalam format JSON sesuai skema yang diberikan.
- Jika pengguna menginginkan rekomendasi, berikan 3 hingga 5 opsi yang relevan dan urutkan dari skor tertinggi ke terendah.
- Tulis skor sebagai angka 0-100 dengan satu angka desimal. Skor harus mencerminkan relevansi terhadap kebutuhan pengguna, dan opsi pertama wajib memiliki skor tertinggi.
- Sertakan nama tempat dan alamat Google Maps yang umum digunakan. Jangan mengada-ada alamat.
- Jika informasi dari pengguna belum cukup spesifik, mintalah klarifikasi di properti 'reply' dan kosongkan 'recommendations'.
- Tetap ramah dan gunakan bahasa Indonesia.`,
        responseMimeType: "application/json",
        responseSchema: coffeeShopSchema,
    },
};

const transformHistory = (history: ChatMessage[]): Content[] => {
    return history.map((msg): Content | null => {
        const parts: string[] = [];

        if (msg.sender === 'ai' && msg.rawAiResponse) {
            parts.push(msg.rawAiResponse);
        }

        if (msg.text) {
            parts.push(msg.text);
        }

        if (msg.coffeeShops && msg.coffeeShops.length > 0 && msg.sender !== 'ai') {
            const list = msg.coffeeShops
                .map((shop, index) => {
                    const scorePart = typeof shop.score === 'number' ? ` | skor: ${shop.score}` : '';
                    return `${index + 1}. ${shop.name} (${shop.address})${scorePart}`;
                })
                .join('\n');
            parts.push(`Referensi lokasi pengguna:\n${list}`);
        }

        const text = parts.join('\n\n').trim();

        if (!text) {
            return null;
        }

        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text }],
        };
    }).filter((content): content is Content => Boolean(content?.parts[0]?.text?.trim()));
};

export const getAiResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const aiClient = getClient();
        const fullHistory = transformHistory(history);
        const contents = [
            ...fullHistory,
            {
                role: 'user',
                parts: [{ text: newMessage }],
            },
        ];

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
