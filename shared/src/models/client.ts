import { IsOptional, IsString, IsUUID } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { Role } from './utils';

export class Client {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    // TODO
    public role: Role;

    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public viewRestrictedToViewportId?: UUID;

    constructor(name: string, role: Role, viewRestrictedToViewportId?: UUID) {
        this.name = name;
        this.role = role;
        this.viewRestrictedToViewportId = viewRestrictedToViewportId;
    }
}
