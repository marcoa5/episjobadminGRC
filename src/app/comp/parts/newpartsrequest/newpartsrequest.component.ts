import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Inject } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import firebase from 'firebase/app'
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import * as moment from 'moment';

@Component({
  selector: 'episjob-newpartsrequest',
  templateUrl: './newpartsrequest.component.html',
  styleUrls: ['./newpartsrequest.component.scss']
})
export class NewpartsrequestComponent implements OnInit {
  newRequest!: FormGroup
  type: any
  rigs:any[]=[]
  _rigs:any[]=[]
  chStr:boolean=true
  details:any[]=[]
  pos:string=''
  technicians:any[]=[]
  subsList:Subscription[]=[]
  tech:any
  nome:string=''
  tId:string=''
  sol:boolean=false
  date:Date|undefined
  @Output() sn=new EventEmitter()
  
  constructor(public fb: FormBuilder, public dialogRef: MatDialogRef<NewpartsrequestComponent>, public auth:AuthServiceService, @Inject(MAT_DIALOG_DATA) public data:any) {
    this.newRequest = fb.group({
      search: ['']
    })
   }

  @ViewChild('sea') sea1!: ElementRef
  
  ngOnInit(): void {
    this.date=new Date()
    this.technicians=[]
    this.tech=undefined
    this.subsList.push(
      this.auth._fleet.subscribe(a=>{
        this._rigs=a; this.rigs=a
        //if(this.rigs && this.data.sn) this.sel(this.rigs.filter(o=>{return o.sn==this.data.sn}))
      }),
      this.auth._userData.subscribe(a=>{
        this.pos=a.Pos
        this.nome=a.Nome + ' ' + a.Cognome
        this.tId=a.uid
      })
    )
    
    if(this.auth.acc('AdminTechRights')){
      firebase.database().ref('Users').once('value',a=>{
        a.forEach(b=>{
          this.technicians.push({name: b.val().Nome + ' ' + b.val().Cognome, id:b.key})
        })
      }).then(()=>{
        this.technicians.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        });
      })
    } else{
      this.technicians=[]
      this.technicians.push({name: this.nome, id:this.tId})
      this.tech=this.nome
    }
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{a.unsubscribe()})
  }

  /*filter(){
    let f=this.newRequest.controls.search.value
    if(f.length<2) {
      this.chStr=true
      this.details=[]
      this.sn.emit('')
    }
    if(f.length>2){
      this.rigs=this._rigs.filter(a=>{
        if(a.sn.toLowerCase().includes(f.toLowerCase()) || a.model.toLowerCase().includes(f.toLowerCase()) || a.customer.toLowerCase().includes(f.toLowerCase())) return true
        return false
      }) 
    } else {
      this.rigs= this._rigs
    }
  }*/

  sel(a:any){
    if(a){
      this.chStr=false
      this.details=[
        {value: a.sn, lab: 'Serial nr.', click:'', url:''},
        {value: a.model, lab: 'Model', click:'', url:''},
        {value: a.customer, lab: 'Customer', click:'', url:''},
      ]
      firebase.database().ref('SOL').child(a.custid).child('sol').once('value',g=>{
        if(g.val()){
          this.sol=g.val()
        } else {
          this.sol= false
        }
      })
      this.sn.emit(a.sn)
    } else {
      this.sol=false
      this.details=[]
    }
  }

  rem(){
    this.newRequest.controls.search.setValue('')
    this.details=[]
    this.chStr=true
    this.rigs=this._rigs
    this.sn.emit('')
    setTimeout(() => {
      this.sea1.nativeElement.focus()
    }, 20);
    
  }

  onNoClick(){
    this.dialogRef.close()
  }

  go(){
    let a = this.details
    let b: string=''
    firebase.database().ref('Users').child(this.tech).once('value',a=>{
      b=a.val().Nome + ' ' + a.val().Cognome
    })
    .then(()=>{
      this.dialogRef.close({sn: a[0].value, model: a[1].value, customer: a[2].value, type: this.type, origId: this.tech, orig:b, author: this.nome, sel:'0', date:moment(this.date).format('YYYY-MM-DD')})
    })
  }

  chPos(a:string):boolean{
    let b:boolean= this.auth.acc(a)
    return b
  }

  chCheck(a:string){
    return this.auth.acc(a)
  }
}
