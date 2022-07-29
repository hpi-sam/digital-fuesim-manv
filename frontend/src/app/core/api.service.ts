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
import { freeze } from 'immer';
import type { Observable } from 'rxjs';
import { BehaviorSubject, lastValueFrom, map, of, switchMap } from 'rxjs';
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
import type { TimeConstraints } from './time-travel-helper';
import { TimeTravelHelper } from './time-travel-helper';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    public get isTimeTraveling() {
        return this.timeTravelHelper !== undefined;
    }
    public readonly isTimeTraveling$ = new BehaviorSubject(
        this.isTimeTraveling
    );
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
        () =>
            this.isTimeTraveling
                ? this.presentState!
                : getStateSnapshot(this.store).exercise,
        (action) =>
            this.isTimeTraveling
                ? (this.presentState = reduceExerciseState(
                      this.presentState!,
                      action
                  ))
                : this.store.dispatch(applyServerAction(action)),
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

    private timeTravelHelper?: TimeTravelHelper;

    public jumpToTime(exerciseTime: number) {
        if (!this.timeTravelHelper) {
            this.messageService.postError({
                title: 'Zeitreise ist nicht aktiviert.',
            });
            return;
        }
        this.timeTravelHelper.jumpToTime(exerciseTime);
    }

    public timeConstraints$: Observable<TimeConstraints | undefined> =
        this.isTimeTraveling$.pipe(
            switchMap(
                () => this.timeTravelHelper?.timeConstraints$ ?? of(undefined)
            )
        );
    public get timeConstraints() {
        return this.timeTravelHelper?.timeConstraints;
    }

    // TODO: It is suboptimal to differentiate between null and undefined.
    // But because this distinction is only used in this class and better exposed via
    // isTimeTraveling and getCurrentRole, this is ok for now.
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
    public readonly ownClient$ = this.isTimeTraveling$.pipe(
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
    ): CurrentRole {
        return ownClient === null
            ? 'timeTravel'
            : ownClient === undefined
            ? 'notJoined'
            : ownClient.role;
    }

    private activatingTimeTravel = false;
    public async startTimeTravel() {
        this.activatingTimeTravel = true;
        const exerciseTimeLine = await lastValueFrom(
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
        });
        // Freeze to prevent accidental modification
        freeze(exerciseTimeLine, true);
        if (!this.activatingTimeTravel) {
            // The timeTravel has been stopped during the retrieval of the timeline
            return;
        }
        this.activatingTimeTravel = false;
        this.presentState = getStateSnapshot(this.store).exercise;
        this.timeTravelHelper = new TimeTravelHelper(
            this.presentState,
            exerciseTimeLine,
            (state) => this.store.dispatch(setExerciseState(state))
        );
        this.isTimeTraveling$.next(this.isTimeTraveling);
    }

    public stopTimeTravel() {
        this.activatingTimeTravel = false;
        this.timeTravelHelper = undefined;
        this.isTimeTraveling$.next(this.isTimeTraveling);
        // Set the state back to the present one
        this.store.dispatch(setExerciseState(this.presentState!));
        this.presentState = undefined;
    }

    /**
     *
     * @param optimistic wether the action should be applied before the server responds (to reduce latency) (this update is guaranteed to be synchronous)
     * @returns the response of the server
     */
    public async proposeAction(action: ExerciseAction, optimistic = false) {
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
        ).then((value) => freeze(value, true));
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

type CurrentRole = 'notJoined' | 'participant' | 'timeTravel' | 'trainer';
