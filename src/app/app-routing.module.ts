import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ShowCryptoStatisticsComponent} from "./show-crypto-statistics/show-crypto-statistics.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'crypto-statistics/dashboard'
  },
  {
    path: 'crypto-statistics/dashboard',
    component: ShowCryptoStatisticsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
