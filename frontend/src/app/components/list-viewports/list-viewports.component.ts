import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UUID, Viewport } from 'digital-fuesim-manv-shared';
import { Observable, pairwise, Subject, takeUntil } from 'rxjs';
import { ExerciseState } from 'src/app/store/excercise/excercise.state';
import { StoreModel } from 'src/app/store/store-model';

const numberOfViewportsSelector = (state: StoreModel) =>
    state.exercise.viewports.size;

@Component({
    selector: 'app-list-viewports',
    templateUrl: './list-viewports.component.html',
    styleUrls: ['./list-viewports.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewportsComponent implements OnDestroy {
    private readonly destroy = new Subject<unknown>();

    // Select
    /**
     * Solution 1: decorator style
     */
    @Select(ExerciseState.viewports) public readonly viewports1$!: SelectType<
        // It is important that the argument in the `@Select` decorator is the same as in the `SelectType` function!
        typeof ExerciseState.viewports
    >;
    @Select(numberOfViewportsSelector)
    public readonly numberOfViewports1$!: SelectType<
        typeof numberOfViewportsSelector
    >;

    // or

    /**
     * Solution 2: property style
     */
    public readonly viewports$!: Observable<Map<UUID, Viewport>>;
    public readonly numberOfViewports$!: Observable<number>;

    constructor(private store: Store) {
        this.viewports$ = this.store.select(ExerciseState.viewports);
        this.numberOfViewports$ = this.store.select((state: StoreModel) => {
            return state.exercise.viewports.size;
        });
        this.viewports$
            .pipe(pairwise(), takeUntil(this.destroy))
            .subscribe(([a, b]) => {
                // as you can see the values have always another reference
                console.log(a === b);
            });
    }

    ngOnDestroy() {
        this.destroy.next(null);
    }
}

/**
 * The `@Select` decorator cannot infer the type of the selector (https://github.com/ngxs/store/issues/1719 , https://github.com/ngxs/store/issues/1765).
 * Therefore we have to do it ourselves via this helper type.
 */
type SelectType<T extends (...args: any[]) => any> = Observable<ReturnType<T>>;

// TODO: Check wether [StateTokens](https://www.ngxs.io/advanced/token) solve this problem
