import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hide-off-line',
  templateUrl: './hide-off-line.component.html',
  styleUrls: ['./hide-off-line.component.css']
})
export class HideOffLineComponent implements OnInit {

  @Output() hideOffLine = new EventEmitter<boolean>();
  public hide = false;

  constructor() { }

  ngOnInit() {

  }

  changeHide () {
    this.hideOffLine.emit(this.hide);
  }
}
