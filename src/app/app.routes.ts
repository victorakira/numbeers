import { Routes } from '@angular/router';
import { GenerateNumberComponent } from './pages/generate-number/generate-number.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'friend',
    component: HomeComponent,
  },
  {
    path: 'generate-number',
    component: GenerateNumberComponent,
  },
  // {
  //   path: 'previous/:year/:month/:day',
  //   component: HomeComponent,
  // },
  { path: '**', redirectTo: '/' },
];
