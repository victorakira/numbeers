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
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected answer = '';

  protected listAnswers: {
    numbers: string[];
    correctNumberCount: number;
    correctPositionCount: number;
    wrongPositionCount: number;
  }[] = [];

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
    const controlName = event.target?.getAttribute('formControlName');

    if (event.key === 'Tab' || event.key === 'Enter') {
      return true;
    }

    if (event.key === 'Backspace') {
      this.formGroup.controls[controlName].reset();
      return true;
    }

    if (!isNaN(Number(event.key))) {
      this.formGroup.controls[controlName].setValue(event.key);
      setTimeout(() => {
        this.nextFocus(controlName);
      }, 100);
      return true;
    }

    return false;
  }

  protected nextFocus(currentElement: string) {
    const keys = Object.keys(this.formGroup.controls);
    const currentIndex = keys.indexOf(currentElement);
    const nextIndex = currentIndex + 1 > keys.length - 1 ? 0 : currentIndex + 1;
    const nextKey = keys[nextIndex];

    const inputs = this.el.nativeElement.querySelectorAll(
      `[formControlName="${nextKey}"]`
    );
    if (inputs.length > 0) {
      inputs[0].focus();
    }
  }

  private setAnswer(year: number, month: number, day: number) {
    const seed = new Date(year, month - 1, day).getTime();
    const randomNumber = Math.floor(Math.abs(Math.sin(seed) * 10000)) % 10000;
    this.answer = randomNumber.toString();
  }

  private checkAnswer(currentAnswer: string): boolean {
    const result: {
      numbers: string[];
      correctNumberCount: number;
      correctPositionCount: number;
      wrongPositionCount: number;
    } = {
      numbers: [],
      correctNumberCount: 0,
      correctPositionCount: 0,
      wrongPositionCount: 0,
    };

    for (let index = 0; index < currentAnswer.length; index++) {
      const current = currentAnswer[index];

      result.numbers.push(current);

      const exist = this.answer.indexOf(current) >= 0;
      if (exist) result.correctNumberCount = result.correctNumberCount + 1;

      if (current === this.answer[index])
        result.correctPositionCount = result.correctPositionCount + 1;
      else if (exist) result.wrongPositionCount = result.wrongPositionCount + 1;
    }

    this.listAnswers.push(result);

    return result.correctNumberCount === result.correctPositionCount;
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
    }
  }
}
