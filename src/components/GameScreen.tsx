import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Application, Container, Graphics, Point } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { FactionType } from '../types/units';

interface GameScreenProps {
  width: number;
  height: number;
  faction: string;
}

export interface GameScreenHandle {
  spawnUnit: (type: 'Basic' | 'Advanced' | 'Special', spawnCorner: 'tl' | 'tr' | 'bl' | 'br') => void;
}

export const GameScreen = forwardRef<GameScreenHandle, GameScreenProps>(({ width, height, faction }, ref) => {
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
  const spawnUnit = (type: 'Basic' | 'Advanced' | 'Special', spawnCorner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (!appRef.current || !unitsContainerRef.current || !gameContainerRef.current) return;

    const mapSize = Math.min(width, height);
    const cornerOffset = mapSize * 0.1; // 10% of map size for better visibility

    // Calculate spawn position based on corner
    let spawnPosition: Point;
    switch (spawnCorner) {
      case 'tl':
        spawnPosition = new Point(cornerOffset, cornerOffset);
        break;
      case 'tr':
        spawnPosition = new Point(mapSize - cornerOffset, cornerOffset);
        break;
      case 'bl':
        spawnPosition = new Point(cornerOffset, mapSize - cornerOffset);
        break;
      case 'br':
        spawnPosition = new Point(mapSize - cornerOffset, mapSize - cornerOffset);
        break;
    }

    // Create new unit
    const unit = new BaseUnit(faction as FactionType, type, spawnPosition);
    
    // Set initial target to center
    const centerPoint = new Point(mapSize / 2, mapSize / 2);
    unit.moveTo(centerPoint);
    
    // Add to container and tracking array
    unitsContainerRef.current.addChild(unit);
    unitsRef.current.push(unit);

    console.log('Spawned unit:', {
      type,
      corner: spawnCorner,
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
    const cornerSize = mapSize * 0.35;
    const centerSize = mapSize * 0.22;

    // Center the map
    gameContainer.x = (width - mapSize) / 2;
    gameContainer.y = (height - mapSize) / 2;

    // Draw background grid
    const grid = new Graphics();
    grid.lineStyle(1, 0x00ff00, 0.1);
    
    const gridSize = 40;
    for (let x = 0; x <= mapSize; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, mapSize);
    }
    for (let y = 0; y <= mapSize; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(mapSize, y);
    }
    
    gameContainer.addChild(grid);

    // Draw the map elements
    const map = new Graphics();
    
    // Define corner colors
    const cornerColors: Record<string, number> = {
      'Netrunners': 0x00ff00,
      'Cyborgs': 0x00ffff,
      'Rogue AI': 0xff00ff,
      'Megacorps': 0xffff00,
    };

    // Helper function to draw a right triangle corner
    const drawCorner = (x: number, y: number, isRight: boolean, isBottom: boolean) => {
      map.beginFill(0x1a1a1a);
      map.lineStyle(2, cornerColors[faction] || 0x00ff00, 0.8);
      
      // Start at corner point
      map.moveTo(x, y);
      
      // Draw right triangle based on position
      if (isRight) {
        // Right side corners
        map.lineTo(x - cornerSize, y); // Horizontal line
        map.lineTo(x, isBottom ? y - cornerSize : y + cornerSize); // Vertical line
      } else {
        // Left side corners
        map.lineTo(x + cornerSize, y); // Horizontal line
        map.lineTo(x, isBottom ? y - cornerSize : y + cornerSize); // Vertical line
      }
      
      map.closePath();
      map.endFill();
    };

    // Draw all corners with right triangles
    drawCorner(0, 0, false, false); // Top-left
    drawCorner(mapSize, 0, true, false); // Top-right
    drawCorner(0, mapSize, false, true); // Bottom-left
    drawCorner(mapSize, mapSize, true, true); // Bottom-right

    // Draw center circle with glow effect
    const centerGlow = new Graphics();
    for (let i = 15; i >= 0; i--) {
      centerGlow.beginFill(0x00ff00, 0.04 - (i * 0.002));
      centerGlow.drawCircle(mapSize / 2, mapSize / 2, centerSize + (i * 2));
      centerGlow.endFill();
    }
    
    map.beginFill(0x1a1a1a);
    map.lineStyle(2, 0x00ff00, 1);
    map.drawCircle(mapSize / 2, mapSize / 2, centerSize);
    map.endFill();

    gameContainer.addChild(centerGlow);
    gameContainer.addChild(map);

    // Add units container AFTER map elements
    gameContainer.addChild(unitsContainer);

    // Set up game loop
    app.ticker.add((delta) => {
      // Update all units
      unitsRef.current.forEach(unit => {
        if (unit.isAlive()) {
          unit.update((delta / 60) * 10); // Convert to seconds and multiply by 3 for faster movement
          
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
  }, [width, height, faction]);

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