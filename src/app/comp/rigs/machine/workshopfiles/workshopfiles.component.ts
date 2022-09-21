import { ListKeyManager } from '@angular/cdk/a11y';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatDialog, _closeDialogVia } from '@angular/material/dialog';
import { FiledialogComponent } from './filedialog/filedialog.component';

@Component({
  selector: 'episjob-workshopfiles',
  templateUrl: './workshopfiles.component.html',
  styleUrls: ['./workshopfiles.component.scss']
})
export class WorkshopfilesComponent implements OnInit {
  @Input() list:any[]=[]
  _list:any[]=[]
  inizio: number = 0
  fine: number = 5
  ascdesc:number=-1
  displayedColumns:string[]=[]
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.onResize()
    this.list.sort((a:any,b:any)=>{
      if(a.min>b.min) return -1
      if(a.min<b.min) return 1
      return 0
    })
    this._list=this.list.slice(this.inizio,this.fine)
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if(window.innerWidth<800){
      this.displayedColumns=['type', 'status', 'hrs']
    } else {
      this.displayedColumns=['type', 'status', 'hrs', 'from','to']
    }
  }

  ngOnChanges(){
    
  }

  open(fileData:any){
    const r = this.dialog.open(FiledialogComponent, {panelClass:'filedialog', data:fileData})
  }

  split(e:any){
    this.inizio = e.pageIndex * e.pageSize
    this.fine = this.inizio + e.pageSize
    //this._list = this.list.slice(this.inizio,this.fine)
  }

  sort(s:string){
    this.ascdesc*=-1
    this.list.sort((a:any,b:any)=>{
      if(a[s]>b[s]) return -1*this.ascdesc
      if(a[s]<b[s]) return 1*this.ascdesc
      return 0
    })
    this._list=this.list.slice(this.inizio,this.fine)
  }

}
