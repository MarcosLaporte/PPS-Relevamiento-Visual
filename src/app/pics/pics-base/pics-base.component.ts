import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { BuildingPicture, User } from 'src/app/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { StorageService } from 'src/app/services/storage.service';
import { MySwal } from 'src/app/utils';

const datePipe = new DatePipe('en-US', '-0300');
@Component({
  selector: 'app-pics-base',
  templateUrl: './pics-base.component.html',
  styleUrls: ['./pics-base.component.scss'],
})
export class PicsBaseComponent implements OnInit {
  @Input({ required: true }) storageName!: string;
  @Input({ required: true }) newPicPrefix!: string;
  pictures: BuildingPicture[] = [];

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private auth: AuthService,
    private spinner: SpinnerService
  ) { }

  async ngOnInit() {
    this.db.listenColChanges<BuildingPicture>(
      this.storageName,
      this.pictures,
      undefined,
      (pic1: BuildingPicture, pic2: BuildingPicture) => pic1.date > pic2.date ? -1 : 1,
      this.timestampParse
    );

    this.spinner.show = true;
    setTimeout(() => {
      console.log(this.pictures);
      this.spinner.show = false;
    }, 3000);
  }

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

  setImage(ev: any) {
    let auxFile: File = ev.target.files[0];

    if (!auxFile || !auxFile.type.startsWith('image')) {
      MySwal.fire('Algo salió mal.', 'Debe elegir un archivo de tipo imagen.', 'error');
      return;
    }

    this.uploadPicture(auxFile);
  }

  async uploadPicture(image: File) {
    this.spinner.show = true;

    const datetime: Date = new Date();
    const dateStr: string = datePipe.transform(datetime, 'yyyyMMdd-HHmmss')!;
    const picName: string = `${this.auth.UserInSession!.name}-${this.auth.UserInSession!.lastname}-${dateStr}`;

    const url = await this.storage.uploadImage(image, `${this.storageName}/${this.newPicPrefix}-${picName}`);
    const buildingPic: BuildingPicture = {
      id: '',
      name: picName,
      author: `${this.auth.UserInSession!.name} ${this.auth.UserInSession!.lastname}`,
      posVotes: [],
      negVotes: [],
      date: datetime,
      url: url
    };
    await this.db.addData(this.storageName, buildingPic, true);

    this.spinner.show = false;
  }
}
