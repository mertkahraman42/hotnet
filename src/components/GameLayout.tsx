import React, { useRef } from 'react';
import { GameScreen, GameScreenHandle } from './GameScreen';
import { PLAYER_COLORS, factions } from '../types/faction';

type OctagonPosition = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

const POSITION_PRIORITY: OctagonPosition[][] = [
  [],  // 0 players
  ['N'],  // 1 player
  ['N', 'S'],  // 2 players
  ['N', 'SE', 'SW'],  // 3 players
  ['N', 'E', 'S', 'W'],  // 4 players
  ['N', 'E', 'SE', 'SW', 'W'],  // 5 players
  ['N', 'NE', 'SE', 'S', 'SW', 'NW'],  // 6 players
  ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W'],  // 7 players
  ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']  // 8 players
];

interface GameLayoutProps {
  width: number;
  height: number;
  playerFactions: string[];
}

export const GameLayout: React.FC<GameLayoutProps> = ({ width, height, playerFactions }) => {
  const gameScreenRef = useRef<GameScreenHandle>(null);
  
  // Determine if we're in mobile view (portrait mode)
  const isMobile = width < height;

  // Calculate dimensions based on viewport
  const statsHeight = 40; // Single row for stats
  const actionWidth = isMobile ? width : 200; // Full width in mobile, 200px in desktop
  const actionHeight = isMobile ? 160 : height - statsHeight; // Reduced height for mobile
  
  // Calculate game area dimensions
  const gameWidth = isMobile ? width : width - actionWidth;
  const gameHeight = isMobile ? height - statsHeight - actionHeight : height - statsHeight;

  // Calculate button dimensions for mobile
  const mobileButtonWidth = (width - 50) / 4; // 4 buttons per row, 50px total padding/gaps

  // Handle unit spawning
  const handleSpawnUnit = (type: 'Basic' | 'Advanced' | 'Special') => {
    if (!gameScreenRef.current) return;

    // Get the active positions for current player count
    const activePositions = POSITION_PRIORITY[playerFactions.length] || [];
    
    // For now, just spawn in first player's position
    // TODO: Implement turn system to determine which player is active
    if (activePositions.length > 0) {
      gameScreenRef.current.spawnUnit(type, activePositions[0]);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#0a0a0a',
      color: '#00ff00',
      fontFamily: 'monospace'
    }}>
      {/* Stats Bar */}
      <div style={{
        height: `${statsHeight}px`,
        backgroundColor: '#0a0a0a',
        borderBottom: '1px solid #00ff00',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        fontSize: '16px'
      }}>
        <span>Active Players: {playerFactions.length} | Score: 0 | Kills: 0</span>
        <span style={{ marginLeft: 'auto' }}>Credits: 1000</span>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'row',
        overflow: 'hidden' // Hide overflow to manage scroll
      }}>
        {/* Game Screen */}
        <div style={{ 
          width: `${gameWidth}px`, 
          height: `${gameHeight}px`,
          flexShrink: 0 // Prevent shrinking
        }}>
          <GameScreen 
            ref={gameScreenRef}
            width={gameWidth} 
            height={gameHeight} 
            playerFactions={playerFactions}
          />
        </div>

        {/* Player Control Bars */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto', // Enable horizontal scroll
          flexGrow: 1 // Allow control bars to fill remaining space
        }}>
          {playerFactions.map((faction, index) => (
            <div key={index} style={{
              width: `${actionWidth}px`,
              height: '100%',
              backgroundColor: '#0a0a0a',
              borderLeft: '1px solid #00ff00',
              display: 'flex',
              flexDirection: 'column',
              padding: '10px',
              gap: '10px',
              color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
            }}>
              {/* Player Title */}
              <div style={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Player {index + 1} - {faction} {factions[faction as keyof typeof factions].emoji}
              </div>

              {/* Upgrades Section */}
              <div style={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
                padding: '0 5px'
              }}>
                <button style={{
                  ...buttonStyle,
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  width: '100%'
                }}>⚔️ Damage +1</button>
                <button style={{
                  ...buttonStyle,
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  width: '100%'
                }}>💨 Speed +1</button>
                <button style={{
                  ...buttonStyle,
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  width: '100%'
                }}>🎯 Range +1</button>
                <button style={{
                  ...buttonStyle,
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  width: '100%'
                }}>❤️ Health +1</button>
              </div>

              {/* Divider */}
              <div style={{
                width: 'auto',
                height: '1px',
                backgroundColor: '#00ff00',
                opacity: 0.5,
                margin: '0 5px'
              }} />

              {/* Minion Spawns Section */}
              <div style={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '10px',
                padding: '0 5px'
              }}>
                <button 
                  style={{
                    ...buttonStyle,
                    borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    width: '100%'
                  }}
                  onClick={() => handleSpawnUnit('Basic')}
                >
                  🛡️ Basic Unit<br/>
                  <span style={{ fontSize: '12px' }}>Cost: 100</span>
                </button>
                <button 
                  style={{
                    ...buttonStyle,
                    borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    width: '100%'
                  }}
                  onClick={() => handleSpawnUnit('Advanced')}
                >
                  ⚙️ Advanced Unit<br/>
                  <span style={{ fontSize: '12px' }}>Cost: 300</span>
                </button>
                <button 
                  style={{
                    ...buttonStyle,
                    borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                    width: '100%'
                  }}
                  onClick={() => handleSpawnUnit('Special')}
                >
                  🚀 Special Unit<br/>
                  <span style={{ fontSize: '12px' }}>Cost: 500</span>
                </button>
              </div>

              {/* Scoreboard and Resources */}
              <div style={{
                marginTop: 'auto',
                borderTop: '1px solid #00ff00',
                padding: '10px 0',
                textAlign: 'center'
              }}>
                <span>Score: 0 | Kills: 0</span><br/>
                <span>Credits: 1000</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Shared button style
const buttonStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  color: '#00ff00',
  border: '1px solid #00ff00',
  padding: '10px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: '14px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '120px',
  flex: '0 0 auto',
  transition: 'all 0.2s',
  ':hover': undefined,
};

export default GameLayout; 