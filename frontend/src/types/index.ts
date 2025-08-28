// User types
export interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  avatar?: string;
}

// Participant types
export interface Participant {
  id: string;
  name: string;
  image: string;
  odds: number;
  wins?: number;
  losses?: number;
}

// Betting match types
export interface BettingMatch {
  id: string;
  title: string;
  participants: [Participant, Participant];
  volume: string;
  date: string;
  chance: number;
  status: 'live' | 'upcoming' | 'settled';
  category: 'tiktok' | 'other';
}

// Bet types
export interface Bet {
  id: string;
  matchId: string;
  participantId: string;
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
}

// Navigation types
export interface Tab {
  id: string;
  label: string;
  isActive?: boolean;
}

// Form types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
} 