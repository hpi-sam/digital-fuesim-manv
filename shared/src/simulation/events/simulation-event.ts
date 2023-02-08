import type { UUID } from "../../utils";

export interface SimulationEvent {
    readonly type: `${string}Event`;
    readonly id: UUID;
}
