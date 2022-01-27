import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { JoinExerciseComponent } from './components/join-exercise/join-exercise.component';

const routes: Routes = [
    { path: 'join/:exerciseId', component: JoinExerciseComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
