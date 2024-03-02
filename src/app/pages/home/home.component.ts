import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageModel } from '../../models/localStorageModel';
import { CryptoService } from '../../services/crypto.service';
import { LocalStorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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
    fb: FormBuilder,
    cryptoService: CryptoService,
    private service: LocalStorageService
  ) {
    if (router.url.includes('friend')) {
      this.enableLocalStorage = false;
      const code = route.snapshot.queryParamMap.get('code');
      if (!code) router.navigate(['/']);

      this.answer = cryptoService.decrypt(code!);
    } else {
      const currentDate = new Date();
      let year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1;
      let day = currentDate.getDate();

      // if (router.url.includes('previous')) {
      //   year = Number(route.snapshot.paramMap.get('year'));
      //   month = Number(route.snapshot.paramMap.get('month'));
      //   day = Number(route.snapshot.paramMap.get('day'));
      // }

      this.setAnswer(year, month, day);
      if (this.enableLocalStorage) this.localStorageModel = this.service.get();
    }
  }

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.enableLocalStorage) {
      if (this.localStorageModel!.stats.lastGame != today.toISOString()) {
        this.localStorageModel!.stats.totalGame += 1;
        this.localStorageModel!.stats.lastGame = today.toISOString();
        this.localStorageModel!.tries = [];
        this.service.save(this.localStorageModel!);
      }

      this.localStorageModel!.tries.forEach((curtry) => {
        this.checkAnswer(curtry.join(''));
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: any): boolean {
    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        this.numbers[this.inputOnFocus] = '';
        break;
      case 'Tab':
        this.nextFocus(this.inputOnFocus);
        return false;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.numbers[this.inputOnFocus] = event.key;
          this.nextFocus(this.inputOnFocus);
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

    this.nextFocus(this.inputOnFocus);
  }

  protected nextFocus(currentElement: string) {
    const keys = Object.keys(this.numbers);
    const currentIndex = keys.indexOf(currentElement);
    const nextIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
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
        this.localStorageModel!.tries.push(values);
        if (this.correct) {
          this.localStorageModel!.stats.totalWin += 1;
        }
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
    const value =
      (this.localStorageModel!.stats.totalWin /
        this.localStorageModel!.stats.totalGame) *
      100;

    return value.toFixed(0);
  }

  goToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
