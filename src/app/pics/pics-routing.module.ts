import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PicsPage } from './pics.page';
import { NicePicsComponent } from './nice-pics/nice-pics.component';
import { UglyPicsComponent } from './ugly-pics/ugly-pics.component';

const routes: Routes = [
  {
    path: '',
    component: PicsPage
  },
  {
    path: 'nice',
    component: NicePicsComponent
  },
  {
    path: 'ugly',
    component: UglyPicsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PicsPageRoutingModule {}
