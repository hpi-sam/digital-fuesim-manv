import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ExerciseRadiogram, UUID } from 'digital-fuesim-manv-shared';
import {
    isDone,
    publishTimeOf,
    isUnpublished,
    StrictObject,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { BehaviorSubject, map, combineLatest } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { selectOwnClientId } from 'src/app/state/application/selectors/application.selectors';
import { selectRadiograms } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-radiogram-list',
    templateUrl: './radiogram-list.component.html',
    styleUrls: ['./radiogram-list.component.scss'],
})
export class RadiogramListComponent implements OnInit {
    ownClientId: UUID | undefined;
    publishedRadiograms$!: Observable<ExerciseRadiogram[]>;
    visibleRadiograms$!: Observable<ExerciseRadiogram[]>;

    showDone$ = new BehaviorSubject<boolean>(false);

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.ownClientId = selectStateSnapshot(selectOwnClientId, this.store)!;

        this.publishedRadiograms$ = this.store.select(selectRadiograms).pipe(
            map((radiograms) => StrictObject.values(radiograms)),
            map((radiograms) =>
                radiograms.filter((radiogram) => !isUnpublished(radiogram))
            ),
            map((radiograms) => [...radiograms].sort(this.compareFn))
        );

        this.visibleRadiograms$ = combineLatest([
            this.publishedRadiograms$,
            this.showDone$,
        ]).pipe(
            map(([radiograms, showDone]) =>
                showDone
                    ? radiograms
                    : radiograms.filter((radiogram) => !isDone(radiogram))
            )
        );
    }

    compareFn(a: ExerciseRadiogram, b: ExerciseRadiogram): number {
        return publishTimeOf(b) - publishTimeOf(a);
    }

    changeShowDone(value: boolean) {
        this.showDone$.next(value);
    }
}
