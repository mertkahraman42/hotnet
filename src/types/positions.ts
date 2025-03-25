import { Point } from 'pixi.js';

// All possible octagon positions
export type OctagonPosition = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

// Valid player counts
export type ValidPlayerCount = 2 | 3 | 4 | 6 | 8;

// Player position configurations
export const PLAYER_POSITIONS: Record<ValidPlayerCount, OctagonPosition[]> = {
    2: ['W', 'E'],
    3: ['SW', 'NW', 'E'],
    4: ['SW', 'NW', 'NE', 'SE'],
    6: ['SW', 'NW', 'W', 'SE', 'NE', 'E'],
    8: ['SW', 'NW', 'W', 'N', 'S', 'NE', 'SE', 'E']
} as const;

// Define angles in radians for each position
// Starting from N as 0 and going clockwise
export const POSITION_ANGLES: Record<OctagonPosition, number> = {
    'N': 0,                // 0° (top)
    'NE': Math.PI / 4,     // 45°
    'E': Math.PI / 2,      // 90° (right)
    'SE': 3 * Math.PI / 4, // 135°
    'S': Math.PI,          // 180° (bottom)
    'SW': -3 * Math.PI / 4,// -135°
    'W': -Math.PI / 2,     // -90° (left)
    'NW': -Math.PI / 4     // -45°
} as const;

export const POSITION_PRIORITY: OctagonPosition[][] = [
    [],  // 0 players
    ['E'],  // 1 player
    ['E', 'W'],  // 2 players
    ['E', 'SW', 'NW'],  // 3 players
    ['N', 'E', 'S', 'W'],  // 4 players
    ['N', 'E', 'SE', 'SW', 'W'],  // 5 players
    ['N', 'NE', 'SE', 'S', 'SW', 'NW'],  // 6 players
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W'],  // 7 players
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']  // 8 players
];

export function isValidPlayerCount(count: number): count is ValidPlayerCount {
    return [2, 3, 4, 6, 8].includes(count);
}

export function getPlayerPosition(playerIndex: number, totalPlayers: ValidPlayerCount): OctagonPosition | null {
    const positions = PLAYER_POSITIONS[totalPlayers];
    return positions[playerIndex] || null;
}

export function calculateSpawnPoint(position: OctagonPosition, radius: number, randomOffset: boolean = true): Point {
    const angle = POSITION_ANGLES[position];
    
    // Add random variation if requested (±15 degrees)
    const finalAngle = randomOffset ? 
        angle + (Math.random() - 0.5) * Math.PI / 6 : 
        angle;
    
    return new Point(
        Math.sin(finalAngle) * radius,  // Use sin for x
        -Math.cos(finalAngle) * radius  // Use negative cos for y to match PIXI's coordinate system
    );
} 