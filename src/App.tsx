import { useState, useEffect } from 'react'
import { IntroScreen } from './components/IntroScreen'
import { FactionSelect } from './components/FactionSelect'
import { GameLayout } from './components/GameLayout'
import './App.css'

type GameState = 'intro' | 'faction-select' | 'game'

function App() {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const [gameState, setGameState] = useState<GameState>('intro')
  const [selectedFaction, setSelectedFaction] = useState<string>('')

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleBegin = () => {
    setGameState('faction-select')
  }

  const handleFactionSelect = (faction: string) => {
    setSelectedFaction(faction)
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
      {gameState === 'faction-select' && (
        <FactionSelect
          width={width}
          height={height}
          onSelectFaction={handleFactionSelect}
        />
      )}
      {gameState === 'game' && (
        <GameLayout
          width={width}
          height={height}
          faction={selectedFaction}
        />
      )}
    </div>
  )
}

export default App
