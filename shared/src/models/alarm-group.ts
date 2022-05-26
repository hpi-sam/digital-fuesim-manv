import { IsObject, IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate } from './utils';
import type { AlarmGroupVehicle } from './utils/alarm-group-vehicle';

export class AlarmGroup {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    @IsObject()
    public alarmGroupVehicles: { readonly [key: UUID]: AlarmGroupVehicle } = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string) {
        this.name = name;
    }

    static readonly create = getCreate(this);
}
