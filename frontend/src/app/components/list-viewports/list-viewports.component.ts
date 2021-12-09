import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { removeViewport, UUID } from 'digital-fuesim-manv-shared';
import { pairwise, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import { selectViewports } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-list-viewports',
    templateUrl: './list-viewports.component.html',
    styleUrls: ['./list-viewports.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewportsComponent implements OnDestroy {
    private readonly destroy = new Subject<unknown>();

    public readonly viewports$ = this.store.select(selectViewports);
    public readonly numberOfViewports$ = this.store.select(
        (state) => state.exercise.viewports.size
    );

    constructor(private store: Store<AppState>) {
        this.viewports$
            .pipe(pairwise(), takeUntil(this.destroy))
            .subscribe(([a, b]) => {
                // as you can see the values have always another reference
                console.log(a === b);
            });
    }

    public removeViewport(viewportId: UUID) {
        this.store.dispatch(removeViewport({ viewportId }));
    }

    ngOnDestroy() {
        this.destroy.next(null);
    }
}
