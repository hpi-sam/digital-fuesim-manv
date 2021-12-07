import { UUID } from '../utils';
import { Role } from './utils';

export class Client {
    public id: UUID;

    public name: string;

    public viewRestrictedToViewportId?: UUID;

    public role: Role;
}
