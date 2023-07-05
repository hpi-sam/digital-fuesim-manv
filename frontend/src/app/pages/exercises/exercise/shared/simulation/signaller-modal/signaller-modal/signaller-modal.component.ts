import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotkeysService } from 'src/app/shared/services/hotkeys.service';
import {
    EOC_ID,
    OVERVIEW_ID,
    SelectSignallerRegionService,
} from '../select-signaller-region.service';

@Component({
    selector: 'app-signaller-modal',
    templateUrl: './signaller-modal.component.html',
    styleUrls: ['./signaller-modal.component.scss'],
})
export class SignallerModalComponent {
    public get eocId() {
        return EOC_ID;
    }
    public get overviewId() {
        return OVERVIEW_ID;
    }

    constructor(
        private readonly activeModal: NgbActiveModal,
        private readonly hotkeys: HotkeysService,
        public readonly selectRegionService: SelectSignallerRegionService
    ) {}

    public close() {
        this.activeModal.close();
    }
}
