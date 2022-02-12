import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    selectParticipantId,
} from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();
    public exerciseId?: string;

    public readonly participantId$ = this.store.select(selectParticipantId);
    public client$ = this.store.select(
        getSelectClient(this.apiService.ownClientId!)
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params
            .pipe(takeUntil(this.destroy))
            .subscribe((params) => {
                this.exerciseId = params['exerciseId'] as string;
            });
    }

    public shareExercise(exerciseId: string) {
        const url = `${location.origin}/exercises/${exerciseId}`;
        if (navigator.share) {
            navigator.share({ url }).catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }
                console.error(error, url);
            });
            return;
        }
        navigator.clipboard.writeText(url);
        // TODO: display a toast #152 informing the user that the url has been copied to the clipboard
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
