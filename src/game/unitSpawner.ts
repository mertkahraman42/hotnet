import { Point } from 'pixi.js';
import { BaseUnit } from '../units/BaseUnit';
import { UnitType, FactionType } from '../types/units';
import { OctagonPosition, POSITION_ANGLES } from '../types/positions';

interface SpawnPoint {
    position: Point;
    angle: number;
}

export class UnitSpawner {
    private readonly centerX: number;
    private readonly centerY: number;
    private readonly radius: number;
    private readonly innerRadius: number;

    constructor(centerX: number, centerY: number, radius: number) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.innerRadius = radius * 0.7;
    }

    private calculateSpawnPoint(position: OctagonPosition): SpawnPoint {
        const angle = POSITION_ANGLES[position];
        const nextPosition = this.getNextPosition(position);
        const nextAngle = POSITION_ANGLES[nextPosition];

        // Calculate spawn position between inner and outer radius with some randomness
        const randomRadius = this.innerRadius + (Math.random() * (this.radius - this.innerRadius));
        const randomAngle = angle + (Math.random() * (nextAngle - angle));

        return {
            position: new Point(
                this.centerX + randomRadius * Math.cos(randomAngle),
                this.centerY + randomRadius * Math.sin(randomAngle)
            ),
            angle: randomAngle
        };
    }

    private getNextPosition(position: OctagonPosition): OctagonPosition {
        const positions: OctagonPosition[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const currentIndex = positions.indexOf(position);
        return positions[(currentIndex + 1) % 8];
    }

    public spawnUnit(
        type: UnitType,
        position: OctagonPosition,
        faction: FactionType,
        playerIndex: number,
        container: any  // PIXI.Container, but using any to avoid circular dependency
    ): BaseUnit {
        const spawnPoint = this.calculateSpawnPoint(position);
        
        // Create and add the new unit
        const unit = new BaseUnit(
            faction,
            type,
            spawnPoint.position,
            playerIndex
        );

        container.addChild(unit);
        return unit;
    }

    public getOctagonPoints(isInner: boolean = false): Point[] {
        const points: Point[] = [];
        const currentRadius = isInner ? this.innerRadius : this.radius;
        const positions: OctagonPosition[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

        // Generate points using predefined angles
        for (const position of positions) {
            const angle = POSITION_ANGLES[position];
            points.push(new Point(
                this.centerX + currentRadius * Math.cos(angle),
                this.centerY + currentRadius * Math.sin(angle)
            ));
        }

        return points;
    }
} 