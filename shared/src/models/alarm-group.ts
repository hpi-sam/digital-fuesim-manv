import { IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsValue } from '../utils/validators';
import { IsIdMap } from '../utils/validators/is-id-map';
import { getCreate } from './utils';
import { AlarmGroupVehicle } from './utils/alarm-group-vehicle';

export class AlarmGroup {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('alarmGroup' as const)
    public readonly type = 'alarmGroup';

    @IsString()
    public readonly name: string;

    @IsIdMap(AlarmGroupVehicle)
    public alarmGroupVehicles: { readonly [key: UUID]: AlarmGroupVehicle } = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string) {
        this.name = name;
    }

    static readonly create = getCreate(this);
}
