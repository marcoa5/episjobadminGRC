import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import firebase from 'firebase/app'
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { DeldialogComponent } from '../deldialog/deldialog.component';
import { MakeidService } from 'src/app/serv/makeid.service';
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import { TechniciansComponent } from 'src/app/comp/technicians/technicians.component';
import { of, Subscription } from 'rxjs';
import { AlertComponent } from '../alert/alert.component';

export interface co{
  id: string
  custName: string
}

@Component({
  selector: 'episjob-newcontact',
  templateUrl: './newcontact.component.html',
  styleUrls: ['./newcontact.component.scss']
})
export class NewcontactComponent implements OnInit {
  id:string=''
  newCont!:FormGroup
  
  oldName:string=''
  comp:any[]=[]
  contId:string=''
  rigs:any[]=[]
  subsList:Subscription[]=[]
  constructor(private auth:AuthServiceService, private makeid:MakeidService, public dialogRef: MatDialogRef<NewcontactComponent>, @Inject(MAT_DIALOG_DATA) public data: any,public fb: FormBuilder, public dialog: MatDialog) {
    this.id=data.id? data.id: data.info.id
    this.newCont=fb.group({
      name: ['',Validators.required],
      pos: ['',Validators.required],
      phone: ['',[Validators.required, Validators.pattern]],
      mail: ['',[Validators.required, Validators.email]],
    })
  }

  ngOnInit(): void {
    console.log(this.data)
    this.subsList.push(
      this.auth._fleet.subscribe(a=>{if(a) this.rigs=a})
    )
    if(this.data.info!=undefined || this.data.info!=null){
      this.oldName=this.data.info.name
      this.newCont.controls.name.setValue(this.data.info.name)
      this.newCont.controls.pos.setValue(this.data.info.pos)
      this.newCont.controls.phone.setValue(this.data.info.phone)
      this.newCont.controls.mail.setValue(this.data.info.mail)
      this.contId=this.data.info.contId
    }
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{a.unsubscribe()})
  }

  onNoClick(){
    this.dialogRef.close()
  }

  addContact(){
    if(this.data.type=='new') this.contId=this.makeid.makeId(5)
    let dat={
      name: this.newCont.controls.name.value,
      pos: this.newCont.controls.pos.value,
      phone: this.newCont.controls.phone.value,
      mail: this.newCont.controls.mail.value,
      custId:this.id,
      contId: this.contId
    }
    let check:boolean=false
    firebase.database().ref('CustContacts').child(this.id).once('value',a=>{
      a.forEach(b=>{
        if(b.val().name==dat.name) check =true
      })
    })
    .then(()=>{
      if(check && this.data.typ=='new'){
        const al = this.dialog.open(AlertComponent, {data: dat.name})
      }else{
        firebase.database().ref('CustContacts').child(this.id).child(dat.contId).set(dat)
        .then(()=>{
          this.dialogRef.close('created')
          this.auth.getContact()
        })
      }
    })
  }

  delete(){
    const dialogconf = new MatDialogConfig();
    dialogconf.disableClose=false;
    dialogconf.autoFocus=false;
    const dialogRef = this.dialog.open(DeldialogComponent, {
      data: {name: this.oldName, id:this.id, contId:this.contId}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result!=undefined) {
        firebase.database().ref('CustContacts').child(result.id).child(result.contId).remove()
        .then(()=>{
          let b = []
          b= this.rigs.filter((d:any)=>{
            return d.custid==this.data.info.custId
          }).map(c=>{return c.sn})
          b.forEach(y=>{
            try{
              firebase.database().ref('shipTo').child(y).child('cont').child(this.data.info.contId).remove()
            } catch{
            }
          })
          this.dialogRef.close('deleted')
        })
        .catch(err=>{console.log('Unable to delete, ' + err)})
      }
    })
  }

}
