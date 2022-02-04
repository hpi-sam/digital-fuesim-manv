import type { ComponentType } from '@angular/cdk/portal';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import type {
    ApplicationRef,
    ComponentFactoryResolver,
    EventEmitter,
    Injector,
} from '@angular/core';
import type { Overlay } from 'ol';
import { Subject, takeUntil } from 'rxjs';
import type { Positioning } from '../../utility/types/positioning';

export class PopupManager {
    private readonly destroy$ = new Subject<void>();
    private readonly popoverPortalHost: DomPortalOutlet;

    constructor(
        private readonly popupOverlay: Overlay,
        // See https://github.com/angular/components/issues/24334 we currently need it for the portal
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly applicationRef: ApplicationRef,
        private readonly injector: Injector
    ) {
        this.popoverPortalHost = new DomPortalOutlet(
            this.popupOverlay.getElement()!,
            this.componentFactoryResolver,
            this.applicationRef,
            this.injector
        );
    }

    public openPopup<Component extends PopupComponent>(
        options: OpenPopupOptions<Component>
    ) {
        this.popoverPortalHost!.detach();
        const componentRef = this.popoverPortalHost!.attach(
            new ComponentPortal(options.component)
        );
        if (options.context) {
            for (const key of Object.keys(options.context)) {
                (componentRef as any).instance[key] = (options.context as any)[
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
        this.popoverPortalHost?.detach();
        this.popupOverlay.setPosition(undefined);
    }

    public destroy() {
        this.destroy$.next();
        this.popoverPortalHost?.dispose();
    }
}

export interface OpenPopupOptions<
    Component extends PopupComponent,
    ComponentClass extends ComponentType<Component> = ComponentType<Component>
> {
    position: number[];
    positioning: Positioning;
    component: ComponentClass;
    context?: Partial<Component>;
}

export interface PopupComponent {
    readonly closePopup: EventEmitter<void>;
}
