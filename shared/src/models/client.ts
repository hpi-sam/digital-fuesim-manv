import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Role } from './utils';

export class Client {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    // TODO
    @IsString()
    public role: Role;

    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public viewRestrictedToViewportId?: UUID;

    @IsBoolean()
    public isInWaitingRoom: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string, role: Role, viewRestrictedToViewportId?: UUID) {
        this.name = name;
        this.role = role;
        this.viewRestrictedToViewportId = viewRestrictedToViewportId;
        this.isInWaitingRoom = this.role === 'participant';
    }

    static readonly create = getCreate(this);
}
