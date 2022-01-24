import type { AfterViewInit, OnDestroy, Type } from '@angular/core';
import {
    ElementRef,
    ViewChild,
    Component,
    ChangeDetectionStrategy,
    NgZone,
} from '@angular/core';
import OlMap from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { Observable } from 'rxjs';
import { pairwise, debounceTime, startWith, Subject, takeUntil } from 'rxjs';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';
import type { Feature } from 'ol';
import { View } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import { ApiService } from 'src/app/core/api.service';
import type { Position, UUID } from 'digital-fuesim-manv-shared';
import type Point from 'ol/geom/Point';
import { getSelectWithPosition } from 'src/app/state/exercise/exercise.selectors';
import type { WithPosition } from '../utility/types/with-position';
import { PatientFeatureManager } from './feature-managers/patient-feature-manager';
import { handleChanges } from './utility/handle-changes';
import type { FeatureManager } from './feature-managers/feature-manager';
import { VehicleFeatureManager } from './feature-managers/vehicle-feature-manager';
import { PersonellFeatureManager } from './feature-managers/personell-feature-manager';
import { MaterialFeatureManager } from './feature-managers/material-feature-manager';
import type { CommonFeatureManager } from './feature-managers/common-feature-manager';

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
        const satelliteLayer = this.createTileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        );
        const patientLayer = this.createElementLayerTemplate();
        const vehicleLayer = this.createElementLayerTemplate();
        const personellLayer = this.createElementLayerTemplate();
        const materialLayer = this.createElementLayerTemplate();

        // Interactions
        const translateInteraction = new Translate({
            layers: [patientLayer, vehicleLayer, personellLayer, materialLayer],
        });

        this.olMap = new OlMap({
            interactions: defaultInteractions().extend([translateInteraction]),
            target: this.openLayersContainer.nativeElement,
            layers: [
                satelliteLayer,
                vehicleLayer,
                patientLayer,
                personellLayer,
                materialLayer,
            ],
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
        this.createAndRegisterFeatureManager(
            PatientFeatureManager,
            patientLayer,
            this.store.select(getSelectWithPosition('patients'))
        );
        this.createAndRegisterFeatureManager(
            VehicleFeatureManager,
            vehicleLayer,
            this.store.select(getSelectWithPosition('vehicles'))
        );
        this.createAndRegisterFeatureManager(
            PersonellFeatureManager,
            personellLayer,
            this.store.select(getSelectWithPosition('personell'))
        );
        this.createAndRegisterFeatureManager(
            MaterialFeatureManager,
            materialLayer,
            this.store.select(getSelectWithPosition('materials'))
        );
    }

    // If the signature of the FeatureManager classes change, the initialisation should be done individually
    private createAndRegisterFeatureManager<
        Element extends Readonly<{ id: UUID; position: Position }>
    >(
        // `Type` is an utility type from angular, that returns the type of the constructor function
        featureManagerClass: Type<CommonFeatureManager<Element>>,
        layer: VectorLayer<VectorSource<Point>>,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        const featureManager = new featureManagerClass(
            this.olMap!,
            layer,
            this.apiService
        );
        this.registerFeatureManager(featureManager, elementDictionary$);
    }

    private registerFeatureManager<Element extends WithPosition<object>>(
        featureManager: FeatureManager<Element, any, any>,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        elementDictionary$
            .pipe(
                // TODO: this is workaround for not emitting synchronously
                // currently, the setState of the optimistic update and the actions that are reapplied each bring the state to synchronously emit
                debounceTime(0),
                startWith({}),
                pairwise(),
                takeUntil(this.destroy$)
            )
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

    private createElementLayerTemplate() {
        return new VectorLayer({
            // TODO: these two settings prevent clipping during animation/interaction but cause a performance hit -> disable if needed
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            // TODO: Recommended value: the size of the largest symbol, line width or label.
            // The value is in pixel -> if we are very zoomed in we might need to increase it
            renderBuffer: 250,
            source: new VectorSource<Point>(),
        });
    }

    private createTileLayer(url: string, maxZoom = 20) {
        return new TileLayer({
            source: new XYZ({
                url,
                // this is server specific - the sever only supports up to zoom level 20
                maxZoom,
                // We want to keep the tiles cached if we are zooming in and out fast
                cacheSize: 1000,
            }),
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
