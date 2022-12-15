import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Viewport } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectViewport } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-viewport-name',
    templateUrl: './viewport-name.component.html',
    styleUrls: ['./viewport-name.component.scss'],
})
export class ViewportNameComponent implements OnChanges {
    @Input() viewportId!: UUID;
    constructor(private readonly store: Store<AppState>) {}

    public viewport$?: Observable<Viewport>;

    ngOnChanges() {
        this.viewport$ = this.store.select(
            createSelectViewport(this.viewportId)
        );
    }
}
