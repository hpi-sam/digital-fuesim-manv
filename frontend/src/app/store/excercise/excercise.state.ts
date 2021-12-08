import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Exercise } from 'digital-fuesim-manv-shared';
import produce from 'immer';
import { ExerciseActions } from './exercise.actions';

export type ExerciseStateModel = Exercise;

@State<ExerciseStateModel>({
    name: 'exercise',
    defaults: new Exercise(),
})
@Injectable()
export class ExerciseState {
    // this is memoized
    @Selector()
    static viewports(state: ExerciseStateModel) {
        return state.viewports;
    }

    @Action(ExerciseActions.AddViewport)
    addViewport(
        { getState, setState }: StateContext<ExerciseStateModel>,
        { viewport }: ExerciseActions.AddViewport
    ) {
        setState(
            produce(getState(), (state) => {
                // this isn't needed thanks to "immer"s produce
                // state.viewports = clone(state.viewports);
                state.viewports.set(viewport.id, viewport);
                return state;
            })
        );
    }
}
