import { Injectable } from '@angular/core';
import { SpinnerTypes } from '@ionic/angular';
import { Color } from '@ionic/core/dist/types/interface';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  show: boolean = false;
  color?: Color;
  duration?: number;
  style?: SpinnerTypes;
}
