import { UUID, uuid } from '../utils';
import { Role } from './utils';

export class Client {
    public id: UUID = uuid();

    constructor(
        public name: string,
        public role: Role,
        public viewRestrictedToViewportId?: UUID
    ) {}
}
