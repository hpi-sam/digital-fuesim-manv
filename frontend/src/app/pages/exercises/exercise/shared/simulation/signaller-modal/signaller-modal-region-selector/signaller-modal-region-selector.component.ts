import type { OnDestroy, OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import type { UUID } from 'digital-fuesim-manv-shared';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { selectSimulatedRegions } from 'src/app/state/application/selectors/exercise.selectors';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { SelectSignallerRegionService } from '../select-signaller-region.service';

@Component({
    selector: 'app-signaller-modal-region-selector',
    templateUrl: './signaller-modal-region-selector.component.html',
    styleUrls: ['./signaller-modal-region-selector.component.scss'],
})
export class SignallerModalRegionSelectorComponent
    implements OnInit, OnDestroy
{
    public simulatedRegionNames$!: Observable<
        {
            name: string;
            identifier: UUID;
        }[]
    >;

    private baseLayer!: HotkeyLayer;

    @ViewChild(NgbPopover, { static: true }) popover!: NgbPopover;

    switchSimulatedRegionHotkey = new Hotkey('F2', false, () => {
        this.popover.open();
    });

    constructor(
        private readonly store: Store<AppState>,
        private readonly hotkeys: HotkeysService,
        public readonly selectRegionService: SelectSignallerRegionService
    ) {}

    ngOnInit() {
        this.simulatedRegionNames$ = this.store
            .select(selectSimulatedRegions)
            .pipe(
                map((simulatedRegions) =>
                    Object.entries(simulatedRegions)
                        .sort(([, regionA], [, regionB]) =>
                            regionA.name.localeCompare(regionB.name)
                        )
                        .map(([id, region]) => ({
                            identifier: id,
                            name: region.name,
                        }))
                )
            );

        this.baseLayer = this.hotkeys.createLayer();
        this.baseLayer.addHotkey(this.switchSimulatedRegionHotkey);
    }

    ngOnDestroy() {
        this.hotkeys.removeLayer(this.baseLayer);
    }

    public selectRegion(id: UUID) {
        this.selectRegionService.selectSimulatedRegion(id);
    }
}
