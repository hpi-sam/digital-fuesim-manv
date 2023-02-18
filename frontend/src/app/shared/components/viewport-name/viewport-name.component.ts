import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { Viewport } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectViewport } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-viewport-name',
    templateUrl: './viewport-name.component.html',
    styleUrls: ['./viewport-name.component.scss'],
})
export class ViewportNameComponent implements OnChanges {
    @Input() viewportId!: UUID;
    constructor(private readonly storeService: StoreService) {}

    public viewport$?: Observable<Viewport>;

    ngOnChanges() {
        this.viewport$ = this.storeService.select$(
            createSelectViewport(this.viewportId)
        );
    }
}
