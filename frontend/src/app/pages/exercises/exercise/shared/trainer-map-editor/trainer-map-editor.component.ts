import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { plainToInstance } from 'class-transformer';
import type { UUID, VehicleTemplate } from 'digital-fuesim-manv-shared';
import {
    colorCodeMap,
    SimulatedRegion,
    Viewport,
    TransferPoint,
    PartialExport,
    migratePartialExport,
    validateExerciseExport,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectVehicleTemplates,
    selectPatientCategories,
    selectMapImagesTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';
import { DragElementService } from '../core/drag-element.service';
import { TransferLinesService } from '../core/transfer-lines.service';
import { openCreateImageTemplateModal } from '../editor-panel/create-image-template-modal/open-create-image-template-modal';
import { openEditImageTemplateModal } from '../editor-panel/edit-image-template-modal/open-edit-image-template-modal';
import { openPartialImportOverwriteModal } from '../partial-import/open-partial-import-overwrite-modal';

@Component({
    selector: 'app-trainer-map-editor',
    templateUrl: './trainer-map-editor.component.html',
    styleUrls: ['./trainer-map-editor.component.scss'],
})
/**
 * A wrapper around the map that provides trainers with more options and tools.
 */
export class TrainerMapEditorComponent {
    public currentCategory: keyof typeof colorCodeMap = 'X';
    public readonly colorCodeMap = colorCodeMap;
    public readonly categories = ['X', 'Y', 'Z'] as const;

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    public readonly patientCategories$ = this.store.select(
        selectPatientCategories
    );

    public readonly mapImageTemplates$ = this.store.select(
        selectMapImagesTemplates
    );

    public changeDisplayTransferLines(newValue: boolean) {
        this.transferLinesService.displayTransferLines = newValue;
    }

    constructor(
        private readonly store: Store<AppState>,
        public readonly dragElementService: DragElementService,
        public readonly transferLinesService: TransferLinesService,
        private readonly ngbModalService: NgbModal,
        private readonly messageService: MessageService,
        private readonly exerciseService: ExerciseService
    ) {}

    public readonly simulatedRegionTemplate = {
        image: SimulatedRegion.image,
    };

    public readonly viewportTemplate = {
        image: Viewport.image,
    };

    public readonly transferPointTemplate = {
        image: TransferPoint.image,
    };

    public addImageTemplate() {
        openCreateImageTemplateModal(this.ngbModalService);
    }

    public editMapImageTemplate(mapImageTemplateId: UUID) {
        openEditImageTemplateModal(this.ngbModalService, mapImageTemplateId);
    }

    public setCurrentCategory(category: keyof typeof colorCodeMap) {
        this.currentCategory = category;
    }
    public async vehicleOnMouseDown(
        event: MouseEvent,
        vehicleTemplate: VehicleTemplate
    ) {
        this.dragElementService.onMouseDown(event, {
            type: 'vehicle',
            template: vehicleTemplate,
        });
    }

    public importingTemplates = false;
    public async importPartialExport(fileList: FileList) {
        try {
            this.importingTemplates = true;
            const importedText = await fileList.item(0)?.text();
            if (importedText === undefined) {
                // The file dialog has been aborted.
                return;
            }
            const importedPlainObject = JSON.parse(
                importedText
            ) as PartialExport;
            const migratedPartialExport =
                migratePartialExport(importedPlainObject);
            const validation = validateExerciseExport(
                plainToInstance(PartialExport, migratedPartialExport)
            );
            if (validation.length > 0) {
                throw Error(
                    `PartialExport is invalid:\n${validation.join('\n')}`
                );
            }
            openPartialImportOverwriteModal(
                this.ngbModalService,
                migratedPartialExport
            );
        } finally {
            this.importingTemplates = false;
        }
    }
}
