import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Application, Container, Graphics, Point } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { FactionType } from '../types/units';
import { PLAYER_COLORS } from '../types/faction';

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

interface GameScreenProps {
  width: number;
  height: number;
  playerFactions: string[];
}

export interface GameScreenHandle {
  spawnUnit: (type: 'Basic' | 'Advanced' | 'Special', position: OctagonPosition) => void;
}

export const GameScreen = forwardRef<GameScreenHandle, GameScreenProps>(({ width, height, playerFactions }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const unitsRef = useRef<BaseUnit[]>([]);
  const gameContainerRef = useRef<Container | null>(null);
  const unitsContainerRef = useRef<Container | null>(null);

  // Helper function to check collision between two units
  const checkCollision = (unit1: BaseUnit, unit2: BaseUnit): boolean => {
    const dx = unit2.x - unit1.x;
    const dy = unit2.y - unit1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = unit1.radius + unit2.radius;
    return distance < combinedRadius;
  };

  // Handle collision between two units
  const handleCollision = (unit1: BaseUnit, unit2: BaseUnit) => {
    // If units are from different factions, they fight
    if (unit1.faction !== unit2.faction) {
      unit1.attack(unit2);
      unit2.attack(unit1);
    } else {
      // Same faction units should avoid overlapping
      const dx = unit2.x - unit1.x;
      const dy = unit2.y - unit1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return; // Prevent division by zero
      
      // Calculate separation vector
      const overlap = (unit1.radius + unit2.radius - distance) / 2;
      const separationX = (dx / distance) * overlap;
      const separationY = (dy / distance) * overlap;
      
      // Move units apart
      unit1.x -= separationX;
      unit1.y -= separationY;
      unit2.x += separationX;
      unit2.y += separationY;
    }
  };

  // Function to spawn a unit
  const spawnUnit = (type: 'Basic' | 'Advanced' | 'Special', position: OctagonPosition) => {
    if (!appRef.current || !unitsContainerRef.current || !gameContainerRef.current) return;

    const mapSize = Math.min(width, height);
    const cornerOffset = mapSize * 0.1; // 10% of map size for better visibility

    // Calculate spawn position based on corner
    let spawnPosition: Point;
    switch (position) {
      case 'N':
        spawnPosition = new Point(mapSize / 2, cornerOffset);
        break;
      case 'NE':
        spawnPosition = new Point(mapSize - cornerOffset, cornerOffset);
        break;
      case 'E':
        spawnPosition = new Point(mapSize - cornerOffset, mapSize - cornerOffset);
        break;
      case 'SE':
        spawnPosition = new Point(cornerOffset, mapSize - cornerOffset);
        break;
      case 'S':
        spawnPosition = new Point(cornerOffset, cornerOffset);
        break;
      case 'SW':
        spawnPosition = new Point(cornerOffset, cornerOffset);
        break;
      case 'W':
        spawnPosition = new Point(cornerOffset, cornerOffset);
        break;
      case 'NW':
        spawnPosition = new Point(cornerOffset, cornerOffset);
        break;
    }

    // Create new unit
    const unit = new BaseUnit(playerFactions[0] as FactionType, type, spawnPosition);
    
    // Set initial target to center
    const centerPoint = new Point(mapSize / 2, mapSize / 2);
    unit.moveTo(centerPoint);
    
    // Add to container and tracking array
    unitsContainerRef.current.addChild(unit);
    unitsRef.current.push(unit);

    console.log('Spawned unit:', {
      type,
      corner: position,
      position: spawnPosition,
      target: centerPoint,
      mapSize,
      containerPos: {
        x: gameContainerRef.current.x,
        y: gameContainerRef.current.y
      }
    });
  };

  // Expose spawn function to parent
  useImperativeHandle(ref, () => ({
    spawnUnit
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('Initializing GameScreen with dimensions:', { width, height });

    const app = new Application({
      width,
      height,
      backgroundColor: 0x0a0a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create main container
    const gameContainer = new Container();
    gameContainerRef.current = gameContainer;
    app.stage.addChild(gameContainer);

    // Create units container and add it AFTER the map elements
    const unitsContainer = new Container();
    unitsContainerRef.current = unitsContainer;

    // Calculate map dimensions
    const mapSize = Math.min(width, height);
    const centerX = mapSize / 2;
    const centerY = mapSize / 2;
    const radius = mapSize * 0.45; // Slightly smaller than half to fit in view
    const innerRadius = radius * 0.7; // For the inner octagon
    
    // Helper function to calculate octagon points
    const getOctagonPoints = (radius: number) => {
      const points: Point[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 8; // -PI/8 to align N to top
        points.push(new Point(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        ));
      }
      return points;
    };

    // Draw outer octagon (game boundary)
    const outerPoints = getOctagonPoints(radius);
    const map = new Graphics();
    map.lineStyle(2, 0x00ff00, 0.5);
    map.beginFill(0x0a0a0a);
    map.moveTo(outerPoints[0].x, outerPoints[0].y);
    for (let i = 1; i < 8; i++) {
      map.lineTo(outerPoints[i].x, outerPoints[i].y);
    }
    map.closePath();
    map.endFill();

    // Draw inner octagon (center area)
    const innerPoints = getOctagonPoints(innerRadius);
    map.lineStyle(2, 0x00ff00, 1);
    map.beginFill(0x1a1a1a);
    map.moveTo(innerPoints[0].x, innerPoints[0].y);
    for (let i = 1; i < 8; i++) {
      map.lineTo(innerPoints[i].x, innerPoints[i].y);
    }
    map.closePath();
    map.endFill();

    // Draw player sections
    const activePositions = POSITION_PRIORITY[playerFactions.length] || [];
    const positionToIndex: Record<OctagonPosition, number> = {
      'N': 0, 'NE': 1, 'E': 2, 'SE': 3, 'S': 4, 'SW': 5, 'W': 6, 'NW': 7
    };

    // Draw sections between inner and outer octagon
    for (let i = 0; i < 8; i++) {
      const position = Object.keys(positionToIndex).find(
        key => positionToIndex[key as OctagonPosition] === i
      ) as OctagonPosition;

      const isActive = activePositions.includes(position);
      const playerIndex = activePositions.indexOf(position);
      
      map.lineStyle(2, isActive 
        ? parseInt(PLAYER_COLORS[`player${playerIndex + 1}` as keyof typeof PLAYER_COLORS].replace('#', '0x'))
        : parseInt(PLAYER_COLORS.inactive.replace('#', '0x')), 
        isActive ? 0.8 : 0.3
      );
      
      map.beginFill(isActive ? 0x1a1a1a : 0x666666, isActive ? 0.5 : 0.2);
      map.moveTo(innerPoints[i].x, innerPoints[i].y);
      map.lineTo(outerPoints[i].x, outerPoints[i].y);
      map.lineTo(outerPoints[(i + 1) % 8].x, outerPoints[(i + 1) % 8].y);
      map.lineTo(innerPoints[(i + 1) % 8].x, innerPoints[(i + 1) % 8].y);
      map.closePath();
      map.endFill();
    }

    // Draw center glow
    const centerGlow = new Graphics();
    const glowRadius = innerRadius * 0.7;
    for (let i = 15; i >= 0; i--) {
      centerGlow.beginFill(0x00ff00, 0.04 - (i * 0.002));
      centerGlow.drawCircle(centerX, centerY, glowRadius + (i * 2));
      centerGlow.endFill();
    }

    gameContainer.addChild(centerGlow);
    gameContainer.addChild(map);

    // Add units container AFTER map elements
    gameContainer.addChild(unitsContainer);

    // Set up game loop
    app.ticker.add((delta) => {
      // Update all units
      unitsRef.current.forEach(unit => {
        if (unit.isAlive()) {
          unit.update((delta / 60) * 20); // Convert to seconds and multiply by 20 for faster movement
          
          // Check collisions with other units
          unitsRef.current.forEach(otherUnit => {
            if (unit !== otherUnit && otherUnit.isAlive()) {
              if (checkCollision(unit, otherUnit)) {
                handleCollision(unit, otherUnit);
              }
            }
          });
        }
      });

      // Clean up dead units
      unitsRef.current = unitsRef.current.filter(unit => {
        if (!unit.isAlive()) {
          unitsContainerRef.current?.removeChild(unit);
          return false;
        }
        return true;
      });
    });

    return () => {
      console.log('Cleaning up GameScreen');
      app.destroy(true);
      appRef.current = null;
      unitsRef.current = [];
    };
  }, [width, height, playerFactions]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0a',
        position: 'relative',
      }} 
    />
  );
}); 