import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { factions, PLAYER_COLORS } from '../types/faction';

interface FactionSelectProps {
  playerCount: number;
  onFactionsSelected: (factions: string[]) => void;
  width: number;
  height: number;
}

export const FactionSelect: React.FC<FactionSelectProps> = ({ playerCount, onFactionsSelected, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedFactions, setSelectedFactions] = useState<string[]>([]);

  const handleFactionSelect = useCallback((faction: string) => {
    const newSelectedFactions = [...selectedFactions, faction];
    
    if (currentPlayer < playerCount) {
      setSelectedFactions(newSelectedFactions);
      setCurrentPlayer(currentPlayer + 1);
    } else {
      // All players have selected their factions
      onFactionsSelected(newSelectedFactions);
    }
  }, [currentPlayer, playerCount, selectedFactions, onFactionsSelected]);

  useEffect(() => {
    if (!containerRef.current) return;

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
    const mainContainer = new Container();
    app.stage.addChild(mainContainer);

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
    
    mainContainer.addChild(background);

    // Calculate layout constraints
    const titleHeight = height * 0.15;
    const contentHeight = height * 0.85;
    const contentPadding = Math.min(width, height) * 0.05;

    // Create title container
    const titleContainer = new Container();
    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: Math.min(64, height * 0.08),
      fill: PLAYER_COLORS[`player${currentPlayer}` as keyof typeof PLAYER_COLORS],
      stroke: '#003300',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#00ff00',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    const title = new Text('Select Your Faction', titleStyle);
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = titleHeight / 2;
    titleContainer.addChild(title);

    // Add player selection text
    const playerText = new Text(
      `Player ${currentPlayer} Selection${selectedFactions.length > 0 ? ` (Previous: ${selectedFactions.map((f, i) => `P${i + 1}: ${factions[f as keyof typeof factions].emoji}`).join(', ')})` : ''}`,
      new TextStyle({
        fontFamily: 'monospace',
        fontSize: Math.min(32, height * 0.04),
        fill: PLAYER_COLORS[`player${currentPlayer}` as keyof typeof PLAYER_COLORS],
      })
    );
    playerText.anchor.set(0.5);
    playerText.x = width / 2;
    playerText.y = titleHeight - 20;
    titleContainer.addChild(playerText);
    
    // Create content container for faction boxes
    const contentContainer = new Container();
    contentContainer.y = titleHeight;

    // Calculate box dimensions
    const boxWidth = (width - contentPadding * 3) / 2;
    const boxHeight = (contentHeight - contentPadding * 3) / 2;

    Object.values(factions).forEach((faction, index) => {
      const container = new Container();
      
      // Calculate grid position
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = contentPadding + col * (boxWidth + contentPadding) + boxWidth/2;
      const y = contentPadding + row * (boxHeight + contentPadding) + boxHeight/2;

      // Create box
      const box = new Graphics();
      const playerColor = parseInt(PLAYER_COLORS[`player${currentPlayer}` as keyof typeof PLAYER_COLORS].replace('#', '0x'));
      box.lineStyle(3, playerColor);
      box.beginFill(0x0a0a0a);
      box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
      box.endFill();

      // Add diagonal lines in corners
      const cornerSize = Math.min(20, boxWidth * 0.05);
      box.lineStyle(2, playerColor);
      // Top left
      box.moveTo(-boxWidth/2, -boxHeight/2 + cornerSize);
      box.lineTo(-boxWidth/2, -boxHeight/2);
      box.lineTo(-boxWidth/2 + cornerSize, -boxHeight/2);
      // Top right
      box.moveTo(boxWidth/2 - cornerSize, -boxHeight/2);
      box.lineTo(boxWidth/2, -boxHeight/2);
      box.lineTo(boxWidth/2, -boxHeight/2 + cornerSize);
      // Bottom left
      box.moveTo(-boxWidth/2, boxHeight/2 - cornerSize);
      box.lineTo(-boxWidth/2, boxHeight/2);
      box.lineTo(-boxWidth/2 + cornerSize, boxHeight/2);
      // Bottom right
      box.moveTo(boxWidth/2 - cornerSize, boxHeight/2);
      box.lineTo(boxWidth/2, boxHeight/2);
      box.lineTo(boxWidth/2, boxHeight/2 - cornerSize);

      // Add faction name with emoji
      const nameStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: Math.min(36, boxHeight * 0.12),
        fill: PLAYER_COLORS[`player${currentPlayer}` as keyof typeof PLAYER_COLORS],
        stroke: '#000000',
        strokeThickness: 1,
      });

      const name = new Text(`${faction.emoji} ${faction.name}`, nameStyle);
      name.anchor.set(0.5);
      name.y = -boxHeight/2 + boxHeight * 0.15;

      // Add description
      const descStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: Math.min(24, boxHeight * 0.08),
        fill: PLAYER_COLORS[`player${currentPlayer}` as keyof typeof PLAYER_COLORS],
        align: 'center',
        wordWrap: true,
        wordWrapWidth: boxWidth * 0.8,
      });

      const description = new Text(faction.description, descStyle);
      description.anchor.set(0.5);
      description.y = 0;

      // Make box interactive
      box.eventMode = 'static';
      box.cursor = 'pointer';
      
      box.on('mouseover', () => {
        box.clear();
        box.lineStyle(3, playerColor);
        box.beginFill(0x1a1a1a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
      });

      box.on('mouseout', () => {
        box.clear();
        box.lineStyle(3, playerColor);
        box.beginFill(0x0a0a0a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
      });

      box.on('click', () => {
        handleFactionSelect(faction.id);
      });

      container.addChild(box);
      container.addChild(name);
      container.addChild(description);
      container.x = x;
      container.y = y;
      contentContainer.addChild(container);
    });

    // Add containers to stage in correct order
    mainContainer.addChild(contentContainer);
    mainContainer.addChild(titleContainer);

    return () => {
      app.destroy(true);
      appRef.current = null;
    };
  }, [width, height, currentPlayer, selectedFactions, handleFactionSelect]);

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