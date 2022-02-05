import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
    ElementRef,
    ViewContainerRef,
    ViewChild,
    Component,
    NgZone,
} from '@angular/core';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
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
    private olMapManager?: OlMapManager;
    private popupManager?: PopupManager;

    constructor(
        private readonly store: Store<AppState>,
        private readonly ngZone: NgZone,
        private readonly apiService: ApiService
    ) {}

    ngAfterViewInit(): void {
        // run outside angular zone for better performance
        this.ngZone.runOutsideAngular(() => {
            this.olMapManager = new OlMapManager(
                this.store,
                this.apiService,
                this.openLayersContainer.nativeElement,
                this.popoverContainer.nativeElement,
                this.ngZone
            );
        });

        this.popupManager = new PopupManager(
            this.olMapManager!.popupOverlay,
            this.popoverContent
        );
        this.olMapManager!.changePopup$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((options) => {
            if (!options) {
                this.popupManager!.closePopup();
                return;
            }
            this.popupManager!.togglePopup(options);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.olMapManager?.destroy();
        this.popupManager?.destroy();
    }
}
