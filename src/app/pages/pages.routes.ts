import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { ManageRepos } from './managerepos/managerepos';
import { ManageApprovals } from './approvals/approvals';
import { Home } from './Home/home';
import { Support } from './support/support';


export default [
     {path: 'manageusers', component: ManageUsers},  
     {path: 'managerepos', component: ManageRepos},
     {path: 'manageapprovals', component: ManageApprovals},
     {path: 'support', component: Support},
     {path: 'home', component: Home},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
