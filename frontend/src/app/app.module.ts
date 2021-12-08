import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';
// this enables this option globally
import { enableMapSet } from 'immer';
enableMapSet();

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListViewportsComponent } from './components/list-viewports/list-viewports.component';
import { ExerciseState } from './store/excercise/excercise.state';

@NgModule({
    declarations: [AppComponent, ListViewportsComponent],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        NgxsModule.forRoot([ExerciseState], {
            developmentMode: !environment.production,
            selectorOptions: {
                // in preparation for ngxs@4
                suppressErrors: false,
                injectContainerState: false,
            },
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({
            disabled: environment.production,
        }),
        // NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
