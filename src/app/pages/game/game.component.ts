import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomFormInputComponent } from '../../components/custom-form-input/custom-form-input.component';
import { LocalStorageModel } from '../../models/localStorageModel';
import { CryptoService } from '../../services/crypto.service';
import { LocalStorageService } from '../../services/localStorage.service';
import {
  FieldTranslation,
  TranslationService,
} from '../../services/translation.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, CustomFormInputComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  private currentDate: Date;

  protected tries: {
    numbers: string[];
    correctPositionCount: number;
    wrongPositionCount: number;
  }[] = [];

  protected answer = '';
  protected correct: boolean = false;

  protected localStorageModel: LocalStorageModel | null = null;
  protected enableLocalStorage = true;

  constructor(
    route: ActivatedRoute,
    router: Router,
    cryptoService: CryptoService,
    private service: LocalStorageService,
    private translation: TranslationService
  ) {
    this.currentDate = new Date();

    if (router.url.includes('friend')) {
      this.enableLocalStorage = false;
      const code = route.snapshot.queryParamMap.get('code');
      if (!code) router.navigate(['/']);

      this.answer = cryptoService.decrypt(code!);
      return;
    }

    if (router.url.includes('previous')) {
      const yearParam = route.snapshot.paramMap.get('year');
      const monthParam = route.snapshot.paramMap.get('month');
      const dayParam = route.snapshot.paramMap.get('day');

      if (!yearParam || !monthParam || !dayParam) {
        router.navigate(['/']);
        return;
      }

      const year = parseInt(yearParam!);
      const month = parseInt(monthParam!);
      const day = parseInt(dayParam!);

      const dateParam = new Date(year, month - 1, day, 0, 0, 0, 0);

      if (dateParam.getTime() >= this.currentDate.getTime()) {
        router.navigate(['/', 'game']);
        return;
      }

      this.currentDate = dateParam;
    }

    this.currentDate.setHours(0, 0, 0, 0);
    let year = this.currentDate.getFullYear();
    let month = this.currentDate.getMonth() + 1;
    let day = this.currentDate.getDate();

    this.setAnswer(year, month, day);
    if (this.enableLocalStorage) this.localStorageModel = this.service.get();
  }

  ngOnInit(): void {
    if (this.enableLocalStorage) {
      this.localStorageModel!.addGame(this.currentDate);
      this.service.save(this.localStorageModel!);

      const game = this.localStorageModel!.getGame(this.currentDate);
      if (game)
        game.attempts.forEach((x) => {
          this.checkAnswer(x.join(''));
        });
    }
  }

  translate(field: FieldTranslation, defaultValue: string): string {
    return this.translation.translate(field, defaultValue);
  }

  private setAnswer(year: number, month: number, day: number) {
    const size = 4;
    let seed = new Date(year, month - 1, day).getTime();
    let randomNumber = '';

    while (randomNumber.length < size) {
      const digit = Math.floor(Math.abs(Math.sin(seed++) * 10));
      if (!randomNumber.includes(digit.toString())) {
        randomNumber += digit.toString();
      }
    }
    this.answer = randomNumber;
  }

  private checkAnswer(currentAnswer: string) {
    const currentTry: {
      numbers: string[];
      correctPositionCount: number;
      wrongPositionCount: number;
    } = {
      numbers: currentAnswer.split(''),
      correctPositionCount: 0,
      wrongPositionCount: 0,
    };

    for (let index = 0; index < currentAnswer.length; index++) {
      const current = currentAnswer[index];

      if (this.answer[index] === current) currentTry.correctPositionCount += 1;
      else if (this.answer.includes(current))
        currentTry.wrongPositionCount += 1;
    }

    this.tries.push(currentTry);

    this.correct = this.answer.length === currentTry.correctPositionCount;
  }

  protected send(value: string[]) {
    const answer = value.join('');
    this.checkAnswer(answer);

    if (this.enableLocalStorage) {
      this.localStorageModel!.addAttemp(value, this.currentDate);

      if (this.correct) this.localStorageModel!.win(this.currentDate);

      this.service.save(this.localStorageModel!);
    }

    setTimeout(() => {
      this.goToBottom();
    }, 100);
  }

  protected get winPorcentage(): string {
    if (this.localStorageModel) {
      const value =
        (this.localStorageModel!.stats.totalWin /
          this.localStorageModel!.stats.totalGame) *
        100;

      return value.toFixed(0);
    }
    return '0';
  }

  protected get totalAttempts(): string {
    return this.tries.length.toFixed(0);
  }

  protected get formatedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    const language = this.translation.getLanguage();

    return this.currentDate.toLocaleDateString(language, options);
  }

  protected goToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
