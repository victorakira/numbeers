import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected answer = '';

  protected tries: {
    numbers: string[];
    correctPositionCount: number;
    wrongPositionCount: number;
  }[] = [];

  protected inputOnFocus: string = 'number1';
  protected correct: boolean = false;
  protected submitted: boolean = false;
  protected formGroup: FormGroup;

  constructor(
    private el: ElementRef,
    route: ActivatedRoute,
    router: Router,
    fb: FormBuilder
  ) {
    this.formGroup = fb.group({
      number1: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number2: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number3: fb.control('', [Validators.required, Validators.maxLength(1)]),
      number4: fb.control('', [Validators.required, Validators.maxLength(1)]),
    });

    const currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();

    if (router.url.includes('previous')) {
      year = Number(route.snapshot.paramMap.get('year'));
      month = Number(route.snapshot.paramMap.get('month'));
      day = Number(route.snapshot.paramMap.get('day'));
    }

    this.setAnswer(year, month, day);
  }

  protected onKeyDown(event: any): boolean {
    const controlName = this.inputOnFocus;

    switch (event.key) {
      case 'Backspace':
        this.formGroup.controls[controlName].reset();
        break;
      case 'Tab':
        this.nextFocus(controlName);
        break;
      case 'Enter':
        return true;
      default:
        if (!isNaN(Number(event.key))) {
          this.formGroup.controls[controlName].setValue(event.key);
          this.nextFocus(controlName);
          return true;
        }
    }

    return false;
  }

  protected inputClick(controlName: string) {
    this.inputOnFocus = controlName;
  }

  protected buttonClick(value: string) {
    const controlName = this.inputOnFocus;

    this.formGroup.controls[controlName].setValue(value);

    this.nextFocus(controlName);
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
    console.log(this.answer);
  }

  private checkAnswer(currentAnswer: string): boolean {
    const currentTry: {
      numbers: string[];
      correctPositionCount: number;
      wrongPositionCount: number;
    } = {
      numbers: currentAnswer.split(''),
      correctPositionCount: 0,
      wrongPositionCount: 0,
    };

    const counter: { [id: string]: number } = {
      '0': this.answer.split('0').length - 1,
      '1': this.answer.split('1').length - 1,
      '2': this.answer.split('2').length - 1,
      '3': this.answer.split('3').length - 1,
      '4': this.answer.split('4').length - 1,
      '5': this.answer.split('5').length - 1,
      '6': this.answer.split('6').length - 1,
      '7': this.answer.split('7').length - 1,
      '8': this.answer.split('8').length - 1,
      '9': this.answer.split('9').length - 1,
    };

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

      if (this.answer.includes(current)) currentTry.wrongPositionCount += 1;
    }

    this.tries.push(currentTry);

    return this.answer.length === currentTry.correctPositionCount;
  }

  protected isValid(fieldName: string): boolean {
    return this.formGroup.controls[fieldName].valid;
  }

  protected send() {
    this.submitted = true;
    if (this.formGroup.valid) {
      const values = Object.values(this.formGroup.value);
      this.correct = this.checkAnswer(values.join(''));

      this.submitted = false;
      this.formGroup.reset();
      this.inputOnFocus = 'number1';
      setTimeout(() => {
        this.goToBottom();
      }, 100);
    }
  }

  goToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
