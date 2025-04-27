import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  @Input() gameSettings: any;

  playerPosition = 200;
  playerWidth = 90;
  gameTime = 30;
  fallingSpeed = 5;
  fallingFrequency = 1000; // Меньше значение — быстрее появляется новый шарик
  timeRemaining = this.gameTime;
  gameOver = false;
  caughtObjects = 0;
  fallingObjects: { x: number, y: number, id: number, color: string }[] = [];
  nextObjectId = 0;

  gameSubscription: Subscription = new Subscription();
  timerSubscription: Subscription = new Subscription();
  objectMoveSubscription: Subscription = new Subscription();

  ngOnInit() {
    if (this.gameSettings) {
      this.startGame();
      window.addEventListener('keydown', this.handlePlayerMovement.bind(this));
    }
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
    this.gameOver = false;
    this.fallingObjects = [];
    this.caughtObjects = 0;
    this.timeRemaining = this.gameTime;

    this.startTimer();
    this.startSpawning();
    this.startObjectMovement();
  }

  startTimer() {
    this.timerSubscription = timer(0, 1000).subscribe(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.endGame();
      }
    });
  }

  startSpawning() {
    const spawnObject$ = timer(0, this.fallingFrequency).pipe(
      switchMap(() => {
        const xPosition = Math.random() * (400 - 20);  // генерируем x, чтобы шарик не выходил за пределы
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
    // Двигаем объекты каждую 1/60 секунды (60 FPS)
    this.objectMoveSubscription = timer(0, 1000 / 60).subscribe(() => {
      if (!this.gameOver) {
        this.moveObjects();
      }
    });
  }

  moveObjects() {
    this.fallingObjects.forEach(object => {
      object.y += this.fallingSpeed;  // Увеличиваем координату y, чтобы объекты падали
    });

    this.checkCollisions();
    this.removeInvisibleObjects();
  }

  checkCollisions() {
    this.fallingObjects = this.fallingObjects.filter(object => {
      const playerLeft = this.playerPosition;
      const playerRight = this.playerPosition + this.playerWidth;

      if (
        object.y >= 350 &&  // Падение на землю
        object.x + 15 >= playerLeft && object.x <= playerRight  // Проверка на ловлю
      ) {
        this.caughtObjects++;
        return false; // Удаляем объект из массива, если он пойман
      }
      return true;
    });
  }

  removeInvisibleObjects() {
    this.fallingObjects = this.fallingObjects.filter(object => object.y <= 400); // Убираем объекты, которые вышли за пределы экрана
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