import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import { useCallback, useState, useEffect, useRef } from 'react';
import { FactionId, factions } from '../types/faction';

interface GameContainerProps {
  width: number;
  height: number;
}

export const GameContainer = ({ width, height }: GameContainerProps) => {
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the Pixi Application
    const app = new Application({
      width,
      height,
      backgroundColor: 0x0a0a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Add the canvas to the DOM
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create cyberpunk grid background
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
    
    app.stage.addChild(background);

    // Create faction cards
    const cardWidth = 300;
    const cardHeight = 400;
    const padding = 20;
    const startX = (width - (cardWidth * 2 + padding)) / 2;
    const startY = (height - (cardHeight * 2 + padding)) / 2;

    const textStyle = new TextStyle({
      fontFamily: 'Share Tech Mono',
      fontSize: 24,
      fill: '#00ff00',
      align: 'center',
    });

    Object.values(factions).forEach((faction, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + (cardWidth + padding) * col;
      const y = startY + (cardHeight + padding) * row;

      // Create card background
      const card = new Graphics();
      card.lineStyle(2, parseInt(faction.color.replace('#', '0x')), 1);
      card.beginFill(0x0a0a0a, 0.8);
      card.drawRect(x, y, cardWidth, cardHeight);
      card.endFill();

      // Add hover interaction
      card.eventMode = 'static';
      card.cursor = 'pointer';
      
      card.on('mouseover', () => {
        card.clear();
        card.lineStyle(2, parseInt(faction.color.replace('#', '0x')), 1);
        card.beginFill(parseInt(faction.color.replace('#', '0x')), 0.2);
        card.drawRect(x, y, cardWidth, cardHeight);
        card.endFill();
      });

      card.on('mouseout', () => {
        card.clear();
        card.lineStyle(2, parseInt(faction.color.replace('#', '0x')), 1);
        card.beginFill(0x0a0a0a, 0.8);
        card.drawRect(x, y, cardWidth, cardHeight);
        card.endFill();
      });

      card.on('click', () => {
        setSelectedFaction(faction.id);
        console.log('Selected faction:', faction.id);
      });

      // Add faction name
      const text = new Text(faction.name, textStyle);
      text.x = x + cardWidth / 2;
      text.y = y + 30;
      text.anchor.set(0.5, 0);

      // Add description
      const descStyle = new TextStyle({
        ...textStyle,
        fontSize: 16,
        wordWrap: true,
        wordWrapWidth: cardWidth - 40,
      });

      const description = new Text(faction.description, descStyle);
      description.x = x + 20;
      description.y = y + 80;

      app.stage.addChild(card);
      app.stage.addChild(text);
      app.stage.addChild(description);
    });

    // Cleanup
    return () => {
      app.destroy(true);
      appRef.current = null;
    };
  }, [width, height]);

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
}; 