import type { TimeConstraints } from 'src/app/core/time-travel-helper';

export class ApplicationState {
    /**
     * Either the trainer or participant id
     * or undefined if the client is not joined to an exercise
     */
    public readonly exerciseId: string | undefined = undefined;

    /**
     * The timeConstraints for the timeTravel
     * or undefined the application is currently not in timeTravel mode
     */
    public readonly timeConstraints: TimeConstraints | undefined = undefined;

    /**
     * The id of the client that is currently joined to the exercise with {@link exerciseId}
     * if undefined the application is either in timeTravel mode or not in an exercise
     */
    public readonly ownClientId: string | undefined = undefined;
}
