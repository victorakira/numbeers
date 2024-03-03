export class LocalStorageModel {
  games: GameModel[] = [];
  stats: StatsModel = new StatsModel();

  addGame(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const game = this.getGame(date);

    if (!game) {
      this.stats.AddTotalGame();

      const game = new GameModel(date);
      this.games.push(game);
    }
  }

  addAttemp(attemp: string[], date: Date) {
    const indexToUpdate = this.games.findIndex(
      (x) => x.date.getTime() === date.getTime()
    );

    this.games[indexToUpdate].addAttempt(attemp);
  }

  win(date: Date) {
    this.stats.win();

    const indexToUpdate = this.games.findIndex(
      (x) => x.date.getTime() === date.getTime()
    );

    this.games[indexToUpdate].win();
  }

  getGame(date: Date): GameModel | undefined {
    const game = this.games.find((x) => x.date.getTime() === date.getTime());

    return game;
  }
}

export class StatsModel {
  totalGame: number = 0;
  totalWin: number = 0;
  winStreak: number = 0;

  public AddTotalGame() {
    this.totalGame += 1;
  }

  public win() {
    this.totalWin += 1;
  }
}

export class GameModel {
  constructor(date: Date) {
    date.setHours(0, 0, 0, 0);
    this.date = date;
  }

  date: Date;
  attempts: string[][] = [];
  status: GameStatus = GameStatus.started;

  public get totalAttempts(): number {
    return this.attempts.length;
  }

  addAttempt(attempt: string[]) {
    this.attempts.push(attempt);
  }

  win() {
    this.status = GameStatus.won;
  }
}

export enum GameStatus {
  started,
  won,
}
