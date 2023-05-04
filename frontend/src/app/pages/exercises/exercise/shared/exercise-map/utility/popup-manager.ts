import type { Type, ViewContainerRef } from '@angular/core';
import type { Feature } from 'ol';
import { Overlay } from 'ol';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { Subject, takeUntil } from 'rxjs';
import type OlMap from 'ol/Map';
import type { UUID } from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';
import type { Positioning } from '../../utils/types/positioning';
import type { FeatureManager } from './feature-manager';
import type { PopupService } from './popup.service';

/**
 * A class that manages the creation and destruction of a single popup with freely customizable content
 * that should appear on the {@link popupOverlay}.
 */
export class PopupManager {
    public readonly popupOverlay: Overlay;
    private readonly destroy$ = new Subject<void>();
    private currentlyOpenPopupOptions?: OpenPopupOptions;
    private popupsEnabled = true;
    public get currentClosingIds(): UUID[] {
        if (this.currentlyOpenPopupOptions === undefined) {
            return [];
        }
        return this.currentlyOpenPopupOptions.closingUUIDs;
    }

    constructor(
        private readonly popoverContent: ViewContainerRef,
        private readonly popoverContainer: HTMLDivElement,
        private readonly popupService: PopupService
    ) {
        this.popupOverlay = new Overlay({
            element: this.popoverContainer,
        });
        this.popupService.proposePopup$
            .pipe(takeUntil(this.destroy$))
            .subscribe((options) => {
                this.togglePopup(options);
            });
    }
    public setPopupsEnabled(enabled: boolean) {
        this.popupsEnabled = enabled;
        if (!enabled) {
            // Close all open popups
            this.closePopup();
        }
    }

    public registerPopupTriggers(
        olMap: OlMap,
        openLayersContainer: HTMLDivElement,
        layerFeatureManagerDictionary: Map<
            VectorLayer<VectorSource>,
            FeatureManager<any>
        >
    ) {
        olMap.on('singleclick', (event) => {
            if (!this.popupsEnabled) {
                return;
            }
            const hasBeenHandled = olMap.forEachFeatureAtPixel(
                event.pixel,
                (feature, layer) => {
                    // Skip layer when unset
                    if (layer === null) {
                        return false;
                    }
                    layerFeatureManagerDictionary
                        .get(layer as VectorLayer<VectorSource>)!
                        .onFeatureClicked(event, feature as Feature);
                    // we only want the top one -> a truthy return breaks this loop
                    return true;
                },
                { hitTolerance: 10 }
            );
            if (!hasBeenHandled) {
                this.closePopup();
            }
        });

        openLayersContainer.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                this.closePopup();
            }
        });
    }

    public togglePopup(options: OpenPopupOptions | undefined) {
        if (!options) {
            this.closePopup();
            return;
        }

        if (this.currentlyOpenPopupOptions) {
            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                position: newPosition,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                positioning: newPositioning,
                ...newOptionsWithoutPosition
            } = options;
            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                position: oldPosition,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                positioning: oldPositioning,
                ...oldOptionsWithoutPosition
            } = this.currentlyOpenPopupOptions;
            if (isEqual(newOptionsWithoutPosition, oldOptionsWithoutPosition)) {
                // All the openPopup buttons should be toggles
                this.closePopup();
                return;
            }
        }

        this.openPopup(options);
    }

    private openPopup(options: OpenPopupOptions) {
        this.currentlyOpenPopupOptions = options;
        this.popupService.popupOpened(options);
        this.popoverContent.clear();
        const componentRef = this.popoverContent.createComponent(
            options.component
        );
        if (options.context) {
            for (const key of Object.keys(options.context)) {
                (componentRef.instance as any)[key] = (options.context as any)[
                    key
                ];
            }
        }
        componentRef.changeDetectorRef.detectChanges();
        this.popupOverlay.setPosition(options.position);
        this.popupOverlay.setPositioning(options.positioning);
    }

    private closePopup() {
        this.popupService.popupOpened(undefined);
        this.currentlyOpenPopupOptions = undefined;
        this.popoverContent.clear();
        this.popupOverlay.setPosition(undefined);
    }

    public destroy() {
        this.closePopup();
        this.destroy$.next();
    }
}

/**
 * {@link closingUUIDs} is an array containing the UUIDs of elements that when clicked shall close the pop-up
 */
export interface OpenPopupOptions<Component = unknown> {
    elementUUID: UUID | undefined;
    position: number[];
    positioning: Positioning;
    component: Type<Component>;
    closingUUIDs: UUID[];
    context?: Partial<Component>;
}
