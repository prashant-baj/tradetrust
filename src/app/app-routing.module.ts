import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CredentialsComponent } from './credentials/credentials.component';

const routes: Routes = [

  { path: 'dashboard',      component: CredentialsComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
