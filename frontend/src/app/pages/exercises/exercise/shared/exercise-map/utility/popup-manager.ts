import type {
    ComponentRef,
    EventEmitter,
    Type,
    ViewContainerRef,
} from '@angular/core';
import { isEqual } from 'lodash-es';
import type { Overlay } from 'ol';
import { Subject, takeUntil } from 'rxjs';
import type { Positioning } from '../../utility/types/positioning';

/**
 * A class that manages the creation and destruction of a single popup with freely customizable content
 * that should appear on the {@link popupOverlay}.
 */
export class PopupManager {
    private readonly destroy$ = new Subject<void>();
    private currentlyOpenPopupOptions?: OpenPopupOptions<any>;

    constructor(
        private readonly popupOverlay: Overlay,
        private readonly popoverContent: ViewContainerRef
    ) {}

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
