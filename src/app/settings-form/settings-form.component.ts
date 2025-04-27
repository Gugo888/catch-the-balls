import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss']
})
export class SettingsFormComponent {
  settingsForm!: FormGroup;
  @Output() startGame = new EventEmitter<void>();
  
  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      fallingSpeed: [null, [Validators.required, Validators.min(1)]], // Скорость падения объектов
      fallingFrequency: [null, [Validators.required, Validators.min(100)]], // Частота появления объектов
      playerSpeed: [null, [Validators.required, Validators.min(1)]], // Скорость игрока
      gameTime: [30, [Validators.required, Validators.min(1)]], // Время игры
    });
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      // Отправляем событие, чтобы начать игру
      console.log(123123132)
      this.startGame.emit(this.settingsForm.value);
    }
  }
}
