import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectClient } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {
    private readonly destroy = new Subject<void>();
    public exerciseId?: string;

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

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
