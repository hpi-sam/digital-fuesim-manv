import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import type { AppState } from './state/app.state';
import { PatientsListComponent } from './components/patients-list/patients-list.component';
import { appReducers } from './state/app.reducer';
import { ClientOverviewComponent } from './components/client-overview/client-overview.component';

@NgModule({
    declarations: [
        AppComponent,
        PatientsListComponent,
        ClientOverviewComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        AppRoutingModule,
        StoreModule.forRoot<AppState>(appReducers),
        NgbModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
