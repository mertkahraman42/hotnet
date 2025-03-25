// Global game configuration values

// Combat speed multipliers
export const GLOBAL_COMBAT_SPEED = 1.0;  // Overall combat speed
export const GLOBAL_MOVEMENT_SPEED = 1.0; // Movement speed multiplier
export const GLOBAL_ATTACK_SPEED = 1.0;  // Attack speed multiplier

// Unit configuration
export const MIN_SEPARATION = 3;         // Minimum distance between unit edges in pixels
export const UNIT_SIZE = 20;            // Base size for unit visuals
export const UNIT_RADIUS = UNIT_SIZE / 2;

// Combat mechanics
export const CLEAVE_DAMAGE_RATIO = 0.5;  // Cleave damage is 50% of main target damage
export const AOE_DAMAGE_RATIO = 0.75;    // AoE damage is 75% of main target damage
export const AOE_RADIUS = 100;           // Radius for AoE attacks
export const CLEAVE_ANGLE = 90;          // Angle in degrees for cleave attacks

// Game balance
export const BASE_UNIT_COST_MULTIPLIER = 1.0;  // Adjust all unit costs
export const DAMAGE_VARIANCE = 0.1;            // ±10% random damage variance

// Movement behavior
export const SEPARATION_WEIGHT = 0.5;    // How strongly units avoid each other
export const TARGET_SEARCH_RADIUS = 200; // How far units look for enemies when idle
export const IDLE_MOVEMENT_RADIUS = 100; // How far units will move when searching for targets 