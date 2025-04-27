import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { GameComponent } from './game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsFormComponent,
    GameComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
