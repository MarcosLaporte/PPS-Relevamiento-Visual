import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PicsPageRoutingModule } from './pics-routing.module';
import { PicsPage } from './pics.page';
import { NicePicsComponent } from './nice-pics/nice-pics.component';
import { UglyPicsComponent } from './ugly-pics/ugly-pics.component';
import { PicsBaseComponent } from './pics-base/pics-base.component';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ChosenPicComponent } from './chosen-pic/chosen-pic.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PicsPageRoutingModule,
    InfiniteScrollModule,
  ],
  declarations: [
    PicsPage,
    NicePicsComponent,
    UglyPicsComponent,
    PicsBaseComponent,
    ChosenPicComponent,
  ]
})
export class PicsPageModule { }
