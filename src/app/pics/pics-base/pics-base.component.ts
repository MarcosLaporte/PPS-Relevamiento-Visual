import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { BuildingPicture, User } from 'src/app/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal, ToastError, ToastSuccess } from 'src/app/utils';
import { ModalController, NavController } from '@ionic/angular';
import { ChartComponent } from '../chart/chart.component';
import { ChartType } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';

const datePipe = new DatePipe('en-US', '-0300');
@Component({
  selector: 'app-pics-base',
  templateUrl: './pics-base.component.html',
  styleUrls: ['./pics-base.component.scss'],
})
export class PicsBaseComponent implements OnInit {
  @Input({ required: true }) storageName!: string;
  @Input({ required: true }) newPicPrefix!: string;
  @Input({ required: true }) chartType!: ChartType;
  @Input() showChartLegends: boolean = true;
  pictures: BuildingPicture[] = [];

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private modalCtrl: ModalController,
    public navCtrl: NavController
  ) { }

  async ngOnInit() {
    this.db.listenColChanges<BuildingPicture>(
      this.storageName,
      this.pictures,
      undefined,
      this.sortDateDesc,
      this.timestampParse
    );

    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }
  readonly sortDateDesc = (pic1: BuildingPicture, pic2: BuildingPicture) => pic1.date > pic2.date ? -1 : 1

  /* private readonly filterBuildingPictures = (pic: BuildingPicture) => {
    const picDate = new Date(pic.date);
    picDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return picDate === today;
  } */

  private readonly timestampParse = async (pic: BuildingPicture) => {
    pic.date = pic.date instanceof Timestamp ? pic.date.toDate() : pic.date;
    return pic;
  }

  takePic() {
    (document as any).getElementById("file-upload").click();
  }

  async setImage(ev: any) {
    const auxFiles: File[] = [...ev.target.files];
    if (auxFiles.length < 1) return;

    for (const file of auxFiles) {
      if (!file.type.startsWith('image')) {
        await MySwal.fire('Algo salió mal.', `El archivo ${file.name} no es de tipo imagen.`, 'error');
        return;
      }

      await this.uploadPicture(file);
    };
  }

  async uploadPicture(image: File) {
    this.spinner.show();

    const datetime: Date = new Date();
    const dateStr: string = datePipe.transform(datetime, 'yyyyMMdd-HHmmss')!;
    const picName: string = `${this.auth.UserInSession!.name}-${this.auth.UserInSession!.lastname}-${dateStr}`;

    try {
      const url = await this.storage.uploadImage(image, `${this.storageName}/${this.newPicPrefix}-${picName}`);
      const buildingPic: BuildingPicture = {
        id: '',
        name: picName,
        authorDocId: this.auth.UserInSession!.id,
        author: `${this.auth.UserInSession!.name} ${this.auth.UserInSession!.lastname}`,
        votes: [],
        date: datetime,
        url: url
      };
      await this.db.addData(this.storageName, buildingPic, true);
      this.spinner.hide();
      ToastSuccess.fire('Imagen subida con éxito!');
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Hubo un problema al subir la imagen.');
    }
  }

  async openChartModal() {
    const pics = this.pictures.filter((pic) => pic.votes.length > 0);
    const chartDataLabels: string[] | string[][] = pics.map((pic) => pic.name);
    const chartDataDatasetData: number[] = pics.map((pic) => pic.votes.length);

    const modal = await this.modalCtrl.create({
      component: ChartComponent,
      componentProps: {
        pictures: pics,
        // width: ,
        // height: ,
        chartId: this.storageName,
        chartType: this.chartType,
        chartData: {
          labels: chartDataLabels,
          datasets: [{
            data: chartDataDatasetData
          }]
        },
        showLegends: this.showChartLegends,
        chartOptions: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              align: 'start',
            }
          }
        },
      },
    });
    modal.present();
  }
}
