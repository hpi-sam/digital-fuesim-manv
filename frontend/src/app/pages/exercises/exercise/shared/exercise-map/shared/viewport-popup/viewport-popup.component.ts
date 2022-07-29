import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Viewport } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectViewport } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-viewport-popup',
    templateUrl: './viewport-popup.component.html',
    styleUrls: ['./viewport-popup.component.scss'],
})
export class ViewportPopupComponent implements OnInit {
    // These properties are only set after OnInit
    public viewportId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public viewport$?: Observable<Viewport>;

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService
    ) {}

    ngOnInit() {
        this.viewport$ = this.store.select(getSelectViewport(this.viewportId));
    }

    public renameViewport(newName: string) {
        this.apiService.proposeAction({
            type: '[Viewport] Rename viewport',
            viewportId: this.viewportId,
            newName,
        });
    }
}
