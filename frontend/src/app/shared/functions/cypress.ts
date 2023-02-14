import type { Store } from '@ngrx/store';
import type { ExerciseAction, Immutable } from 'digital-fuesim-manv-shared';
import { environment } from 'src/environments/environment';
import { defaults } from 'lodash-es';

export interface CypressTestingValues {
    store: Store;
    proposedActions: Immutable<ExerciseAction>[];
    performedActions: Immutable<ExerciseAction>[];
    backendBaseUrl: string;
}

export const isBeingTestedByCypress = () =>
    'Cypress' in window && !environment.production;

export const setupCypressTestingValues = (
    values: Partial<CypressTestingValues>
) => {
    const anyWindow = window as any;
    if (isBeingTestedByCypress()) {
        if (!anyWindow.cypressTestingValues)
            anyWindow.cypressTestingValues = {};
        defaults(anyWindow.cypressTestingValues, values);
    }
};
