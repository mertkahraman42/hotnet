import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';

interface IntroScreenProps {
  width: number;
  height: number;
  onBegin: () => void;
}

export const IntroScreen = ({ width, height, onBegin }: IntroScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const particlesRef = useRef<Container | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Creating PixiJS application with dimensions:', { width, height });

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

    // Create particle container
    const particles = new Container();
    particlesRef.current = particles;
    app.stage.addChild(particles);

    // Create floating particles
    for (let i = 0; i < 50; i++) {
      const particle = new Graphics();
      particle.beginFill(0x00ff00, 0.5); // Increased opacity
      particle.drawCircle(0, 0, 3); // Increased size
      particle.endFill();
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      // @ts-ignore - Adding custom properties for animation
      particle.speedX = (Math.random() - 0.5) * 3; // Increased speed
      // @ts-ignore
      particle.speedY = (Math.random() - 0.5) * 3; // Increased speed
      particles.addChild(particle);
    }

    // Create title text with glow effect
    const titleStyle = new TextStyle({
      fontFamily: 'Share Tech Mono',
      fontSize: 120,
      fill: ['#00ff00', '#66ff66'], // Gradient fill
      stroke: '#003300',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#00ff00',
      dropShadowBlur: 10,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    const title = new Text('HoTNET', titleStyle);
    title.x = width / 2;
    title.y = height * 0.3;
    title.anchor.set(0.5);

    // Add subtitle
    const subtitleStyle = new TextStyle({
      fontFamily: 'Share Tech Mono',
      fontSize: 32,
      fill: '#00ff00',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: width * 0.5,
    });

    const subtitle = new Text(
      'Enter the digital battleground where four factions wage war for control of the network. Choose your allegiance and shape the future of cyberspace.',
      subtitleStyle
    );
    subtitle.x = width / 2;
    subtitle.y = height * 0.35;
    subtitle.anchor.set(0.5);

    // Create BEGIN button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const button = new Graphics();
    
    // Function to draw button in different states
    const drawButton = (isHover: boolean) => {
      button.clear();
      button.lineStyle(3, 0x00ff00);
      button.beginFill(isHover ? 0x003300 : 0x0a0a0a);
      button.drawRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight);
      button.endFill();

      // Add diagonal lines in corners for cyberpunk effect
      const cornerSize = 15;
      button.lineStyle(2, 0x00ff00);
      // Top left
      button.moveTo(-buttonWidth/2, -buttonHeight/2 + cornerSize);
      button.lineTo(-buttonWidth/2, -buttonHeight/2);
      button.lineTo(-buttonWidth/2 + cornerSize, -buttonHeight/2);
      // Top right
      button.moveTo(buttonWidth/2 - cornerSize, -buttonHeight/2);
      button.lineTo(buttonWidth/2, -buttonHeight/2);
      button.lineTo(buttonWidth/2, -buttonHeight/2 + cornerSize);
      // Bottom left
      button.moveTo(-buttonWidth/2, buttonHeight/2 - cornerSize);
      button.lineTo(-buttonWidth/2, buttonHeight/2);
      button.lineTo(-buttonWidth/2 + cornerSize, buttonHeight/2);
      // Bottom right
      button.moveTo(buttonWidth/2 - cornerSize, buttonHeight/2);
      button.lineTo(buttonWidth/2, buttonHeight/2);
      button.lineTo(buttonWidth/2, buttonHeight/2 - cornerSize);
    };

    button.x = width / 2;
    button.y = height * 0.7;
    drawButton(false);

    // Add button text
    const buttonStyle = new TextStyle({
      fontFamily: 'Share Tech Mono',
      fontSize: 36,
      fill: '#00ff00',
      stroke: '#003300',
      strokeThickness: 1,
    });

    const buttonText = new Text('BEGIN', buttonStyle);
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height * 0.7;

    // Make button interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    button.on('mouseover', () => {
      drawButton(true);
      buttonText.style.fill = '#ffffff';
    });

    button.on('mouseout', () => {
      drawButton(false);
      buttonText.style.fill = '#00ff00';
    });

    button.on('click', () => {
      console.log('Begin button clicked');
      onBegin();
    });

    // Placeholder for logo/pixel art
    const logoContainer = new Container();
    const logoPlaceholder = new Graphics();
    logoPlaceholder.beginFill(0x00ff00, 0.1);
    const logoWidth = Math.max(subtitle.width + 40, 400);
    const logoHeight = Math.max(subtitle.height + 40, 200);
    logoPlaceholder.drawRect(-logoWidth/2, -logoHeight/2, logoWidth, logoHeight);
    logoPlaceholder.endFill();
    logoContainer.addChild(logoPlaceholder);
    
    logoContainer.addChild(subtitle);
    subtitle.x = 0;
    subtitle.y = 0;
    
    logoContainer.x = width / 2;
    logoContainer.y = height * 0.5;

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016;

      // Animate title glow
      title.style.dropShadowDistance = 6 + Math.sin(time * 2) * 2;
      title.style.dropShadowBlur = 10 + Math.sin(time * 2) * 4;

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.children.forEach((particle: any) => {
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Wrap around screen
          if (particle.x < 0) particle.x = width;
          if (particle.x > width) particle.x = 0;
          if (particle.y < 0) particle.y = height;
          if (particle.y > height) particle.y = 0;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Add everything to stage
    app.stage.addChild(title);
    app.stage.addChild(logoContainer);
    app.stage.addChild(button);
    app.stage.addChild(buttonText);

    console.log('All elements added to stage');

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      app.destroy(true);
      appRef.current = null;
      particlesRef.current = null;
    };
  }, [width, height, onBegin]);

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