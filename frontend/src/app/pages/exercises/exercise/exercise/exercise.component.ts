import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import {
    cloneDeepMutable,
    StateExport,
    StateHistoryCompound,
} from 'digital-fuesim-manv-shared';
import Package from 'package.json';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { ApplicationService } from 'src/app/core/application.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { StoreService } from 'src/app/core/store.service';
import { saveBlob } from 'src/app/shared/functions/save-blob';
import {
    selectExerciseId,
    selectExerciseStateMode,
    selectTimeConstraints,
} from 'src/app/state/application/selectors/application.selectors';
import {
    selectExerciseState,
    selectParticipantId,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectOwnClient } from 'src/app/state/application/selectors/shared.selectors';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnDestroy {
    private readonly destroy = new Subject<void>();

    public readonly exerciseStateMode$ = this.storeService.select$(
        selectExerciseStateMode
    );
    public readonly participantId$ =
        this.storeService.select$(selectParticipantId);
    public readonly timeConstraints$ = this.storeService.select$(
        selectTimeConstraints
    );
    public readonly ownClient$ = this.storeService.select$(selectOwnClient);

    readonly version: string = Package.version;

    constructor(
        private readonly storeService: StoreService,
        private readonly apiService: ApiService,
        private readonly applicationService: ApplicationService,
        private readonly messageService: MessageService
    ) {}

    public shareExercise(type: 'participantId' | 'trainerId') {
        const id = this.storeService.select(
            type === 'participantId' ? selectParticipantId : selectExerciseId
        );
        const url = `${location.origin}/exercises/${id}`;
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
        this.applicationService.rejoinExercise();
        this.messageService.postMessage({
            title: 'Zurück in die Zukunft!',
            color: 'info',
        });
    }

    public async exportExerciseWithHistory() {
        const history = await this.apiService.exerciseHistory();
        const currentState = this.storeService.select(selectExerciseState);
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
        const currentState = this.storeService.select(selectExerciseState);
        const blob = new Blob([
            JSON.stringify(new StateExport(cloneDeepMutable(currentState))),
        ]);
        saveBlob(blob, `exercise-state-${currentState.participantId}.json`);
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
