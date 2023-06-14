import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';

@Component({
    selector: 'app-signaller-modal',
    templateUrl: './signaller-modal.component.html',
    styleUrls: ['./signaller-modal.component.scss'],
})
export class SignallerModalComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private baseLayer!: HotkeyLayer;
    private additionalLayer: HotkeyLayer | null = null;

    @Input()
    currentSimulatedRegionId!: UUID;

    constructor(
        private readonly activeModal: NgbActiveModal,
        private readonly hotkeys: HotkeysService
    ) {}

    ngOnInit() {
        this.baseLayer = this.hotkeys.createLayer();
        this.baseLayer.addHotkey(
            new Hotkey('f1', false, () => {
                console.log('Base F1');
            })
        );
        this.baseLayer.addHotkey(
            new Hotkey('f2', false, () => {
                console.log('Base F2');
            })
        );
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    public close() {
        this.activeModal.close();
    }

    public openLayer() {
        if (!this.additionalLayer) {
            this.additionalLayer = this.hotkeys.createLayer(true);
            this.additionalLayer.addHotkey(
                new Hotkey('f1', false, () => console.log('Additional F1'))
            );
        }
    }

    public closeLayer() {
        if (this.additionalLayer) {
            this.hotkeys.removeLayer(this.additionalLayer);
            this.additionalLayer = null;
        }
    }
}
