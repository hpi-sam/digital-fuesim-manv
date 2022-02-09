import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { LandingPageComponent } from './landing-page/landing-page.component';

@NgModule({
    declarations: [LandingPageComponent],
    imports: [CommonModule, FormsModule],
    exports: [LandingPageComponent],
})
export class LandingPageModule {}
