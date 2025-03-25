import React, { useRef, useEffect } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { UnitType, FactionType } from '../types/units';
import { GameLayout } from './GameLayout';
import { ValidPlayerCount, getPlayerPosition, calculateSpawnPoint, isValidPlayerCount } from '../types/positions';

const PLAYER_FACTIONS: FactionType[] = ['Netrunners', 'Cyborgs', 'Rogue AI'];
const SPAWN_RADIUS = 100;

export const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const app = useRef<Application | null>(null);
    const gameContainer = useRef<Container | null>(null);
    const unitsContainer = useRef<Container | null>(null);
    const castleMarker = useRef<Graphics | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize PIXI Application
        app.current = new Application({
            view: canvasRef.current,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            antialias: true
        });

        // Create containers
        gameContainer.current = new Container();
        unitsContainer.current = new Container();
        app.current.stage.addChild(gameContainer.current);
        gameContainer.current.addChild(unitsContainer.current);

        // Center the game container
        gameContainer.current.position.set(
            window.innerWidth / 2,
            window.innerHeight / 2
        );

        // Draw castle marker
        castleMarker.current = new Graphics();
        castleMarker.current.lineStyle(2, 0xffffff, 1, 0.5);
        castleMarker.current.drawCircle(0, 0, 80);
        castleMarker.current.alpha = 0.3;
        gameContainer.current.addChild(castleMarker.current);

        // Start the game loop
        app.current.ticker.add(() => {
            if (!unitsContainer.current) return;
            
            // Update all units
            for (const unit of unitsContainer.current.children) {
                if (unit instanceof BaseUnit) {
                    unit.update(app.current!.ticker.deltaMS / 1000);
                }
            }
        });

        // Handle window resize
        const handleResize = () => {
            if (!app.current || !gameContainer.current) return;
            
            app.current.renderer.resize(window.innerWidth, window.innerHeight);
            gameContainer.current.position.set(
                window.innerWidth / 2,
                window.innerHeight / 2
            );
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            app.current?.destroy(true);
        };
    }, []);

    const handleSpawnUnit = (type: UnitType, playerIndex: number, faction: FactionType) => {
        if (!app.current || !unitsContainer.current) return;

        // Get total players (this should come from game state in a real implementation)
        const totalPlayers = PLAYER_FACTIONS.length as ValidPlayerCount;
        
        if (!isValidPlayerCount(totalPlayers)) {
            console.error(`Invalid player count: ${totalPlayers}`);
            return;
        }

        // Get the player's position on the octagon
        const position = getPlayerPosition(playerIndex, totalPlayers);
        if (!position) {
            console.error(`No position found for player ${playerIndex} in ${totalPlayers}-player game`);
            return;
        }

        // Calculate spawn point with random offset
        const spawnPosition = calculateSpawnPoint(position, SPAWN_RADIUS, true);
        
        // Create and add the new unit
        const unit = new BaseUnit(
            faction,
            type,
            spawnPosition,
            playerIndex
        );
        unitsContainer.current.addChild(unit);
    };

    const handleClearUnits = () => {
        console.log('Clearing units...');
        if (!unitsContainer.current) {
            console.log('No units container found');
            return;
        }
        
        // Remove all units
        while (unitsContainer.current.children.length > 0) {
            unitsContainer.current.removeChildAt(0);
        }
        console.log('All units cleared');
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GameLayout 
                width={window.innerWidth}
                height={window.innerHeight}
                playerFactions={PLAYER_FACTIONS}
                onSpawnUnit={handleSpawnUnit}
                onClearUnits={handleClearUnits}
            />
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
}; 