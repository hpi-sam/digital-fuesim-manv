import {
    IsBoolean,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import type { UUID } from '../utils/index.js';
import { uuid, uuidValidationOptions } from '../utils/index.js';
import { IsLiteralUnion, IsValue } from '../utils/validators/index.js';
import type { Role } from './utils/index.js';
import { getCreate } from './utils/index.js';
import { roleAllowedValues } from './utils/role.js';

export class Client {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('client' as const)
    public readonly type = 'client';

    @IsString()
    // Required by database
    @MaxLength(255)
    public readonly name: string;

    @IsLiteralUnion(roleAllowedValues)
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
