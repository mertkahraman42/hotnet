import { Point } from 'pixi.js';

export type UnitStats = {
    health: number;
    maxHealth: number;
    damage: number;
    speed: number;
    range: number;
    cost: number;
};

export type UnitState = {
    position: Point;
    targetPosition: Point | null;
    currentHealth: number;
    isMoving: boolean;
    isAttacking: boolean;
    isDead: boolean;
};

export type FactionType = 'Netrunners' | 'Cyborgs' | 'Rogue AI' | 'Megacorps';

export interface IUnit {
    id: string;
    faction: FactionType;
    type: 'Basic' | 'Advanced' | 'Special';
    stats: UnitStats;
    state: UnitState;
    radius: number; // Size of the unit for collision detection
    
    // Core methods
    update(delta: number): void;
    takeDamage(amount: number): void;
    heal(amount: number): void;
    moveTo(target: Point): void;
    attack(target: IUnit): void;
    
    // State checks
    isAlive(): boolean;
    isInRange(target: IUnit): boolean;
    
    // Getters
    getPosition(): Point;
    getHealth(): number;
}

// Base stats for different unit types
export const BASE_UNIT_STATS: Record<'Basic' | 'Advanced' | 'Special', UnitStats> = {
    Basic: {
        health: 100,
        maxHealth: 100,
        damage: 10,
        speed: 2,
        range: 50,
        cost: 100
    },
    Advanced: {
        health: 200,
        maxHealth: 200,
        damage: 20,
        speed: 1.5,
        range: 75,
        cost: 300
    },
    Special: {
        health: 300,
        maxHealth: 300,
        damage: 30,
        speed: 1,
        range: 100,
        cost: 500
    }
};

// Faction-specific stat modifiers (multiplicative)
export const FACTION_MODIFIERS: Record<FactionType, Partial<UnitStats>> = {
    Netrunners: {
        speed: 1.2,    // Faster units
        range: 1.2     // Longer range
    },
    Cyborgs: {
        health: 1.2,   // More health
        damage: 1.1    // More damage
    },
    'Rogue AI': {
        damage: 1.3,   // High damage
        speed: 0.9     // Slower
    },
    Megacorps: {
        health: 1.1,   // Slightly more health
        range: 1.1     // Slightly more range
    }
}; 