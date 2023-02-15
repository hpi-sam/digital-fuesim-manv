import type { Type, NgZone } from '@angular/core';
import type { Store } from '@ngrx/store';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { Subject } from 'rxjs';
import { rgbColorPalette } from 'src/app/shared/functions/colors';
import type { CateringLine } from 'src/app/shared/types/catering-line';
import type { AppState } from 'src/app/state/app.state';
import { selectVisibleCateringLines } from 'src/app/state/application/selectors/shared.selectors';
import type OlMap from 'ol/Map';
import type { FeatureManager } from '../utility/feature-manager';
import type { OlMapInteractionsManager } from '../utility/ol-map-interactions-manager';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { LineStyleHelper } from '../utility/style-helper/line-style-helper';
import { ElementManager } from './element-manager';

export class CateringLinesFeatureManager
    extends ElementManager<CateringLine, LineString>
    implements FeatureManager<LineString>
{
    private readonly lineStyleHelper = new LineStyleHelper(
        (feature) => ({
            color: rgbColorPalette.cyan,
        }),
        0.05
    );
    public readonly layer: VectorLayer<VectorSource<LineString>>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly olMap: OlMap
    ) {
        super();
        this.layer = super.createElementLayer<LineString>();
        this.layer.setStyle((feature, currentZoom) =>
            this.lineStyleHelper.getStyle(feature as Feature, currentZoom)
        );
    }
    togglePopup$?: Subject<OpenPopupOptions<any, Type<any>>> | undefined;
    register(
        changePopup$: Subject<OpenPopupOptions<any, Type<any>> | undefined>,
        destroy$: Subject<void>,
        ngZone: NgZone,
        mapInteractionsManager: OlMapInteractionsManager
    ) {
        this.olMap.addLayer(this.layer);
        mapInteractionsManager.addFeatureLayer(this.layer);
        this.togglePopup$?.subscribe(changePopup$);
        // Propagate the changes on an element to the featureManager
        this.registerChangeHandlers(
            this.store.select(selectVisibleCateringLines),
            destroy$,
            ngZone,
            (element) => this.onElementCreated(element),
            (element) => this.onElementDeleted(element),
            (oldElement, newElement) =>
                this.onElementChanged(oldElement, newElement)
        );
    }

    public isFeatureTranslatable(feature: Feature<LineString>) {
        return false;
    }

    createFeature(element: CateringLine): Feature<LineString> {
        const feature = new Feature(
            new LineString([
                [element.catererPosition.x, element.catererPosition.y],
                [element.patientPosition.x, element.patientPosition.y],
            ])
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
        return feature;
    }

    deleteFeature(
        element: CateringLine,
        elementFeature: Feature<LineString>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
    }

    changeFeature(
        oldElement: CateringLine,
        newElement: CateringLine,
        changedProperties: ReadonlySet<keyof CateringLine>,
        elementFeature: Feature<LineString>
    ): void {
        // Rendering the line again is expensive, so we only do it if we must
        if (
            changedProperties.has('catererPosition') ||
            changedProperties.has('patientPosition')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.catererPosition.x, newElement.catererPosition.y],
                [newElement.patientPosition.x, newElement.patientPosition.y],
            ]);
        }
    }

    onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<LineString>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {}

    onFeatureDrop(
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<LineString>,
        dropEvent?: TranslateEvent
    ) {
        return false;
    }

    getFeatureFromElement(element: CateringLine) {
        return this.layer.getSource()!.getFeatureById(element.id) ?? undefined;
    }
}
