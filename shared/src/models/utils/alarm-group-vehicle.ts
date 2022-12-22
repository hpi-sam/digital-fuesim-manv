import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export class AlarmGroupVehicle {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleTemplateId: UUID;

    /**
     * The time in ms until the vehicle arrives
     */
    @IsNumber()
    @Min(0)
    public readonly time: number;

    @IsString()
    public readonly name: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(vehicleTemplateId: UUID, time: number, name: string) {
        this.vehicleTemplateId = vehicleTemplateId;
        this.time = time;
        this.name = name;
    }

    static readonly create = getCreate(this);
}
