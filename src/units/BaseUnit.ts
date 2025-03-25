import { Container, Graphics, Point, Text } from 'pixi.js';
import { IUnit, UnitStats, UnitState, FactionType, UnitType, BASE_UNIT_STATS, FACTION_MODIFIERS } from '../types/units';
import { PLAYER_COLORS } from '../types/faction';
import { v4 as uuidv4 } from 'uuid';

export class BaseUnit extends Container implements IUnit {
    private static readonly MIN_SEPARATION = 3; // Minimum distance between unit edges in pixels
    private static readonly UNIT_SIZE = 20;     // Base size for unit visuals
    private static readonly TARGET_SEARCH_INTERVAL = 500; // ms between target searches
    private static readonly CENTER_OFFSET = 15; // Small offset for center targeting
    private static readonly CONTROL_POINT_RADIUS = 80; // Match the castle marker radius

    id: string;
    faction: FactionType;
    type: UnitType;
    stats: UnitStats;
    state: UnitState;
    radius: number;
    playerIndex: number;
    
    private body: Graphics = new Graphics();
    private healthBar: Graphics = new Graphics();
    private lastAttackTime: number = 0;
    private lastTargetSearchTime: number = 0;

    constructor(
        faction: FactionType,
        type: UnitType,
        position: Point,
        playerIndex: number
    ) {
        super();
        
        this.id = uuidv4();
        this.faction = faction;
        this.type = type;
        this.playerIndex = playerIndex;
        
        // Set radius based on unit size
        this.radius = BaseUnit.UNIT_SIZE / 2;
        
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
    }

    private drawBody(): void {
        const size = BaseUnit.UNIT_SIZE;
        const color = this.getFactionColor();

        this.body.clear();
        this.body.lineStyle(2, color);
        this.body.beginFill(0x000000);
        
        // Different shapes for different unit types
        if (this.type.startsWith('Ranged')) {
            // Diamond shape for ranged units
            this.body.moveTo(0, -size/2);
            this.body.lineTo(size/2, 0);
            this.body.lineTo(0, size/2);
            this.body.lineTo(-size/2, 0);
            this.body.lineTo(0, -size/2);
        } else if (this.type.startsWith('Support')) {
            // Cross shape for support units
            this.body.drawRect(-size/6, -size/2, size/3, size); // Vertical
            this.body.drawRect(-size/2, -size/6, size, size/3); // Horizontal
        } else {
            // Original shapes for melee units
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
        const colorKey = `player${this.playerIndex + 1}` as keyof typeof PLAYER_COLORS;
        return parseInt(PLAYER_COLORS[colorKey].replace('#', '0x'));
    }

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

    update(delta: number): void {
        if (this.state.isDead) return;

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

        // Get normalized direction to target
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Calculate separation force (avoid other units)
        let separationX = 0;
        let separationY = 0;
        let neighborCount = 0;

        // Get all units from parent container
        const allUnits = (this.parent?.children || []) as BaseUnit[];
        
        for (const other of allUnits) {
            if (other === this || !other.isAlive()) continue;

            const offsetX = this.position.x - other.position.x;
            const offsetY = this.position.y - other.position.y;
            const sqDist = offsetX * offsetX + offsetY * offsetY;
            
            // Calculate minimum separation distance (edge to edge)
            const minSeparation = BaseUnit.MIN_SEPARATION + this.radius + other.radius;
            
            if (sqDist < minSeparation * minSeparation && sqDist > 0) {
                // Calculate separation vector
                const d = Math.sqrt(sqDist);
                // Stronger separation force when very close
                const separationStrength = Math.max(0, 1 - (d / minSeparation));
                separationX += (offsetX / d) * separationStrength;
                separationY += (offsetY / d) * separationStrength;
                neighborCount++;
            }
        }

        // Apply separation if there are neighbors
        if (neighborCount > 0) {
            separationX /= neighborCount;
            separationY /= neighborCount;
            
            // Normalize separation vector
            const sepLength = Math.sqrt(separationX * separationX + separationY * separationY);
            if (sepLength > 0) {
                separationX /= sepLength;
                separationY /= sepLength;
            }
        }

        // Combine target direction with separation
        // Reduce separation influence to allow units to get closer for combat
        const separationWeight = 0.5; // Reduced from 1.0
        const finalDirX = dirX + separationX * separationWeight;
        const finalDirY = dirY + separationY * separationWeight;

        // Normalize final direction
        const finalLength = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
        const normalizedDirX = finalLength > 0 ? finalDirX / finalLength : dirX;
        const normalizedDirY = finalLength > 0 ? finalDirY / finalLength : dirY;

        // Apply movement
        const speed = this.stats.speed * delta;
        this.position.x += normalizedDirX * speed;
        this.position.y += normalizedDirY * speed;
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
        this.state.currentTarget = target;
        
        // If we haven't attacked yet, perform first attack immediately
        if (this.lastAttackTime === 0) {
            this.performAttack(target);
            this.lastAttackTime = Date.now();
        }
    }

    private performAttack(target: IUnit): void {
        if (this.state.isDead) return;

        // Calculate damage variance based on unit type
        const variance = this.type === 'Basic' ? 0.15 : 
                        this.type === 'Advanced' ? 0.20 : 0.25;
        
        // Calculate min and max damage
        const minDamage = Math.floor(this.stats.damage * (1 - variance));
        const maxDamage = Math.floor(this.stats.damage * (1 + variance));
        
        // Generate random damage between min and max (inclusive)
        const actualDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
        
        target.takeDamage(actualDamage);
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