import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID, VehicleTemplate } from 'digital-fuesim-manv-shared';
import {
    colorCodeMap,
    TransferPoint,
    Viewport,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import type { AppState } from 'src/app/state/app.state';
import {
    selectMapImagesTemplates,
    selectPatientCategories,
    selectVehicleTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';
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
        private readonly ngbModalService: NgbModal
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
}
