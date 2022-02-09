import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HealthPageComponent } from './pages/health/health-page/health-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page/landing-page.component';

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
    },
    {
        path: 'exercises',
        loadChildren: async () =>
            import('./pages/exercises/exercises.module').then(
                (m) => m.ExercisesModule
            ),
    },
    {
        path: 'health',
        component: HealthPageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
