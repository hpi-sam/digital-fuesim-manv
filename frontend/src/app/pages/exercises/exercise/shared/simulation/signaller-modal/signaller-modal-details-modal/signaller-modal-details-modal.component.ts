import type {
    OnDestroy,
    OnInit} from '@angular/core';
import {
    Component,
    Input,
    TemplateRef,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type {
    HotkeyLayer} from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';

@Component({
    selector: 'app-signaller-modal-details-modal',
    templateUrl: './signaller-modal-details-modal.component.html',
    styleUrls: ['./signaller-modal-details-modal.component.scss'],
})
export class SignallerModalDetailsModalComponent implements OnInit, OnDestroy {
    @Input() title = '';
    @Input() body!: TemplateRef<any>;

    private hotkeyLayer!: HotkeyLayer;
    private readonly closeHotkey = new Hotkey('Esc', false, () => this.close());

    constructor(
        private readonly activeModal: NgbActiveModal,
        private readonly hotkeysServive: HotkeysService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysServive.createLayer();
        this.hotkeyLayer.addHotkey(this.closeHotkey);
    }

    ngOnDestroy() {
        this.hotkeysServive.removeLayer(this.hotkeyLayer);
    }

    public close() {
        this.activeModal.close();
    }
}
