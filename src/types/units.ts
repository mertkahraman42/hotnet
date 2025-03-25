import { Point } from 'pixi.js';

// Combat roles and types
export type UnitRole = 'Melee' | 'Ranged' | 'Artillery';
export type AttackType = 'Single' | 'Cleave' | 'AoE';
export type DamageType = 'Normal' | 'Pierce' | 'Siege' | 'Magic';
export type ArmorType = 'Light' | 'Medium' | 'Heavy' | 'Fortified';

export type FactionType = 'Netrunners' | 'Cyborgs' | 'Rogue AI';

export type UnitType = 
  // Melee Units
  'Basic' | 'Advanced' | 'Special' |
  // Ranged Units
  'RangedBasic' | 'RangedAdvanced' | 'RangedSpecial' |
  // Support Units
  'SupportBasic' | 'SupportAdvanced' | 'SupportSpecial';

export interface UnitStats {
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  range: number;
  attackSpeed: number;
}

export type UnitState = {
    position: Point;
    targetPosition: Point | null;
    currentHealth: number;
    isMoving: boolean;
    isAttacking: boolean;
    isDead: boolean;
    currentTarget?: IUnit; // Track current combat target
};

export interface IUnit {
    id: string;
    faction: FactionType;
    type: UnitType;
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

// Base stats for each unit type
export const BASE_UNIT_STATS: Record<UnitType, UnitStats> = {
    // Melee Units
    Basic: {
        health: 150,
        maxHealth: 150,
        damage: 65,
        speed: 2,
        range: 30,
        attackSpeed: 1.2
    },
    Advanced: {
        health: 300,
        maxHealth: 300,
        damage: 100,
        speed: 1.5,
        range: 35,
        attackSpeed: 1.0
    },
    Special: {
        health: 400,
        maxHealth: 400,
        damage: 150,
        speed: 1.8,
        range: 40,
        attackSpeed: 1.5
    },
    // Ranged Units
    RangedBasic: {
        health: 100,
        maxHealth: 100,
        damage: 45,
        speed: 1.7,
        range: 150,
        attackSpeed: 1.0
    },
    RangedAdvanced: {
        health: 120,
        maxHealth: 120,
        damage: 80,
        speed: 1.4,
        range: 200,
        attackSpeed: 0.8
    },
    RangedSpecial: {
        health: 150,
        maxHealth: 150,
        damage: 120,
        speed: 1.2,
        range: 250,
        attackSpeed: 0.6
    },
    // Support Units
    SupportBasic: {
        health: 120,
        maxHealth: 120,
        damage: 20,
        speed: 2.0,
        range: 100,
        attackSpeed: 1.0
    },
    SupportAdvanced: {
        health: 180,
        maxHealth: 180,
        damage: 30,
        speed: 1.7,
        range: 120,
        attackSpeed: 0.8
    },
    SupportSpecial: {
        health: 250,
        maxHealth: 250,
        damage: 40,
        speed: 1.5,
        range: 150,
        attackSpeed: 0.7
    }
};

// Damage type effectiveness multipliers
export const DAMAGE_MULTIPLIERS: Record<DamageType, Record<ArmorType, number>> = {
    Normal: { Light: 1, Medium: 0.8, Heavy: 0.6, Fortified: 0.4 },
    Pierce: { Light: 1.5, Medium: 1.2, Heavy: 1.0, Fortified: 0.8 }, // Improved pierce vs Heavy
    Siege: { Light: 0.8, Medium: 1, Heavy: 1.2, Fortified: 1.5 },
    Magic: { Light: 1.2, Medium: 1.2, Heavy: 1.2, Fortified: 1 }
};

// Faction-specific modifiers
export const FACTION_MODIFIERS: Record<FactionType, Partial<UnitStats>> = {
    Netrunners: {
        damage: 1.0,
        speed: 1.0,
        health: 1.0,
        range: 1.0
    },
    Cyborgs: {
        damage: 1.0,
        speed: 1.0,
        health: 1.0,
        range: 1.0
    },
    'Rogue AI': {
        damage: 1.0,
        speed: 1.0,
        health: 1.0,
        range: 1.0
    }
};

// Global combat speed modifier (can be adjusted for slower/faster combat)
export const COMBAT_SPEED = 1.0; 