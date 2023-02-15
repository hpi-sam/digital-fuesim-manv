import type {
    ComponentRef,
    EventEmitter,
    Type,
    ViewContainerRef,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import type { Feature } from 'ol';
import { Overlay } from 'ol';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { Subject, takeUntil } from 'rxjs';
import type OlMap from 'ol/Map';
import type { Positioning } from '../../utility/types/positioning';
import type { FeatureManager } from './feature-manager';

/**
 * A class that manages the creation and destruction of a single popup with freely customizable content
 * that should appear on the {@link popupOverlay}.
 */
export class PopupManager {
    /**
     * If this subject emits options, the specified popup should be toggled.
     * If it emits undefined, the currently open popup should be closed.
     */
    public readonly changePopup$ = new Subject<
        OpenPopupOptions<any> | undefined
    >();

    public readonly popupOverlay: Overlay;
    private readonly destroy$ = new Subject<void>();
    private currentlyOpenPopupOptions?: OpenPopupOptions<any>;
    private popupsEnabled = true;

    constructor(
        private readonly popoverContent: ViewContainerRef,
        private readonly popoverContainer: HTMLDivElement
    ) {
        this.popupOverlay = new Overlay({
            element: this.popoverContainer,
        });
    }
    public setPopupsEnabled(enabled: boolean) {
        this.popupsEnabled = enabled;
        if (!enabled) {
            // Close all open popups
            this.changePopup$.next(undefined);
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
                this.changePopup$.next(undefined);
            }
        });

        openLayersContainer.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                this.changePopup$.next(undefined);
            }
        });
    }

    /**
     * Toggles the popup with the given options.
     * If a popup is already open, it will be closed.
     * If the given options are different from the currently open popup, the new popup will be opened.
     * If the given options are the same as the currently open popup, the popup will be closed.
     * @param options The options to use for the popup.
     */
    public togglePopup<Component extends PopupComponent>(
        options: OpenPopupOptions<Component>
    ) {
        if (isEqual(this.currentlyOpenPopupOptions, options)) {
            // All the openPopup buttons should be toggles
            this.closePopup();
            return;
        }
        this.currentlyOpenPopupOptions = options;
        this.popoverContent.clear();
        const componentRef: ComponentRef<PopupComponent> =
            this.popoverContent.createComponent(options.component);
        if (options.context) {
            for (const key of Object.keys(options.context)) {
                (componentRef.instance as any)[key] = (options.context as any)[
                    key
                ];
            }
        }
        componentRef.instance.closePopup
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.closePopup());
        componentRef.changeDetectorRef.detectChanges();
        this.popupOverlay.setPosition(options.position);
        this.popupOverlay.setPositioning(options.positioning);
    }

    public closePopup() {
        this.currentlyOpenPopupOptions = undefined;
        this.popoverContent.clear();
        this.popupOverlay.setPosition(undefined);
    }

    public destroy() {
        this.destroy$.next();
        this.popoverContent.clear();
        this.popupOverlay.setPosition(undefined);
    }
}

export interface OpenPopupOptions<
    Component extends PopupComponent,
    ComponentClass extends Type<Component> = Type<Component>
> {
    position: number[];
    positioning: Positioning;
    component: ComponentClass;
    context?: Partial<Component>;
}

export interface PopupComponent {
    readonly closePopup: EventEmitter<void>;
}
