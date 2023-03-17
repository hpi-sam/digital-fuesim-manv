import fs from 'node:fs';
import { UserReadableIdGenerator } from 'utils/user-readable-id-generator';
import { exerciseMap } from 'exercise/exercise-map';
import { createTestEnvironment } from './utils';

const basePath = '../test-scenarios/migration-test-scenarios';

describe('migration', () => {
    const environment = createTestEnvironment();

    beforeEach(async () => {
        UserReadableIdGenerator.freeAll();
        exerciseMap.clear();
    });

    fs.readdirSync(basePath).forEach((dir) => {
        describe(dir, () => {
            const exercisePaths = fs.readdirSync(`${basePath}/${dir}`);
            const exercisePathsToTest = exercisePaths.filter(
                (exercisePath) =>
                    exercisePath.split('-')[0] !== 'EXCLUDE' ||
                    exercisePath.split('-')[1] !== 'FROM' ||
                    exercisePath.split('-')[2] !== 'TEST'
            );
            test.each(exercisePathsToTest)(
                'It imports %s correctly',
                async (exercisePath) => {
                    const exercise = JSON.parse(
                        fs.readFileSync(
                            `${basePath}/${dir}/${exercisePath}`,
                            'utf8'
                        )
                    );
                    await environment
                        .httpRequest('post', '/api/exercise')
                        .send(exercise)
                        .expect(201);
                },
                120_000
            );
        });
    });
});
