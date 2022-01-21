import type { AfterViewInit, OnDestroy } from '@angular/core';
import {
    ElementRef,
    ViewChild,
    Component,
    ChangeDetectionStrategy,
    NgZone,
} from '@angular/core';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { selectPatients } from 'src/app/state/exercise/exercise.selectors';
import type { Observable } from 'rxjs';
import { pairwise, startWith, Subject, takeUntil } from 'rxjs';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';
import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import { ApiService } from 'src/app/core/api.service';
import type { UUID } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import { PatientFeatureManager } from './feature-managers/patient-feature-manager';
import { handleChanges } from './utility/handle-changes';
import type { FeatureManager } from './feature-managers/feature-manager';

@Component({
    selector: 'app-exercise-map',
    templateUrl: './exercise-map.component.html',
    styleUrls: ['./exercise-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseMapComponent implements AfterViewInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    @ViewChild('openLayersContainer')
    openLayersContainer!: ElementRef<HTMLDivElement>;

    private olMap?: OlMap;
    constructor(
        private readonly store: Store<AppState>,
        private readonly ngZone: NgZone,
        private readonly apiService: ApiService
    ) {}

    // https://www.openstreetmap.org/#map=19/52.39378/13.13115
    // https://www.openstreetmap.org/#map=19/52.39377/13.13093
    ngAfterViewInit(): void {
        // run outside angular zone for better performance
        this.ngZone.runOutsideAngular(() => {
            this.setupMap();
        });
    }

    private setupMap() {
        // Layers
        const satellite = new TileLayer({
            source: new XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                // this is server specific - the sever only supports up to zoom level 20
                maxZoom: 20,
                // We want to keep the tiles cached if we are zooming in and out fast
                cacheSize: 1000,
                attributions: [
                    // TODO: DO we need this?
                    // 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                ],
            }),
        });

        const patientLayer = new VectorLayer({
            source: new VectorSource<Point>(),
            // TODO: these two settings prevent clipping during animation/interaction but cause a performance hit -> disable if needed
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            // TODO: Recommended value: the size of the largest symbol, line width or label.
            // The value is in pixel -> if we are very zoomed in we might need to increase it
            renderBuffer: 250,
        });
        // Interactions
        const translateInteraction = new Translate({
            features: patientLayer.getSource().getFeaturesCollection(),
        });

        this.olMap = new OlMap({
            interactions: defaultInteractions().extend([translateInteraction]),
            target: this.openLayersContainer.nativeElement,
            layers: [satellite, patientLayer],
            view: new View({
                center: [1461850, 6871673],
                zoom: 20,
                maxZoom: 23,
            }),
        });
        // Cursors
        this.olMap.on('pointermove', (event) => {
            this.setCursorStyle(
                this.olMap!.hasFeatureAtPixel(event.pixel) ? 'pointer' : ''
            );
        });
        // TODO:
        // translateInteraction.on('translatestart', () => {
        //     this.setCursorStyle('grabbing');
        // });
        // translateInteraction.on('translateend', () => {
        //     this.setCursorStyle('');
        // });

        // These event don't propagate to anything else bz default. We therefore propagate it manually to the specific features.
        const translateEvents = [
            'translatestart',
            'translating',
            'translateend',
        ] as const;
        for (const eventName of translateEvents) {
            translateInteraction.on(eventName, (event) => {
                event.features.forEach((feature: Feature<Geometry>) => {
                    feature.dispatchEvent(event);
                });
            });
        }
        // FeatureManagers
        const patientFeatureManager = new PatientFeatureManager(
            this.olMap,
            patientLayer,
            this.apiService
        );
        this.registerFeatureManager(
            patientFeatureManager,
            this.store.select(selectPatients)
        );
    }

    private registerFeatureManager<Element extends object>(
        featureManager: FeatureManager<Element, any, any, any>,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        elementDictionary$
            .pipe(startWith({}), pairwise(), takeUntil(this.destroy$))
            .subscribe(([oldElementDictionary, newElementDictionary]) => {
                // run outside angular zone for better performance
                this.ngZone.runOutsideAngular(() => {
                    handleChanges(
                        oldElementDictionary,
                        newElementDictionary,
                        (element) => featureManager.onElementCreated(element),
                        (element) => featureManager.onElementDeleted(element),
                        (oldElement, newElement) =>
                            featureManager.onElementChanged(
                                oldElement,
                                newElement
                            )
                    );
                });
            });
    }

    private setCursorStyle(cursorStyle: string) {
        this.olMap!.getTargetElement().style.cursor = cursorStyle;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
