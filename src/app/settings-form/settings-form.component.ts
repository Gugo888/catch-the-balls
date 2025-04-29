import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { GameSettings } from '../shared/models/game.model';
import { debounceTime } from 'rxjs';
@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
})

export class SettingsFormComponent {
  @Output() startGame = new EventEmitter<GameSettings>();
  @Output() settingsChanged = new EventEmitter<GameSettings>();

  settingsForm!: FormGroup;
  startClicked: boolean = false

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      fallingSpeed: [null, [Validators.required, Validators.min(1), integerValidator]],
      fallingFrequency: [null, [Validators.required, Validators.min(100), integerValidator]],
      playerSpeed: [null, [Validators.required, Validators.min(1), integerValidator]],
      gameTime: [30, [Validators.required, Validators.min(1), integerValidator]],
    });

    this.settingsForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.settingsChanged.emit(value);
    });
  }

  allowOnlyPositiveIntegers(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'
    ];
    const isNumberKey = /^[0-9]$/.test(event.key);
  
    if (!isNumberKey && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      this.startClicked = true;
      this.startGame.emit(this.settingsForm.value);
    }
  }
}

function integerValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value !== null && !Number.isInteger(control.value)) {
    return { notInteger: true };
  }
  return null;
}