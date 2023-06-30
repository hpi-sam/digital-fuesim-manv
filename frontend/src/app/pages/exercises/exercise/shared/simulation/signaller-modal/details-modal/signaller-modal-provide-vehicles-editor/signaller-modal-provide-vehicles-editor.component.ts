import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    TransferPoint,
    UUID,
    isInSpecificSimulatedRegion,
    isUnoccupiedImmutable,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { combineLatest, map, type Observable } from 'rxjs';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import {
    selectCurrentTime,
    selectTransferPoints,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-provide-vehicles-editor',
    templateUrl: './signaller-modal-provide-vehicles-editor.component.html',
    styleUrls: ['./signaller-modal-provide-vehicles-editor.component.scss'],
})
export class SignallerModalProvideVehiclesEditorComponent
    implements OnInit, OnChanges, OnDestroy
{
    @Input() simulatedRegionId!: UUID;
    @Input() transferBehaviorId!: UUID;

    @ViewChild('selectVehiclePopover')
    selectVehiclePopover!: NgbPopover;
    @ViewChild('selectTargetPopover')
    selectTargetPopover!: NgbPopover;

    public get canSend() {
        return this.selectedVehicle !== null && this.selectedTarget !== null;
    }

    private hotkeyLayer!: HotkeyLayer;
    selectVehicleHotkey = new Hotkey('F', false, () =>
        this.selectVehiclePopover.open()
    );
    selectTargetHotkey = new Hotkey('Z', false, () =>
        this.selectTargetPopover.open()
    );

    availableVehicles$!: Observable<SearchableDropdownOption[]>;
    selectedVehicle: SearchableDropdownOption | null = null;

    availableTargets$!: Observable<SearchableDropdownOption[]>;
    selectedTarget: SearchableDropdownOption | null = null;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService,
        private readonly hotkeysService: HotkeysService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.hotkeyLayer.addHotkey(this.selectVehicleHotkey);
        this.hotkeyLayer.addHotkey(this.selectTargetHotkey);
    }

    ngOnChanges() {
        const vehicles$ = this.store.select(selectVehicles);
        const currentTime$ = this.store.select(selectCurrentTime);

        this.availableVehicles$ = combineLatest([vehicles$, currentTime$]).pipe(
            map(([vehicles, currentTime]) =>
                Object.values(vehicles).filter(
                    (vehicle) =>
                        isInSpecificSimulatedRegion(
                            vehicle,
                            this.simulatedRegionId
                        ) && isUnoccupiedImmutable(vehicle, currentTime)
                )
            ),
            map((vehicles) =>
                vehicles.map((vehicle) => ({
                    identifier: vehicle.id,
                    name: vehicle.name,
                }))
            ),
            map((options) => this.sortOptions(options))
        );

        this.availableTargets$ = this.store.select(selectTransferPoints).pipe(
            map((transferPoints) =>
                Object.values(transferPoints).filter(
                    (transferPoint) =>
                        !isInSpecificSimulatedRegion(
                            transferPoint,
                            this.simulatedRegionId
                        )
                )
            ),
            map((transferPoints) =>
                transferPoints.map((transferPoint) => ({
                    identifier: transferPoint.id,
                    name: TransferPoint.getFullName(transferPoint),
                }))
            ),
            map((options) => this.sortOptions(options))
        );
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
    }

    private sortOptions(options: SearchableDropdownOption[]) {
        return options.sort((a, b) => a.name.localeCompare(b.name));
    }

    selectVehicle(selectedVehicle: SearchableDropdownOption) {
        this.selectedVehicle = selectedVehicle;
    }

    selectTarget(selectedTarget: SearchableDropdownOption) {
        this.selectedTarget = selectedTarget;
    }

    startTransfer() {
        if (!this.canSend) return;

        this.exerciseService.proposeAction({
            type: '[TransferBehavior] Send Transfer Request Event',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transferBehaviorId,
            vehicleId: this.selectedVehicle!.identifier,
            destinationType: 'transferPoint',
            destinationId: this.selectedTarget!.identifier,
            patients: {},
        });

        this.selectedVehicle = null;
        this.selectedTarget = null;
    }

    close() {
        this.detailsModal.close();
    }
}
