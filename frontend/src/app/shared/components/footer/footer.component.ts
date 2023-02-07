import { Component } from '@angular/core';
import Package from 'package.json';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    version = Package.version;
}
