import { UUID, uuid } from '../utils';

export class EocLogEntry {
    public id: UUID = uuid();

    constructor(
        /**
         * The "real" time
         */
        public timestamp: Date,

        /**
         * The time in the exercise
         */
        public exerciseTimestamp: Date,
        public message: string,
        public clientId: UUID
    ) {}
}
