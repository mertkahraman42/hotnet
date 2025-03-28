# HotNet - Multiplayer Combat Game
*Created: March 19, 2024, 15:30 UTC*

## Overview
HotNet is a multiplayer combat game where players control different factions battling for control of a central point on an octagonal map. Each faction has unique units with different abilities, and players must strategically deploy and manage their units to achieve victory.

## Game Features
- 2-4 player multiplayer support
- Unique factions with different unit types
- Real-time unit movement and combat
- Strategic control point gameplay
- Dynamic unit behavior and targeting
- Visual feedback for unit states and health

## Technical Architecture

### Core Components

#### GameScreen (`src/components/GameScreen.tsx`)
The main game rendering component that handles:
- PIXI.js canvas setup and management
- Game map rendering (octagon grid, sections, labels)
- Unit container management
- Game loop for unit updates
- Unit spawning and clearing

#### BaseUnit (`src/units/BaseUnit.ts`)
The core unit class that implements all unit behavior including:
- Unit initialization and stats management
- Visual representation (body and health bar)
- Movement and pathfinding
- Combat mechanics (targeting, attacking, damage)
- Health management

### Game Mechanics

#### Unit Types
1. **Melee Units**
   - Warrior: Balanced melee fighter
   - Knight: Defensive melee unit
   - Berserker: High damage, low defense

2. **Ranged Units**
   - Archer: Balanced ranged attacker
   - Sniper: High damage, low rate of fire
   - Artillery: Area damage specialist

3. **Support Units**
   - Medic: Healing specialist
   - Guardian: Defensive support
   - Enchanter: Buff/debuff specialist

#### Factions
1. **Netrunners** (Player 1)
   - Specializes in digital warfare
   - Balanced unit stats

2. **Cyborgs** (Player 2)
   - Enhanced combat capabilities
   - Focused on direct combat

3. **Megacorps** (Player 3)
   - Advanced technology
   - Specialized unit types

4. **Rogue AI** (Player 4)
   - Autonomous combat systems
   - Unique unit behaviors

### Game Flow
1. Players select their factions
2. Game map is initialized with player sections
3. Players spawn units from their designated positions
4. Units automatically move towards the center
5. Combat occurs when units from different factions meet
6. Players continue to spawn and manage units
7. Victory is achieved by controlling the center point

## Technical Details

### Unit Movement
- Units automatically path towards the center
- Movement speed is normalized for consistent gameplay
- Units avoid collisions with friendly units
- Ranged units maintain optimal combat distance

### Combat System
- Units automatically target nearest enemies
- Damage calculation includes variance based on unit type
- Health bars provide visual feedback
- Dead units are removed after a delay

### Visual Elements
- Cyberpunk-themed grid background
- Glowing center point
- Octagonal map with player sections
- Color-coded units and sections
- Health bars and unit indicators

## Development Notes
- Built with React and PIXI.js
- TypeScript for type safety
- Modular architecture for easy expansion
- Performance optimized for smooth gameplay

## Future Enhancements
- Additional unit types
- Special abilities for each faction
- Power-ups and objectives
- Enhanced visual effects
- Sound effects and music
- Player statistics and achievements

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open in browser: `http://localhost:3000`

## Controls
- Click unit buttons to spawn units
- Units automatically move and fight
- Clear button to reset the game
- Faction selection at game start
