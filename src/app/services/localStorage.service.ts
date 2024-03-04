import { Injectable } from '@angular/core';
import { environment } from '../../environment/enviroment';
import { GameModel, LocalStorageModel } from '../models/localStorageModel';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  key = 'app';

  constructor() {}

  get(): LocalStorageModel {
    const item = localStorage.getItem(this.key);
    const localStorageModel = new LocalStorageModel();

    if (item) {
      const data = JSON.parse(item);

      if (data.version === environment.Version) {
        localStorageModel.stats.totalGame = data.stats.totalGame;
        localStorageModel.stats.totalWin = data.stats.totalWin;
        localStorageModel.version = data.version;

        data.games.forEach((gameData: any) => {
          const game = new GameModel(new Date(gameData.date));
          gameData.attempts.forEach((attempt: string[]) => {
            game.addAttempt(attempt);
          });
          game.status = gameData.status;
          localStorageModel.games.push(game);
        });
      }
    }

    return localStorageModel;
  }

  save(model: LocalStorageModel) {
    localStorage.setItem(this.key, JSON.stringify(model));
  }
}
