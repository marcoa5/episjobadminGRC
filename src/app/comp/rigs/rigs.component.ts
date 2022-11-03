import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import { GetfleetutilizationService } from 'src/app/serv/getfleetutilization.service';
import { BackService } from '../../serv/back.service'
import firebase from 'firebase/app';

@Component({
  selector: 'episjob-rigs',
  templateUrl: './rigs.component.html',
  styleUrls: ['./rigs.component.scss']
})
export class RigsComponent implements OnInit {
  rigs:any[] =[]
  oldPosition:number=0;
  currentPosition:number=0;
  scrollaV:boolean =true;
  filtro:string=''
  lar:boolean|undefined;
  value:any
  subsList:Subscription[]=[]
  
  
  constructor(private http:HttpClient, private fleetHrs:GetfleetutilizationService, public router: Router, public bak:BackService, public auth: AuthServiceService) {}

  ngOnInit(): void {
    this.subsList.push(
      this.auth._fleet.subscribe(a=>{
        if(a.length>0) {
          setTimeout(() => {
            this.rigs=a
          }, 1);
        }
      })
    )
    this.largh(1)
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{
      a.unsubscribe()
    })
  }

  back(){
    this.bak.backP()
  }

  open(a: String, b:String, c:String, d:any){
    if(d=='0') {
    } else{
      if(navigator.onLine) this.router.navigate(['machine',{sn:b}])
    }
  }

  scrolla(e:Event){
    
    this.currentPosition = window.pageYOffset
    if(this.currentPosition>this.oldPosition){
      this.scrollaV = false
    } else {
      this.scrollaV = true
    }
    this.oldPosition = this.currentPosition
  }

  scrivi(e: any){
    this.filtro=e.target.value.toString()
  }

  largh(e:any){
    if(window.innerWidth>500) {
      this.lar = true
    } else {
      this.lar=false
    }      
  }

  cancella(){
    this.value=''
    this.filtro=''
  }
  
  filter(a:any){
    this.filtro=a
  }

  export(){
    this.fleetHrs.getHRS(this.rigs,false)
  }

  exportDetails(){
    this.fleetHrs.getHRS(this.rigs,true)
  }


  import(e:any){
    let myRe = new FileReader()
    myRe.onloadend = (e)=>{
      let res = myRe.result?.toString()
      let righe = res!.split('\r\n')
      righe.forEach(r=>{
        let da = r.split('\t')
        firebase.database().ref('Hours').child(da[0]).child(da[1]).set({
          orem: da[2]?da[2]:"",
          perc1:da[3]?da[3]:"",
          perc2:da[4]?da[4]:"",
          perc3:da[5]?da[5]:""
        })
      })
    }
    myRe.readAsText(e.target.files[0])
  }
}
