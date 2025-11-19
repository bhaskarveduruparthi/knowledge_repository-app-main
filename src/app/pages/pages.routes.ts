import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { ManageRepos } from './managerepos/managerepos';
import { ManageApprovals } from './approvals/approvals';


export default [
     {path: 'manageusers', component: ManageUsers},  
     {path: 'managerepos', component: ManageRepos},
     {path: 'manageapprovals', component: ManageApprovals},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
