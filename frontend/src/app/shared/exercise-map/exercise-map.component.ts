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
import { pairwise, startWith, Subject, takeUntil } from 'rxjs';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';
import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import { ApiService } from 'src/app/core/api.service';
import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import { PatientRenderer } from './renderers/patient-renderer';
import { handleChanges } from './utility/handle-changes';

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
        // TODO: display streets above satellite
        // const normal = new TileLayer({source: new XYZ({
        //     url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        // })});
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
            className: 'map-tile-layer',
        });
        const imageStyle = new Style({
            image: new Icon({
                src: 'https://svgsilh.com/svg/2098868.svg',
            }),
        });

        const patientLayer = new VectorLayer({
            style: (feature, resolution) => {
                const featureGeometry = feature.getGeometry() as Point;
                // We have to create a new Point and can't reuse it because else the you can't select the image
                imageStyle.setGeometry(
                    new Point(featureGeometry.getCoordinates())
                );
                const image = imageStyle.getImage();
                // Normalize the image size
                const imageScale = 80 / (image.getImageSize()?.[1] ?? 0);

                // Make sure the image is always the same size on the map
                image.setScale(imageScale / (resolution * 23));
                return imageStyle;
            },
            source: new VectorSource(),
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
                center: [1461850.1072131598, 6871673.736095486],
                // center: transform(
                //     [13.13115, 52.39378],
                //     'EPSG:4326',
                //     'EPSG:3857'
                // ),
                zoom: 20,
                maxZoom: 23,
            }),
            pixelRatio: window.devicePixelRatio,
        });
        this.olMap.on('pointermove', (event) => {
            this.olMap!.getTargetElement().style.cursor =
                this.olMap!.hasFeatureAtPixel(event.pixel) ? 'pointer' : '';
        });

        // Event listeners
        // TODO: this event isn't fired automatically, we therefore propagate it manually
        translateInteraction.on('translateend', (event) => {
            event.features.forEach((feature: Feature<Geometry>) => {
                feature.dispatchEvent('translateend');
            });
        });
        // Renderers
        const patientRenderer = new PatientRenderer(
            this.olMap,
            patientLayer,
            this.apiService
        );
        this.store
            .select(selectPatients)
            .pipe(startWith({}), pairwise(), takeUntil(this.destroy$))
            .subscribe(([oldPatients, newPatients]) => {
                // run outside angular zone for better performance
                this.ngZone.runOutsideAngular(() => {
                    handleChanges(
                        oldPatients,
                        newPatients,
                        (patient) => patientRenderer.createElement(patient),
                        (patient) => patientRenderer.deleteElement(patient),
                        (oldPatient, newPatient) =>
                            patientRenderer.changeElement(
                                oldPatient,
                                newPatient
                            )
                    );
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
