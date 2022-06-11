import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    Client,
    ExerciseAction,
    ExerciseIds,
    ExerciseState,
    ExerciseTimeline,
    StateExport,
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

    private readonly presentExerciseHelper = new PresentExerciseHelper(
        (exercise) =>
            this.isTimeTraveling
                ? (this.presentState = exercise)
                : this.store.dispatch(setExerciseState(exercise)),
        () => {
            // TODO: this is called synchronously, because at this time isTimeTraveling is not defined, an error occurs.
            // Probably the best solution would be to do refactor all of the time travel and
            try {
                return this.isTimeTraveling
                    ? this.presentState!
                    : getStateSnapshot(this.store).exercise;
            } catch {
                return getStateSnapshot(this.store).exercise;
            }
        },
        (action) => {
            if (!this.isTimeTraveling) {
                this.store.dispatch(applyServerAction(action));
                return;
            }
            this.presentState = reduceExerciseState(this.presentState!, action);
        },
        this.messageService
    );

    public readonly joinExercise = this.presentExerciseHelper.joinExercise.bind(
        this.presentExerciseHelper
    );
    public leaveExercise() {
        this.presentExerciseHelper.leaveExercise();
        this.stopTimeTravel();
    }
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
        async () =>
            lastValueFrom(
                this.httpClient.get<ExerciseTimeline>(
                    `${httpOrigin}/api/exercise/${this.exerciseId}/history`
                )
            ).catch((error) => {
                this.stopTimeTravel();
                this.messageService.postError({
                    title: 'Die Vergangenheit konnte nicht geladen werden',
                    error,
                });
                throw error;
            })
    );

    public readonly jumpToTime = this.timeTravelHelper.jumpToTime.bind(
        this.timeTravelHelper
    );
    public timeConstraints$ = this.timeTravelHelper.timeConstraints$;
    public get timeConstraints() {
        return this.timeTravelHelper.timeConstraints;
    }
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

    public currentRole$: Observable<CurrentRole> = this.ownClient$.pipe(
        // If we wouldn't provide the ownClient from the observable, this could be a race condition
        map((ownClient) => this.getCurrentRole(ownClient))
    );
    public getCurrentRole(
        ownClient: Client | null | undefined = this.ownClientId
            ? getSelectClient(this.ownClientId)(getStateSnapshot(this.store))
            : // clientId is expected to never be the empty string
              (this.ownClientId as null | undefined)
    ) {
        return ownClient ? ownClient.role : 'timeTravel';
    }

    public startTimeTravel() {
        if (this.isTimeTraveling) {
            return;
        }
        this.presentState = getStateSnapshot(this.store).exercise;
        this.timeTravelHelper.startTimeTravel();
    }

    public stopTimeTravel() {
        if (!this.isTimeTraveling) {
            return;
        }
        this.timeTravelHelper.stopTimeTravel();
        // Set the state back to the present one
        this.store.dispatch(setExerciseState(this.presentState!));
        this.presentState = undefined;
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
                body: 'Deaktiviere den Aufnahme Modus, um Änderungen vorzunehmen.',
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

    public async importExercise(exportedState: StateExport) {
        return lastValueFrom(
            this.httpClient.post<ExerciseIds>(
                `${httpOrigin}/api/exercise`,
                exportedState
            )
        );
    }

    public async exerciseHistory() {
        return lastValueFrom(
            this.httpClient.get<ExerciseTimeline>(
                `${httpOrigin}/api/exercise/${this.exerciseId}/history`
            )
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

type CurrentRole = 'participant' | 'timeTravel' | 'trainer';
