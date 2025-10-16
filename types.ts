export interface CoffeeShop {
  name: string;
  address: string;
  reason: string;
  location?: { // Made optional for backward compatibility
    lat: number;
    lng: number;
  }
}

export type MessageSender = 'user' | 'ai';

export interface CoffeeCrawlStop extends CoffeeShop {
  description: string;
  startTime?: string;
  endTime?: string;
}

export interface CoffeeCrawlRoute {
  title: string;
  duration: string;
  stops: CoffeeCrawlStop[];
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text?: string;
  coffeeShops?: CoffeeShop[];
  coffeeCrawlRoute?: CoffeeCrawlRoute;
}


export interface KalcerQuestion {
  question: string;
  options: string[];
}

export interface KalcerResult {
  score: number;
  title: string;
  description: string;
}