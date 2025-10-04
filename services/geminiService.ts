import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from '../types';

let ai: GoogleGenAI;

function getClient(): GoogleGenAI {
    if (!ai) {
        // Safely access process.env, which may not be defined in browser environments.
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

        if (!apiKey) {
            throw new Error("The API_KEY environment variable is not set. Please configure it in your deployment environment to use the AI features.");
        }
        ai = new GoogleGenAI({ apiKey });
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