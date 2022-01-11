import type { OnDestroy } from '@angular/core';
import {
    ElementRef,
    ViewChild,
    Component,
    ChangeDetectionStrategy,
} from '@angular/core';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import { selectPatients } from 'src/app/state/exercise/exercise.selectors';
import { Subject, takeUntil } from 'rxjs';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Circle from 'ol/geom/Circle';
import { Feature } from 'ol';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';

@Component({
    selector: 'app-exercise-map',
    templateUrl: './exercise-map.component.html',
    styleUrls: ['./exercise-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseMapComponent implements OnDestroy {
    private readonly destroy$ = new Subject<void>();

    @ViewChild('openLayersContainer')
    openLayersContainer!: ElementRef<HTMLDivElement>;

    private olMap?: OlMap;
    constructor(private readonly store: Store<AppState>) {}

    // https://www.openstreetmap.org/#map=19/52.39378/13.13115
    // https://www.openstreetmap.org/#map=19/52.39377/13.13093
    ngAfterViewInit(): void {
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

        this.olMap = new OlMap({
            interactions: defaultInteractions().extend([
                new Translate({
                    features: patientLayer.getSource().getFeaturesCollection(),
                }),
            ]),
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
        this.store
            .select(selectPatients)
            .pipe(takeUntil(this.destroy$))
            .subscribe((patients) => {
                // render the patients at their respective location
                for (const patient of Object.values(patients)) {
                    const circleFeature = new Feature(
                        new Circle(
                            [patient.position!.x, patient.position!.y],
                            10
                        )
                    );
                    patientLayer.getSource().addFeature(circleFeature);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
