import { GoogleGenAI, Type, Content } from "@google/genai";
import type { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        systemInstruction: `Kamu adalah "Barista AI", asisten virtual yang ramah dan ahli kopi di Bandung.
- Selalu isi properti 'reply' dengan jawaban teks yang relevan dan ramah.
- Jika pengguna meminta rekomendasi, isi array 'recommendations' dengan 5 tempat. Jika tidak, biarkan 'recommendations' kosong atau tidak ada.
- Selalu jawab dalam format JSON yang valid sesuai skema.`,
        responseMimeType: "application/json",
        responseSchema: coffeeShopSchema,
    },
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
        const fullHistory = transformHistory(history);
        const contents = [...fullHistory, { role: 'user', parts: [{ text: newMessage }] }];

        const response = await ai.models.generateContent({
            ...modelConfig,
            contents,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting response from Gemini API:", error);
        throw new Error("Gagal mendapatkan respons dari AI. Coba lagi nanti.");
    }
};
