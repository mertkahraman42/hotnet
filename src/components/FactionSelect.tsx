import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';

interface FactionSelectProps {
  width: number;
  height: number;
  onSelectFaction: (faction: string) => void;
}

export const FactionSelect = ({ width, height, onSelectFaction }: FactionSelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('Initializing FactionSelect with dimensions:', { width, height });

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

    // Create main container for all elements
    const mainContainer = new Container();
    app.stage.addChild(mainContainer);
    console.log('Created main container');

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
    console.log('Added grid background');

    // Calculate layout constraints
    const titleHeight = height * 0.15; // 15% of height for title section
    const contentHeight = height * 0.85; // 85% of height for content
    const contentPadding = Math.min(width, height) * 0.05; // 5% padding

    // Create title with its own container to ensure it's always on top
    const titleContainer = new Container();
    const titleStyle = new TextStyle({
      fontFamily: 'Share Tech Mono',
      fontSize: Math.min(64, height * 0.08), // Responsive font size
      fill: '#00ff00',
      stroke: '#003300',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#00ff00',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    const title = new Text('Select a Faction', titleStyle);
    title.anchor.set(0.5);
    title.x = width / 2;
    title.y = titleHeight / 2;
    titleContainer.addChild(title);
    
    // Create content container for faction boxes
    const contentContainer = new Container();
    contentContainer.y = titleHeight; // Position below title section

    // Create faction boxes
    const factions = [
      {
        name: 'Netrunners',
        description: 'Elite digital infiltration specialists who can hack and manipulate the digital landscape.',
        color: 0x00ff00, // Green
      },
      {
        name: 'Cyborgs',
        description: 'Augmented humans with powerful cybernetic enhancements and superior combat abilities.',
        color: 0x00ffff, // Cyan
      },
      {
        name: 'Rogue AI',
        description: 'Sentient artificial intelligence systems with unparalleled processing power.',
        color: 0xff00ff, // Magenta
      },
      {
        name: 'Megacorps',
        description: 'Powerful corporate entities with vast resources and advanced technology.',
        color: 0xffff00, // Yellow
      },
    ];

    console.log('Setting up faction boxes with layout constraints:', {
      titleHeight,
      contentHeight,
      contentPadding
    });

    // Calculate box dimensions based on content area
    const boxWidth = (width - contentPadding * 3) / 2; // 2 columns with padding
    const boxHeight = (contentHeight - contentPadding * 3) / 2; // 2 rows with padding

    factions.forEach((faction, index) => {
      const container = new Container();
      
      // Calculate grid position
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = contentPadding + col * (boxWidth + contentPadding) + boxWidth/2;
      const y = contentPadding + row * (boxHeight + contentPadding) + boxHeight/2;

      console.log(`Creating faction box: ${faction.name}`, { x, y, boxWidth, boxHeight });

      // Create box
      const box = new Graphics();
      box.lineStyle(3, faction.color);
      box.beginFill(0x0a0a0a);
      box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
      box.endFill();

      // Add diagonal lines in corners
      const cornerSize = Math.min(20, boxWidth * 0.05); // Responsive corner size
      box.lineStyle(2, faction.color);
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

      // Add faction name
      const nameStyle = new TextStyle({
        fontFamily: 'Share Tech Mono',
        fontSize: Math.min(36, boxHeight * 0.12), // Responsive font size
        fill: faction.color,
        stroke: '#000000',
        strokeThickness: 1,
      });

      const name = new Text(faction.name, nameStyle);
      name.anchor.set(0.5);
      name.y = -boxHeight/2 + boxHeight * 0.15; // 15% from top

      // Add description
      const descStyle = new TextStyle({
        fontFamily: 'Share Tech Mono',
        fontSize: Math.min(24, boxHeight * 0.08), // Responsive font size
        fill: faction.color,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: boxWidth * 0.8, // 80% of box width
      });

      const description = new Text(faction.description, descStyle);
      description.anchor.set(0.5);
      description.y = 0; // Centered vertically

      // Make box interactive
      box.eventMode = 'static';
      box.cursor = 'pointer';
      
      box.on('mouseover', () => {
        box.clear();
        box.lineStyle(3, faction.color);
        box.beginFill(0x1a1a1a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
        console.log(`Faction box hover: ${faction.name}`);
      });

      box.on('mouseout', () => {
        box.clear();
        box.lineStyle(3, faction.color);
        box.beginFill(0x0a0a0a);
        box.drawRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight);
        box.endFill();
      });

      box.on('click', () => {
        console.log(`Faction selected: ${faction.name}`);
        onSelectFaction(faction.name);
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
    mainContainer.addChild(titleContainer); // Title container added last to be on top

    console.log('FactionSelect component fully initialized');

    return () => {
      console.log('Cleaning up FactionSelect component');
      app.destroy(true);
      appRef.current = null;
    };
  }, [width, height, onSelectFaction]);

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