import type { UUID } from '../../utils';

export class SimulationEvent {
    readonly type!: `${string}Event`;
    readonly id!: UUID;
}
