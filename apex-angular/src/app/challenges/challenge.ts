export const categories = ['1-Step', '2-Step'] as const;
export type Category = typeof categories[number];

export interface ChallengeInput {
  name: string;
  category: Category;
  account: number;
  price: number;
  target: number;
  secondTarget: number | null;
  dailyLoss: number;
  totalLoss: number;
  description: string;
}

export interface Challenge extends ChallengeInput {
  id: number;
}

export const demoChallenges: readonly Challenge[] = [
  { id: 1, name: 'Apex 25K Sprint', category: '1-Step', account: 25000, price: 149, target: 10, secondTarget: null, dailyLoss: 4, totalLoss: 8, description: 'Одноетапне оцінювання на демо-рахунку $25 000.' },
  { id: 2, name: 'Apex 50K Sprint', category: '1-Step', account: 50000, price: 249, target: 10, secondTarget: null, dailyLoss: 4, totalLoss: 8, description: 'Одноетапне оцінювання на демо-рахунку $50 000.' },
  { id: 3, name: 'Apex 25K Classic', category: '2-Step', account: 25000, price: 119, target: 8, secondTarget: 5, dailyLoss: 5, totalLoss: 10, description: 'Двоетапне оцінювання на демо-рахунку $25 000.' },
  { id: 4, name: 'Apex 50K Classic', category: '2-Step', account: 50000, price: 199, target: 8, secondTarget: 5, dailyLoss: 5, totalLoss: 10, description: 'Двоетапне оцінювання на демо-рахунку $50 000.' },
];
