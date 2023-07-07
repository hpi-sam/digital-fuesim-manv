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
import { combineLatest, map, tap, type Observable } from 'rxjs';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import {
    selectCurrentTime,
    selectTransferPoints,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'src/app/core/messages/message.service';
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
    submitHotkey = new Hotkey('Enter', false, () => this.startTransfer());

    availableVehicles$!: Observable<SearchableDropdownOption[]>;
    selectedVehicle: SearchableDropdownOption | null = null;

    availableTargets$!: Observable<SearchableDropdownOption[]>;
    selectedTarget: SearchableDropdownOption | null = null;

    loading = false;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService,
        private readonly hotkeysService: HotkeysService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.hotkeyLayer.addHotkey(this.selectVehicleHotkey);
        this.hotkeyLayer.addHotkey(this.selectTargetHotkey);
        this.hotkeyLayer.addHotkey(this.submitHotkey);
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
                    key: vehicle.id,
                    name: vehicle.name,
                }))
            ),
            map((options) => this.sortOptions(options)),
            tap((options) => {
                if (
                    !options.some(
                        (option) => option.key === this.selectedVehicle?.key
                    )
                ) {
                    this.selectedVehicle = null;
                }
            })
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
                    key: transferPoint.id,
                    name: TransferPoint.getFullName(transferPoint),
                }))
            ),
            map((options) => this.sortOptions(options)),
            tap((options) => {
                if (
                    !options.some(
                        (option) => option.key === this.selectedTarget?.key
                    )
                ) {
                    this.selectedTarget = null;
                }
            })
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

        this.exerciseService
            .proposeAction({
                type: '[TransferBehavior] Send Transfer Request Event',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: this.transferBehaviorId,
                vehicleId: this.selectedVehicle!.key,
                destinationType: 'transferPoint',
                destinationId: this.selectedTarget!.key,
                patients: {},
            })
            .then((result) => {
                this.loading = false;

                if (result.success) {
                    this.messageService.postMessage({
                        title: 'Befehl erteilt',
                        body: 'Der Fahrzeug wurde erfolgreich entsendet',
                        color: 'success',
                    });
                } else {
                    this.messageService.postError({
                        title: 'Fehler beim Erteilen des Befehls',
                        body: 'Das Fahrzeug konnte nicht entsendet werden',
                    });
                }
            });

        this.loading = true;
        this.selectedVehicle = null;
        this.selectedTarget = null;
    }

    close() {
        this.detailsModal.close();
    }
}
