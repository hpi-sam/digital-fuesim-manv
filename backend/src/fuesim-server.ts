import express from 'express';
import { PeriodicEventHandler } from './exercise/periodic-events/periodic-event-handler';
import { exerciseMap } from './exercise/exercise-map';
import { ExerciseWebsocketServer } from './exercise/websocket';
import { ExerciseHttpServer } from './exercise/http-server';
import { Config } from './config';
import type { DatabaseService } from './database/services/database-service';
import type { ExerciseWrapper } from './exercise/exercise-wrapper';

export class FuesimServer {
    private readonly _httpServer: ExerciseHttpServer;
    private readonly _websocketServer: ExerciseWebsocketServer;

    private readonly saveTick = async () => {
        const exercisesToSave: ExerciseWrapper[] = [];
        exerciseMap.forEach((exercise, key) => {
            // Only use exercises referenced by their trainer id (8 characters) to not choose the same exercise twice
            if (key.length !== 8) {
                return;
            }
            if (exercise.changedSinceSave) {
                exercisesToSave.push(exercise);
            }
        });
        if (exercisesToSave.length === 0) {
            return;
        }
        await this.databaseService.transaction(async (manager) => {
            const exerciseEntities = await Promise.all(
                exercisesToSave.map(async (exercise) => {
                    exercise.markAsAboutToBeSaved();
                    return exercise.asEntity(false, manager);
                })
            );
            const actionEntities = exerciseEntities.flatMap(
                (exercise) => exercise.actions ?? []
            );
            // First save the exercises...
            await manager.save(exerciseEntities);
            // ...and then the actions
            await manager.save(actionEntities);
            // Re-map database id to instance
            exercisesToSave.forEach((exercise) => {
                if (!exercise.id) {
                    exercise.id = exerciseEntities.find(
                        (entity) => entity.trainerId === exercise.trainerId
                    )?.id;
                }
            });
            exercisesToSave
                .flatMap((exercise) => exercise.temporaryActionHistory)
                .forEach((action) => {
                    if (!action.id) {
                        action.id = actionEntities.find(
                            (entity) =>
                                entity.index === action.index &&
                                entity.exercise.id === action.exercise.id
                        )?.id;
                    }
                });
            exercisesToSave.forEach((exercise) => {
                exercise.markAsSaved();
            });
        });
    };

    private readonly saveTickInterval = 10_000;

    private readonly saveHandler = new PeriodicEventHandler(
        this.saveTick,
        this.saveTickInterval
    );

    // 1 month in minutes
    private readonly keepExerciseTime = 43_800;

    private readonly cleanupTick = async () => {
        exerciseMap.forEach((exercise, key) => {
            // Only use exercises referenced by their trainer id (8 characters) to not choose the same exercise twice
            // TODO: maybe put this `8` for the length of trainerId in some config file
            if (key.length !== 8) {
                return;
            }
            if (
                exercise.ExerciseIsWithoutClients() &&
                Math.floor(
                    (Date.now() - exercise.sinceExerciseWithoutClients) / 60_000
                ) > this.keepExerciseTime
            ) {
                exercise.deleteExercise();
            }
        });
    };

    private readonly cleanupTickInterval = 10_000;

    private readonly cleanupHandler = new PeriodicEventHandler(
        this.cleanupTick,
        this.cleanupTickInterval
    );

    constructor(private readonly databaseService: DatabaseService) {
        const app = express();
        this._websocketServer = new ExerciseWebsocketServer(app);
        this._httpServer = new ExerciseHttpServer(app, databaseService);
        if (Config.useDb) {
            this.saveHandler.start();
        }
        // TODO: create ENV for useCleanup, where the time in minutes/hours is saved
        // 0 would be "disabled"
        // set a viable default value, maybe something like 1 month
        // if(Config.useCleanup > 0) {

        // }
        this.cleanupHandler.start();
    }

    public get websocketServer(): ExerciseWebsocketServer {
        return this._websocketServer;
    }

    public get httpServer(): ExerciseHttpServer {
        return this._httpServer;
    }

    public async destroy() {
        this.httpServer.close();
        this.websocketServer.close();
        this.saveHandler.pause();
        this.cleanupHandler.pause();
        // Save all remaining instances, if it's still possible
        if (this.databaseService.isInitialized) {
            await this.saveTick();
        }
    }
}
