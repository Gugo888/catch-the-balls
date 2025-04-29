import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { GameStateService } from '../shared/services/game-state.service';
import { GameSettings } from '../shared/models/game.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  @Input() gameSettings!: GameSettings;

  playerPosition: number = 200;
  playerWidth: number = 90;
  
  gameTime: number = 0;
  fallingSpeed: number = 0;
  fallingFrequency: number = 0;

  timeRemaining:number = this.gameTime;
  gameOver: boolean = false;
  caughtObjects: number = 0;
  fallingObjects: { x: number, y: number, id: number, color: string }[] = [];
  nextObjectId:number = 0;

  gameSubscription: Subscription = new Subscription();
  timerSubscription: Subscription = new Subscription();
  objectMoveSubscription: Subscription = new Subscription();

  constructor(private gameStateService: GameStateService) { }

  ngOnInit() {
    if (this.gameSettings) {
      this.startGame();
      window.addEventListener('keydown', this.handlePlayerMovement.bind(this));
    };
    this.gameStateService.gameState$.subscribe(state => {
      this.caughtObjects = state.caughtObjects;
      this.timeRemaining = state.timeRemaining;

      if (this.timeRemaining === 0 && !this.gameOver) {
        this.endGame();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameSettings'] && this.gameSettings) {
      const prevSettings = changes['gameSettings'].previousValue;
      const currentSettings = changes['gameSettings'].currentValue;
  
      if (!prevSettings) return;
  
      if (prevSettings.gameTime !== currentSettings.gameTime) {
        this.endGame();
        this.gameTime = currentSettings.gameTime;
        this.timeRemaining = this.gameTime;
        this.startGame();
        return;
      }
  
      this.fallingSpeed = currentSettings.fallingSpeed || this.fallingSpeed;
      const newFrequency = currentSettings.fallingFrequency || this.fallingFrequency;
      if (newFrequency !== this.fallingFrequency) {
        this.fallingFrequency = newFrequency;
  
        if (this.gameSubscription) {
          this.gameSubscription.unsubscribe();
        }
        if (!this.gameOver) {
          this.startSpawning();
        }
      }
    }
  }

  isGameRunning() {
    return !this.gameOver && this.timeRemaining !== this.gameTime;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  startGame() {
    if (!this.gameSettings) return;
  
    this.gameOver = false;
    this.fallingObjects = [];
    this.caughtObjects = 0;
  
    this.gameTime = this.gameSettings.gameTime;
    this.timeRemaining = this.gameTime;
    this.fallingSpeed = this.gameSettings.fallingSpeed;
    this.fallingFrequency = this.gameSettings.fallingFrequency;
  
    this.gameStateService.startGame(this.gameTime);
  
    this.startSpawning();
    this.startObjectMovement();
  }

  startSpawning() {
    const spawnObject$ = timer(0, this.fallingFrequency).pipe(
      switchMap(() => {
        const xPosition = Math.random() * (400 - 20);
        return of({ x: xPosition, y: 0, id: this.nextObjectId++, color: this.getRandomColor() });
      }),
      takeUntil(timer(this.gameTime * 1000))
    );

    this.gameSubscription = spawnObject$.subscribe(object => {
      if (!this.gameOver) {
        this.fallingObjects.push(object);
      }
    });
  }

  startObjectMovement() {
    this.objectMoveSubscription = timer(0, 1000 / 60).subscribe(() => {
      if (!this.gameOver) {
        this.moveObjects();
      }
    });
  }

  moveObjects() {
    this.fallingObjects.forEach(object => {
      object.y += this.fallingSpeed;
    });

    this.checkCollisions();
    this.removeInvisibleObjects();
  }

  checkCollisions() {
    this.fallingObjects = this.fallingObjects.filter(object => {
      const playerLeft = this.playerPosition;
      const playerRight = this.playerPosition + this.playerWidth;

      if (
        object.y >= 350 &&
        object.x + 15 >= playerLeft && object.x <= playerRight
      ) {
        this.gameStateService.catchObject();
        return false;
      }
      return true;
    });
  }

  removeInvisibleObjects() {
    this.fallingObjects = this.fallingObjects.filter(object => object.y <= 400);
  }

  handlePlayerMovement(event: KeyboardEvent) {
    const step = this.gameSettings?.playerSpeed || 5;

    if (event.key === 'ArrowLeft') {
      this.playerPosition = Math.max(this.playerPosition - step, 0);
    } else if (event.key === 'ArrowRight') {
      this.playerPosition = Math.min(this.playerPosition + step, 400 - this.playerWidth);
    }
  }

  restartGame() {
    this.endGame();
    this.startGame();
  }

  endGame() {
    this.gameOver = true;
    this.gameStateService.stopGame();

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.objectMoveSubscription) {
      this.objectMoveSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.endGame();
    window.removeEventListener('keydown', this.handlePlayerMovement.bind(this));
  }
}