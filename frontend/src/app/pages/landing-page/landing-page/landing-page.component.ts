import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { plainToInstance } from 'class-transformer';
import type { Constructor, ExportImportFile } from 'digital-fuesim-manv-shared';
import { PartialExport, StateExport } from 'digital-fuesim-manv-shared';
import { escapeRegExp } from 'lodash-es';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
    public exerciseId = '';

    public exerciseHasBeenCreated = false;

    public trainerId = '';

    public participantId = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    public async createExercise() {
        this.apiService
            .createExercise()
            .then((ids) => {
                this.trainerId = ids.trainerId;
                this.exerciseId = this.trainerId;
                this.participantId = ids.participantId;
                this.exerciseHasBeenCreated = true;

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

    public importingExercise = false;
    public async importExerciseState(fileList: FileList) {
        this.importingExercise = true;
        try {
            const importString = await fileList.item(0)?.text();
            if (importString === undefined) {
                // The file dialog has been aborted.
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
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
                    PartialExport | StateExport
                >,
                importPlain
            );
            switch (importInstance.type) {
                case 'complete': {
                    const ids = await this.apiService.importExercise(
                        importInstance
                    );
                    this.trainerId = ids.trainerId;
                    this.exerciseId = this.trainerId;
                    this.participantId = ids.participantId;
                    this.exerciseHasBeenCreated = true;

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
            this.importingExercise = false;
        }
    }

    public pasteExerciseId(event: ClipboardEvent) {
        const pastedText = event.clipboardData?.getData('text') ?? '';
        const joinUrl = new RegExp(
            `^${escapeRegExp(location.origin)}/exercises/(\\d{6,8})$`,
            'u'
        );

        const matches = joinUrl.exec(pastedText);
        if (matches?.[1]) {
            this.exerciseId = matches[1];
            event.preventDefault();
        }
    }

    public joinExercise() {
        this.router.navigate(['/exercises', this.exerciseId]);
    }
}
