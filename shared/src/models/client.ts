import { IsEnum, IsIn, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { Role } from './utils';

export class Client {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    // TODO
    public role: Role;

    @IsUUID(4, UUIDValidationOptions)
    public viewRestrictedToViewportId?: UUID;

    constructor(name: string, role: Role, viewRestrictedToViewportId?: UUID) {
        this.name = name;
        this.role = role;
        this.viewRestrictedToViewportId = viewRestrictedToViewportId;
    }
}
