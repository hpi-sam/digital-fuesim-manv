import { Component, Input } from '@angular/core';
import { Hotkey } from '../../services/hotkeys.service';

@Component({
    selector: 'app-hotkey-indicator',
    templateUrl: './hotkey-indicator.component.html',
    styleUrls: ['./hotkey-indicator.component.scss'],
})
export class HotkeyIndicatorComponent {
    @Input() hotkey!: Hotkey;
}
