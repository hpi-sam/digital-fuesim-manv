import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import { selectParticipantId } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnDestroy {
    private readonly destroy = new Subject<void>();

    public readonly exerciseId = this.apiService.exerciseId;
    public readonly participantId$ = this.store.select(selectParticipantId);

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

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

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
