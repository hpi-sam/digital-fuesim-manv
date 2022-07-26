import type {
    Client,
    EocLogEntry,
    ImmutableDate,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Migration } from './migrations';

export const updateEocLog3: Migration = {
    actions: null,
    state: migrateState,
};

function migrateState(state: object): object {
    // Rename `ecoLog` to `eocLog`
    (state as { eocLog: EocLogEntry[] }).eocLog = (
        state as { ecoLog: EocLogEntry[] }
    ).ecoLog;

    delete (state as { ecoLog?: EocLogEntry[] }).ecoLog;

    (state as { eocLog: EocLogEntry[] }).eocLog.forEach((entry) =>
        convertEocLogEntryInPlace(
            entry,
            (state as { clients: { [key: UUID]: Client } }).clients
        )
    );
    return state;
}

/**
 *
 * @param entry The {@link EocLogEntry} for version 2
 */
function convertEocLogEntryInPlace(
    entry: object,
    clients: { [key: UUID]: Client }
): EocLogEntry {
    interface EocLogEntry3 {
        id: UUID;
        timestamp: ImmutableDate;
        exerciseTimestamp: number;
        message: string;
        clientName: string;
    }
    delete (entry as any).timestamp;
    (entry as EocLogEntry3).exerciseTimestamp = Math.floor(
        (entry as { exerciseTimestamp: Date }).exerciseTimestamp.getTime() /
            1000
    );
    (entry as EocLogEntry3).message = (entry as EocLogEntry3).message.slice(
        0,
        65535
    );
    (entry as EocLogEntry3).clientName =
        clients[(entry as { clientId: UUID }).clientId]?.name ??
        'Unbekannter Autor';
    return entry as EocLogEntry;
}
