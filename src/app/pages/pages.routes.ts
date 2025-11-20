import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { ManageRepos } from './managerepos/managerepos';
import { ManageApprovals } from './approvals/approvals';
import { Home } from './Home/home';


export default [
     {path: 'manageusers', component: ManageUsers},  
     {path: 'managerepos', component: ManageRepos},
     {path: 'manageapprovals', component: ManageApprovals},
     {path: 'home', component: Home},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
