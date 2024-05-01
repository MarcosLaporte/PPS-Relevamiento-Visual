import { Component, Input, OnInit, inject, } from '@angular/core';
import { BuildingPicture, User } from 'src/app/interfaces';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ToastError, ToastSuccess } from 'src/app/utils';

@Component({
  selector: 'app-chosen-pic',
  templateUrl: './chosen-pic.component.html',
  styleUrls: ['./chosen-pic.component.scss'],
})
export class ChosenPicComponent implements OnInit {
  @Input({ required: true }) picture!: BuildingPicture;
  @Input({ required: true }) dbColPath!: string;
  user: User;
  userVoted: boolean = false;

  constructor(private modalCtrl: ModalController, private db: DatabaseService, private spinner: SpinnerService) {
    this.user = inject(AuthService).UserInSession!;
  }

  ngOnInit() {
    this.userVoted = this.picture.votes.includes(this.user.id);
  }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async vote(vote: boolean) {
    if (vote)
      this.picture.votes.push(this.user.id);
    else {
      const index = this.picture.votes.findIndex(id => id === this.user.id);
      this.picture.votes.splice(index, 1);
    }

    try {
      this.spinner.show = true;
      await this.db.updateDoc(this.dbColPath, this.picture.id, { votes: this.picture.votes });
      this.userVoted = !this.userVoted;
      this.spinner.show = false;
      ToastSuccess.fire('Su voto ha sido actualizado!');
      this.close();
    } catch (error: any) {
      this.spinner.show = false;
      ToastError.fire('Ups! Algo salió mal. Intente de nuevo.', error.message);
    }

  }
}
