import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { TransferPoint, Viewport } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectMapImagesTemplates,
    selectPatientTemplates,
    selectVehicleTemplates,
} from 'src/app/state/exercise/exercise.selectors';
import { DragElementService } from '../core/drag-element.service';
import { TransferLinesService } from '../core/transfer-lines.service';
import { openCreateImageTemplateModal } from '../editor-panel/create-image-template-modal/open-create-image-template-modal';
import { openEditImageTemplateModal } from '../editor-panel/edit-image-template-modal/open-edit-image-template-modal';

@Component({
    selector: 'app-trainer-map-editor',
    templateUrl: './trainer-map-editor.component.html',
    styleUrls: ['./trainer-map-editor.component.scss'],
})
/**
 * A wrapper around the map that provides trainers with more options and tools.
 */
export class TrainerMapEditorComponent {
    @Input() exerciseId!: string;

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    public readonly patientTemplates$ = this.store.select(
        selectPatientTemplates
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
        private readonly ngbModalService: NgbModal
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
}
