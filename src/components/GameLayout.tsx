import React, { useRef } from 'react';
import { GameScreen, GameScreenHandle } from './GameScreen';
import { PLAYER_COLORS, factions } from '../types/faction';

interface GameLayoutProps {
  width: number;
  height: number;
  playerFactions: string[];
}

export const GameLayout: React.FC<GameLayoutProps> = ({ width, height, playerFactions }) => {
  const gameScreenRef = useRef<GameScreenHandle>(null);
  
  // Calculate dimensions
  const controlBarWidth = 250; // Fixed width for each control bar
  
  // Calculate game area dimensions
  const gameSize = Math.min(height, width - (controlBarWidth * playerFactions.length)); // Square size for game area

  // Button style
  const buttonStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #00ff00',
    color: '#00ff00',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    ':hover': {
      backgroundColor: '#003300'
    }
  };

  const handleSpawnUnit = (type: 'Basic' | 'Advanced' | 'Special', faction: string) => {
    if (!gameScreenRef.current) return;
    gameScreenRef.current.spawnUnit(type, 'N', faction);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex', 
      backgroundColor: '#0a0a0a',
      color: '#00ff00',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
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
              {faction} {factions[faction as keyof typeof factions].emoji}
            </div>

            {/* Upgrades Section */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <button style={{
                ...buttonStyle,
                color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
              }}>⚔️ Damage +1</button>
              <button style={{
                ...buttonStyle,
                color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
              }}>⚡ Speed +1</button>
              <button style={{
                ...buttonStyle,
                color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
              }}>🎯 Range +1</button>
              <button style={{
                ...buttonStyle,
                color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
              }}>❤️ Health +1</button>
            </div>

            {/* Unit Spawn Buttons */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '10px',
              flex: 1
            }}>
              <button 
                onClick={() => handleSpawnUnit('Basic', faction)}
                style={{
                  ...buttonStyle,
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
                }}
              >
                🤖 Basic Unit (100)
              </button>
              <button 
                onClick={() => handleSpawnUnit('Advanced', faction)}
                style={{
                  ...buttonStyle,
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
                }}
              >
                🦾 Advanced Unit (300)
              </button>
              <button 
                onClick={() => handleSpawnUnit('Special', faction)}
                style={{
                  ...buttonStyle,
                  color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
                  borderColor: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]
                }}
              >
                ⚡ Special Unit (500)
              </button>
            </div>

            {/* Player Stats */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '20px',
              borderTop: `1px solid ${PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS]}`,
              color: PLAYER_COLORS[`player${index + 1}` as keyof typeof PLAYER_COLORS],
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div>🏆 Score: 0</div>
              <div>💀 Kills: 0</div>
              <div>💰 Credits: 1000</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLayout; 