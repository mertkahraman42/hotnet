/**
 * GameScreen Component
 * 
 * The main game rendering component that handles:
 * - PIXI.js canvas setup and management
 * - Game map rendering (octagon grid, sections, labels)
 * - Unit container management
 * - Game loop for unit updates
 * - Unit spawning and clearing
 * 
 * This component creates and manages the visual game environment, including:
 * - Background grid
 * - Center glow effect
 * - Map base (outer and inner octagon)
 * - Section fills and borders
 * - Position labels
 * - Castle marker
 * - Units container
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Application, Container, Graphics, Point, Text } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { FactionType, UnitType } from '../types/units';
import { OctagonPosition } from '../types/positions';
import { PLAYER_COLORS } from '../types/faction';
import { UnitSpawner } from '../game/unitSpawner';
import { POSITION_PRIORITY } from '../types/positions';

// Props interface for the GameScreen component
export interface GameScreenProps {
    width: number;
    height: number;
    playerFactions: string[];
}

// Interface for methods exposed to parent components
export interface GameScreenHandle {
    spawnUnit: (type: UnitType, position: OctagonPosition, faction: string) => void;
    clearUnits: () => void;
}

// Main GameScreen component with ref forwarding for parent control
export const GameScreen = forwardRef<GameScreenHandle, GameScreenProps>(({ width, height, playerFactions }, ref) => {
    // Refs for managing game state and PIXI objects
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const unitsRef = useRef<BaseUnit[]>([]);
    const gameContainerRef = useRef<Container | null>(null);
    const unitsContainerRef = useRef<Container | null>(null);
    const spawnerRef = useRef<UnitSpawner | null>(null);

    // Main setup effect that runs once on mount
    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize PIXI Application with game settings
        const app = new Application({
            width,
            height,
            backgroundColor: 0x0a0a0a,
            antialias: true
        });
        appRef.current = app;
        containerRef.current.appendChild(app.view as unknown as Node);

        // Create main game container
        const gameContainer = new Container();
        gameContainerRef.current = gameContainer;
        app.stage.addChild(gameContainer);

        // Calculate map dimensions and center
        const mapSize = Math.min(width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = mapSize * 0.45;

        // Initialize unit spawner with map dimensions
        spawnerRef.current = new UnitSpawner(centerX, centerY, radius);

        // Z-INDEX HIERARCHY (bottom to top):
        // 1. Background grid
        // 2. Center glow effect
        // 3. Map base (outer and inner octagon)
        // 4. Section fills and borders
        // 5. Position labels
        // 6. Castle marker (dashed circle)
        // 7. Units container (for dynamic units)

        // 1. Create cyberpunk grid background
        const background = new Graphics();
        background.lineStyle(1, 0x00ff00, 0.3);
        
        // Draw grid lines
        for (let x = 0; x < width; x += 50) {
            background.moveTo(x, 0);
            background.lineTo(x, height);
        }
        
        for (let y = 0; y < height; y += 50) {
            background.moveTo(0, y);
            background.lineTo(width, y);
        }
        
        gameContainer.addChild(background);

        // 2. Draw center glow effect
        const centerGlow = new Graphics();
        const glowRadius = radius * 0.7;
        for (let i = 15; i >= 0; i--) {
            centerGlow.beginFill(0x00ff00, 0.04 - (i * 0.002));
            centerGlow.drawCircle(centerX, centerY, glowRadius + (i * 2));
            centerGlow.endFill();
        }
        gameContainer.addChild(centerGlow);

        // 3. Draw map base (outer and inner octagon)
        const map = new Graphics();
        const outerPoints = spawnerRef.current.getOctagonPoints(false);
        const innerPoints = spawnerRef.current.getOctagonPoints(true);
        
        // Draw outer octagon (game boundary)
        map.lineStyle(2, 0x00ff00, 0.5);
        map.beginFill(0x0a0a0a);
        map.moveTo(outerPoints[0].x, outerPoints[0].y);
        for (let i = 1; i < 8; i++) {
            map.lineTo(outerPoints[i].x, outerPoints[i].y);
        }
        map.closePath();
        map.endFill();

        // Draw inner octagon (center area)
        map.lineStyle(2, 0x00ff00, 1);
        map.beginFill(0x1a1a1a);
        map.moveTo(innerPoints[0].x, innerPoints[0].y);
        for (let i = 1; i < 8; i++) {
            map.lineTo(innerPoints[i].x, innerPoints[i].y);
        }
        map.closePath();
        map.endFill();
        
        gameContainer.addChild(map);

        // Create container for sections and labels
        const sectionsContainer = new Container();
        gameContainer.addChild(sectionsContainer);

        // 4 & 5. Draw sections and labels
        const positions: OctagonPosition[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        // Get active positions based on player count
        const activePositions: OctagonPosition[] = 
            (POSITION_PRIORITY[playerFactions.length as keyof typeof POSITION_PRIORITY] as OctagonPosition[]) || [];

        // Draw each section and its label
        for (let i = 0; i < 8; i++) {
            const position = positions[i];
            const isActive = activePositions.includes(position);
            
            // Map positions to player indices for coloring
            let playerIndex = -1;
            if (isActive) {
                if (position === 'SW') playerIndex = 0;      // Player 1 (Red/Netrunners)
                else if (position === 'NW') playerIndex = 1; // Player 2 (Blue/Cyborgs)
                else if (position === 'NE') playerIndex = 2; // Player 3 (Orange/Megacorps)
                else if (position === 'SE') playerIndex = 3; // Player 4 (Purple/Rogue AI)
            }
            
            // Draw section with appropriate color
            const sectionGraphics = new Graphics();
            sectionGraphics.lineStyle(2, isActive && playerIndex !== -1
                ? parseInt(PLAYER_COLORS[`player${playerIndex + 1}` as keyof typeof PLAYER_COLORS].replace('#', '0x'))
                : parseInt(PLAYER_COLORS.inactive.replace('#', '0x')), 
                isActive ? 0.8 : 0.3
            );
            
            // Fill section with color
            sectionGraphics.beginFill(isActive ? 0x1a1a1a : 0x666666, isActive ? 0.5 : 0.2);
            sectionGraphics.moveTo(innerPoints[i].x, innerPoints[i].y);
            sectionGraphics.lineTo(outerPoints[i].x, outerPoints[i].y);
            sectionGraphics.lineTo(outerPoints[(i + 1) % 8].x, outerPoints[(i + 1) % 8].y);
            sectionGraphics.lineTo(innerPoints[(i + 1) % 8].x, innerPoints[(i + 1) % 8].y);
            sectionGraphics.closePath();
            sectionGraphics.endFill();
            
            sectionsContainer.addChild(sectionGraphics);

            // Add position label (N, NE, E, etc.)
            const midX = (innerPoints[i].x + outerPoints[i].x) / 2;
            const midY = (innerPoints[i].y + outerPoints[i].y) / 2;
            
            const label = new Text(position, {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff,
                stroke: 0x000000,
                strokeThickness: 4,
                align: 'center',
                fontWeight: 'bold'
            });
            label.anchor.set(0.5);
            label.position.set(midX, midY);
            
            // Adjust label position for better readability
            switch(position) {
                case 'N':
                    label.x += 60;
                    break;
                case 'S':
                    label.x -= 60;
                    break;
                case 'E':
                    label.y += 60;
                    break;
                case 'W':
                    label.y -= 60;
                    break;
                case 'NE':
                    label.x += 30;
                    label.y += 30;
                    break;
                case 'NW':
                    label.x += 30;
                    label.y -= 30;
                    break;
                case 'SE':
                    label.x -= 30;
                    label.y += 30;
                    break;
                case 'SW':
                    label.x -= 30;
                    label.y -= 30;
                    break;
            }
            
            sectionsContainer.addChild(label);
        }

        // 6. Draw castle marker (dashed circle in center)
        const castleMarker = new Graphics();
        const castleRadius = 80;
        const segments = 24;
        
        castleMarker.lineStyle(4, 0x00ff00, 0.8);
        for (let i = 0; i < segments; i++) {
            const startAngle = (i * 2 * Math.PI) / segments;
            const endAngle = ((i + 0.7) * 2 * Math.PI) / segments;
            
            castleMarker.moveTo(
                centerX + castleRadius * Math.cos(startAngle),
                centerY + castleRadius * Math.sin(startAngle)
            );
            castleMarker.arc(centerX, centerY, castleRadius, startAngle, endAngle);
        }
        gameContainer.addChild(castleMarker);

        // 7. Create container for units (top layer)
        const unitsContainer = new Container();
        unitsContainerRef.current = unitsContainer;
        gameContainer.addChild(unitsContainer);

        // Set up game loop for unit updates
        app.ticker.add((delta) => {
            if (unitsContainerRef.current) {
                for (const unit of unitsContainerRef.current.children as BaseUnit[]) {
                    // Convert delta to seconds for consistent movement speed
                    const deltaSeconds = delta / 60;
                    unit.update(deltaSeconds);
                }
            }
        });

        // Cleanup function
        return () => {
            app.destroy(true);
            appRef.current = null;
            unitsRef.current = [];
        };
    }, [width, height, playerFactions]);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
        // Spawn a new unit at specified position
        spawnUnit: (type: UnitType, position: OctagonPosition, faction: string) => {
            if (!unitsContainerRef.current || !spawnerRef.current) return;

            const playerIndex = playerFactions.indexOf(faction);
            if (playerIndex === -1) {
                console.error(`Invalid faction: ${faction}`);
                return;
            }

            const unit = spawnerRef.current.spawnUnit(
                type,
                position,
                faction as FactionType,
                playerIndex,
                unitsContainerRef.current
            );
            unitsRef.current.push(unit);
        },
        // Clear all units from the game
        clearUnits: () => {
            if (!unitsContainerRef.current) return;
            while (unitsContainerRef.current.children.length > 0) {
                unitsContainerRef.current.removeChildAt(0);
            }
            unitsRef.current = [];
        }
    }));

    // Render the game container
    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: '#0a0a0a',
                position: 'relative',
            }} 
        />
    );
}); 