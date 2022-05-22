import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Action } from '@ngrx/store';
import { Store } from '@ngrx/store';
import type {
    Client,
    ExerciseAction,
    ExerciseIds,
    ExerciseState,
} from 'digital-fuesim-manv-shared';
import { reduceExerciseState } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { lastValueFrom, map, of, switchMap } from 'rxjs';
import type { AppState } from '../state/app.state';
import {
    applyServerAction,
    setExerciseState,
} from '../state/exercise/exercise.actions';
import { getSelectClient } from '../state/exercise/exercise.selectors';
import { getStateSnapshot } from '../state/get-state-snapshot';
import { httpOrigin } from './api-origins';
import { MessageService } from './messages/message.service';
import { PresentExerciseHelper } from './present-exercise-helper';
import { getTimeLine } from './temp-timeline';
import { TimeTravelHelper } from './time-travel-helper';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(
        private readonly store: Store<AppState>,
        private readonly httpClient: HttpClient,
        private readonly messageService: MessageService
    ) {}

    private presentState?: ExerciseState;
    // TODO: These are currently not used
    private presentActionsQueue: Action[] = [];

    private readonly presentExerciseHelper = new PresentExerciseHelper(
        (exercise) =>
            this.isTimeTraveling
                ? (this.presentState = exercise)
                : this.store.dispatch(setExerciseState(exercise)),
        () =>
            this.isTimeTraveling
                ? this.presentState!
                : getStateSnapshot(this.store).exercise,
        (action) => {
            if (!this.isTimeTraveling) {
                this.store.dispatch(applyServerAction(action));
                return;
            }
            // TODO: Add these to the timeHelperConstraints to enable real-time timeline updates
            this.presentActionsQueue.push(action);
            this.presentState = reduceExerciseState(this.presentState!, action);
        },
        this.messageService
    );

    public readonly joinExercise = this.presentExerciseHelper.joinExercise.bind(
        this.presentExerciseHelper
    );
    public readonly leaveExercise =
        this.presentExerciseHelper.leaveExercise.bind(
            this.presentExerciseHelper
        );
    /**
     * Either the trainer or participant id
     */
    public get exerciseId() {
        return this.presentExerciseHelper.exerciseId;
    }
    /**
     * Whether the client is currently joined to an exercise
     */
    public get isJoined() {
        return this.presentExerciseHelper.ownClientId !== undefined;
    }

    private readonly timeTravelHelper: TimeTravelHelper = new TimeTravelHelper(
        () =>
            this.isTimeTraveling
                ? this.presentState!
                : getStateSnapshot(this.store).exercise,
        (state) => this.store.dispatch(setExerciseState(state)),
        // TODO: get from the server
        async () => getTimeLine()
    );

    public readonly jumpToTime = this.timeTravelHelper.jumpToTime.bind(
        this.timeTravelHelper
    );
    public timeConstraints$ = this.timeTravelHelper.timeConstraints$;
    public get isTimeTraveling() {
        return this.timeTravelHelper.isTimeTraveling;
    }

    /**
     * The id of the client that is currently joined to the exercise with {@link exerciseId}
     * undefined: the client is not joined to an exercise
     * null: {@link isTimeTraveling} is true, the client could not be in the current exercise state
     */
    public get ownClientId() {
        if (this.isTimeTraveling) {
            return null;
        }
        return this.presentExerciseHelper.ownClientId;
    }

    /**
     * Emits either the users own client in the state or
     * undefined if the user is not joined to an exercise or
     * null if time travel is active
     */
    public readonly ownClient$ = this.timeTravelHelper.isTimeTraveling$.pipe(
        switchMap((isTimeTraveling) =>
            isTimeTraveling ? of(null) : this.presentExerciseHelper.ownClientId$
        ),
        switchMap((clientId) =>
            clientId
                ? this.store.select(getSelectClient(clientId))
                : // clientId is expected to never be the empty string
                  of(clientId as null | undefined)
        )
    );

    public get currentRole() {
        const ownClient = this.ownClientId
            ? getSelectClient(this.ownClientId)(getStateSnapshot(this.store))
            : // clientId is expected to never be the empty string
              (this.ownClientId as null | undefined);
        return this.getCurrentRole(ownClient);
    }
    public currentRole$: Observable<this['currentRole']> = this.ownClient$.pipe(
        map((ownClient) => this.getCurrentRole(ownClient))
    );
    private getCurrentRole(ownClient: Client | null | undefined) {
        return ownClient ? ownClient.role : 'timeTravel';
    }

    public toggleTimeTravel() {
        if (this.isTimeTraveling) {
            this.timeTravelHelper.stopTimeTravel();
            // Set the state back to the present one
            this.store.dispatch(setExerciseState(this.presentState!));
            this.presentState = undefined;
            this.presentActionsQueue = [];
        } else {
            this.presentState = getStateSnapshot(this.store).exercise;
            this.timeTravelHelper.startTimeTravel();
        }
    }

    /**
     *
     * @param optimistic wether the action should be applied before the server responds (to reduce latency) (this update is guaranteed to be synchronous)
     * @returns the response of the server
     */
    public async proposeAction<A extends ExerciseAction>(
        action: A,
        optimistic = false
    ) {
        if (this.isTimeTraveling) {
            this.messageService.postError({
                title: 'Die Vergangenheit kann nicht bearbeitet werden',
                body: 'Deaktiviere den Zeitreise Modus, um Änderungen vorzunehmen.',
            });
            return { success: false };
        }
        // TODO: throw if `response.success` is false
        return this.presentExerciseHelper.proposeAction(action, optimistic);
    }

    /**
     * These functions are independent from the rest
     *
     */

    public async createExercise() {
        return lastValueFrom(
            this.httpClient.post<ExerciseIds>(`${httpOrigin}/api/exercise`, {})
        );
    }

    public async deleteExercise(trainerId: string) {
        return lastValueFrom(
            this.httpClient.delete<undefined>(
                `${httpOrigin}/api/exercise/${trainerId}`,
                {}
            )
        );
    }

    /**
     * @param exerciseId the trainerId or participantId of the exercise
     * @returns wether the exercise exists
     */
    public async exerciseExists(exerciseId: string) {
        return lastValueFrom(
            this.httpClient.get<null>(
                `${httpOrigin}/api/exercise/${exerciseId}`
            )
        )
            .then(() => true)
            .catch((error) => {
                if (error.status !== 404) {
                    this.messageService.postError({
                        title: 'Interner Fehler',
                        error,
                    });
                }
                return false;
            });
    }
}
