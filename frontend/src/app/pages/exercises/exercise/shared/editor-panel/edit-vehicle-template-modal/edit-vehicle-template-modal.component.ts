import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type {
    UUID,
    Mutable,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { cloneDeepMutable } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectVehicleTemplate } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { ChangedVehicleTemplateValues } from '../vehicle-template-form/vehicle-template-form.component';
import { ConfirmationModalService } from 'src/app/core/confirmation-modal/confirmation-modal.service';

@Component({
    selector: 'app-edit-vehicle-template-modal',
    templateUrl: './edit-vehicle-template-modal.component.html',
    styleUrls: ['./edit-vehicle-template-modal.component.scss'],
    standalone: false,
})
export class EditVehicleTemplateModalComponent implements OnInit {
    // This is set after the modal creation and therefore accessible in ngOnInit
    public vehicleTemplateId!: UUID;

    public vehicleTemplate?: Mutable<VehicleTemplate>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly confirmationModalService: ConfirmationModalService
    ) {}

    ngOnInit(): void {
        this.vehicleTemplate = cloneDeepMutable(
            selectStateSnapshot(
                createSelectVehicleTemplate(this.vehicleTemplateId),
                this.store
            )
        );
    }

    public async deleteVehicleTemplate(): Promise<void> {
        const confirmDelete = await this.confirmationModalService.confirm({
            title: 'Fahrzeug-Vorlage löschen',
            description: `Möchten Sie die Fahrzeug-Vorlage "${this.vehicleTemplate?.vehicleType}" wirklich löschen? Diese Vorlage wird auch aus allen Alarmgruppen gelöscht werden. Bereit auf der Karte existierende Fahrzeuge sind davon nicht betroffen.`,
        });
        if (!confirmDelete) {
            return;
        }
        this.exerciseService
            .proposeAction({
                type: '[VehicleTemplate] Delete vehicleTemplate',
                id: this.vehicleTemplateId,
            })
            .then((response) => {
                if (response.success) {
                    console.log(
                        'after deleting',
                        JSON.stringify(
                            selectStateSnapshot(
                                (state) => state.application.exerciseState,
                                this.store
                            )
                        )
                    );
                    this.close();
                }
            });
    }

    public editVehicleTemplate({
        url,
        height,
        name,
        aspectRatio,
        patientCapacity,
        type,
        materialTypes,
        personnelTypes,
    }: ChangedVehicleTemplateValues): void {
        if (!this.vehicleTemplate) {
            console.error("VehicleTemplate wasn't initialized yet");
            return;
        }
        this.exerciseService
            .proposeAction({
                type: '[VehicleTemplate] Edit vehicleTemplate',
                id: this.vehicleTemplateId,
                name,
                image: {
                    url,
                    height,
                    aspectRatio,
                },
                materials: materialTypes,
                patientCapacity,
                personnelTypes: personnelTypes,
                vehicleType: type,
            })
            .then((response) => {
                if (response.success) {
                    this.close();
                }
            });
    }

    public close(): void {
        this.activeModal.close();
    }
}
