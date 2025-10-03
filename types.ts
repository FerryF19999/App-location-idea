
export interface CoffeeShop {
  name: string;
  address: string;
  reason: string;
}

export type MessageSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text?: string;
  coffeeShops?: CoffeeShop[];
}
