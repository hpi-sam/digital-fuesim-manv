import {
    IsBoolean,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Role } from './utils';

export class Client {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    // Required by database
    @MaxLength(255)
    public readonly name: string;

    // TODO
    @IsString()
    public readonly role: Role;

    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly viewRestrictedToViewportId?: UUID;

    @IsBoolean()
    public readonly isInWaitingRoom: boolean;

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
