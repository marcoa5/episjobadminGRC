import { Component, ElementRef, enableProdMode, isDevMode, OnInit, ViewChild } from '@angular/core';
import firebase from 'firebase/app'
import 'firebase/database'
import * as moment from 'moment'
import { HttpClient, HttpParams } from '@angular/common/http'
import {Clipboard} from '@angular/cdk/clipboard';
import {Sort} from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'episjob-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  str:string=''
  certiqN:any
  filt:boolean=true
  contT:ElementRef|undefined
  rigs:any[]=[]
  mac: any
  length:number=0
  ch:number=0
  isThinking: boolean=false
  _machineData:any=[]
  machineData:any=[]
  isMobile:boolean=true
  isAsc:boolean=true
  errore:string=''
  pos:string=''
  sortedData:any[]=[]
  _sortedData:any[]=[]
  displayedColumns:any=['Serial Number', 'Model','Company','Site','Engine Hrs','Service Int','Hours to next service','.', 'Service pred date','Prev working day hours' ]
  allow:boolean=false
  info:any[]=[/*{
    "machineItemNumber": "8992009970",
    "machineCompany": "Manfredi Technique srl (Cave Gioia)",
    "machineSite": "Carrara",
    "machineModel": "FlexiROC D50 -10SF",
    "machineSerialNr": "TMG16SED0091",
    "LastDayEngineHours": 0,
    "serviceStep": "250 (A-250)",
    "hoursLeftToService": 250,
    "servicePredictedDate": "2018-12-03T23:56:06Z",
    "machineHrs": 0,
    "machineNote": "1"
},
{
  "machineItemNumber": "8992009970",
  "machineCompany": "Manfredi Technique srl (Cave Gioia)",
  "machineSite": "Carrara",
  "machineModel": "FlexiROC D50 -10SF",
  "machineSerialNr": "TMG16SED0091",
  "LastDayEngineHours": 0,
  "serviceStep": "250 (A-250)",
  "hoursLeftToService": 250,
  "servicePredictedDate": "2018-12-03T23:56:06Z",
  "machineHrs": 0,
  "machineNote": "1"
},*/]
  allSpin:boolean=true
  strSea:string=''
  subsList:Subscription[]=[]

  constructor(private auth: AuthServiceService, private http: HttpClient, private clip: Clipboard, public route:ActivatedRoute) {
  }

  ngOnInit(): void {
    this.onResize()
    this.subsList.push(
      this.auth._userData.subscribe(a=>{
        this.pos=a.Pos
        setTimeout(() => {
          this.allow=this.auth.allow('SU',this.pos)
        }, 1);
        this.allSpin=false
      })
    )
    this.sortedData=this.info.slice()
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{a.unsubscribe()})
  }

  certiq(){
    if(!this.isMobile){
    this.info=[]
    this.sortedData=[]
    this.isThinking=true
    let params = new HttpParams().set("day",moment(this.chD()).format('YYYY-MM-DD'))
    let url:string = environment.url
    
    this.http.get(url + 'certiq',{params:params}).subscribe(a=> {
      if(a){
        let b = Object.values(a)
        let d=b.filter(el=>{
          if(el.machineSerialNr!=undefined) return el
          return false
        })
        d.map((fa: any)=>{
          if(fa.serviceStep>0) fa.machineHrs = fa.serviceStep - fa.hoursLeftToService
          if(fa.serviceStep % 1500==0) {
            fa.serviceStep += ' (C-1500)'
          } else if(fa.serviceStep % 500==0) {
            fa.serviceStep += ' (B-500)'
          } else if(fa.serviceStep % 250==0) {
            fa.serviceStep  += ' (A-250)'
          } else {
            fa.serviceStepABC = ''
          }
        })
        this.info=d.slice()
        this.isThinking=false
        
        firebase.database().ref('Certiq/notes').on('value',df=>{
          this.certiqN=df.val()
        })
        setTimeout(() => {
          this.info.forEach((de:any)=>{
            if(this.certiqN[de.machineSerialNr]) {
              de.machineNote = this.certiqN[de.machineSerialNr].note
            } else {
              de.machineNote = 1
            }
          })
        }, 200);
        setTimeout(() => {
          this.sortedData=this.info.slice()
        }, 500);
      }
    },
    error =>{
      this.errore= `Data not available. ${error.message}`
      console.log(error)
    }
  )}   
  }

  onResize(){
    if(window.innerWidth<100) {
      this.isMobile=true
    } else {
      this.isMobile=false
    }
  }
  
  sfondo(a:any){
    if(a<=50) return 'backCR'
    if(a>50 && a<=100) return 'backCY'
    if(a>100) return 'backCG'
    return ''
  }

  sortData(sort: Sort) {
    const data = this.sortedData;
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a:any, b:any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'serial': return compare(a.machineSerialNr, b.machineSerialNr, isAsc);
        case 'model': return compare(a.machineModel, b.machineModel, isAsc);
        case 'company': return compare(a.machineCompany, b.machineCompany, isAsc);
        case 'site': return compare(a.machineSite, b.machineSite, isAsc);
        case 'hrs': return compare(a.machineHrs, b.machineHrs, isAsc);
        case 'step': return compare(a.serviceStep, b.serviceStep, isAsc);
        case 'next': return compare(a.hoursLeftToService, b.hoursLeftToService, isAsc);
        case '.': return compare(a.hoursLeftToService, b.hoursLeftToService, isAsc);
        case 'pred': return compare(a.servicePredictedDate, b.servicePredictedDate, isAsc);
        case 'day': return compare(a.LastDayEngineHours, b.LastDayEngineHours , isAsc);

        default: return 0;
      }
    });
  }

  salva(e:any,b:string){
    this.sortedData.forEach((el: any) => {
      if(el.machineSerialNr==b) el.machineNote=e.target.value
    });
    firebase.database().ref('Certiq').child('notes').child(b).set({
      note: e.target.value
    })
  }

  filtra(r:string){
    r=r.toLowerCase()
    this.strSea = r
    //let r=this.str.toLowerCase()
    if(this.filt && r.length<3){this.sortedData=this.info}
    if(this.filt && r.length>2){
      this.sortedData=this.info.filter((er:any)=>{
        return (er.machineSerialNr.toLowerCase().includes(r) || er.machineCompany.toLowerCase().includes(r) || er.machineModel.toLowerCase().includes(r))
      })
    }
    if(!this.filt && r.length<3){
      this.sortedData=this.info.filter((er:any)=>{return er.machineNote!=1})
    }
    if(!this.filt && r.length>2){
      this.sortedData=this.info.filter((er:any)=>{
        return er.machineNote!=1 && (er.machineSerialNr.toLowerCase().includes(r) || er.machineCompany.toLowerCase().includes(r) || er.machineModel.toLowerCase().includes(r))
      })
    }
  }

  width(){
    if(window.innerWidth<1200) return true
    return false
  }

  chD(): Date{
    let r:boolean=false
    let d: Date=new Date()
    d=new Date(moment(d).add(-1,'days').format('YYYY-MM-DD'))

    do{
      r=dayType(d)
      d=new Date(moment(d).add(-1,'days').format('YYYY-MM-DD'))
    } while (r==false)
    return new Date(moment(d).add(+1,'days').format('YYYY-MM-DD'))
  }

  lastWorkingDay(){
    return moment(this.chD()).format('DD-MM-YY')
  }

  chB(e:any){
    console.log(e)
  }

  chPos(a:string):boolean{
    return this.auth.acc(a)
  }
  
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function dayType(a: any): any{
  let y = parseInt(moment(a).format('YYYY'))
  let holy: string[]=[
    moment(new Date(y, 0,1)).format('YYYY-MM-DD'),
    moment(new Date(y,0,6)).format('YYYY-MM-DD'),
    moment(new Date(y,3,25)).format('YYYY-MM-DD'),
    moment(new Date(y,4,1)).format('YYYY-MM-DD'),
    moment(new Date(y,5,2)).format('YYYY-MM-DD'),
    moment(new Date(y,7,15)).format('YYYY-MM-DD'),
    moment(new Date(y,10,1)).format('YYYY-MM-DD'),
    moment(new Date(y,11,8)).format('YYYY-MM-DD'),
    moment(new Date(y,11,24)).format('YYYY-MM-DD'),
    moment(new Date(y,11,25)).format('YYYY-MM-DD'),
    moment(new Date(y,11,26)).format('YYYY-MM-DD'),
    moment(new Date(y,11,31)).format('YYYY-MM-DD'),
  ]
  holy.push(moment(Easter(y)).format('YYYY-MM-DD'))
  holy.push(moment(new Date(moment(Easter(y)).add(1,'days').format('YYYY-MM-DD'))).format('YYYY-MM-DD'))
  if(holy.includes(moment(a).format('YYYY-MM-DD'))) return false

  if(a.getDay()==0 || a.getDay()==6) return false
  return true
  
}

function Easter(Y:number):Date {
  var C = Math.floor(Y/100);
  var N = Y - 19*Math.floor(Y/19);
  var K = Math.floor((C - 17)/25);
  var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
  I = I - 30*Math.floor((I/30));
  I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
  var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
  J = J - 7*Math.floor(J/7);
  var L = I - J;
  var M = 3 + Math.floor((L + 40)/44);
  var D = L + 28 - 31*Math.floor(M/4);
  return new Date(Y,M-1,D)
}

