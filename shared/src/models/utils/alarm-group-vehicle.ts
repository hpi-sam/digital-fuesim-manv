import { IsNumber, IsUUID, Min } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export class AlarmGroupVehicle {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleTemplateId: UUID;

    @IsNumber()
    @Min(0)
    public readonly time: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleTemplateId: UUID, time: number) {
        this.vehicleTemplateId = vehicleTemplateId;
        this.time = time;
    }

    static readonly create = getCreate(this);
}
