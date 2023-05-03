import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingPageComponent } from './landing-page/landing-page.component';

@NgModule({
    declarations: [LandingPageComponent],
    imports: [CommonModule, FormsModule, SharedModule, NgbDropdownModule],
    exports: [LandingPageComponent],
})
export class LandingPageModule {}
