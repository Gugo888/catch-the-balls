export interface GameSettings {
   fallingSpeed: number;
   fallingFrequency: number;
   playerSpeed: number;
   gameTime: number;
}

export interface GameState {
   caughtObjects: number;
   timeRemaining: number;
}