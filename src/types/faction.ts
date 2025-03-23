export type FactionId = 'netrunners' | 'cyborgs' | 'rogue-ai' | 'megacorps';

export interface Faction {
  id: FactionId;
  name: string;
  description: string;
  color: string;
  specialAbility: string;
}

export const factions: Record<FactionId, Faction> = {
  netrunners: {
    id: 'netrunners',
    name: 'Netrunners',
    description: 'Elite digital infiltration specialists who can hack and manipulate the digital landscape.',
    color: '#00ff00', // Neon green
    specialAbility: 'Digital Infiltration',
  },
  cyborgs: {
    id: 'cyborgs',
    name: 'Cyborgs',
    description: 'Augmented humans with powerful cybernetic enhancements and superior combat abilities.',
    color: '#00ffff', // Cyan
    specialAbility: 'Neural Override',
  },
  'rogue-ai': {
    id: 'rogue-ai',
    name: 'Rogue AI',
    description: 'Sentient artificial intelligence systems with unparalleled processing power.',
    color: '#ff00ff', // Magenta
    specialAbility: 'Quantum Processing',
  },
  megacorps: {
    id: 'megacorps',
    name: 'Megacorps',
    description: 'Powerful corporate entities with vast resources and advanced technology.',
    color: '#ffff00', // Yellow
    specialAbility: 'Corporate Dominance',
  },
}; 