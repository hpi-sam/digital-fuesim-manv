import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { cloneDeepMutable } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectConfiguration,
    selectTileMapProperties,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-exercise-settings-modal',
    templateUrl: './exercise-settings-modal.component.html',
    styleUrls: ['./exercise-settings-modal.component.scss'],
})
export class ExerciseSettingsModalComponent {
    public tileMapProperties = cloneDeepMutable(
        selectStateSnapshot(selectTileMapProperties, this.store)
    );

    public readonly tileMapUrlRegex =
        /^(?=.*\{x\})(?=.*\{-?y\})(?=.*\{z\}).*$/u;

    public configuration$ = this.store.select(selectConfiguration);

    constructor(
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {}

    public updateTileMapProperties() {
        this.apiService.proposeAction({
            type: '[Configuration] Set tileMapProperties',
            tileMapProperties: this.tileMapProperties,
        });
    }

    public setPretriageFlag(pretriageEnabled: boolean) {
        this.apiService.proposeAction({
            type: '[Configuration] Set pretriageEnabled',
            pretriageEnabled,
        });
    }

    public setBluePatientsFlag(bluePatientsEnabled: boolean) {
        this.apiService.proposeAction({
            type: '[Configuration] Set bluePatientsEnabled',
            bluePatientsEnabled,
        });
    }

    public close() {
        this.activeModal.close();
    }
}
