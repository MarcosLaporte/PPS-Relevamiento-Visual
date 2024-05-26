import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { BuildingPicture, User } from 'src/app/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal, ToastError, ToastInfo, ToastSuccess } from 'src/app/utils';
import { ModalController, NavController } from '@ionic/angular';
import { ChartComponent } from '../chart/chart.component';
import { ChartType } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { Camera, CameraResultType } from '@capacitor/camera';

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

  private readonly timestampParse = async (pic: BuildingPicture) => {
    pic.date = pic.date instanceof Timestamp ? pic.date.toDate() : pic.date;
    return pic;
  }

  readonly supportedImageFormats = ['jpg', 'jpeg', 'png'];
  async takePic() {
    try {
      let proceed: boolean = false;
      do {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
        });
        if (!this.supportedImageFormats.includes(image.format))
          throw new Error('El archivo debe ser de formato .JPG, .JPEG ó .PNG');

        this.spinner.show();
        await MySwal.fire({
          text: 'Desea tomar más fotos?',
          imageUrl: image.webPath,
          imageWidth: '75vw',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: true,
          confirmButtonText: 'Sí',
          confirmButtonColor: '#a5dc86',
          showDenyButton: true,
          denyButtonText: 'No',
          denyButtonColor: '#f27474',
          showCancelButton: true,
          cancelButtonText: 'Volver a tomar esta foto',
          cancelButtonColor: '#f0ec0d'
        }).then(async (res) => {
          proceed = !res.isDenied;
          const imgFile = await this.getFileFromUri(image.webPath!, image.format);
          if (!res.isDismissed) this.uploadPicture(imgFile);
        });
      } while (proceed);

    } catch (er: any) {
      if (er.message === 'User cancelled photos app') ToastInfo.fire('Operación cancelada.');
      else await MySwal.fire('Algo salió mal.', er.message, 'error');
      throw er;
    }
  }

  private async getFileFromUri(fileUri: string, fileFormat: string): Promise<File> {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const file = new File([blob], 'photo.jpg', {
      type: 'image/' + fileFormat,
    });
    return file;
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
