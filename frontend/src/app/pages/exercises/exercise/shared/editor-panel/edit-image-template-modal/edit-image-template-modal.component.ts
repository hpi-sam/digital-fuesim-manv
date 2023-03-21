import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type {
    MapImageTemplate,
    Mutable,
    UUID,
} from 'digital-fuesim-manv-shared';
import { cloneDeep } from 'lodash-es';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import { createSelectMapImageTemplate } from 'src/app/state/application/selectors/exercise.selectors';
import type { ChangedImageTemplateValues } from '../image-template-form/image-template-form.component';

@Component({
    selector: 'app-edit-image-template-modal',
    templateUrl: './edit-image-template-modal.component.html',
    styleUrls: ['./edit-image-template-modal.component.scss'],
})
export class EditImageTemplateModalComponent implements OnInit {
    // This is set after the modal creation and therefore accessible in ngOnInit
    public mapImageTemplateId!: UUID;

    public mapImageTemplate?: Mutable<MapImageTemplate>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly storeService: StoreService,
        public readonly activeModal: NgbActiveModal
    ) {}

    ngOnInit(): void {
        this.mapImageTemplate = cloneDeep(
            this.storeService.select(
                createSelectMapImageTemplate(this.mapImageTemplateId)
            )
        );
    }

    public deleteMapImageTemplate(): void {
        this.exerciseService
            .proposeAction({
                type: '[MapImageTemplate] Delete mapImageTemplate',
                id: this.mapImageTemplateId,
            })
            .then((response) => {
                if (response.success) {
                    this.close();
                }
            });
    }

    public editMapImageTemplate({
        url,
        height,
        name,
        aspectRatio,
    }: ChangedImageTemplateValues): void {
        if (!this.mapImageTemplate) {
            console.error("MapImageTemplate wasn't initialized yet");
            return;
        }
        this.exerciseService
            .proposeAction({
                type: '[MapImageTemplate] Edit mapImageTemplate',
                id: this.mapImageTemplateId,
                name,
                image: {
                    url,
                    height,
                    aspectRatio,
                },
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
