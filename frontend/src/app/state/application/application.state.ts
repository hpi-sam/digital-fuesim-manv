import type { UUID } from 'digital-fuesim-manv-shared';
import type { TimeConstraints } from 'src/app/core/time-travel-helper';

export class ApplicationState {
    public readonly mode: 'exercise' | 'frontPage' | 'timeTravel' = 'frontPage';
    /**
     * Either the trainer or participant id of the current or last exercise the client had joined
     * undefined if the client hasn't joined an exercise yet
     */
    public readonly exerciseId: string | undefined = undefined;

    /**
     * The timeConstraints for the current or last timeTravel
     * undefined if the client hasn't time traveled yet
     */
    public readonly timeConstraints: TimeConstraints | undefined = undefined;

    /**
     * The current or last id of the client that is or was joined to {@link exerciseId}
     * undefined if the client hasn't joined an exercise yet
     */
    public readonly ownClientId: UUID | undefined = undefined;

    /**
     * The last name this client had, when he joined an exercise
     * undefined if the client hasn't joined an exercise yet
     */
    public readonly lastClientName: string | undefined = undefined;
}
