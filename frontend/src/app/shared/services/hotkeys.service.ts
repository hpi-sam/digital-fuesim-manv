import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { uuid } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
// import * as x from '@rwh/keystrokes';

class Hotkey {
    public readonly enabled = new Subject<boolean>();

    constructor(
        public readonly keys: string,
        public readonly isCombo: boolean,
        // public readonly element: HTMLElement,
        public readonly callback: () => void
    ) {}

    public enable() {
        this.enabled.next(true);
    }

    public disable() {
        this.enabled.next(false);
    }
}

class HotkeyLayer {
    public readonly id = uuid();
    public readonly hotkeys: Hotkey[] = [];

    constructor(private readonly service: HotkeysService) {}

    public addHotkey() {
        // Make sure people don't add directly to the array!
        this.service.recomputeHandlers();
    }
}

@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    private readonly layers: HotkeyLayer[] = [];
    constructor() {}

    public createLayer() {
        const layer = new HotkeyLayer(this);
        this.layers.push(layer);

        return layer;
    }

    public removeLayer(layer: HotkeyLayer) {
        const index = this.layers.findIndex((l) => l.id === layer.id);

        if (index !== -1) {
            this.layers.splice(index, 1);
            this.recomputeHandlers();
        }
    }

    public recomputeHandlers() {
        //
    }
}
