import type { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import type { MapImageTemplate } from 'digital-fuesim-manv-shared';
import { firstValueFrom } from 'rxjs';
import { CreateImageTemplateModalComponent } from './create-image-template-modal.component';

/**
 *
 * @returns a Promise that resolves with the new MapImageTemplate or undefined if the user canceled the dialog.
 */
export async function createImageTemplate(
    ngbModalService: NgbModal
): Promise<MapImageTemplate | null> {
    const modalRef = ngbModalService.open(CreateImageTemplateModalComponent);
    const componentInstance =
        modalRef.componentInstance as CreateImageTemplateModalComponent;
    return firstValueFrom(componentInstance.createImageTemplate$);
}
