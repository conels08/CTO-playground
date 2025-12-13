export interface HealthFact {
  id: number;
  title: string;
  fact: string;
  category: string;
}

export interface Milestone {
  id: number;
  days: number;
  title: string;
  description: string;
  icon: string;
}

export interface MotivationalQuote {
  id: number;
  text: string;
  author: string;
}
