import React, { useRef } from 'react';
import { GameScreen, GameScreenHandle } from './GameScreen';

interface GameLayoutProps {
  width: number;
  height: number;
  faction: string;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ width, height, faction }) => {
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

    // Determine spawn corner based on faction
    let spawnCorner: 'tl' | 'tr' | 'bl' | 'br';
    switch (faction) {
      case 'Netrunners':
        spawnCorner = 'tl';
        break;
      case 'Cyborgs':
        spawnCorner = 'tr';
        break;
      case 'Rogue AI':
        spawnCorner = 'bl';
        break;
      case 'Megacorps':
        spawnCorner = 'br';
        break;
      default:
        spawnCorner = 'tl';
    }

    gameScreenRef.current.spawnUnit(type, spawnCorner);
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
        <span>Score: 0 | Kills: 0</span>
        <span style={{ marginLeft: 'auto' }}>Credits: 1000</span>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        {/* Game Screen */}
        <div style={{ 
          width: `${gameWidth}px`, 
          height: `${gameHeight}px`
        }}>
          <GameScreen 
            ref={gameScreenRef}
            width={gameWidth} 
            height={gameHeight} 
            faction={faction} 
          />
        </div>

        {/* Action Column/Row */}
        <div style={{
          width: `${actionWidth}px`,
          height: isMobile ? `${actionHeight}px` : '100%',
          backgroundColor: '#0a0a0a',
          borderLeft: isMobile ? 'none' : '1px solid #00ff00',
          borderTop: isMobile ? '1px solid #00ff00' : 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          gap: '10px'
        }}>
          {/* Upgrades Section */}
          <div style={{ 
            flex: isMobile ? '0 0 65px' : 1,
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            gap: '10px',
            padding: '0 5px'
          }}>
            <button style={{
              ...buttonStyle,
              ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
              ...(!isMobile && { width: '100%' })
            }}>Damage +1</button>
            <button style={{
              ...buttonStyle,
              ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
              ...(!isMobile && { width: '100%' })
            }}>Speed +1</button>
            <button style={{
              ...buttonStyle,
              ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
              ...(!isMobile && { width: '100%' })
            }}>Range +1</button>
            <button style={{
              ...buttonStyle,
              ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
              ...(!isMobile && { width: '100%' })
            }}>Health +1</button>
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
            flex: isMobile ? '0 0 65px' : 1,
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            gap: '10px',
            padding: '0 5px'
          }}>
            <button 
              style={{
                ...buttonStyle,
                ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
                ...(!isMobile && { width: '100%' })
              }}
              onClick={() => handleSpawnUnit('Basic')}
            >
              Basic Unit<br/>
              <span style={{ fontSize: '12px' }}>Cost: 100</span>
            </button>
            <button 
              style={{
                ...buttonStyle,
                ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
                ...(!isMobile && { width: '100%' })
              }}
              onClick={() => handleSpawnUnit('Advanced')}
            >
              Advanced Unit<br/>
              <span style={{ fontSize: '12px' }}>Cost: 300</span>
            </button>
            <button 
              style={{
                ...buttonStyle,
                ...(isMobile && { minWidth: `${mobileButtonWidth}px` }),
                ...(!isMobile && { width: '100%' })
              }}
              onClick={() => handleSpawnUnit('Special')}
            >
              Special Unit<br/>
              <span style={{ fontSize: '12px' }}>Cost: 500</span>
            </button>
            {isMobile && <div style={{ minWidth: `${mobileButtonWidth}px` }} />} {/* Spacer for mobile only */}
          </div>
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
  ':hover': {
    backgroundColor: '#001100',
    boxShadow: '0 0 10px #00ff00'
  }
};

export default GameLayout; 