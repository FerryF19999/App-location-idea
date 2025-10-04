

export interface CoffeeShop {
  name: string;
  address: string;
  reason: string;
}

export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  // FIX: Corrected typo from `Message-sender` to `MessageSender`.
  sender: MessageSender;
  text?: string;
  coffeeShops?: CoffeeShop[];
}