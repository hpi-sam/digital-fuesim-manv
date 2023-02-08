import { IsUUID } from "class-validator";
import { uuid, UUID, uuidValidationOptions } from "../../utils";
import { IsValue } from "../../utils/validators";
import type { SimulationEvent } from "./simulation-event";

export class VehicleArrivedEvent implements SimulationEvent {
    @IsValue('TickEvent')
    readonly type = 'TickEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();
}
