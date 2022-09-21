import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'episjob-contractalreadyexistsdialog',
  templateUrl: './contractalreadyexistsdialog.component.html',
  styleUrls: ['./contractalreadyexistsdialog.component.scss']
})
export class ContractalreadyexistsdialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ContractalreadyexistsdialogComponent>, @Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit(): void {
  }

  onNoClick(){
    this.dialogRef.close()
  }

}
