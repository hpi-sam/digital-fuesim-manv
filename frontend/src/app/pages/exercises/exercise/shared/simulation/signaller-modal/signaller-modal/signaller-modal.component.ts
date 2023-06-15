import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotkeysService } from 'src/app/shared/services/hotkeys.service';
import { SelectSignallerRegionService } from '../select-signaller-region.service';

@Component({
    selector: 'app-signaller-modal',
    templateUrl: './signaller-modal.component.html',
    styleUrls: ['./signaller-modal.component.scss'],
})
export class SignallerModalComponent {
    constructor(
        private readonly activeModal: NgbActiveModal,
        private readonly hotkeys: HotkeysService,
        public readonly selectRegionService: SelectSignallerRegionService
    ) {}

    public close() {
        this.activeModal.close();
    }
}
