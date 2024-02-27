export class LocalStorageModel {
  tries: string[][] = [];
  stats: StatsModel = new StatsModel();
}

export class StatsModel {
  lastGame: string = '';
  totalGame: number = 0;
  totalWin: number = 0;
}
