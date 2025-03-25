import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Application, Container, Graphics, Point, Text } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { FactionType, UnitType } from '../types/units';
import { OctagonPosition } from '../types/positions';
import { PLAYER_COLORS } from '../types/faction';
import { UnitSpawner } from '../game/unitSpawner';

export interface GameScreenProps {
    width: number;
    height: number;
    playerFactions: string[];
}

export interface GameScreenHandle {
    spawnUnit: (type: UnitType, position: OctagonPosition, faction: string) => void;
    clearUnits: () => void;
}

export const GameScreen = forwardRef<GameScreenHandle, GameScreenProps>(({ width, height, playerFactions }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const unitsRef = useRef<BaseUnit[]>([]);
    const gameContainerRef = useRef<Container | null>(null);
    const unitsContainerRef = useRef<Container | null>(null);
    const spawnerRef = useRef<UnitSpawner | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize PIXI Application
        const app = new Application({
            width,
            height,
            backgroundColor: 0x0a0a0a,
            antialias: true
        });
        appRef.current = app;
        containerRef.current.appendChild(app.view as unknown as Node);

        // Create main container
        const gameContainer = new Container();
        gameContainerRef.current = gameContainer;
        app.stage.addChild(gameContainer);

        // Calculate map dimensions
        const mapSize = Math.min(width, height);
        const centerX = width / 2;  // Use full width center
        const centerY = height / 2; // Use full height center
        const radius = mapSize * 0.45;

        // Initialize spawner
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
        
        // Draw vertical lines
        for (let x = 0; x < width; x += 50) {
            background.moveTo(x, 0);
            background.lineTo(x, height);
        }
        
        // Draw horizontal lines
        for (let y = 0; y < height; y += 50) {
            background.moveTo(0, y);
            background.lineTo(width, y);
        }
        
        gameContainer.addChild(background);

        // 2. Draw center glow
        const centerGlow = new Graphics();
        const glowRadius = radius * 0.7;
        for (let i = 15; i >= 0; i--) {
            centerGlow.beginFill(0x00ff00, 0.04 - (i * 0.002));
            centerGlow.drawCircle(centerX, centerY, glowRadius + (i * 2));
            centerGlow.endFill();
        }
        gameContainer.addChild(centerGlow);

        // 3. Draw map base
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

        // Create a separate container for sections and labels
        const sectionsContainer = new Container();
        gameContainer.addChild(sectionsContainer);

        // 4 & 5. Draw sections and labels
        const positions: OctagonPosition[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const activePositions = positions.slice(0, playerFactions.length);

        for (let i = 0; i < 8; i++) {
            const position = positions[i];
            const isActive = activePositions.includes(position);
            const playerIndex = activePositions.indexOf(position);
            
            // Draw section
            const sectionGraphics = new Graphics();
            sectionGraphics.lineStyle(2, isActive 
                ? parseInt(PLAYER_COLORS[`player${playerIndex + 1}` as keyof typeof PLAYER_COLORS].replace('#', '0x'))
                : parseInt(PLAYER_COLORS.inactive.replace('#', '0x')), 
                isActive ? 0.8 : 0.3
            );
            
            sectionGraphics.beginFill(isActive ? 0x1a1a1a : 0x666666, isActive ? 0.5 : 0.2);
            sectionGraphics.moveTo(innerPoints[i].x, innerPoints[i].y);
            sectionGraphics.lineTo(outerPoints[i].x, outerPoints[i].y);
            sectionGraphics.lineTo(outerPoints[(i + 1) % 8].x, outerPoints[(i + 1) % 8].y);
            sectionGraphics.lineTo(innerPoints[(i + 1) % 8].x, innerPoints[(i + 1) % 8].y);
            sectionGraphics.closePath();
            sectionGraphics.endFill();
            
            sectionsContainer.addChild(sectionGraphics);

            // Add position label
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
                    label.y -= 20;
                    break;
                case 'S':
                    label.y += 20;
                    break;
                case 'E':
                    label.x += 20;
                    break;
                case 'W':
                    label.x -= 20;
                    break;
                case 'NE':
                    label.x += 15;
                    label.y -= 15;
                    break;
                case 'NW':
                    label.x -= 15;
                    label.y -= 15;
                    break;
                case 'SE':
                    label.x += 15;
                    label.y += 15;
                    break;
                case 'SW':
                    label.x -= 15;
                    label.y += 15;
                    break;
            }
            
            sectionsContainer.addChild(label);
        }

        // 6. Draw castle marker (dashed circle)
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

        // 7. Create and add units container last (top layer)
        const unitsContainer = new Container();
        unitsContainerRef.current = unitsContainer;
        gameContainer.addChild(unitsContainer);

        return () => {
            app.destroy(true);
            appRef.current = null;
            unitsRef.current = [];
        };
    }, [width, height, playerFactions]);

    // Expose functions to parent
    useImperativeHandle(ref, () => ({
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
        clearUnits: () => {
            if (!unitsContainerRef.current) return;
            while (unitsContainerRef.current.children.length > 0) {
                unitsContainerRef.current.removeChildAt(0);
            }
            unitsRef.current = [];
        }
    }));

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