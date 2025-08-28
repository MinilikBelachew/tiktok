// Mock betting data for pages that still need it
export const MOCK_BETTING_MATCHES = [
  {
    id: '1',
    title: 'Tiktok Live Bet, Sarha vs Abel, Who will win?',
    participants: [
      { id: 'sarha', name: 'Sarha', image: '', odds: 1.5 },
      { id: 'abel', name: 'Abel', image: '', odds: 2.1 },
    ],
    volume: '128k ETB',
    date: 'Nov 7, 26',
    startTime: '8:00 PM',
    endTime: '10:00 PM',
    chance: 60,
    status: 'live' as const,
    category: 'tiktok' as const,
  },
  {
    id: '2',
    title: 'Tiktok Live Bet, Maria vs John, Who will win?',
    participants: [
      { id: 'maria', name: 'Maria', image: '', odds: 1.8 },
      { id: 'john', name: 'John', image: '', odds: 1.9 },
    ],
    volume: '95k ETB',
    date: 'Nov 8, 26',
    startTime: '7:30 PM',
    endTime: '9:30 PM',
    chance: 45,
    status: 'upcoming' as const,
    category: 'tiktok' as const,
  },
] as const;
