import type { Type, NgZone } from '@angular/core';
import type { Store } from '@ngrx/store';
import type { MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import LineString from 'ol/geom/LineString';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { Subject } from 'rxjs';
import { pairwise, startWith, takeUntil } from 'rxjs';
import { handleChanges } from 'src/app/shared/functions/handle-changes';
import type { TransferLine } from 'src/app/shared/types/transfer-line';
import type { AppState } from 'src/app/state/app.state';
import { selectTransferLines } from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { TransferLinesService } from '../../core/transfer-lines.service';
import type { FeatureManager } from '../utility/feature-manager';
import type { OlMapInteractionsManager } from '../utility/map/ol-map-interactions-manager';
import type { OpenPopupOptions } from '../utility/popup-manager';
import { ElementManager } from './element-manager';

export class TransferLinesFeatureManager
    extends ElementManager<TransferLine, LineString>
    implements FeatureManager<LineString>
{
    public readonly layer: VectorLayer<VectorSource<LineString>>;
    constructor(
        private readonly store: Store<AppState>,
        private readonly transferLinesService: TransferLinesService
    ) {
        super();
        this.layer = this.createElementLayer<LineString>();
        this.layer.setStyle(
            new Style({
                stroke: new Stroke({
                    color: '#fd7e14',
                    // We don't want to scale with the zoom to be better seen when zoomed out
                    width: 3,
                }),
            })
        );
    }
    togglePopup$?: Subject<OpenPopupOptions<any, Type<any>>> | undefined;
    register(
        changePopup$: Subject<OpenPopupOptions<any, Type<any>> | undefined>,
        destroy$: Subject<void>,
        ngZone: NgZone,
        mapInteractionsManager: OlMapInteractionsManager
    ) {
        mapInteractionsManager.addFeatureLayer(this.layer);
        this.togglePopup$?.subscribe(changePopup$);
        if (selectStateSnapshot(selectCurrentRole, this.store) === 'trainer') {
            this.store
                .select(selectTransferLines)
                .pipe(startWith({}), pairwise(), takeUntil(destroy$))
                .subscribe(([oldElementDictionary, newElementDictionary]) => {
                    // run outside angular zone for better performance
                    ngZone.runOutsideAngular(() => {
                        handleChanges(
                            oldElementDictionary,
                            newElementDictionary,
                            {
                                createHandler: (element) =>
                                    this.onElementCreated(element),
                                deleteHandler: (element) =>
                                    this.onElementDeleted(element),
                                changeHandler: (oldElement, newElement) =>
                                    this.onElementChanged(
                                        oldElement,
                                        newElement
                                    ),
                            }
                        );
                    });
                });
            this.transferLinesService.displayTransferLines$.subscribe(
                (display) => {
                    this.layer.setVisible(display);
                }
            );
        }
    }

    createFeature(element: TransferLine): Feature<LineString> {
        const feature = new Feature(
            new LineString([
                [element.startPosition.x, element.startPosition.y],
                [element.endPosition.x, element.endPosition.y],
            ])
        );
        feature.setId(element.id);
        this.layer.getSource()!.addFeature(feature);
        return feature;
    }

    deleteFeature(
        element: TransferLine,
        elementFeature: Feature<LineString>
    ): void {
        this.layer.getSource()!.removeFeature(elementFeature);
    }

    changeFeature(
        oldElement: TransferLine,
        newElement: TransferLine,
        changedProperties: ReadonlySet<keyof TransferLine>,
        elementFeature: Feature<LineString>
    ): void {
        // Rendering the line again is expensive, so we only do it if we must
        if (
            changedProperties.has('startPosition') ||
            changedProperties.has('endPosition')
        ) {
            elementFeature.getGeometry()!.setCoordinates([
                [newElement.startPosition.x, newElement.startPosition.y],
                [newElement.endPosition.x, newElement.endPosition.y],
            ]);
        }
    }

    onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<LineString>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ) {}

    onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<LineString>
    ) {
        return false;
    }

    getFeatureFromElement(element: TransferLine) {
        return this.layer.getSource()!.getFeatureById(element.id) ?? undefined;
    }

    isFeatureTranslatable(feature: Feature<LineString>) {
        return false;
    }
}
