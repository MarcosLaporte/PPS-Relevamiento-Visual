import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BuildingPicture } from 'src/app/interfaces';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  @Input() pictures: BuildingPicture[] = [];

  @Input() width: string = 'auto';
  @Input() height: string = 'auto';

  @Input() chartId: string = 'myChart';
  @Input() chartType: ChartType = 'pie';
  @Input() chartData: ChartData = {
    labels: [],
    datasets: []
  };
  @Input() chartOptions: ChartOptions = {};
  @Input() showLegends: boolean = true;

  sortVotes = (pic1: BuildingPicture, pic2: BuildingPicture) => pic1.votes.length > pic2.votes.length ? -1 : 1
  constructor(private modalCtrl: ModalController) { }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
