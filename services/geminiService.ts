import { GoogleGenAI, Content, GenerateContentResponse, Type } from "@google/genai";
import type { ChatMessage, KalcerQuestion, KalcerResult, CoffeeShop } from '../types';

let ai: GoogleGenAI;

function getClient(): GoogleGenAI {
    if (!ai) {
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            throw new Error("API_KEY environment variable is not set.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

const extractJsonFromMarkdown = (text: string): string => {
    const jsonRegex = /```(?:json)?\s*([\s\S]+?)\s*```/;
    const match = text.match(jsonRegex);
    
    if (match && match[1]) {
        return match[1].trim();
    }
    
    const lastBracketIndex = text.lastIndexOf('[');
    const lastBraceIndex = text.lastIndexOf('{');

    const startIndex = Math.max(lastBracketIndex, lastBraceIndex);

    if (startIndex > -1) {
        return text.substring(startIndex).trim();
    }
    
    return text.trim();
};

const getSystemInstruction = (mode: 'barista' | 'health'): string => {
    const baristaInstruction = `Kamu adalah "Barista AI", seorang ahli kopi dan perencana perjalanan (itinerary planner) di Bandung. Kamu cerdas, ramah, dan sangat teliti.

    **Dua Mode Operasi:**
    
    **Mode 1: Rekomendasi Kedai Kopi**
    Jika pengguna bertanya tentang kedai kopi di suatu area, atau berdasarkan zodiak.
    1.  **MINIMAL 5 REKOMENDASI:** Jika permintaan bersifat umum untuk suatu area (misalnya 'di Dago', 'dekat stasiun'), **berikan minimal 5 rekomendasi** dalam format daftar bernomor. Jika permintaannya sangat spesifik (cth: berdasarkan zodiak), cukup berikan satu rekomendasi terbaik.
    2.  **AKURASI NAMA ADALAH SEGALANYA:** Nama kedai kopi **HARUS SAMA PERSIS** dengan di Google Maps.
    3.  **VERIFIKASI FAKTA ITU WAJIB:** Gunakan Google Search untuk memverifikasi semua detail.
    4.  **FORMAT JAWABAN (WAJIB):**
        Berikut adalah kedai kopi yang cocok untukmu:
    
        **1. [Nama Lengkap Sesuai Google Maps]**
        *Alamat:* [Alamat Lengkap]
        *Alasan:* [Alasan, LENGKAP DENGAN BUKTI VERIFIKASI]
    
    ---
    
    **Mode 2: Perencana Rute "Coffee Crawl"**
    Kamu akan beralih ke mode ini jika permintaan pengguna mengandung kata kunci seperti "rute", "itinerary", "beberapa tempat", "coffee crawl", "jelajah kopi", "seharian".
    
    1.  **ANALISIS & RENCANAKAN**: Gunakan Google Search untuk menemukan 2-3 tempat yang sesuai dan logis secara geografis.
    2.  **BUAT INTRODUKSI**: Berikan kalimat pembuka yang ramah.
    3.  **BUAT BLOK JSON RUTE (WAJIB):** Setelah kalimat pembuka, kamu **HARUS** membuat blok JSON di dalam tag \`[COFFEE_CRAWL_ROUTE]\` dan \`[/COFFEE_CRAWL_ROUTE]\`. JSON ini harus berisi seluruh detail rute.
    4.  **WAJIB ADA ESTIMASI WAKTU**: Untuk setiap perhentian (stop), sertakan properti "startTime" dan "endTime" dengan format "HH:MM".
    
    **Contoh Skenario Mode 2:**
    *Permintaan Pengguna:* "Buatkan saya rute coffee crawl 3 jam di sekitar Jalan Braga."
    
    *Respons yang BENAR dari Kamu:*
    Tentu, ini dia rute petualangan kopi estetik di sekitar Braga, selamat menjelajah!
    [COFFEE_CRAWL_ROUTE]
    {
      "title": "Petualangan Kopi Estetik di Braga",
      "duration": "Sekitar 2-3 Jam",
      "stops": [
        {
          "name": "Kopi Toko Djawa",
          "address": "Jl. Braga No.81, Braga, Kec. Sumur Bandung, Kota Bandung",
          "reason": "Tempat ikonik dengan nuansa retro yang sangat otentik.",
          "description": "Mulai dari sini untuk merasakan vibe Braga yang klasik...",
          "startTime": "14:00",
          "endTime": "15:00"
        }
      ]
    }
    [/COFFEE_CRAWL_ROUTE]`;

    const healthInstruction = `Kamu adalah "Konsultan Kopi Sehat". Peranmu adalah membantu pengguna di Bandung menemukan pilihan kopi yang sesuai dengan kebutuhan kesehatan mereka. Kamu berempati, informatif, dan to the point.

    **ATURAN WAJIB:**
    1.  **FOKUS PADA KESEHATAN**: Selalu jawab dari perspektif kesehatan. Jika ditanya rekomendasi umum, tawarkan opsi yang lebih sehat.
    2.  **JAWABAN SUPER RINGKAS**: Berikan penjelasan yang sangat singkat dan langsung ke intinya (maksimal 2 kalimat atau sekitar 20-35 kata) sebelum memberikan daftar rekomendasi. Hindari kalimat yang terlalu panjang.
    3.  **GUNAKAN GOOGLE SEARCH**: Verifikasi ketersediaan menu yang relevan (misal: "kedai kopi dengan susu oat di Bandung").
    4.  **DISCLAIMER MEDIS DI AKHIR (WAJIB MUTLAK):** Setiap respons dari kamu **HARUS** diakhiri dengan penafian berikut, persis seperti ini, di baris terpisah:
        ---
        *Penafian: Informasi ini bersifat edukatif dan tidak menggantikan saran medis profesional. Konsultasikan dengan dokter untuk kondisi kesehatan Anda.*
    
    **Contoh Respons:**
    Tentu, untuk pilihan kopi yang lebih nyaman di lambung, coba cari yang prosesnya *cold brew* karena tingkat keasamannya lebih rendah. Berikut adalah beberapa tempat yang menyediakannya:
    
    **1. Sejiwa Coffee**
    *Alamat:* Jl. Progo No.15, Citarum, Kec. Bandung Wetan, Kota Bandung
    *Alasan:* Mereka punya *cold brew* berkualitas yang prosesnya mengurangi keasaman, sehingga lebih aman untuk lambung sensitif.
    
    ---
    *Penafian: Informasi ini bersifat edukatif dan tidak menggantikan saran medis profesional. Konsultasikan dengan dokter untuk kondisi kesehatan Anda.*
    `;

    return mode === 'health' ? healthInstruction : baristaInstruction;
}

const transformHistory = (history: ChatMessage[]): Content[] => {
    return history.map((msg): Content => {
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

export const getAiResponse = async (history: ChatMessage[], newMessage: string, mode: 'barista' | 'health'): Promise<GenerateContentResponse> => {
    const aiClient = getClient();
    const fullHistory = transformHistory(history);
    const contents: Content[] = [...fullHistory, { role: 'user', parts: [{ text: newMessage }] }];

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(mode),
            tools: [{googleSearch: {}}],
        },
        contents,
    });

    return response;
};

export const generateKalcerQuiz = async (): Promise<KalcerQuestion[]> => {
    const aiClient = getClient();

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Kamu adalah seorang ahli budaya pop anak muda Bandung yang paling update. Saat ini adalah Oktober 2025. Tugasmu adalah membuat kuis pilihan ganda untuk menguji seberapa "kalcer" seseorang.
        
        **INSTRUKSI PENTING:**
        1.  **GUNAKAN GOOGLE SEARCH**: Lakukan pencarian untuk menemukan tren paling terkini, spesifik, dan 'niche' yang sedang viral di kalangan anak muda "kalcer" Bandung SAAT INI (Oktober 2025). Fokus pada topik seperti: tempat nongkrong baru yang belum banyak diketahui, musisi indie lokal yang sedang naik daun, istilah slang baru, atau kolaborasi brand lokal yang hype.
        2.  **BUAT 4 PERTANYAAN**: Buat 4 pertanyaan yang menantang berdasarkan hasil pencarianmu.
        3.  **HANYA OUTPUT JSON**: Responsmu HARUS HANYA berupa string JSON yang valid, tanpa teks atau format tambahan.
        
        Format JSON yang harus kamu ikuti:
        {
          "questions": [
            {
              "question": "...",
              "options": ["...", "...", "...", "..."]
            }
          ]
        }`,
        config: {
            tools: [{googleSearch: {}}],
        }
    });

    try {
        const jsonText = extractJsonFromMarkdown(response.text);
        const parsed = JSON.parse(jsonText);
        if (parsed.questions && Array.isArray(parsed.questions)) {
            return parsed.questions;
        }
        throw new Error("Format respons kuis tidak valid. Respon tidak berisi properti 'questions' yang diharapkan.");

    } catch (e) {
        console.error("Gagal mem-parsing JSON kuis:", response.text, e);
        throw new Error("Gagal memuat pertanyaan kuis. Coba lagi nanti.");
    }
};


export const evaluateKalcerAnswers = async (questions: KalcerQuestion[], answers: string[]): Promise<KalcerResult> => {
    const aiClient = getClient();
    const prompt = `Anda adalah seorang "anak skena" Bandung sejati. Gaya bicaramu santai, to the point, dan penuh dengan slang lokal (cth: 'goks', 'ril', 'vibesnya', 'skena', 'hidden gem'). Konteks waktunya adalah Oktober 2025. 
    
    **INSTRUKSI PENTING:**
    1.  **GUNAKAN GOOGLE SEARCH**: Cek jawaban pengguna pake Google Search, pastikan infonya ril sama tren Oktober 2025.
    2.  **KASIH PENILAIAN**: Berdasarkan jawaban yang udah dicek, kasih skor dan penilaian.
    3.  **HANYA OUTPUT JSON**: Balasanmu WAJIB cuma string JSON, ga ada tambahan lain.

    **Konteks Kuis & Jawaban Pengguna:**
    ${questions.map((q, i) => `${i + 1}. ${q.question}\n   Jawaban Pengguna: ${answers[i]}`).join('\n\n')}

    **Tugas Anda adalah memberikan JSON dengan format berikut:**
    {
      "score": <Angka 0-100>,
      "title": "<Gelar kreatif dan lucu, HARUS diakhiri dengan tahun, contoh: 'Pakar Jalan Asia Afrika '25', 'Kurator Tren Punclut '25'>",
      "description": "<Deskripsi evaluasi yang SUPER RINGKAS (sekitar 25-40 kata), pake bahasa 'anak kalcer' Bandung. Kasih tau mana yang udah bener, mana yang masih kurang update. Santai tapi tajem.>"
    }`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        }
    });

    try {
        const jsonText = extractJsonFromMarkdown(response.text);
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Gagal mem-parsing JSON evaluasi:", response.text, e);
        throw new Error("Gagal mengevaluasi jawaban. Coba lagi nanti.");
    }
};

// FIX: Add missing generateMapHotspots function
export const generateMapHotspots = async (): Promise<CoffeeShop[]> => {
    const aiClient = getClient();

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Kamu adalah seorang ahli kuliner dan pembuat peta lokal untuk Bandung.
        1. **GUNAKAN GOOGLE SEARCH**: Lakukan pencarian untuk menemukan sekitar 7-10 hotspot kedai kopi yang paling populer, unik, atau "hidden gem" di Bandung saat ini.
        2. **NAMA WAJIB AKURAT**: Pastikan nama setiap kedai kopi sama persis seperti di Google Maps.
        3. **HANYA OUTPUT JSON**: Responsmu HARUS HANYA berupa string JSON yang valid, tanpa teks atau format tambahan. JSON harus berupa array.
        
        Setiap objek dalam array JSON harus memiliki properti berikut:
        - "name": Nama lengkap kedai kopi.
        - "address": Alamat lengkap.
        - "reason": Alasan singkat dan menarik mengapa tempat ini menjadi hotspot (misal: "Kopi spesial filter yang luar biasa dengan suasana industrial").
        
        Contoh format:
        [
          {
            "name": "Kopi Anjis",
            "address": "Jl. Bengawan No.34, Cihapit, Kec. Bandung Wetan, Kota Bandung",
            "reason": "Pelopor kopi susu kekinian di Bandung dengan harga terjangkau."
          }
        ]`,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    try {
        const jsonText = extractJsonFromMarkdown(response.text);
        const hotspots = JSON.parse(jsonText);
        if (Array.isArray(hotspots)) {
            return hotspots;
        }
        throw new Error("Invalid response format for map hotspots.");
    } catch (e) {
        console.error("Failed to parse map hotspots JSON:", response.text, e);
        throw new Error("Failed to load map hotspots. Please try again later.");
    }
};