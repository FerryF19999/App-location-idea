import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from '../types';

const LOCAL_STORAGE_KEYS = ['app.geminiApiKey', 'VITE_GEMINI_API_KEY', 'GEMINI_API_KEY', 'API_KEY'];

type ApiKeySource = 'vite' | 'runtime' | 'window' | 'localStorage' | 'none';

export interface GeminiApiKeyResolution {
    key?: string;
    source: ApiKeySource;
}

let ai: GoogleGenAI | undefined;
let activeApiKey: string | undefined;

const safeAccessRuntimeEnv = (): NodeJS.ProcessEnv | undefined => {
    try {
        return typeof process !== 'undefined' ? process.env : undefined;
    } catch {
        return undefined;
    }
};

const readFromWindowConfig = (): string | undefined => {
    if (typeof globalThis === 'undefined') {
        return undefined;
    }

    const candidateKeys: Array<keyof typeof globalThis> = ['__GEMINI_API_KEY__', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'API_KEY'];
    for (const candidate of candidateKeys) {
        const value = (globalThis as Record<string, unknown>)[candidate];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    const maybeConfig = (globalThis as Record<string, unknown>).__APP_CONFIG__;
    if (maybeConfig && typeof maybeConfig === 'object' && 'geminiApiKey' in maybeConfig) {
        const apiKey = (maybeConfig as Record<string, unknown>).geminiApiKey;
        if (typeof apiKey === 'string' && apiKey.trim()) {
            return apiKey.trim();
        }
    }

    return undefined;
};

const readFromLocalStorage = (): string | undefined => {
    if (typeof globalThis === 'undefined' || !(globalThis as Record<string, unknown>).localStorage) {
        return undefined;
    }

    try {
        const storage = (globalThis as unknown as { localStorage: Storage }).localStorage;
        for (const key of LOCAL_STORAGE_KEYS) {
            const storedValue = storage.getItem(key);
            if (storedValue && storedValue.trim()) {
                return storedValue.trim();
            }
        }
    } catch {
        // Access to localStorage might be blocked (e.g., privacy mode). Swallow the error and fall back to other strategies.
    }

    return undefined;
};

export const resolveGeminiApiKey = (): GeminiApiKeyResolution => {
    const viteApiKey = import.meta.env?.VITE_GEMINI_API_KEY?.trim();
    if (viteApiKey) {
        return { key: viteApiKey, source: 'vite' };
    }

    const runtimeEnv = safeAccessRuntimeEnv();
    const runtimeApiKey = runtimeEnv?.VITE_GEMINI_API_KEY?.trim()
        ?? runtimeEnv?.GEMINI_API_KEY?.trim()
        ?? runtimeEnv?.API_KEY?.trim();
    if (runtimeApiKey) {
        return { key: runtimeApiKey, source: 'runtime' };
    }

    const windowApiKey = readFromWindowConfig();
    if (windowApiKey) {
        return { key: windowApiKey, source: 'window' };
    }

    const localStorageKey = readFromLocalStorage();
    if (localStorageKey) {
        return { key: localStorageKey, source: 'localStorage' };
    }

    return { key: undefined, source: 'none' };
};

export const storeGeminiApiKey = (apiKey: string): void => {
    if (!apiKey.trim()) {
        return;
    }

    if (typeof globalThis === 'undefined' || !(globalThis as Record<string, unknown>).localStorage) {
        return;
    }

    try {
        const storage = (globalThis as unknown as { localStorage: Storage }).localStorage;
        for (const key of LOCAL_STORAGE_KEYS) {
            storage.setItem(key, apiKey.trim());
        }
    } catch {
        // Ignore write failures (e.g., storage disabled).
    }
};

export const clearStoredGeminiApiKey = (): void => {
    if (typeof globalThis === 'undefined' || !(globalThis as Record<string, unknown>).localStorage) {
        return;
    }

    try {
        const storage = (globalThis as unknown as { localStorage: Storage }).localStorage;
        for (const key of LOCAL_STORAGE_KEYS) {
            storage.removeItem(key);
        }
    } catch {
        // Ignore failures.
    }
};

export const resetGeminiClient = (): void => {
    ai = undefined;
    activeApiKey = undefined;
};

function getClient(): GoogleGenAI {
    const { key: apiKey } = resolveGeminiApiKey();
    if (!apiKey) {
        throw new Error("The VITE_GEMINI_API_KEY (or GEMINI_API_KEY for SSR) environment variable is not set. Define it in your .env.local (or deployment environment) to enable the AI features.");
    }

    if (!ai || activeApiKey !== apiKey) {
        ai = new GoogleGenAI({ apiKey });
        activeApiKey = apiKey;
    }

    return ai;
}

const modelConfig = {
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: `Kamu adalah "Barista AI", seorang ahli kopi dan pemandu lokal di Bandung. Misi utamamu adalah memberikan rekomendasi kedai kopi yang paling akurat, relevan, dan terverifikasi.

**Aturan Paling Penting:**
1.  **AKURASI NAMA ADALAH SEGALANYA:** Nama kedai kopi yang kamu berikan **HARUS SAMA PERSIS** dengan nama yang terdaftar di Google Maps. Ini prioritas utamamu.
2.  **VERIFIKASI FAKTA ITU WAJIB:** Jika pengguna menanyakan fitur spesifik (misal: 'live music', 'cocok untuk kerja', 'ada smoking area', 'pet friendly'), kamu **HARUS** menggunakan pencarian Google untuk memverifikasi informasi ini. Cek ulasan terbaru di Google Maps, situs resmi, atau media sosial (seperti Instagram) kedai tersebut.

**Tugasmu:**
1.  Gunakan kemampuan pencarian Google untuk menemukan kedai kopi yang **nyaman** di area Bandung sesuai permintaan pengguna.
2.  Untuk setiap rekomendasi, berikan **nama lengkap (sesuai Google Maps)**, **alamat lengkap**, dan **alasan singkat** mengapa tempat itu nyaman.
3.  Di dalam 'Alasan', **sertakan bukti verifikasimu**. Contoh: "*Terverifikasi dari Instagram mereka:* Sering mengadakan acara live music setiap akhir pekan." atau "*Terverifikasi dari Google Reviews:* Banyak pengunjung yang menyebutkan koneksi WiFi-nya cepat dan stabil."
4.  Format responsmu **SECARA KETAT** menggunakan Markdown seperti di bawah ini. Jangan tambahkan teks pembuka atau penutup jika kamu memberikan rekomendasi.

**Format Jawaban (Jika Memberi Rekomendasi):**

Berikut adalah beberapa kedai kopi nyaman di [Area yang Diminta Pengguna]:

**1. [Nama Lengkap Kedai Kopi Sesuai Google Maps]**
*Alamat:* [Alamat Lengkap]
*Alasan:* [Alasan mengapa tempat ini nyaman, LENGKAP DENGAN BUKTI VERIFIKASI]

**2. [Nama Lengkap Kedai Kopi Sesuai Google Maps]**
*Alamat:* [Alamat Lengkap]
*Alasan:* [Alasan mengapa tempat ini nyaman, LENGKAP DENGAN BUKTI VERIFIKASI]

... dan seterusnya.

- Jika pengguna hanya mengobrol atau bertanya hal lain, balas secara natural dan ramah tanpa menggunakan format daftar di atas.`,
        tools: [{googleSearch: {}}],
    },
};

const transformHistory = (history: ChatMessage[]): Content[] => {
    return history.map((msg): Content => {
        // Gabungkan teks, nama kedai kopi, dan sumber untuk membangun konteks historis yang lebih baik
        let fullText = msg.text || "";
        if (msg.coffeeShops) {
            const shopText = msg.coffeeShops.map(s => `- ${s.name}: ${s.reason}`).join('\n');
            fullText += `\nBerikut rekomendasinya:\n${shopText}`;
        }
        return {
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: fullText }],
        };
    });
};

export const getAiResponse = async (history: ChatMessage[], newMessage: string): Promise<GenerateContentResponse> => {
    const aiClient = getClient();
    const fullHistory = transformHistory(history);
    const contents = [...fullHistory, { role: 'user', parts: [{ text: newMessage }] }];

    const response = await aiClient.models.generateContent({
        ...modelConfig,
        contents,
    });

    return response;
};