import { Container, Graphics, Point, Text } from 'pixi.js';
import { IUnit, UnitStats, UnitState, FactionType, BASE_UNIT_STATS, FACTION_MODIFIERS } from '../types/units';
import { v4 as uuidv4 } from 'uuid';

export class BaseUnit extends Container implements IUnit {
    id: string;
    faction: FactionType;
    type: 'Basic' | 'Advanced' | 'Special';
    stats: UnitStats;
    state: UnitState;
    radius: number;
    
    private body: Graphics;
    private healthBar: Graphics;
    private label: Text;

    constructor(
        faction: FactionType,
        type: 'Basic' | 'Advanced' | 'Special',
        position: Point
    ) {
        super();
        
        this.id = uuidv4();
        this.faction = faction;
        this.type = type;
        
        // Set radius based on unit type
        this.radius = 10; // Base size for all units
        
        // Apply faction modifiers to base stats
        const baseStats = { ...BASE_UNIT_STATS[type] };
        const modifiers = FACTION_MODIFIERS[faction];
        
        this.stats = {
            ...baseStats,
            health: baseStats.health * (modifiers.health || 1),
            damage: baseStats.damage * (modifiers.damage || 1),
            speed: baseStats.speed * (modifiers.speed || 1),
            range: baseStats.range * (modifiers.range || 1),
            maxHealth: baseStats.maxHealth * (modifiers.health || 1)
        };

        this.state = {
            position,
            targetPosition: null,
            currentHealth: this.stats.health,
            isMoving: false,
            isAttacking: false,
            isDead: false
        };

        // Initialize visual components
        this.initializeGraphics();
        
        // Set initial position
        this.position.set(position.x, position.y);
    }

    private initializeGraphics(): void {
        // Create unit body
        this.body = new Graphics();
        this.drawBody();
        this.addChild(this.body);

        // Create health bar
        this.healthBar = new Graphics();
        this.drawHealthBar();
        this.addChild(this.healthBar);

        // Create label
        this.label = new Text(this.type, {
            fontFamily: 'monospace',
            fontSize: 10,
            fill: 0x00ff00
        });
        this.label.anchor.set(0.5);
        this.label.position.set(0, -25);
        this.addChild(this.label);
    }

    private drawBody(): void {
        const size = 20; // Base size for the unit
        const color = this.getFactionColor();

        this.body.clear();
        this.body.lineStyle(2, color);
        this.body.beginFill(0x000000);
        
        // Different shapes for different unit types
        switch (this.type) {
            case 'Basic':
                this.body.drawCircle(0, 0, size / 2);
                break;
            case 'Advanced':
                this.body.drawRect(-size/2, -size/2, size, size);
                break;
            case 'Special':
                this.body.moveTo(-size/2, size/2);
                this.body.lineTo(0, -size/2);
                this.body.lineTo(size/2, size/2);
                this.body.lineTo(-size/2, size/2);
                break;
        }
        
        this.body.endFill();
    }

    private drawHealthBar(): void {
        const width = 30;
        const height = 4;
        const healthPercentage = this.state.currentHealth / this.stats.maxHealth;

        this.healthBar.clear();
        
        // Background
        this.healthBar.beginFill(0x333333);
        this.healthBar.drawRect(-width/2, -20, width, height);
        this.healthBar.endFill();
        
        // Health
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-width/2, -20, width * healthPercentage, height);
        this.healthBar.endFill();
    }

    private getFactionColor(): number {
        switch (this.faction) {
            case 'Netrunners': return 0x00ff00;
            case 'Cyborgs': return 0x00ffff;
            case 'Rogue AI': return 0xff00ff;
            case 'Megacorps': return 0xffff00;
            default: return 0x00ff00;
        }
    }

    // IUnit interface implementation
    update(delta: number): void {
        if (this.state.isDead) return;

        if (this.state.isMoving && this.state.targetPosition) {
            this.updateMovement(delta);
        }

        // Update visuals
        this.drawHealthBar();
    }

    private updateMovement(delta: number): void {
        if (!this.state.targetPosition) return;

        const dx = this.state.targetPosition.x - this.position.x;
        const dy = this.state.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
            this.state.isMoving = false;
            this.state.targetPosition = null;
            return;
        }

        const speed = this.stats.speed * delta;
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        this.position.x += moveX;
        this.position.y += moveY;
    }

    takeDamage(amount: number): void {
        if (this.state.isDead) return;

        this.state.currentHealth = Math.max(0, this.state.currentHealth - amount);
        this.drawHealthBar();

        if (this.state.currentHealth <= 0) {
            this.state.isDead = true;
            this.alpha = 0.5; // Visual indication of death
        }
    }

    heal(amount: number): void {
        if (this.state.isDead) return;

        this.state.currentHealth = Math.min(
            this.stats.maxHealth,
            this.state.currentHealth + amount
        );
        this.drawHealthBar();
    }

    moveTo(target: Point): void {
        this.state.targetPosition = target;
        this.state.isMoving = true;
    }

    attack(target: IUnit): void {
        if (this.state.isDead || !this.isInRange(target)) return;

        this.state.isAttacking = true;
        target.takeDamage(this.stats.damage);
    }

    isAlive(): boolean {
        return !this.state.isDead;
    }

    isInRange(target: IUnit): boolean {
        const targetPos = target.getPosition();
        const dx = targetPos.x - this.position.x;
        const dy = targetPos.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= this.stats.range;
    }

    getPosition(): Point {
        return new Point(this.position.x, this.position.y);
    }

    getHealth(): number {
        return this.state.currentHealth;
    }
} 