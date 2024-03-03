import { Injectable } from '@angular/core';
import { GameModel, LocalStorageModel } from '../models/localStorageModel';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  get(): LocalStorageModel {
    const item = localStorage.getItem('app');
    const localStorageModel = new LocalStorageModel();

    if (item) {
      const data = JSON.parse(item);

      localStorageModel.stats.totalGame = data.stats.totalGame;
      localStorageModel.stats.totalWin = data.stats.totalWin;
      localStorageModel.stats.winStreak = data.stats.winStreak;

      data.games.forEach((gameData: any) => {
        const game = new GameModel(new Date(gameData.date));
        gameData.attempts.forEach((attempt: string[]) => {
          game.addAttempt(attempt);
        });
        game.status = gameData.status;
        localStorageModel.games.push(game);
      });
    }

    return localStorageModel;
  }

  save(model: LocalStorageModel) {
    localStorage.setItem('app', JSON.stringify(model));
  }
}
