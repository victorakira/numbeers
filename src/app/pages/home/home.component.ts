import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageModel } from '../../models/localStorageModel';
import { CryptoService } from '../../services/crypto.service';
import { LocalStorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected tries: {
    numbers: string[];
    correctPositionCount: number;
    wrongPositionCount: number;
  }[] = [];

  protected answer = '';
  protected inputOnFocus: string = 'number1';
  protected correct: boolean = false;
  protected submitted: boolean = false;
  protected formGroup: FormGroup;

  protected localStorageModel: LocalStorageModel | null = null;
  protected enableLocalStorage = true;

  constructor(
    route: ActivatedRoute,
    router: Router,
    fb: FormBuilder,
    cryptoService: CryptoService,
    private service: LocalStorageService
  ) {
    this.formGroup = fb.group({
      number1: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number2: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number3: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number4: fb.control('', [Validators.required, Validators.maxLength(1)]),
    });

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
        this.formGroup.controls[this.inputOnFocus].reset();
        break;
      case 'Tab':
        this.nextFocus(this.inputOnFocus);
        break;
      case 'Enter':
        this.send();
        break;
      default:
        if (!isNaN(Number(event.key))) {
          this.formGroup.controls[this.inputOnFocus].setValue(event.key);
          this.nextFocus(this.inputOnFocus);
          return true;
        }
    }

    return false;
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    this.formGroup.controls[this.inputOnFocus].setValue(value);

    this.nextFocus(this.inputOnFocus);
  }

  protected nextFocus(currentElement: string) {
    const keys = Object.keys(this.formGroup.controls);
    const currentIndex = keys.indexOf(currentElement);
    const nextIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
    const nextKey = keys[nextIndex];

    this.inputOnFocus = nextKey;
  }

  private setAnswer(year: number, month: number, day: number) {
    const seed = new Date(year, month - 1, day).getTime();
    const randomNumber = Math.floor(Math.abs(Math.sin(seed) * 10000)) % 10000;
    this.answer = randomNumber.toString();
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

    const counter: { [id: string]: number } = {};

    for (const num of this.answer) {
      counter[num] = (counter[num] || 0) + 1;
    }

    for (let index = 0; index < currentAnswer.length; index++) {
      const current = currentAnswer[index];

      if (counter[current] <= 0) continue;

      if (current === this.answer[index]) {
        currentTry.correctPositionCount += 1;
        counter[current] -= 1;
      }
    }

    for (let index = 0; index < currentAnswer.length; index++) {
      const current = currentAnswer[index];

      if (counter[current] <= 0) continue;

      if (this.answer.includes(current)) {
        currentTry.wrongPositionCount += 1;
        counter[current] -= 1;
      }
    }

    this.tries.push(currentTry);

    this.correct = this.answer.length === currentTry.correctPositionCount;
  }

  protected isValid(fieldName: string): boolean {
    return this.formGroup.controls[fieldName].valid;
  }

  protected send() {
    this.submitted = true;
    if (this.formGroup.valid) {
      const values = Object.values(this.formGroup.value).map((x) => String(x));
      this.checkAnswer(values.join(''));

      if (this.enableLocalStorage) {
        this.localStorageModel!.tries.push(values);

        if (this.correct) {
          this.localStorageModel!.stats.totalWin += 1;
        }

        this.service.save(this.localStorageModel!);
      }

      this.submitted = false;
      this.formGroup.reset();
      this.inputOnFocus = 'number1';
      setTimeout(() => {
        this.goToBottom();
      }, 100);
    }
  }

  protected get winPorcentage(): string {
    const value =
      (this.localStorageModel!.stats.totalWin /
        this.localStorageModel!.stats.totalGame) *
      100;

    return value.toFixed(2);
  }

  goToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
