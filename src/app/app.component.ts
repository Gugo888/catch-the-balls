import { Component } from '@angular/core';
import { GameSettings } from './shared/models/game.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  gameStarted: boolean = false;
  gameSettings!: GameSettings;

  startGame(settings: GameSettings) {
    this.gameSettings = settings;
    this.gameStarted = true;
  }

  updateSettings(settings: GameSettings) {
    if (this.gameStarted) {
      this.gameSettings = settings;
    }
  }

}