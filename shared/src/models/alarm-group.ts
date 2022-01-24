import { IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsIdObject } from '../utils/validators/is-id-object';
import { getCreate } from './utils';
import { AlarmGroupVehicle } from './utils/alarm-group-vehicle';

export class AlarmGroup {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    @IsIdObject(AlarmGroupVehicle)
    public alarmGroupVehicles: { readonly [key: UUID]: AlarmGroupVehicle } = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string) {
        this.name = name;
    }

    static readonly create = getCreate(this);
}
