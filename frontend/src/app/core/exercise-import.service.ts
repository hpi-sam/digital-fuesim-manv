import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import type {
    Constructor,
    ExerciseIds,
    ExportImportFile,
    HistoryImportStrategy,
} from 'digital-fuesim-manv-shared';
import { PartialExport, StateExport } from 'digital-fuesim-manv-shared';
import { BehaviorSubject, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { MessageService } from './messages/message.service';

@Injectable({
    providedIn: 'root',
})
export class ExerciseImportService {
    public readonly selectedOption$ =
        new BehaviorSubject<HistoryImportStrategy>('complete-history');
    public readonly currentlyImporting$ = new BehaviorSubject<boolean>(false);
    public readonly ids$ = new Subject<ExerciseIds>();
    public historyImportStrategy: HistoryImportStrategy = 'complete-history';

    constructor(
        private readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

    public async createExercise() {
        this.apiService
            .createExercise()
            .then((ids) => {
                this.ids$.next(ids);
                this.messageService.postMessage(
                    {
                        title: 'Übung erstellt',
                        body: 'Sie können nun der Übung beitreten.',
                        color: 'success',
                    },
                    'toast'
                );
            })
            .catch((error) => {
                this.messageService.postError({
                    title: 'Fehler beim Erstellen der Übung',
                    error: error.message,
                });
            });
    }

    public async importExercise(file: File | null) {
        this.currentlyImporting$.next(true);
        try {
            const importString = await file?.text();
            if (importString === undefined) {
                return;
            }
            const importPlain = JSON.parse(importString) as ExportImportFile;
            const type = importPlain.type;
            if (!['complete', 'partial'].includes(type)) {
                throw new Error(`Ungültiger Dateityp: \`type === ${type}\``);
            }
            const importInstance = plainToInstance(
                (type === 'complete'
                    ? StateExport
                    : PartialExport) as Constructor<
                    PartialExport | StateExport
                >,
                importPlain
            );
            switch (importInstance.type) {
                case 'complete': {
                    const ids = await this.apiService.importExercise(
                        importInstance,
                        this.historyImportStrategy
                    );
                    this.ids$.next(ids);

                    this.messageService.postMessage(
                        {
                            color: 'success',
                            title: 'Übung importiert',
                            body: 'Sie können nun der Übung beitreten',
                        },
                        'toast'
                    );
                    break;
                }
                case 'partial': {
                    throw new Error(
                        'Dieser Typ kann zur Zeit nicht importiert werden.'
                    );
                }
            }
        } catch (error: unknown) {
            this.messageService.postError({
                title: 'Fehler beim Importieren der Übung',
                error,
            });
        } finally {
            this.currentlyImporting$.next(false);
        }
    }
}
