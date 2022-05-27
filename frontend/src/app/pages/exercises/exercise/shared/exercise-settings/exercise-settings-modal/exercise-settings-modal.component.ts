import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { Mutable, TileMapProperties } from 'digital-fuesim-manv-shared';
import { cloneDeep } from 'lodash';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectBluePatientsFlag,
    selectPretriageFlag,
    selectTileMapProperties,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-exercise-settings-modal',
    templateUrl: './exercise-settings-modal.component.html',
    styleUrls: ['./exercise-settings-modal.component.scss'],
})
export class ExerciseSettingsModalComponent {
    public tileMapProperties: Mutable<TileMapProperties>;

    public readonly tileMapUrlRegex =
        /^(?=.*\{x\})(?=.*\{-?y\})(?=.*\{z\}).*$/u;

    public pretriageFlag$ = this.store.select(selectPretriageFlag);
    public bluePatientsFlag$ = this.store.select(selectBluePatientsFlag);

    constructor(
        public readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {
        this.tileMapProperties = cloneDeep(
            selectTileMapProperties(getStateSnapshot(store))
        );
    }

    public updateTileMapProperties() {
        this.apiService.proposeAction({
            type: '[ExerciseSettings] Set tile map properties',
            tileMapProperties: this.tileMapProperties,
        });
    }

    public setPretriageFlag(flag: boolean) {
        this.apiService.proposeAction({
            type: '[ExerciseSettings] Set Pretriage Flag',
            pretriageEnabled: flag,
        });
    }

    public setBluePatientsFlag(flag: boolean) {
        this.apiService.proposeAction({
            type: '[ExerciseSettings] Set Blue Patients Flag',
            bluePatientsEnabled: flag,
        });
    }

    public close() {
        this.activeModal.close();
    }
}
