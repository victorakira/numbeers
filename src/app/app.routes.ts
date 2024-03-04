import { Routes } from '@angular/router';
import { GameComponent } from './pages/game/game.component';
import { GenerateNumberComponent } from './pages/generate-number/generate-number.component';
import { HomeComponent } from './pages/home/home.component';
import { PreviousGamesComponent } from './pages/previous-games/previous-games.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },

  {
    path: 'generate-number',
    component: GenerateNumberComponent,
  },
  {
    path: 'game',
    component: GameComponent,
    children: [
      { path: 'previous/:year/:month/:day', component: GameComponent },
      { path: 'friend', component: GameComponent },
    ],
  },
  {
    path: 'calendar',
    component: PreviousGamesComponent,
  },
  { path: '**', redirectTo: '/' },
];
