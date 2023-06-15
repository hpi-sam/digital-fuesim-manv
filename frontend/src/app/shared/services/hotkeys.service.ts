import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { uuid } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import {
    bindKey,
    bindKeyCombo,
    unbindKey,
    unbindKeyCombo,
} from '@rwh/keystrokes';

export class Hotkey {
    public readonly enabled = new Subject<boolean>();

    constructor(
        public readonly keys: string,
        public readonly isCombo: boolean,
        public readonly callback: () => void
    ) {}

    public enable() {
        this.enabled.next(true);
    }

    public disable() {
        this.enabled.next(false);
    }
}

export class HotkeyLayer {
    public readonly id: UUID = uuid();
    public readonly hotkeys: Hotkey[] = [];

    constructor(
        private readonly service: HotkeysService,
        public readonly disableAll: boolean
    ) {}

    public addHotkey(hotkey: Hotkey) {
        this.hotkeys.push(hotkey);

        this.service.recomputeHandlers();
    }

    public removeHotkey(keys: string) {
        const index = this.hotkeys.findIndex((hotkey) => hotkey.keys === keys);

        if (index !== -1) {
            this.hotkeys.splice(index, 1);
        }

        this.service.recomputeHandlers();
    }
}

@Injectable({
    providedIn: 'root',
})
export class HotkeysService {
    private readonly layers: HotkeyLayer[] = [];
    private registeredHotkeys: { [key: string]: boolean } = {};

    public createLayer(disableAll: boolean = false) {
        const layer = new HotkeyLayer(this, disableAll);
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
        Object.entries(this.registeredHotkeys).forEach(([hotkey, isCombo]) => {
            if (isCombo) {
                unbindKeyCombo(hotkey);
            } else {
                unbindKey(hotkey);
            }
        });
        this.registeredHotkeys = {};

        let disableAll = false;

        [...this.layers].reverse().forEach((layer) => {
            layer.hotkeys.forEach((hotkey) => {
                const lowerCaseKeys = hotkey.keys.toLowerCase();
                if (!(lowerCaseKeys in this.registeredHotkeys) && !disableAll) {
                    if (hotkey.isCombo) {
                        bindKeyCombo(hotkey.keys, hotkey.callback);
                    } else {
                        bindKey(hotkey.keys, hotkey.callback);
                    }

                    this.registeredHotkeys[lowerCaseKeys] = hotkey.isCombo;
                    hotkey.enable();
                } else {
                    hotkey.disable();
                }
            });

            if (layer.disableAll) {
                disableAll = true;
            }
        });
    }
}
