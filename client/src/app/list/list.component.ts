import { Component, OnInit } from '@angular/core';

import { Position } from '../position';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  public listData: Position[];

  constructor() {
    this.listData = [];
   }

  ngOnInit() {
  }

}
