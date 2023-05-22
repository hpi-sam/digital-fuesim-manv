import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
    Component,
    ElementRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectCurrentRole,
    selectRestrictedViewport,
} from 'src/app/state/application/selectors/shared.selectors';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DragElementService } from '../core/drag-element.service';
import { TransferLinesService } from '../core/transfer-lines.service';
import { openCoordinatePickerModal } from '../coordinate-picker/open-coordinate-picker-modal';
import { OlMapManager } from './utility/ol-map-manager';
import { PopupManager } from './utility/popup-manager';
import { PopupService } from './utility/popup.service';

@Component({
    selector: 'app-exercise-map',
    templateUrl: './exercise-map.component.html',
    styleUrls: ['./exercise-map.component.scss'],
})
export class ExerciseMapComponent implements AfterViewInit, OnDestroy {
    @ViewChild('openLayersContainer')
    openLayersContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('popoverContainer')
    popoverContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('popoverContent', { read: ViewContainerRef })
    popoverContent!: ViewContainerRef;

    private readonly destroy$ = new Subject<void>();
    public olMapManager?: OlMapManager;
    private popupManager?: PopupManager;
    public readonly restrictedToViewport$ = this.store.select(
        selectRestrictedViewport
    );
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService,
        public readonly dragElementService: DragElementService,
        public readonly transferLinesService: TransferLinesService,
        private readonly popupService: PopupService,
        private readonly modalService: NgbModal
    ) {}

    ngAfterViewInit(): void {
        this.popupManager = new PopupManager(
            this.popoverContent,
            this.popoverContainer.nativeElement,
            this.popupService
        );
        this.olMapManager = new OlMapManager(
            this.store,
            this.exerciseService,
            this.openLayersContainer.nativeElement,
            this.transferLinesService,
            this.popupManager,
            this.popupService
        );
        this.dragElementService.registerMap(this.olMapManager.olMap);
        this.dragElementService.registerLayerFeatureManagerDictionary(
            this.olMapManager.layerFeatureManagerDictionary
        );

        // Check whether the map is fullscreen
        this.openLayersContainer.nativeElement.addEventListener(
            'fullscreenchange',
            (event) => {
                this.fullscreenEnabled = document.fullscreenElement !== null;
            }
        );
    }

    public fullscreenEnabled = false;
    public toggleFullscreen() {
        if (!this.fullscreenEnabled) {
            this.openLayersContainer.nativeElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    public goToCoordinates() {
        if (!this.olMapManager) return;

        openCoordinatePickerModal(this.modalService, this.olMapManager);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.dragElementService.unregisterMap();
        this.dragElementService.unregisterLayerFeatureManagerDictionary();
    }
}
