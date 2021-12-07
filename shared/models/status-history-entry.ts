import { UUID } from "../utils";

export class StatusHistoryEntry {
    public id: UUID;

    public status: 'paused' | 'running';

    /**
     * The time from which on this status was set.
     */
    public startTimestamp: Date;
}
