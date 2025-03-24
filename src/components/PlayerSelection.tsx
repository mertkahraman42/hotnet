import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

interface PlayerSelectionProps {
  onPlayerCountSelected: (count: number) => void;
  width: number;
  height: number;
}

export const PlayerSelection: React.FC<PlayerSelectionProps> = ({ onPlayerCountSelected, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

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
      fill: '#00ff00',
      stroke: '#003300',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#00ff00',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    const title = new Text('HoTNET - Select Player Count', titleStyle);
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = titleHeight / 2;
    titleContainer.addChild(title);

    // Create content container for player count boxes
    const contentContainer = new Container();
    contentContainer.y = titleHeight;

    // Player count options
    const playerCounts = [
      { count: 1, description: 'Solo challenge against AI opponents' },
      { count: 2, description: 'Head-to-head tactical combat' },
      { count: 3, description: 'Three-way strategic warfare' },
      { count: 4, description: 'Full-scale network domination' }
    ];

    // Calculate box dimensions
    const boxWidth = (width - contentPadding * 3) / 2;
    const boxHeight = (contentHeight - contentPadding * 3) / 2;

    playerCounts.forEach((option, index) => {
      const container = new Container();
      
      // Calculate grid position
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = contentPadding + col * (boxWidth + contentPadding) + boxWidth/2;
      const y = contentPadding + row * (boxHeight + contentPadding) + boxHeight/2;

      // Create box
      const box = new Graphics();
      box.lineStyle(3, 0x00ff00);
      box.beginFill(0x0a0a0a);
      box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
      box.endFill();

      // Add diagonal lines in corners
      const cornerSize = Math.min(20, boxWidth * 0.05);
      box.lineStyle(2, 0x00ff00);
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

      // Add player count text
      const countStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: Math.min(36, boxHeight * 0.12),
        fill: '#00ff00',
        stroke: '#000000',
        strokeThickness: 1,
      });

      const countText = new Text(`${option.count} Player${option.count > 1 ? 's' : ''}`, countStyle);
      countText.anchor.set(0.5);
      countText.y = -boxHeight/2 + boxHeight * 0.15;

      // Add description
      const descStyle = new TextStyle({
        fontFamily: 'monospace',
        fontSize: Math.min(24, boxHeight * 0.08),
        fill: '#00ff00',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: boxWidth * 0.8,
      });

      const description = new Text(option.description, descStyle);
      description.anchor.set(0.5);
      description.y = 0;

      // Make box interactive
      box.eventMode = 'static';
      box.cursor = 'pointer';
      
      box.on('mouseover', () => {
        box.clear();
        box.lineStyle(3, 0x00ff00);
        box.beginFill(0x1a1a1a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
      });

      box.on('mouseout', () => {
        box.clear();
        box.lineStyle(3, 0x00ff00);
        box.beginFill(0x0a0a0a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
      });

      box.on('click', () => {
        onPlayerCountSelected(option.count);
      });

      container.addChild(box);
      container.addChild(countText);
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
  }, [width, height, onPlayerCountSelected]);

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