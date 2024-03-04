import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalStorageModel } from '../../models/localStorageModel';
import { LocalStorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-previous-games',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './previous-games.component.html',
  styleUrl: './previous-games.component.scss',
})
export class PreviousGamesComponent {
  currentDate = new Date();
  days: string[] = [];
  protected localStorageModel: LocalStorageModel;

  constructor(service: LocalStorageService) {
    this.generateCalendar();
    this.localStorageModel = service.get();
  }

  protected generateCalendar() {
    this.days = [];

    const firstDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    ).getDay();

    const daysInMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    ).getDate();

    let dayCounter = 1;
    for (let i = 0; i < 42; i++) {
      if (i < firstDayOfMonth || dayCounter > daysInMonth) {
        this.days.push('');
      } else {
        this.days.push(dayCounter.toString());
        dayCounter++;
      }
    }
  }

  protected get month(): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return this.currentDate.toLocaleDateString('en-US', options);
  }

  protected previousMonth() {
    const minDate = new Date(2024, 0, 1);
    const newDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    if (newDate >= minDate) {
      this.currentDate = newDate;
      this.generateCalendar();
    }
  }

  protected nextMonth() {
    const currentDate = new Date();
    const newDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    if (newDate <= currentDate) {
      this.currentDate = newDate;
      this.generateCalendar();
    }
  }

  protected getLink(day: string): any[] | undefined {
    const date = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      parseInt(day)
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() <= today.getTime())
      return [
        '/',
        'game',
        'previous',
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        day,
      ];
    return undefined;
  }

  protected getStatus(day: string): 'won' | 'started' | '' {
    const date = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      parseInt(day)
    );

    const game = this.localStorageModel.getGame(date);

    if (game) {
      return game.status;
    }

    return '';
  }

  protected isEnable(day: string): boolean {
    const date = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      parseInt(day)
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() <= today.getTime();
  }
}
