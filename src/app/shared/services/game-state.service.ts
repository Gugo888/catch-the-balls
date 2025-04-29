import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { GameState } from '../models/game.model';


@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private gameStateSubject = new BehaviorSubject<GameState>({ caughtObjects: 0, timeRemaining: 0 });
  gameState$ = this.gameStateSubject.asObservable();

  private gameActive: boolean = false;

  startGame(initialTime: number) {
    this.gameActive = true;
    this.gameStateSubject.next({ caughtObjects: 0, timeRemaining: initialTime });

    interval(1000)
      .pipe(takeWhile(() => this.gameActive))
      .subscribe(() => {
        const currentState = this.gameStateSubject.value;
        if (currentState.timeRemaining > 0) {
          this.gameStateSubject.next({
            ...currentState,
            timeRemaining: currentState.timeRemaining - 1,
          });
        } else {
          this.stopGame();
        }
      });
  }

  catchObject() {
    const currentState = this.gameStateSubject.value;
    this.gameStateSubject.next({
      ...currentState,
      caughtObjects: currentState.caughtObjects + 1,
    });
  }

  stopGame() {
    this.gameActive = false;
  }
}