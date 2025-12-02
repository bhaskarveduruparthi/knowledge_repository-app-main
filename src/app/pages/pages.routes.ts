import { Routes } from '@angular/router';
import { ManageUsers } from './manageusers/manageusers';
import { ManageRepos } from './managerepos/managerepos';
import { ManageApprovals } from './approvals/approvals';
import { Home } from './Home/home';
import { Support } from './support/support';
import { ManageApprovalsReport } from './manageapprovals/manageapprovals';
import { ManagePendingReport } from './managepending/managepending';
import { ManageUnapprovedReport } from './manageunapproved/manageunapproved';
import { ManageRejectedReport } from './managerejected/managerejected';
import { LoginHistory } from './loginhistory/loginhistory';
import { DownloadHistory } from './downloadhistory/downloadhistory';
import { ManageManagers } from './manage_managers/manage_managers';


export default [
     {path: 'manageusers', component: ManageUsers},  
     {path: 'managerepos', component: ManageRepos},
     {path: 'manageapprovals', component: ManageApprovals},
     {path: 'approved', component: ManageApprovalsReport},
     {path: 'pending', component: ManagePendingReport},
     {path: 'unapproved', component: ManageUnapprovedReport},
     {path: 'rejected', component: ManageRejectedReport},
     {path: 'support', component: Support},
     {path: 'home', component: Home},
     {path:'login-history', component: LoginHistory},
     {path: 'manage-managers', component: ManageManagers},
     {path: 'download-history', component: DownloadHistory},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
