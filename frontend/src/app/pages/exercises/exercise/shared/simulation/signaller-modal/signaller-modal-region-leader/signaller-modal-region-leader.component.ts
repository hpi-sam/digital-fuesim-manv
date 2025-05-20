import type { OnChanges, OnDestroy } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Personnel } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import {
    combineLatest,
    map,
    takeUntil,
    type Observable,
    Subject,
    distinctUntilChanged,
} from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectBehaviorStatesByType,
    selectPersonnel,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-signaller-modal-region-leader',
    templateUrl: './signaller-modal-region-leader.component.html',
    styleUrls: ['./signaller-modal-region-leader.component.scss'],
})
export class SignallerModalRegionLeaderComponent
    implements OnChanges, OnDestroy
{
    @Input() simulatedRegionId!: UUID;
    @Output() readonly hasLeader = new EventEmitter<boolean>();

    leader$!: Observable<Personnel | null>;
    private readonly destroy$ = new Subject<void>();

    constructor(private readonly store: Store<AppState>) {}

    ngOnChanges() {
        const assignLeaderBehaviorState$ = this.store
            .select(
                createSelectBehaviorStatesByType(
                    this.simulatedRegionId,
                    'assignLeaderBehavior'
                )
            )
            .pipe(map((behaviorStates) => behaviorStates[0] ?? null));

        const personnel$ = this.store.select(selectPersonnel);

        this.leader$ = combineLatest([
            assignLeaderBehaviorState$,
            personnel$,
        ]).pipe(
            map(([behaviorState, personnel]) => {
                if (behaviorState?.leaderId) {
                    return personnel[behaviorState.leaderId] ?? null;
                }
                return null;
            })
        );

        this.leader$
            .pipe(
                map((personnel) => !!personnel),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe((personnel) => this.hasLeader.emit(!!personnel));
    }

    ngOnDestroy() {
        this.destroy$.next();
    }
}
