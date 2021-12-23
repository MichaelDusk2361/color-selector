import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ColorSelectorComponent } from './color-selector/color-selector.component';
import { InputService } from './input.service';
import { RgbToStringPipe } from './rgb-to-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ColorSelectorComponent,
    RgbToStringPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [RgbToStringPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
