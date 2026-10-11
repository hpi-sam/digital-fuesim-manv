import {
    Component,
    computed,
    inject,
    input,
    OnInit,
    signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
    numberEvalCriterionTypes,
    combinedEvalCriterionTypes,
    evalCriterionTypesNames,
    getRootCriteriaMap,
    type EvalCriterionCategory,
    type UUID,
    type EvalResult,
    type TechnicalChallengeId,
    getNumFromEvalResult,
    isTemporalEvalCriterionType,
    statusNames,
    ExerciseTimeline,
} from 'fuesim-digital-shared';
import {
    selectEvalCriteria,
    selectEvalResults,
    selectPatients,
    selectScoutables,
    selectTechnicalChallenges,
} from '../../../../../state/application/selectors/exercise.selectors';
import { AppState } from '../../../../../state/app.state';
import { EvalCriterionEditorComponent } from './eval-criterion-editor/eval-criterion-editor.component';
import { ExerciseService } from '../../../../../core/exercise.service';
import { DidacticOverViewResultsTableComponent } from './result-table/didactic-overview-results-table.component';
import { selectExerciseKey } from '../../../../../state/application/selectors/application.selectors';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { httpOrigin } from '../../../../../core/api-origins';
import { MessageService } from '../../../../../core/messages/message.service';

@Component({
    selector: 'app-didactic-overview',
    templateUrl: './didactic-overview.component.html',
    styleUrls: ['./didactic-overview.component.scss'],
    imports: [
        EvalCriterionEditorComponent,
        DidacticOverViewResultsTableComponent,
    ],
})
export class DidacticOverviewComponent implements OnInit {
    private readonly store = inject<Store<AppState>>(Store);
    private readonly exerciseService = inject(ExerciseService);
    private readonly httpClient = inject(HttpClient);
    private readonly messageService = inject(MessageService);

    /* TODO @JohannesPotzi @Jogius : drop this? */
    public readonly resultsCache = this.exerciseService.evalResultsCache;

    public readonly tableWidth = input.required<number>();
    public readonly enableCriterionCreation = input<boolean>(true);

    public readonly selectedSubResults = signal<EvalResult[]>([]);

    public async ngOnInit(): Promise<void> {
        /* The exerciseTimeline is required to calculate time-based results */
        const exerciseKey = this.store.selectSignal(selectExerciseKey)();
        const exerciseTimeline = await lastValueFrom(
            this.httpClient.get<ExerciseTimeline>(
                `${httpOrigin}/api/exercise/${exerciseKey}/history`
            )
        ).catch((error) => {
            this.messageService.postError({
                title: 'Die Vergangenheit konnte nicht geladen werden',
                error,
            });
            throw error;
        });
    }
    public readonly criteria = this.store.selectSignal(selectEvalCriteria);
    public readonly rootCriteriaMap = computed(() =>
        this.getRootCriteriaMap(this.criteria())
    );
    public readonly results = this.store.selectSignal(selectEvalResults);
    public readonly resultsVals = computed(() =>
        Object.values(this.results()).map((res) => {
            if (isTemporalEvalCriterionType(res.criterion.criterionType)) {
                const cacheRes = this.resultsCache()[res.criterionId];
                return cacheRes ?? res;
            }
            return res;
        })
    );
    public readonly resultsMap = computed(() =>
        this.resultsVals().reduce<{ [crieterionId: UUID]: EvalResult }>(
            (mapObject, result) => {
                mapObject[result.criterionId] = result;
                return mapObject;
            },
            {}
        )
    );
    public readonly rootResults = computed(() =>
        this.resultsVals().filter(
            (res) => this.rootCriteriaMap()[res.criterionId]
        )
    );
    public readonly completedCriteriaCount = computed(() => {
        const results = this.resultsVals();
        let count = 0;
        for (let i = 0; i < results.length; i += 1) {
            const res = results.at(i);
            if (res?.type === 'boolEvalResult' && res.isCompleted) {
                count += 1;
            }
        }
        return count;
    });
    public logSubResults(results: EvalResult[]) {
        console.log(
            'selecting sub results from main list.' +
                ' count: ' +
                results.length
        );
    }
    /* the editor rquires patients, scoutables, technicalChallenges, criteria and results as input */
    public readonly scoutables = this.store.selectSignal(selectScoutables);
    public readonly patients = this.store.selectSignal(selectPatients);
    public readonly tcs = this.store.selectSignal(selectTechnicalChallenges);
    public readonly technicalChallenges = signal(Object.values(this.tcs()));
    creatingcriterion = false;
    public readonly numberEvalCriterionTypes = numberEvalCriterionTypes;
    public readonly combinedEvalCriterionTypes = combinedEvalCriterionTypes;
    public readonly evalCriterionTypesNames = evalCriterionTypesNames;
    public readonly statusNames = statusNames;
    /* this is set on selection of the criterion category to be created. */
    public readonly criterionCreationCategory =
        signal<EvalCriterionCategory | null>(null);
    public setCriterionCreationCategory(category: EvalCriterionCategory) {
        this.criterionCreationCategory.set(category);
    }
    public getTechnicalChallengeNamebyId(id: TechnicalChallengeId) {
        return this.technicalChallenges()
            .filter((tc) => tc.id === id)
            .at(0)?.name;
    }
    public getNumFromEvalResult = getNumFromEvalResult;
    public getRootCriteriaMap = getRootCriteriaMap;
}
