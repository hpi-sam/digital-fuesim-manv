import type { Store } from '@ngrx/store';
import type { ExerciseAction, Immutable } from 'digital-fuesim-manv-shared';
import { environment } from 'src/environments/environment';

export interface CypressTestingValues {
    store: Store;
    proposedActions: Immutable<ExerciseAction>[];
    performedAcctions: Immutable<ExerciseAction>[];
    backendBaseUrl: string;
}

export const isBeingTestedByCypress = () =>
    'Cypress' in window && !environment.production;

export const setupCypressTestingValues = (
    apply: (values: Partial<CypressTestingValues>) => void
) => {
    const anyWindow = window as any;
    if (isBeingTestedByCypress()) {
        if (!anyWindow.cypressTestingValues)
            anyWindow.cypressTestingValues = {};
        apply(anyWindow.cypressTestingValues);
    }
};
