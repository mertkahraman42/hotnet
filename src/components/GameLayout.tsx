import React, { useRef, useState } from 'react';
import { GameScreen, GameScreenHandle } from './GameScreen';
import { PLAYER_COLORS, factions } from '../types/faction';
import { UnitType, FactionType } from '../types/units';

// Define position priority for different numbers of players
export const POSITION_PRIORITY = {
  1: ['E'],
  2: ['W', 'E'],
  3: ['SW', 'NW', 'E'],
  4: ['SW', 'NW', 'NE', 'SE'],
  5: ['SW', 'NW', 'W', 'SE', 'NE'],
  6: ['SW', 'NW', 'W', 'SE', 'NE', 'E'],
  7: ['SW', 'NW', 'W', 'N', 'S', 'NE', 'SE'],
  8: ['SW', 'NW', 'W', 'N', 'S', 'NE', 'SE', 'E']
} as const;

interface GameLayoutProps {
  width: number;
  height: number;
  playerFactions: FactionType[];
  onSpawnUnit: (type: UnitType, playerIndex: number, faction: FactionType) => void;
  onClearUnits: () => void;
}

const UNIT_COSTS: Record<UnitType, number> = {
  // Melee Units
  Warrior: 100,
  Knight: 300,
  Berserker: 500,
  // Ranged Units
  Archer: 150,
  Sniper: 350,
  Artillery: 600,
  // Support Units
  Medic: 200,
  Guardian: 400,
  Enchanter: 550
};

const UNIT_INFO: Record<UnitType, { name: string, description: string }> = {
  Warrior: { 
    name: "Warrior",
    description: "Balanced melee fighter with good speed and moderate health. Deals consistent damage in close combat."
  },
  Knight: {
    name: "Knight",
    description: "Heavy melee unit with high health and strong defense. Slower but deals significant damage."
  },
  Berserker: {
    name: "Berserker",
    description: "Elite melee unit with very high damage and attack speed. Can quickly eliminate targets in combat."
  },
  Archer: {
    name: "Archer",
    description: "Basic ranged unit with good mobility. Attacks from a safe distance with moderate damage."
  },
  Sniper: {
    name: "Sniper",
    description: "Specialized ranged unit with extreme range and high single-target damage. Low health but very effective."
  },
  Artillery: {
    name: "Artillery",
    description: "Heavy ranged unit with massive damage potential. Slow but devastating at maximum range."
  },
  Medic: {
    name: "Medic",
    description: "Fast support unit that can heal allies. Essential for maintaining army health in prolonged battles."
  },
  Guardian: {
    name: "Guardian",
    description: "Defensive support unit with protective abilities. Helps keep other units alive in combat."
  },
  Enchanter: {
    name: "Enchanter",
    description: "Elite support unit with powerful enhancement abilities. Can turn the tide of battle with buffs."
  }
};

// Common styles that are reused
const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: '#0a0a0a',
    color: '#00ff00',
    fontFamily: 'monospace',
    overflow: 'hidden',
    paddingTop: '40px'
  },
  button: (color: string) => ({
    backgroundColor: 'transparent',
    border: `1px solid ${color}`,
    color: color,
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    ':hover': {
      backgroundColor: '#003300'
    }
  }),
  categoryHeader: (color: string) => ({
    color: color,
    fontSize: '14px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${color}`,
    paddingBottom: '5px',
    marginBottom: '5px'
  }),
  tooltip: {
    position: 'fixed' as const,
    backgroundColor: '#1a1a1a',
    border: '1px solid #00ff00',
    padding: '10px',
    borderRadius: '4px',
    maxWidth: '250px',
    zIndex: 1000,
    color: '#00ff00',
    fontSize: '14px'
  },
  debugPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40px',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '10px',
    borderBottom: '1px solid #333'
  },
  debugButton: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#3a3a3a'
    }
  }
} as const;

// Unit category types
interface UnitData {
  type: UnitType;
  icon: string;
  name: string;
}

interface UnitCategoryProps {
  title: string;
  units: UnitData[];
  faction: FactionType;
  playerIndex: number;
  onSpawnUnit: (type: UnitType, playerIndex: number, faction: FactionType) => void;
}

const UnitCategory: React.FC<UnitCategoryProps> = ({ title, units, faction, playerIndex, onSpawnUnit }) => {
  const handleClick = (unit: UnitData) => {
    onSpawnUnit(unit.type, playerIndex, faction);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
      <div style={styles.categoryHeader(PLAYER_COLORS[`player${playerIndex + 1}` as keyof typeof PLAYER_COLORS])}>
        {title}
      </div>
      {units.map((unit) => (
        <button
          key={unit.type}
          onClick={() => handleClick(unit)}
          style={styles.button(PLAYER_COLORS[`player${playerIndex + 1}` as keyof typeof PLAYER_COLORS])}
        >
          {unit.icon} {unit.name} (${UNIT_COSTS[unit.type]})
        </button>
      ))}
    </div>
  );
};

export const GameLayout: React.FC<GameLayoutProps> = ({ width, height, playerFactions, onSpawnUnit, onClearUnits }) => {
  const gameScreenRef = useRef<GameScreenHandle>(null);
  const [showUpgradesForPlayer, setShowUpgradesForPlayer] = useState<number | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<{ type: UnitType, x: number, y: number } | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
  
  const controlBarWidth = 250;
  const gameSize = Math.min(height, width - (controlBarWidth * playerFactions.length));

  const handleSpawnUnit = (type: UnitType, playerIndex: number, faction: FactionType) => {
    console.log('handleSpawnUnit called with:', { type, faction });
    if (!gameScreenRef.current) {
      console.log('gameScreenRef is null!');
      return;
    }
    const positions = POSITION_PRIORITY[playerFactions.length as keyof typeof POSITION_PRIORITY];
    console.log('positions:', positions);
    if (positions && playerIndex >= 0) {
      console.log('Spawning unit at position:', positions[playerIndex]);
      gameScreenRef.current.spawnUnit(type, positions[playerIndex], faction);
    } else {
      console.log('Failed to spawn - invalid position or player index');
    }
  };

  const handleUnitHover = (type: UnitType, event: React.MouseEvent) => {
    if (tooltipTimer) clearTimeout(tooltipTimer);
    
    const timer = setTimeout(() => {
      setHoveredUnit({
        type,
        x: event.clientX,
        y: event.clientY
      });
    }, 200);

    setTooltipTimer(timer);
  };

  const handleUnitHoverEnd = () => {
    if (tooltipTimer) clearTimeout(tooltipTimer);
    setHoveredUnit(null);
  };

  const renderUpgradesMenu = (faction: string, index: number) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '20px'
    }}>
      <button style={{
        ...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]),
        color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
        borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
      }}>⚔️ Damage +1</button>
      <button style={{
        ...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]),
        color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
        borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
      }}>⚡ Speed +1</button>
      <button style={{
        ...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]),
        color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
        borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
      }}>🎯 Range +1</button>
      <button style={{
        ...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]),
        color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
        borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
      }}>❤️ Health +1</button>
      <button 
        style={{
          ...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]),
          marginTop: '10px',
          color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
          borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
        }}
        onClick={() => setShowUpgradesForPlayer(null)}
      >
        ↩️ Back to Units
      </button>
    </div>
  );

  const unitCategories = [
    {
      title: '⚔️ Melee',
      units: [
        { type: 'Warrior' as UnitType, icon: '🗡️', name: 'Warrior' },
        { type: 'Knight' as UnitType, icon: '🛡️', name: 'Knight' },
        { type: 'Berserker' as UnitType, icon: '⚔️', name: 'Berserker' }
      ]
    },
    {
      title: '🏹 Ranged',
      units: [
        { type: 'Archer' as UnitType, icon: '🏹', name: 'Archer' },
        { type: 'Sniper' as UnitType, icon: '🎯', name: 'Sniper' },
        { type: 'Artillery' as UnitType, icon: '💣', name: 'Artillery' }
      ]
    },
    {
      title: '🔮 Support',
      units: [
        { type: 'Medic' as UnitType, icon: '💉', name: 'Medic' },
        { type: 'Guardian' as UnitType, icon: '🛡️', name: 'Guardian' },
        { type: 'Enchanter' as UnitType, icon: '✨', name: 'Enchanter' }
      ]
    }
  ];

  const renderUnitButtons = (faction: string, index: number) => (
    <>
      <button 
        style={{...styles.button(PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]), marginBottom: '15px'}}
        onClick={() => setShowUpgradesForPlayer(index)}
      >
        🔧 Upgrades
      </button>

      {unitCategories.map((category, i) => (
        <UnitCategory
          key={`${faction}-${category.title}`}
          title={category.title}
          units={category.units}
          faction={faction as FactionType}
          playerIndex={index}
          onSpawnUnit={handleSpawnUnit}
        />
      ))}
    </>
  );

  return (
    <div style={styles.container}>
      {/* Debug Panel */}
      <div style={styles.debugPanel}>
        <button 
          style={styles.debugButton} 
          onClick={() => {
            console.log('Big Combat button clicked');
            // For each faction
            playerFactions.forEach((faction, factionIndex) => {
              console.log('Spawning units for faction:', faction);
              // Random number between 5-8 (reduced from 10-15)
              const count = Math.floor(Math.random() * 4) + 5;
              console.log('Will spawn', count, 'units');
              
              // Spawn random units
              for (let i = 0; i < count; i++) {
                const unitTypes = [
                  'Warrior', 'Knight', 'Berserker',  // Melee
                  'Archer', 'Sniper', 'Artillery',   // Ranged
                  'Medic', 'Guardian', 'Enchanter'   // Support
                ] as UnitType[];
                const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
                console.log('Spawning unit:', { type: randomType, faction });
                handleSpawnUnit(randomType, factionIndex, faction);
              }
            });
          }}
        >
          🔥 Big Combat
        </button>
        <button 
          style={styles.debugButton} 
          onClick={() => {
            console.log('Clear button clicked');
            if (gameScreenRef.current) {
              gameScreenRef.current.clearUnits();
            } else {
              console.error('gameScreenRef is null');
            }
          }}
        >
          🧹 Clear
        </button>
      </div>

      {/* Game Screen Container */}
      <div style={{ 
        width: `${gameSize}px`,
        height: `${gameSize}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <GameScreen
          ref={gameScreenRef}
          width={gameSize}
          height={gameSize}
          playerFactions={playerFactions}
          onClearUnits={onClearUnits}
        />
      </div>

      {/* Control Bars Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderLeft: '1px solid #00ff00'
      }}>
        {playerFactions.map((faction, index) => (
          <div key={index} style={{
            width: `${controlBarWidth}px`,
            borderRight: index < playerFactions.length - 1 ? '1px solid #00ff00' : 'none',
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            gap: '10px'
          }}>
            {/* Player Title */}
            <div style={{
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
              fontSize: '20px'
            }}>
              Player {index + 1} - {faction} {factions[faction as keyof typeof factions].emoji}
            </div>

            {/* Show either upgrades menu or unit buttons */}
            {showUpgradesForPlayer === index ? 
              renderUpgradesMenu(faction, index) : 
              renderUnitButtons(faction, index)
            }

            {/* Player Stats */}
            <div style={{
              paddingTop: '10px',
              borderTop: `1px solid ${PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]}`,
              color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div>🏆 Score: 0</div>
              <div>💀 Kills: 0</div>
              <div>💰 Credits: $1000</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredUnit && (
        <div style={{
          ...styles.tooltip,
          top: hoveredUnit.y + 20,
          left: hoveredUnit.x + 20
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {UNIT_INFO[hoveredUnit.type].name}
          </div>
          <div>{UNIT_INFO[hoveredUnit.type].description}</div>
        </div>
      )}
    </div>
  );
};

export default GameLayout; 