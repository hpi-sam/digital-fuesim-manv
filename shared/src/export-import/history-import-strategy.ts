import type { StateExport } from './file-format';

export interface StateImportBody {
    stateExport: StateExport;
    historyImportStrategy: HistoryImportStrategy;
}

export type HistoryImportStrategy =
    | 'complete-history'
    | 'current'
    | 'up-to-start';
