import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {

  constructor(private router: Router) {
    setTimeout(() => {
      router.navigateByUrl('home');
      history.pushState(null, '');
    }, 2650);
  }

}
