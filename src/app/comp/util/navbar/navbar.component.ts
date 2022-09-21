import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router'
import { Location } from '@angular/common'

@Component({
  selector: 'episjob-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() title:string=''
  @Input() cerca:boolean=true
  @Input() home:boolean=false
  @Input() backB:any = ''
  @Output() filter = new EventEmitter()
  @Input() hide:boolean=true
  chLar:boolean=true
  constructor(private router:Router, private location:Location) { }

  oldPosition:number=0;
  currentPosition:number=0;
  scrollaV:boolean =true;
  filtro:string=''
  lar:boolean|undefined;
  value:string=''
  ngOnInit(): void {
    this.largh(1)
    this.scrollaV= true
    this.onResize()
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => {
      if(window.innerWidth>500) {this.chLar=true} else {this.chLar=false}
    }, 1);
  }

  scrolla(e:Event){
    if(window.innerWidth<700){
      if(this.hide){
        this.currentPosition = window.pageYOffset
        if(this.currentPosition>this.oldPosition){
          this.scrollaV = false
        } else {
          this.scrollaV = true
        }
        this.oldPosition = this.currentPosition
      }
    } else{
      this.scrollaV=true
    }
    
  }

  scrivi(e: any){
    this.filter.emit(e.target.value.toString())
  }

  cancella(){
    this.value=''
    this.filtro=''
    this.filter.emit('')
  }

  back(){
    this.location.back()
    /*if(typeof this.backB == 'string') {
      this.router.navigate([this.backB])
    }else {
      this.router.navigate(this.backB)
    }*/
  }

  next(){
    this.location.forward()
  }

  largh(e:any){
    if(window.innerWidth>350) {
      this.lar = true
    } else {
      this.lar=false
    } 
  }

  homeNav(){
    this.router.navigate(['/'])
  }

}
