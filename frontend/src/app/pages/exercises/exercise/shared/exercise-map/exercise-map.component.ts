import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
    Component,
    ElementRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    selectCurrentRole,
    selectRestrictedViewport,
} from 'src/app/state/application/selectors/shared.selectors';
import { DragElementService } from '../core/drag-element.service';
import { TransferLinesService } from '../core/transfer-lines.service';
import { OlMapManager } from './utility/ol-map-manager';
import { PopupManager } from './utility/popup-manager';

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
    public readonly restrictedToViewport$ = this.storeService.select$(
        selectRestrictedViewport
    );
    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService,
        public readonly dragElementService: DragElementService,
        public readonly transferLinesService: TransferLinesService
    ) {}

    ngAfterViewInit(): void {
        this.popupManager = new PopupManager(
            this.popoverContent,
            this.popoverContainer.nativeElement
        );
        this.olMapManager = new OlMapManager(
            this.storeService,
            this.exerciseService,
            this.openLayersContainer.nativeElement,
            this.transferLinesService,
            this.popupManager!
        );
        this.dragElementService.registerMap(this.olMapManager.olMap);
        this.dragElementService.registerLayerFeatureManagerDictionary(
            this.olMapManager.layerFeatureManagerDictionary
        );

        this.popupManager!.changePopup$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((options) => {
            if (!options) {
                this.popupManager!.closePopup();
                return;
            }
            this.popupManager!.togglePopup(options);
        });
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.dragElementService.unregisterMap();
        this.dragElementService.unregisterLayerFeatureManagerDictionary();
    }
}
