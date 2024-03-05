import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FieldTranslation,
  TranslationService,
} from '../../services/translation.service';

@Component({
  selector: 'app-custom-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-form-input.component.html',
  styleUrl: './custom-form-input.component.scss',
})
export class CustomFormInputComponent {
  @Output()
  submit = new EventEmitter<string[]>();

  @ViewChild('inputs')
  divInputs!: ElementRef;

  protected inputOnFocus = 'number1';

  protected numbers: { [name: string]: string } = {
    number1: '',
    number2: '',
    number3: '',
    number4: '',
  };

  constructor(private translation: TranslationService) {}

  protected translate(field: FieldTranslation, defaultValue: string): string {
    return this.translation.translate(field, defaultValue);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeyDown(event: any) {
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
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.changeFocus(this.inputOnFocus, 'next');
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.changeFocus(this.inputOnFocus, 'prev');
        event.preventDefault();
        break;
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
  }

  protected setFocus(fieldName: string) {
    this.inputOnFocus = fieldName;
  }

  protected setValue(value: string) {
    this.numbers[this.inputOnFocus] = value;

    this.changeFocus(this.inputOnFocus, 'next');
  }

  protected clearValues() {
    for (const name in this.numbers) {
      this.numbers[name] = '';
    }
  }

  protected send() {
    if (!this.isFormValid()) {
      this.divInputs.nativeElement.classList.add('animate-shake');
      setTimeout(() => {
        this.divInputs.nativeElement.classList.remove('animate-shake');
      }, 800);

      return;
    }

    const values = Object.values(this.numbers).map((x) => String(x));

    this.setFocus('number1');
    this.clearValues();
    this.submit.emit(values);
  }

  private isFormValid(): boolean {
    for (const name in this.numbers) {
      if (!this.numbers[name]) return false;
    }
    return true;
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
}
