import type { ExerciseIds } from 'digital-fuesim-manv-shared';

export async function withExercise(
    callback: (ids: ExerciseIds) => Promise<void>
) {
    cy.request<ExerciseIds>('POST', 'http://locahost:3201/api/exercise').then(
        async (response) => {
            const ids = response.body;
            callback(ids).finally(() => {
                cy.request(
                    'DELETE',
                    `http://locahost:3201/api/exercise/${ids.trainerId}`
                );
            });
        }
    );
}
