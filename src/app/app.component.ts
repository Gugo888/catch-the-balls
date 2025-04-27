import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'catch-the-balls';
  gameStarted = false;
  gameSettings: any;

  startGame(settings: any) {
    console.log(settings,'settings')
    this.gameStarted = true;
    this.gameSettings = settings; // Обновляем настройки игры  }
  }
}