import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthServiceService } from 'src/app/serv/auth-service.service';
import firebase from 'firebase/app'
import { ActivatedRoute, ChildActivationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeldialogComponent } from '../util/dialog/deldialog/deldialog.component';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment'
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { GenericComponent } from '../util/dialog/generic/generic.component';
import { environment } from 'src/environments/environment';
import { SendSJService } from 'src/app/serv/send-sj.service';

@Component({
  selector: 'episjob-sjhome',
  templateUrl: './sjhome.component.html',
  styleUrls: ['./sjhome.component.scss']
})
export class SjhomeComponent implements OnInit {
  pos:string=''
  userId:string=''
  allow:boolean=false
  subsList:Subscription[]=[]
  _list:any=[]
  list:any=[]
  list1:any=[]
  sjId:string=''
  sjUrl:number=-1
  _listSent:any[]=[]
  listSent:any[]=[]
  spin:boolean=false
  draftSel:boolean=false
  sentSel:boolean=false
  chDel:boolean=false
  rigs:any[]=[]
  customers:any[]=[]
  tech:any[]=[]
  constructor(private sendSJ:SendSJService ,private auth: AuthServiceService, private router:Router, private dialog: MatDialog, private http: HttpClient, private _snackBar: MatSnackBar) { }

  async ngOnInit() {
    this.subsList.push(
      this.auth._userData.subscribe(a=>{
        if(a) {
          this.pos=a.Pos
          this.userId=a.uid
        }
        setTimeout(() => {
          this.allow= this.auth.allow('TechAll',this.pos)
        }, 1);
      }),
      this.auth._custI.subscribe(a=>{
        if(a) this.customers=a
      }),
      this.auth._fleet.subscribe(a=>{
        if(a){
          this.rigs=a
        }
      }),
      this.auth._tech.subscribe(a=>{
        if(a) this.tech=a
      })
    )
    if(navigator.onLine) {
      this.syncSignature()
      await this.checkApproval()
      this.loadSent()
        this.checkDeleted()
        .then(()=>{
          this.syncDraft()
          .then(()=>{
            this.loadSJ()
          })
        })
    } else {
      this.loadSJ()
    }
  }

  ngOnDestroy(){
    this.subsList.forEach(a=>{a.unsubscribe()})
  }

  syncDraft(){
    return new Promise((res,rej)=>{
      this.spin=true
      this.fromLocalToServer()
      .then((a)=>{
        console.log(a)
        this.fromServerToLocal()
        .then(b=>{
          console.log(b)
          this.spin=false
          res('ok')
        })
        .catch(err=>{
          console.log(err)
          this.spin=false
        })
      })
      .catch(err=>{
        console.log(err)
        this.fromServerToLocal()
        .then(b=>{
          console.log(b)
          this.spin=false
          res('ok')
        })
        .catch(err=>{
          console.log(err)
          this.spin=false
        })
      })
    })
  }

  fromLocalToServer(){
    let kt:number=0
    return new Promise((res,rej)=>{
      setTimeout(() => {
        rej('error')
      }, 20000);
      for(let i=0; i<localStorage.length;i++){
        let k:string|null = localStorage.key(i)
        if(k?.substring(0,7)=="sjdraft"){
          let _info:string|null = localStorage.getItem(k)
          if(_info) {
            firebase.database().ref('sjDraft').child('deleted').child(k).once('value',y=>{
              if(y.val()!=null) {
                localStorage.removeItem(k!)
                console.log('REMOVED ' + k!)
              }
            }).then(()=>{
              firebase.database().ref('sjDraft').child('sent').child(k!).once('value',y=>{
                if(y.val()!=null) {
                  localStorage.removeItem(k!)
                  console.log('REMOVED ' + k!)
                }
              }).then(()=>{
                firebase.database().ref('sjDraft').child('draft').child(k!).once('value',y=>{
                  let l:string|undefined=undefined, s:string
                  if(_info) l=JSON.parse(_info).lastM
                  s=y.val()?.lastM
                  if((l && l>s) || s==null) {
                    let t:string|null = localStorage.getItem(k!)
                    if(k) firebase.database().ref('sjDraft').child('draft').child(k).set(JSON.parse(t!))
                  } else if(l!<s){
                    //console.log(k, y.val().matricola,y.val().cliente11, 'S')
                    if(k) localStorage.setItem(k, JSON.stringify(y.val()))
                  } else if(l==s){
                    //console.log(k, y.val().matricola,y.val().cliente11, '=')
                  }
                })
                .then(()=>{
                  kt++
                  if(kt==localStorage.length) res('LtoS sync completed')
                })
                .catch(err=>{
                  console.log('ERRORE: '+ err)
                  kt++
                  if(kt==localStorage.length) res('LtoS  sync completed')
                })
              }).catch(err=>console.log('ERRORE: '+ err))
            }).catch(err=>console.log('ERRORE: '+ err))         
          }
        } else {
          kt++
          if(kt==localStorage.length) res('LtoS  sync completed')
        }
      }
    })
  }

  fromServerToLocal(){
    let s:number=0, l:number=0, kt:number=0
    return new Promise((res,rej)=>{
      setTimeout(() => {
        rej('error')
      }, 2000);
      firebase.database().ref('sjDraft').child('draft').once('value',draft=>{
        if(draft.val()!=null){
          let _draft =Object.values(draft.val())
          let length:number=_draft.length
          draft.forEach(d=>{
            if(((this.auth.acc('Technician') && d.val().userId==this.userId)|| this.pos!='tech')&&(d.val()!=null && ((d.val().userId==this.userId && this.auth.acc('Technician'))|| (this.pos!='tech')))) {
              s=parseInt(d.val().lastM)
              let _l=localStorage.getItem(d.key!)
              if(_l && JSON.parse(_l).lastM) {
                l=JSON.parse(_l!).lastM
              } else {
                l=0
              }
              if(l>s){
                //console.log(d.key, d.val().matricola, d.val().cliente11, 'L')
                firebase.database().ref('sjDraft').child('draft').child(d.key!).set(JSON.parse(localStorage.getItem(d.key!)!))
              } else if(s>l){
                //console.log(d.key,d.val().matricola,d.val().cliente11, 'S')
                localStorage.setItem(d.key!,JSON.stringify(d.val()))
              } else if(s==l){
                //console.log(d.key,d.val().matricola,d.val().cliente11, '=')
              }
            }
            kt++
            if(kt==length) res('StoL  sync completed')
          })
        } else {
          res('StoL sync completed')
        }
      })
    })
  }

  loadSJ(){
    this.list=[]
    let l = localStorage.length
    let k:number=0
    for(let i=0;i<localStorage.length;i++){
      if(localStorage.key(i)?.substring(0,7)=="sjdraft" && (JSON.parse(localStorage.getItem(localStorage.key(i)!)!).status!='deleted' || JSON.parse(localStorage.getItem(localStorage.key(i)!)!).status!='sent')){
        this.list.push(JSON.parse(localStorage.getItem(localStorage.key(i)!)!))
        k++     
      } else {
        k++
      }
      if(k==l) {
        this.list1=this.list
      }

    }
  }

  loadSent(n?:number){
    //if((n==undefined || n ==null)) n=10
    firebase.database().ref('sjDraft').child('sent').on('value',a=>{
      this._listSent=[]
      a.forEach(b=>{
        if(this.auth.acc('Technician') && this.userId==b.val().authorId) {
          this._listSent.push(b.val())
        } else if(this.pos!='tech' && this.pos!='wsadmin'){
          this._listSent.push(b.val())
        }
      })
      this.listSent=this._listSent.sort((a:any, b:any)=>{
        if(a.data_new>b.data_new) return -1
        if(a.data_new<b.data_new) return 1
        return 0
      }).slice()
    })   
  }

  checkDeleted(){
    return new Promise((res)=>{
      let l = localStorage.length
      let nuo:any
      for(let i=0;i<localStorage.length;i++){
        if(localStorage.key(i)?.substring(0,7)=="sjdraft" && JSON.parse(localStorage.getItem(localStorage.key(i)!)!).status=='deleted'){
          nuo=JSON.parse(localStorage.getItem(localStorage.key(i)!)!)
          let keyLS:string=localStorage.key(i)!
          firebase.database().ref('sjDraft').child('deleted').child(keyLS).set(nuo)
          .then(()=>{
            firebase.database().ref('sjDraft').child('draft').child(keyLS).remove()
            .then(()=>{
              localStorage.removeItem(keyLS)
              console.log('REMOVED ' + keyLS)
            })
          })
        }
        if(i==l-1) res('ok')
      }
    })
  }

  async checkApproval(){
    let kt:number =0
    return new Promise(async (res,rej)=>{
      let l = localStorage.length
      let url:string=environment.url; 
      for(let i=0;i<l;i++){
        let keyLS:string=''
        if(localStorage.key(i)) keyLS=localStorage.key(i)!
        if(keyLS.substring(0,6)=="sjsent" ){
          let cont:any=JSON.parse(localStorage.getItem(keyLS)!)
          console.log('Sending ' + keyLS)
          await this.sendSJ.send(keyLS,cont)
          kt++
          if(kt==l) {
            res('Sent checked 307')
          }
        } else {
          kt++
          if(kt==l) {
            res('Sent checked 307')
          }
        }
      }
    })
  }

  go(){
    this.router.navigate(['newsj']) 
  }

  open(e?:any){
    if(e) this.router.navigate(['newsj', {id:e,type:e.substring(2,3)}])
  }

  chW(): boolean{
    if(window.innerWidth>850) return true
    return false
  }

  delete(){
    let del= this.sjId
    const dialogRef = this.dialog.open(DeldialogComponent, {disableClose:true, data: {name:'Service Job draft'}})
    dialogRef.afterClosed().subscribe(res=>{
      if(res!=undefined){
        localStorage.removeItem(del)
        console.log('REMOVED ' + del)
        if(navigator.onLine){
          firebase.database().ref('sjDraft').child('draft').child(del).remove()
          .then(()=>{
            firebase.database().ref('sjDraft').child('deleted').child(del).set({
              lastM: moment(new Date()).format('YYYYMMDDHHmmss'),
              status: 'deleted'
            })
          })
          .then(()=>{
            this.syncDraft()
            .then(()=>{
              this.loadSJ()
            })
          })
        } else {
          this.loadSJ()
        }
      }
      this.unSelect()
    }) 
  }

  unSelect(){
    this.list1.forEach((a:any)=>{
      a.sel=0
    })
    this.listSent.forEach((a:any)=>{
      a.sel=0
    })
    this.sjId=''
  }

  getFile(){
    let file:any|undefined
    console.log(this.sjId)
    return new Promise((res,rej)=>{
      if(this.sjId.substring(0,3)=='sjs') {
        firebase.database().ref('sjDraft').child('sent').child(this.sjId).once('value',a=>{
          file  =a.val()
        })
        .then(()=>{
          res(file)
        })
        .catch(err=>{
          rej(err)
        })
      } else {
        file = JSON.parse(localStorage.getItem(this.sjId)!)
        res(file)
      } 
    })
  }

  exportPdf(){
    this.getFile().then((file:any)=>{
      if(file){
        let dia = this.dialog.open(GenericComponent,{disableClose:true, data:{msg:'Generating PDF...'}})
        setTimeout(() => {
          dia.close()
        }, 10000);
        this.unSelect()
        let urlserver:string = environment.url
        this.http.post(urlserver + 'sjpdf', file, {responseType:'arraybuffer'}).subscribe((o:any)=>{
          console.log(typeof o,o)
          if(o){
            const blob = new Blob([o], { type: 'application/pdf' });
            const href = document.createElement('a')
            document.body.appendChild(href)
            const url= window.URL.createObjectURL(blob)
            href.href=url
            href.download= moment(new Date()).format('YYYYMMDDHHmmss') + ' - ' + file.cliente11 + ' - ' + file.prodotto1 + ' - ' + file.matricola + '.pdf'
            href.click()
            dia.close()
            setTimeout(() => {
              window.URL.revokeObjectURL(url)
              document.body.removeChild(href)
            }, 1)
          } else {
            dia.close()
          }
        })
        this.unSelect()
      }
    })
    

  }
  exportMa(){
    this.getFile()
    .then((file:any)=>{
      if(file){
        let dia = this.dialog.open(GenericComponent,{disableClose:true, data:{msg:'Generating PDF...'}})
        this.unSelect()
        const blob = new Blob([JSON.stringify(file)], { type: 'text/html' });
        const href = document.createElement('a')
        document.body.appendChild(href)
        const url= window.URL.createObjectURL(blob)
        href.href=url
        href.download=moment(new Date()).format('YYYYMMDDHHmmss') + ' - ' + file.cliente11 + ' - ' + file.prodotto1 + ' - ' + file.matricola + '.ma'
        href.click()
        dia.close()
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
          document.body.removeChild(href)
        }, 1);
      }
      
    })
  }

  chOnline(){
    if(navigator.onLine) return true
    return false
  }

  select(e:any, a:string){
    if(!e){
      this.sjId=''
    } else {
      this.sjId=e
    }
    this.chDel=true
    if(e.substring(0,3)=='sjs') this.chDel=false
    switch(a){
      case('sent'):
        this.list1.forEach((a:any)=>{
          a.sel=0
        })
        break
      case('draft'):
        this.listSent.forEach((a:any)=>{
          a.sel=0
        })
        break
    }
  }

  syncSignature(){
    if(localStorage.getItem('Signature')==null){
      firebase.database().ref('UserSignature').child(this.userId).once('value',a=>{
        if(a.val()!=null) localStorage.setItem('Signature', a.val())
      })
    } else {
      firebase.database().ref('UserSignature').child(this.userId).set(localStorage.getItem('Signature'))
    }
  }
  
  saveSP(){
    //let source= {url: 'https://firebasestorage.googleapis.com/v0/b/epi-serv-job.appspot.com/o/Closed%2F428808%20-%2020220221%20-%20UNICALCE%20SPA%20-%20ROC%20L6(25)%20-%20AVO10A1102.pdf?alt=media&token=3a582f3e-2033-4e9a-b8ea-2f977825d11f'}
    let ref=firebase.storage().ref('Marco Arato/20220222121404 - ERDBAU S.R.L. - ROC D5-01 RRC - AVO05A788.ma')
    ref.storage

      /*let url:string='http://localhost:3001/saveOnSP'
      this.http.post(url, {url:a}).subscribe(b=>{console.log(b)})*/
  }

  limit(e:any){
    if(e.target.value>0){
      this.listSent=this._listSent.sort((a:any, b:any)=>{
        if(a.data_new>b.data_new) return -1
        if(a.data_new<b.data_new) return 1
        return 0
      }).slice(0,e.target.value)
    }
    
  }

  chPos(a:string){
    return this.auth.acc(a)
  }
}
