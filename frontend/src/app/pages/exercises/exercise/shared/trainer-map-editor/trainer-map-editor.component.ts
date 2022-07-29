import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import {
    colorCodeMap,
    TransferPoint,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectMapImagesTemplates,
    selectPatientCategories,
    selectVehicleTemplates,
} from 'src/app/state/exercise/exercise.selectors';
import { DragElementService } from '../core/drag-element.service';
import { TransferLinesService } from '../core/transfer-lines.service';
import { openCreateImageTemplateModal } from '../editor-panel/create-image-template-modal/open-create-image-template-modal';
import { openEditImageTemplateModal } from '../editor-panel/edit-image-template-modal/open-edit-image-template-modal';
import { createPatientCatgories } from '../utility/create-patient-categories';
import { parsePatientData } from '../utility/parse-csv';

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
        public readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly dragElementService: DragElementService,
        public readonly transferLinesService: TransferLinesService,
        private readonly ngbModalService: NgbModal,
        private readonly messageService: MessageService
    ) {}

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

    public async importPatientsCSV(fileList: FileList) {
        try {
            const importString = await fileList.item(0)?.text();
            if (importString === undefined) {
                // The file dialog has been aborted.
                return;
            }
            createPatientCatgories(
                parsePatientData(importString),
                this.apiService
            );
            this.messageService.postMessage(
                {
                    color: 'success',
                    title: 'Patienten importiert',
                    body: 'Sie können die importierten Patienten nun verwenden',
                },
                'toast'
            );
        } catch (error: unknown) {
            this.messageService.postError({
                title: 'Fehler beim Importieren der Übung',
                error,
            });
        }
    }
}
