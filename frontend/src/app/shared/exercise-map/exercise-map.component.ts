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
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';
import type { Feature } from 'ol';
import type Geometry from 'ol/geom/Geometry';
import { ApiService } from 'src/app/core/api.service';
import { handleChanges } from './handle-changes';
import { PatientRenderer } from './element-renderer';

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
                attributions: [
                    // TODO: DO we need this?
                    // 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                ],
            }),
        });
        const patientLayer = new VectorLayer({
            source: new VectorSource(),
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
                center: transform(
                    [13.13115, 52.39378],
                    'EPSG:4326',
                    'EPSG:3857'
                ),
                zoom: 20,
            }),
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
