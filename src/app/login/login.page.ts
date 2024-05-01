import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';
import { ToastError, ToastSuccess } from '../utils';
import { SignupPage } from '../signup/signup.page';
import { SpinnerService } from '../services/spinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  protected signupPage = SignupPage

  email: string = "";
  password: string = "";

  constructor(
    private auth: AuthService,
    public navCtrl: NavController,
    private spinner: SpinnerService
  ) { }

  async login() {
    this.spinner.show = true;
    try {
      await this.auth.signInToFirebase(this.email, this.password)

      this.email = "";
      this.password = "";
      ToastSuccess.fire('Operación realizada con éxito.')
      this.navCtrl.navigateBack('/home')
    } catch (error: any) {
      this.spinner.show = false;
      ToastError.fire('Ups! Algo salió mal.', error.message);

    } finally { this.spinner.show = false; }
  }

  quickFill(email: string, pass: string) {
    this.email = email;
    this.password = pass;
  }
}
