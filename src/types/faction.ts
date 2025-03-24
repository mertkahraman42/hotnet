export type FactionId = 'netrunners' | 'cyborgs' | 'rogue-ai' | 'megacorps';

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  emoji: string;
  specialAbility: string;
}

export const PLAYER_COLORS = {
  player1: '#FF0000', // Red
  player2: '#0000FF', // Blue
  player3: '#FFA500', // Orange
  player4: '#FF00FF', // Magenta
  player5: '#00FFFF', // Cyan
  player6: '#FFFF00', // Yellow
  player7: '#800080', // Purple
  player8: '#008080', // Teal
  inactive: '#666666', // Gray for inactive players
};

export const factions: Record<FactionId, Faction> = {
  netrunners: {
    id: 'netrunners',
    name: 'Netrunners',
    description: 'Elite digital infiltration specialists who can hack and manipulate the digital landscape.',
    emoji: '🕵️',
    specialAbility: 'Digital Infiltration',
  },
  cyborgs: {
    id: 'cyborgs',
    name: 'Cyborgs',
    description: 'Augmented humans with powerful cybernetic enhancements and superior combat abilities.',
    emoji: '🤖',
    specialAbility: 'Neural Override',
  },
  'rogue-ai': {
    id: 'rogue-ai',
    name: 'Rogue AI',
    description: 'Sentient artificial intelligence systems with unparalleled processing power.',
    emoji: '🧠',
    specialAbility: 'Quantum Processing',
  },
  megacorps: {
    id: 'megacorps',
    name: 'Megacorps',
    description: 'Powerful corporate entities with vast resources and advanced technology.',
    emoji: '🏢',
    specialAbility: 'Corporate Dominance',
  },
}; 