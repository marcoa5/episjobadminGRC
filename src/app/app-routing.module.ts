import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './comp/home/home.component';
import { MachineComponent } from './comp/rigs/machine/machine.component';
import { RigsComponent } from './comp/rigs/rigs.component';
import { CustomersComponent } from './comp/customers/customers.component'
import { ClienteComponent } from './comp/customers/cliente/cliente.component'
import { TechniciansComponent } from './comp/technicians/technicians.component'
import { FilesComponent } from './comp/files/files.component'
import { NewcustComponent } from './comp/customers/newcust/newcust.component'
import { NewtechComponent } from './comp/technicians/newtech/newtech.component'
import { NewrigComponent } from './comp/rigs/newrig/newrig.component'
import { UsersComponent } from './comp/users/users.component'
import { NewuserComponent } from './comp/users/newuser/newuser.component'
import { AuthComponent } from './comp/auth/auth.component'
import { ReportComponent } from './comp/report/report.component'
import { VisitComponent } from './comp/visit/visit.component'
import { ContactComponent } from './comp/customers/cliente/contact/contact.component'
import { NewvisitComponent } from './comp/visit/newvisit/newvisit.component';
import { PartsComponent } from './comp/parts/parts.component';
import { NotificationListComponent } from './comp/notification-list/notification-list.component';
import { ContactsComponent } from './comp/contacts/contacts.component';
import { SjhomeComponent } from './comp/sjhome/sjhome.component';
import { SjComponent } from './comp/sjhome/sj/sj.component';
import { RequestlistComponent } from './comp/parts/requestlist/requestlist.component';
import { WorkshophomeComponent } from './comp/workshophome/workshophome.component';
import { ContractshomeComponent } from './comp/contractshome/contractshome.component';
import { PricingComponent } from './comp/pricing/pricing.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'rigs', component: RigsComponent},
  {path: 'machine', component: MachineComponent},
  {path: 'customers', component: CustomersComponent},
  {path: 'cliente', component: ClienteComponent},
  {path: 'technicians', component: TechniciansComponent },
  {path: 'files', component: FilesComponent },
  {path: 'newc', component: NewcustComponent },
  {path: 'newtech', component: NewtechComponent },
  {path: 'newrig', component: NewrigComponent },
  {path: 'users', component: UsersComponent },
  {path: 'users', component: UsersComponent },
  {path: 'newuser', component: NewuserComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'report', component: ReportComponent},
  {path: 'visit', component: VisitComponent},
  {path: 'contact', component:ContactComponent},
  {path: 'newvisit', component:NewvisitComponent},
  {path: 'parts', component:PartsComponent},
  {path: 'notif', component:NotificationListComponent},
  {path: 'contacts', component:ContactsComponent},
  {path: 'contracts', component:ContractshomeComponent},
  {path: 'sj', component:SjhomeComponent},
  {path: 'newsj', component:SjComponent},
  {path: 'workshop', component:WorkshophomeComponent},
  {path: 'partrequest', component:RequestlistComponent},
  {path: 'pricing', component:PricingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
