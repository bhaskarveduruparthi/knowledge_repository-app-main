import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { ManageRepos } from './managerepos/managerepos';


export default [
     {path: 'manageusers', component: ManageUsers},  
     {path: 'managerepos', component: ManageRepos},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
