import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  imports: [CommonModule],
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

  protected numbers: { [name: string]: string } = {
    number1: '',
    number2: '',
    number3: '',
    number4: '',
  };

  protected answer = '';
  protected inputOnFocus: string = 'number1';
  protected correct: boolean = false;
  protected submitted: boolean = false;

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
    this.currentDate.setHours(0, 0, 0, 0);

    if (router.url.includes('friend')) {
      this.enableLocalStorage = false;
      const code = route.snapshot.queryParamMap.get('code');
      if (!code) router.navigate(['/']);

      this.answer = cryptoService.decrypt(code!);
    } else {
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
          router.navigate(['/']);
          return;
        }

        this.currentDate = dateParam;
      }

      let year = this.currentDate.getFullYear();
      let month = this.currentDate.getMonth() + 1;
      let day = this.currentDate.getDate();

      this.setAnswer(year, month, day);
      if (this.enableLocalStorage) this.localStorageModel = this.service.get();
    }
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

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: any): boolean {
    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        this.numbers[this.inputOnFocus] = '';
        break;
      case 'Tab':
        if (event.shiftKey) {
          this.changeFocus(this.inputOnFocus, 'prev');
        } else {
          this.changeFocus(this.inputOnFocus, 'next');
        }
        return false;
      case 'ArrowRight':
        this.changeFocus(this.inputOnFocus, 'next');
        return false;
      case 'ArrowLeft':
        this.changeFocus(this.inputOnFocus, 'prev');
        return false;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.numbers[this.inputOnFocus] = event.key;
          this.changeFocus(this.inputOnFocus, 'next');
        }
        break;
    }

    return true;
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    this.numbers[this.inputOnFocus] = value;

    this.changeFocus(this.inputOnFocus, 'next');
  }

  private changeFocus(currentElement: string, direction: 'next' | 'prev') {
    const keys = Object.keys(this.numbers);
    const currentIndex = keys.indexOf(currentElement);
    let nextIndex = 0;

    if (direction == 'next') {
      nextIndex = (currentIndex + 1) % keys.length;
    } else {
      nextIndex = (currentIndex - 1 + keys.length) % keys.length;
    }

    const nextKey = keys[nextIndex];

    this.inputOnFocus = nextKey;
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

  protected getValue(fieldName: string): string {
    return this.numbers[fieldName];
  }

  protected isValid(fieldName: string): boolean {
    return this.numbers[fieldName] !== '';
  }

  protected send() {
    this.submitted = true;

    const values = Object.values(this.numbers).map((x) => String(x));
    const answer = values.join('');

    if (answer.length === values.length) {
      this.checkAnswer(answer);
      if (this.enableLocalStorage) {
        this.localStorageModel!.addAttemp(values, this.currentDate);

        if (this.correct) this.localStorageModel!.win(this.currentDate);

        this.service.save(this.localStorageModel!);
      }
      this.submitted = false;
      this.clearValues();
      this.inputOnFocus = 'number1';
      setTimeout(() => {
        this.goToBottom();
      }, 100);
    }
  }

  protected clearValues() {
    for (const name in this.numbers) {
      this.numbers[name] = '';
    }
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
    if (this.localStorageModel) {
      const game = this.localStorageModel.getGame(this.currentDate);
      if (game) return game.totalAttempts.toFixed(0);
    }

    return '0';
  }

  protected goToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
