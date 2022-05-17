import type { OnDestroy } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type { MapImageTemplate } from 'digital-fuesim-manv-shared';
import { uuid } from 'digital-fuesim-manv-shared';
import type {
    ChangedImageTemplateValues,
    EditableImageTemplateValues,
} from '../image-template-form/image-template-form.component';

@Component({
    selector: 'app-create-image-template-modal',
    templateUrl: './create-image-template-modal.component.html',
    styleUrls: ['./create-image-template-modal.component.scss'],
})
export class CreateImageTemplateModalComponent implements OnDestroy {
    @Output() readonly createImageTemplate$ =
        new EventEmitter<MapImageTemplate | null>();

    public readonly editableImageTemplateValues: EditableImageTemplateValues = {
        url: null,
        height: 100,
        name: null,
    };

    constructor(public readonly activeModal: NgbActiveModal) {}

    public async createImageTemplate({
        url,
        height,
        name,
        aspectRatio,
    }: ChangedImageTemplateValues) {
        this.createImageTemplate$.emit({
            id: uuid(),
            image: {
                url,
                height,
                aspectRatio,
            },
            name,
        });
        this.close();
    }

    public close() {
        this.activeModal.close();
    }

    ngOnDestroy() {
        this.createImageTemplate$.next(null);
        this.createImageTemplate$.complete();
    }
}
