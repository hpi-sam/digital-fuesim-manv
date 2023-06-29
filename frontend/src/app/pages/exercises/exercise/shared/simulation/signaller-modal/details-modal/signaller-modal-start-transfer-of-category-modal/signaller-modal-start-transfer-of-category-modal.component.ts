import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    PatientStatus,
    PatientStatusForTransport,
} from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import { HotkeysService } from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectBehaviorStatesByType } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-start-transfer-of-category-modal',
    templateUrl:
        './signaller-modal-start-transfer-of-category-modal.component.html',
    styleUrls: [
        './signaller-modal-start-transfer-of-category-modal.component.scss',
    ],
})
export class SignallerModalStartTransferOfCategoryModalComponent
    implements OnInit, OnDestroy
{
    @Input() simulatedRegionId!: UUID;

    private hotkeyLayer!: HotkeyLayer;
    private readonly destroy$ = new Subject<void>();

    transportStarted = false;
    maximumStatus: PatientStatusForTransport = 'red';

    allowedStatuses = ['red', 'yellow', 'green'] as const;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly hotkeysService: HotkeysService,
        private readonly detailsModal: SignallerModalDetailsService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();

        const transportBehaviorState = this.getTransportBehaviorState();

        this.transportStarted =
            transportBehaviorState?.transportStarted ?? false;
        this.maximumStatus =
            transportBehaviorState?.maximumCategoryToTransport ?? 'red';
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
        this.destroy$.next();
    }

    getTransportBehaviorState() {
        return selectStateSnapshot(
            createSelectBehaviorStatesByType(
                this.simulatedRegionId,
                'managePatientTransportToHospitalBehavior'
            ),
            this.store
        )[0];
    }

    public updateMaximumStatus(newStatus: PatientStatus) {
        this.maximumStatus = newStatus as PatientStatusForTransport;
    }

    public submit() {
        const transportBehaviorState = this.getTransportBehaviorState();

        if (!transportBehaviorState) {
            this.close();
            return;
        }

        if (
            this.maximumStatus !==
            transportBehaviorState.maximumCategoryToTransport
        ) {
            this.exerciseService.proposeAction({
                type: '[ManagePatientsTransportToHospitalBehavior] Update Maximum Category To Transport',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: transportBehaviorState.id,
                maximumCategoryToTransport: this.maximumStatus,
            });
        }

        if (this.transportStarted !== transportBehaviorState.transportStarted) {
            this.exerciseService.proposeAction({
                type: this.transportStarted
                    ? '[ManagePatientsTransportToHospitalBehavior] Start Transport'
                    : '[ManagePatientsTransportToHospitalBehavior] Stop Transport',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: transportBehaviorState.id,
            });
        }

        this.close();
    }

    close() {
        this.detailsModal.close();
    }
}
