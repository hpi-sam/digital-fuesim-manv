import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type {
    MapImageTemplate,
    Mutable,
    UUID,
} from 'digital-fuesim-manv-shared';
import { cloneDeep } from 'lodash';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectMapImageTemplate } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

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
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal
    ) {}

    ngOnInit(): void {
        this.mapImageTemplate = cloneDeep(
            getSelectMapImageTemplate(this.mapImageTemplateId)(
                getStateSnapshot(this.store)
            )
        );
    }

    public deleteMapImageTemplate(): void {
        this.apiService.proposeAction({
            type: '[MapImageTemplate] Delete mapImageTemplate',
            id: this.mapImageTemplateId,
        });
        this.close();
    }

    public editMapImageTemplate(): void {
        if (!this.mapImageTemplate) {
            console.error("MapImageTemplate wasn't initialized yet");
            return;
        }
        this.apiService.proposeAction({
            type: '[MapImageTemplate] Edit mapImageTemplate',
            id: this.mapImageTemplateId,
            name: this.mapImageTemplate.name,
            imageHeight: this.mapImageTemplate.image.height,
        });
        this.close();
    }

    public close(): void {
        this.activeModal.close();
    }
}
