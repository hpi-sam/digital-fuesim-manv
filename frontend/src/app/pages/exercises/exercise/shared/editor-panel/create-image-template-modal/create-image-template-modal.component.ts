import type { OnDestroy } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type { MapImageTemplate } from 'digital-fuesim-manv-shared';
import { uuid } from 'digital-fuesim-manv-shared';
import { MessageService } from 'src/app/core/messages/message.service';
import { getImageAspectRatio } from 'src/app/shared/functions/get-image-aspect-ratio';

@Component({
    selector: 'app-create-image-template-modal',
    templateUrl: './create-image-template-modal.component.html',
    styleUrls: ['./create-image-template-modal.component.scss'],
})
export class CreateImageTemplateModalComponent implements OnDestroy {
    @Output() readonly createImageTemplate$ =
        new EventEmitter<MapImageTemplate | null>();

    public readonly imageTemplate = {
        id: uuid(),
        image: {
            url: null as string | null,
            height: 100,
            aspectRatio: 0,
        },
        name: null as string | null,
    };

    constructor(
        public readonly activeModal: NgbActiveModal,
        private readonly messageService: MessageService
    ) {}

    public async createImageTemplate() {
        try {
            const aspectRatio = await getImageAspectRatio(
                this.imageTemplate.image.url!
            );
            this.imageTemplate.image.aspectRatio = aspectRatio;
            this.createImageTemplate$.emit(
                this.imageTemplate as MapImageTemplate
            );
            this.close();
        } catch (error: unknown) {
            this.messageService.postError({
                title: 'Ungültige URL',
                body: 'Bitte überprüfen Sie die Bildadresse.',
                error,
            });
        }
    }

    public close() {
        this.activeModal.close();
    }

    ngOnDestroy() {
        this.createImageTemplate$.next(null);
        this.createImageTemplate$.complete();
    }
}
