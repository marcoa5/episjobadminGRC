import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { BackService }  from '../../serv/back.service'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard'
import { HttpClient } from '@angular/common/http';
import { MakeidService } from 'src/app/serv/makeid.service';

@Component({
  selector: 'episjob-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  filtro:any=''
  customers:any[]=[];
  _customers:any[]=[];
  pos:string='';
  ind:number=0
  custSales:string[]=[]
  rigSn:string[]=[]
  subsList:Subscription[]=[]

  constructor(private http:HttpClient, public router: Router, public bak:BackService, private auth: AuthServiceService, private clip: Clipboard, private makeid: MakeidService) {
    
  }

  ngOnInit() {
    this.subsList.push(
      this.auth._userData.subscribe(a=>{
        this.pos=a.Pos
        this.ind=a.Area?.toString()
      }),
      this.auth._customers.subscribe(a=>{
        setTimeout(() => {
          this.customers=a
        }, 1);
      })
    )
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{a.unsubscribe()})
  }

  open(a: String, b:string, c:string, d:string, e:any){
    if(e.ctrlKey){
      this.clip.copy(`${a}\n${b}\n${c}`)
    } else {
      if(navigator.onLine) this.router.navigate(['cliente',{id:d}])
    }
  }

  
  back(){
    this.bak.backP()
  }

  filter(a:any){
    this.filtro=a
  }  

}
