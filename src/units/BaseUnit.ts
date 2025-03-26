/**
 * BaseUnit Class
 * 
 * The core unit class that implements all unit behavior including:
 * - Unit initialization and stats management
 * - Visual representation (body and health bar)
 * - Movement and pathfinding
 * - Combat mechanics (targeting, attacking, damage)
 * - Health management
 * 
 * This class serves as the foundation for all unit types in the game,
 * providing common functionality while allowing for type-specific
 * customization through inheritance.
 */

import { Container, Graphics, Point, Text } from 'pixi.js';
import { IUnit, UnitStats, UnitState, FactionType, UnitType, BASE_UNIT_STATS, FACTION_MODIFIERS } from '../types/units';
import { PLAYER_COLORS } from '../types/faction';
import { v4 as uuidv4 } from 'uuid';

export class BaseUnit extends Container implements IUnit {
    // Static constants for unit configuration
    private static readonly MIN_SEPARATION = 2; // Minimum distance between unit edges in pixels
    private static readonly UNIT_SIZE = 12;     // Base size for unit visuals
    private static readonly TARGET_SEARCH_INTERVAL = 500; // ms between target searches
    private static readonly CENTER_OFFSET = 10; // Small offset for center targeting
    private static readonly CONTROL_POINT_RADIUS = 80; // Match the castle marker radius
    private static readonly DEATH_DELAY = 1000; // 1 second delay before removing dead units

    // Unit properties
    id: string;
    faction: FactionType;
    type: UnitType;
    stats: UnitStats;
    state: UnitState;
    radius: number;
    playerIndex: number;
    
    // Visual components
    private body: Graphics = new Graphics();
    private healthBar: Graphics = new Graphics();
    
    // Combat and movement tracking
    private lastAttackTime: number = 0;
    private lastTargetSearchTime: number = 0;
    private deathTime: number | null = null;

    // Constructor: Initialize unit with faction, type, position, and player index
    constructor(
        faction: FactionType,
        type: UnitType,
        position: Point,
        playerIndex: number
    ) {
        super();

        // Set basic properties
        this.id = uuidv4();
        this.faction = faction;
        this.type = type;
        this.playerIndex = playerIndex;
        this.radius = BaseUnit.UNIT_SIZE / 2;

        // Get base stats for unit type
        const baseStats = BASE_UNIT_STATS[type];
        if (!baseStats) {
            throw new Error(`No base stats found for unit type: ${type}`);
        }

        // Calculate unit stats with faction modifiers
        const defaultModifiers: UnitStats = {
            health: 1.0,
            maxHealth: 1.0,
            damage: 1.0,
            speed: 1.0,
            range: 1.0,
            attackSpeed: 1.0
        };
        const modifiers = FACTION_MODIFIERS[faction] || defaultModifiers;
        const health = Math.round(baseStats.health * (modifiers.health || 1.0));
        const maxHealth = Math.round(baseStats.maxHealth * (modifiers.health || 1.0));
        const damage = Math.round(baseStats.damage * (modifiers.damage || 1.0));
        const speed = baseStats.speed * (modifiers.speed || 1.0);
        const range = Math.round(baseStats.range * (modifiers.range || 1.0));

        // Log calculated stats for debugging
        console.log('Calculated Stats:', {
            health,
            maxHealth,
            damage,
            speed,
            range,
            attackSpeed: baseStats.attackSpeed
        });
        
        // Set unit stats
        this.stats = {
            health,
            maxHealth,
            damage,
            speed,
            range,
            attackSpeed: baseStats.attackSpeed
        };

        // Initialize unit state
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

        // Start moving towards center immediately
        if (this.parent?.parent) {
            const gameContainer = this.parent.parent;
            const centerX = gameContainer.width / 2;
            const centerY = gameContainer.height / 2;
            const offsetX = (Math.random() - 0.5) * 20; // Small random offset
            const offsetY = (Math.random() - 0.5) * 20;
            console.log('=== Unit Initial Movement ===');
            console.log('Unit Type:', type);
            console.log('Current Position:', { x: position.x, y: position.y });
            console.log('Target Position:', { x: centerX + offsetX, y: centerY + offsetY });
            console.log('Game Container Size:', { width: gameContainer.width, height: gameContainer.height });
            this.moveTo(new Point(centerX + offsetX, centerY + offsetY));
        }
        // If parent is not available yet, set up a small delay to try again
        console.log('=== Unit Movement Delayed ===');
        console.log('Parent container not available yet, will retry in 100ms');
        setTimeout(() => {
            if (this.parent?.parent) {
                const gameContainer = this.parent.parent;
                const centerX = gameContainer.width / 2;
                const centerY = gameContainer.height / 2;
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                console.log('=== Unit Delayed Movement ===');
                console.log('Unit Type:', type);
                console.log('Current Position:', { x: this.position.x, y: this.position.y });
                console.log('Target Position:', { x: centerX + offsetX, y: centerY + offsetY });
                console.log('Game Container Size:', { width: gameContainer.width, height: gameContainer.height });
                this.moveTo(new Point(centerX + offsetX, centerY + offsetY));
            } else {
                console.error('Failed to set initial movement - parent container still not available');
            }
        }, 100);
    }

    // Initialize unit graphics (body and health bar)
    private initializeGraphics(): void {
        // Create unit body
        this.body = new Graphics();
        this.drawBody();
        this.addChild(this.body);

        // Create health bar
        this.healthBar = new Graphics();
        this.drawHealthBar();
        this.addChild(this.healthBar);
    }

    // Draw unit body based on unit type
    private drawBody(): void {
        const size = BaseUnit.UNIT_SIZE;
        const color = this.getFactionColor();

        this.body.clear();
        this.body.lineStyle(2, color);
        this.body.beginFill(0x000000);
        
        // Different shapes for different unit types
        if (this.type === 'Archer' || this.type === 'Sniper' || this.type === 'Artillery') {
            // Diamond shape for ranged units
            this.body.moveTo(0, -size/2);
            this.body.lineTo(size/2, 0);
            this.body.lineTo(0, size/2);
            this.body.lineTo(-size/2, 0);
            this.body.lineTo(0, -size/2);
        } else if (this.type === 'Medic' || this.type === 'Guardian' || this.type === 'Enchanter') {
            // Cross shape for support units
            this.body.drawRect(-size/6, -size/2, size/3, size); // Vertical
            this.body.drawRect(-size/2, -size/6, size, size/3); // Horizontal
        } else {
            // Melee units (Warrior, Knight, Berserker)
            switch (this.type) {
                case 'Warrior':
                    this.body.drawCircle(0, 0, size / 2);
                    break;
                case 'Knight':
                    this.body.drawRect(-size/2, -size/2, size, size);
                    break;
                case 'Berserker':
                    this.body.moveTo(-size/2, size/2);
                    this.body.lineTo(0, -size/2);
                    this.body.lineTo(size/2, size/2);
                    this.body.lineTo(-size/2, size/2);
                    break;
            }
        }
        
        this.body.endFill();
    }

    // Draw health bar above unit
    private drawHealthBar(): void {
        const width = 20;
        const height = 3;
        const healthPercentage = this.state.currentHealth / this.stats.maxHealth;

        this.healthBar.clear();
        
        // Background
        this.healthBar.beginFill(0x333333);
        this.healthBar.drawRect(-width/2, -14, width, height);
        this.healthBar.endFill();
        
        // Health
        this.healthBar.beginFill(0x00ff00);
        this.healthBar.drawRect(-width/2, -14, width * healthPercentage, height);
        this.healthBar.endFill();
    }

    // Get faction color for unit visuals
    private getFactionColor(): number {
        const colorKey = `player${this.playerIndex + 1}` as keyof typeof PLAYER_COLORS;
        return parseInt(PLAYER_COLORS[colorKey].replace('#', '0x'));
    }

    // Search for enemy targets within range
    private searchForTargets(): void {
        if (!this.parent) return;

        let nearestEnemy: IUnit | null = null;
        let nearestDistance = Infinity;

        // Get the game container (parent of units container)
        const gameContainer = this.parent.parent;
        if (!gameContainer) return;

        // Calculate center using game container dimensions
        const centerX = gameContainer.width / 2;
        const centerY = gameContainer.height / 2;

        // Calculate distance to center
        const distToCenter = Math.sqrt(
            Math.pow(this.position.x - centerX, 2) + 
            Math.pow(this.position.y - centerY, 2)
        );

        const allUnits = this.parent.children as BaseUnit[];
        
        // Only search for enemies if we're inside the control point
        if (distToCenter <= BaseUnit.CONTROL_POINT_RADIUS) {
            // Look for enemies within maximum detection range
            for (const unit of allUnits) {
                if (unit === this || !unit.isAlive() || unit.faction === this.faction) continue;

                const dx = unit.position.x - this.position.x;
                const dy = unit.position.y - this.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // For ranged units, prioritize enemies at maximum range
                if (this.type.startsWith('Ranged')) {
                    // Prefer targets that are between 50% and 100% of max range
                    if (distance <= this.stats.range && distance >= this.stats.range * 0.5) {
                        nearestEnemy = unit;
                        nearestDistance = distance;
                        break;
                    }
                }

                // For non-ranged units or if no preferred range targets found
                if (distance <= this.stats.range && distance < nearestDistance) {
                    nearestEnemy = unit;
                    nearestDistance = distance;
                }
            }

            if (nearestEnemy) {
                // Always move towards or attack nearest enemy when found
                if (this.isInRange(nearestEnemy)) {
                    this.attack(nearestEnemy);
                } else {
                    this.moveTo(nearestEnemy.getPosition());
                }
            } else {
                // If no enemies found, just stay in current position
                this.state.targetPosition = null;
                this.state.isMoving = false;
            }
        } else {
            // Outside control point - move towards center
            const offsetX = (Math.random() - 0.5) * 20; // Small random offset
            const offsetY = (Math.random() - 0.5) * 20;
            this.moveTo(new Point(centerX + offsetX, centerY + offsetY));
        }
    }

    // Update unit state each frame
    update(delta: number): void {
        if (this.state.isDead) {
            if (this.deathTime === null) {
                this.deathTime = Date.now();
            } else if (Date.now() - this.deathTime >= BaseUnit.DEATH_DELAY) {
                // Remove the unit from its parent container
                this.parent?.removeChild(this);
                return;
            }
            return;
        }

        const currentTime = Date.now();

        // Always search for targets or move towards center
        if (currentTime - this.lastTargetSearchTime >= BaseUnit.TARGET_SEARCH_INTERVAL) {
            this.searchForTargets();
            this.lastTargetSearchTime = currentTime;
        }

        // Handle movement
        if (this.state.targetPosition) {
            this.updateMovement(delta);
        }

        // Handle combat
        if (this.state.isAttacking && this.state.currentTarget) {
            const timeSinceLastAttack = (currentTime - this.lastAttackTime) / 1000;
            
            if (timeSinceLastAttack >= (1 / this.stats.attackSpeed)) {
                if (this.isInRange(this.state.currentTarget)) {
                    this.performAttack(this.state.currentTarget);
                    this.lastAttackTime = currentTime;
                } else {
                    // If target is out of range, move towards it
                    this.moveTo(this.state.currentTarget.getPosition());
                }
            }
        }

        // Update visuals
        this.drawHealthBar();
    }

    // Update unit movement towards target
    private updateMovement(delta: number): void {
        if (!this.state.targetPosition) return;

        // Calculate direction to target
        const dx = this.state.targetPosition.x - this.position.x;
        const dy = this.state.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
            this.state.isMoving = false;
            this.state.targetPosition = null;
            return;
        }

        // Move towards target
        const moveSpeed = this.stats.speed * delta;
        const ratio = moveSpeed / distance;
        this.position.x += dx * ratio;
        this.position.y += dy * ratio;
        this.state.position = this.position.clone();
    }

    // Move unit to specified position
    moveTo(target: Point): void {
        this.state.targetPosition = target;
        this.state.isMoving = true;
    }

    // Attack specified target
    attack(target: IUnit): void {
        this.state.currentTarget = target;
        this.state.isAttacking = true;
    }

    // Check if target is within attack range
    isInRange(target: IUnit): boolean {
        const dx = target.getPosition().x - this.position.x;
        const dy = target.getPosition().y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.stats.range;
    }

    // Perform attack on target
    performAttack(target: IUnit): void {
        // Calculate damage with variance based on unit type
        let variance = 0.1; // Default 10% variance
        switch (this.type) {
            case 'Warrior':
                variance = 0.15; // 15% variance
                break;
            case 'Knight':
                variance = 0.2; // 20% variance
                break;
            case 'Berserker':
                variance = 0.25; // 25% variance
                break;
            case 'Archer':
                variance = 0.1; // 10% variance
                break;
            case 'Sniper':
                variance = 0.05; // 5% variance
                break;
            case 'Artillery':
                variance = 0.3; // 30% variance
                break;
            case 'Medic':
                variance = 0.1; // 10% variance
                break;
            case 'Guardian':
                variance = 0.15; // 15% variance
                break;
            case 'Enchanter':
                variance = 0.2; // 20% variance
                break;
        }

        const minDamage = this.stats.damage * (1 - variance);
        const maxDamage = this.stats.damage * (1 + variance);
        const actualDamage = Math.round(minDamage + Math.random() * (maxDamage - minDamage));

        // Apply damage to target
        target.takeDamage(actualDamage);
    }

    // Take damage from attack
    takeDamage(amount: number): void {
        this.state.currentHealth -= amount;
        if (this.state.currentHealth <= 0) {
            this.state.currentHealth = 0;
            this.state.isDead = true;
        }
    }

    // Check if unit is alive
    isAlive(): boolean {
        return !this.state.isDead;
    }

    // Heal unit by specified amount
    heal(amount: number): void {
        if (this.state.isDead) return;
        this.state.currentHealth = Math.min(this.stats.maxHealth, this.state.currentHealth + amount);
        this.drawHealthBar();
    }

    // Get unit's current health
    getHealth(): number {
        return this.state.currentHealth;
    }

    // Get unit's current position
    getPosition(): Point {
        return this.state.position;
    }
} 