import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BuildingPicture } from 'src/app/interfaces';
import { ChosenPicComponent } from '../chosen-pic/chosen-pic.component';

@Component({
  selector: 'app-pic-list',
  templateUrl: './pic-list.component.html',
  styleUrls: ['./pic-list.component.scss'],
})
export class PicListComponent implements OnInit {
  @Input({ required: true }) storageName!: string;
  @Input({ required: true }) pictures: BuildingPicture[] = [];
  @Input() sortFunc?: (a: any, b: any) => number;
  @Input() allowPictureModal: boolean = true;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.sortFunc) this.pictures.sort(this.sortFunc)
  }

  async openPicModal(picture: BuildingPicture) {
    const modal = await this.modalCtrl.create({
      component: ChosenPicComponent,
      componentProps: { picture: picture, dbColPath: this.storageName },
    });
    modal.present();
  }
}
