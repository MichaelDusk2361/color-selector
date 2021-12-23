import { Component } from '@angular/core';
import { RGB } from './color-selector/color-selector.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gradient';
  color: RGB = { r: 23, g: 23, b: 23 };
}
