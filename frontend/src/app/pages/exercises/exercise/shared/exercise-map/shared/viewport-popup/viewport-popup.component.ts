import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Viewport } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectViewport } from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';

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
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnInit() {
        this.viewport$ = this.store.select(
            createSelectViewport(this.viewportId)
        );
    }

    public renameViewport(newName: string) {
        this.exerciseService.proposeAction({
            type: '[Viewport] Rename viewport',
            viewportId: this.viewportId,
            newName,
        });
    }
}
