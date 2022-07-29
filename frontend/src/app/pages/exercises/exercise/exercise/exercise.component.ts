import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    cloneDeepMutable,
    StateExport,
    StateHistoryCompound,
} from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { saveBlob } from 'src/app/shared/functions/save-blob';
import type { AppState } from 'src/app/state/app.state';
import { selectParticipantId } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import { NotificationService } from '../core/notification.service';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();

    public readonly participantId$ = this.store.select(selectParticipantId);

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService,
        private readonly messageService: MessageService,
        private readonly notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.notificationService.startNotifications();
    }

    public shareExercise(exerciseId: string) {
        const url = `${location.origin}/exercises/${exerciseId}`;
        if (navigator.share) {
            navigator.share({ url }).catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }
                this.messageService.postError({
                    title: 'Fehler beim Teilen der Übung',
                    error: { error, url },
                });
            });
            return;
        }
        navigator.clipboard.writeText(url);

        this.messageService.postMessage({
            title: 'Link wurde in die Zwischenablage kopiert',
            body: 'Sie können ihn nun teilen.',
            color: 'info',
        });
    }

    public leaveTimeTravel() {
        this.apiService.stopTimeTravel();
        this.messageService.postMessage({
            title: 'Zurück in die Zukunft!',
            color: 'info',
        });
    }

    public async exportExerciseWithHistory() {
        const history = await this.apiService.exerciseHistory();
        const currentState = getStateSnapshot(this.store).exercise;
        const blob = new Blob([
            JSON.stringify(
                new StateExport(
                    cloneDeepMutable(currentState),
                    new StateHistoryCompound(
                        history.actionsWrappers.map(
                            (actionWrapper) => actionWrapper.action
                        ),
                        cloneDeepMutable(history.initialState)
                    )
                )
            ),
        ]);
        saveBlob(blob, `exercise-state-${currentState.participantId}.json`);
    }

    public exportExerciseState() {
        const currentState = getStateSnapshot(this.store).exercise;
        const blob = new Blob([
            JSON.stringify(new StateExport(cloneDeepMutable(currentState))),
        ]);
        saveBlob(blob, `exercise-state-${currentState.participantId}.json`);
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.notificationService.stopNotifications();
    }
}
