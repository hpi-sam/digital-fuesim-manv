import { Component, EventEmitter, Input, Output } from '@angular/core';
import type {
    MapImageTemplate,
    Mutable,
    UUID,
} from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-image-template-form',
    templateUrl: './image-template-form.component.html',
    styleUrls: ['./image-template-form.component.scss'],
})
export class ImageTemplateFormComponent {
    /**
     * The image template to edit.
     * It could be mutated by this component.
     */
    @Input() imageTemplate!: EditableImageTemplate;
    @Input() btnText!: string;

    @Output() readonly submitImageTemplate = new EventEmitter<
        Mutable<MapImageTemplate>
    >();
}

export interface EditableImageTemplate {
    id: UUID;
    image: {
        url: string | null;
        height: number;
        aspectRatio: number;
    };
    name: string | null;
}
