import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { ManagePatientTransportToHospitalBehaviorState } from 'digital-fuesim-manv-shared';
import { StrictObject, UUID } from 'digital-fuesim-manv-shared';
import { difference } from 'lodash-es';
import { combineLatest, map, type Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectBehaviorState,
    selectSimulatedRegions,
} from 'src/app/state/application/selectors/exercise.selectors';
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-transport-trays-editor',
    templateUrl: './signaller-modal-transport-trays-editor.component.html',
    styleUrls: ['./signaller-modal-transport-trays-editor.component.scss'],
})
export class SignallerModalTransportTraysEditorComponent
    implements OnInit, OnChanges, OnDestroy
{
    @Input() simulatedRegionId!: UUID;
    @Input() transportBehaviorId!: UUID;

    @ViewChild('addRegionPopover') addRegionPopover!: NgbPopover;
    @ViewChild('removeRegionPopover') removeRegionPopover!: NgbPopover;

    manageTransportBehavior$!: Observable<ManagePatientTransportToHospitalBehaviorState>;
    managedRegions$!: Observable<SearchableDropdownOption[]>;
    unmanagedRegions$!: Observable<SearchableDropdownOption[]>;

    private hotkeyLayer!: HotkeyLayer;
    addRegionHotkey = new Hotkey('+', false, () => {
        this.addRegionPopover.open();
    });
    removeRegionHotkey = new Hotkey('-', false, () => {
        this.removeRegionPopover.open();
    });
    finishHotkey = new Hotkey('Enter', false, () => {
        this.close();
    });

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly hotkeysService: HotkeysService,
        private readonly detailsModal: SignallerModalDetailsService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.hotkeyLayer.addHotkey(this.addRegionHotkey);
        this.hotkeyLayer.addHotkey(this.removeRegionHotkey);
    }

    ngOnChanges() {
        this.manageTransportBehavior$ = this.store.select(
            createSelectBehaviorState(
                this.simulatedRegionId,
                this.transportBehaviorId
            )
        );

        const otherSimulatedRegions$ = this.store
            .select(selectSimulatedRegions)
            .pipe(
                map((regions) =>
                    StrictObject.fromEntries(
                        StrictObject.entries(regions).filter(
                            ([id]) => id !== this.simulatedRegionId
                        )
                    )
                )
            );

        this.managedRegions$ = combineLatest([
            this.manageTransportBehavior$,
            otherSimulatedRegions$,
        ]).pipe(
            map(([behavior, regions]) =>
                Object.keys(behavior.simulatedRegionsToManage).map((id) => ({
                    key: id,
                    name: regions[id]?.name ?? '',
                }))
            )
        );
        this.unmanagedRegions$ = combineLatest([
            this.managedRegions$,
            otherSimulatedRegions$,
        ]).pipe(
            map(([managedRegions, allRegions]) =>
                difference(
                    Object.keys(allRegions),
                    managedRegions.map((managedRegion) => managedRegion.key)
                ).map((id) => ({
                    key: id,
                    name: allRegions[id]?.name ?? '',
                }))
            )
        );
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
    }

    public addManagedRegion(selectedRegion: SearchableDropdownOption) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Add Simulated Region To Manage For Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transportBehaviorId,
            managedSimulatedRegionId: selectedRegion.key,
        });
    }

    public removeManagedRegion(selectedRegion: SearchableDropdownOption) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Remove Simulated Region To Manage From Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transportBehaviorId,
            managedSimulatedRegionId: selectedRegion.key,
        });
    }

    close() {
        this.detailsModal.close();
    }
}
