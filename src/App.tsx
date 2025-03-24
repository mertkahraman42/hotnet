import { useState, useEffect } from 'react'
import { IntroScreen } from './components/IntroScreen'
import { PlayerSelection } from './components/PlayerSelection'
import { FactionSelect } from './components/FactionSelect'
import { GameLayout } from './components/GameLayout'
import './App.css'

type GameState = 'intro' | 'player-select' | 'faction-select' | 'game'

function App() {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [gameState, setGameState] = useState<GameState>('intro')
  const [playerCount, setPlayerCount] = useState(1)
  const [selectedFactions, setSelectedFactions] = useState<string[]>([])

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleBegin = () => {
    setGameState('player-select')
  }

  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count)
    setGameState('faction-select')
  }

  const handleFactionsSelected = (factions: string[]) => {
    setSelectedFactions(factions)
    setGameState('game')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {gameState === 'intro' && (
        <IntroScreen
          width={width}
          height={height}
          onBegin={handleBegin}
        />
      )}
      {gameState === 'player-select' && (
        <PlayerSelection
          width={width}
          height={height}
          onPlayerCountSelected={handlePlayerCountSelect}
        />
      )}
      {gameState === 'faction-select' && (
        <FactionSelect
          width={width}
          height={height}
          playerCount={playerCount}
          onFactionsSelected={handleFactionsSelected}
        />
      )}
      {gameState === 'game' && (
        <GameLayout
          width={width}
          height={height}
          playerFactions={selectedFactions}
        />
      )}
    </div>
  )
}

export default App
