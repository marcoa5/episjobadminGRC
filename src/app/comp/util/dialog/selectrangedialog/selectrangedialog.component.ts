import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CheckwidthService } from 'src/app/serv/checkwidth.service';

@Component({
  selector: 'episjob-selectrangedialog',
  templateUrl: './selectrangedialog.component.html',
  styleUrls: ['./selectrangedialog.component.scss']
})
export class SelectrangedialogComponent implements OnInit {
  range= new FormGroup({
    start:new FormControl(),
    end : new FormControl()
  })
  
  constructor(private ch:CheckwidthService, private dialogRef:MatDialogRef<SelectrangedialogComponent>,@Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit(): void {
  }

  onNoClick(){
    this.dialogRef.close()
  }

  chW(){
    return this.ch.isTouch()
  }
}
