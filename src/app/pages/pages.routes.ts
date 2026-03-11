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
import { ManageDownloads } from './downloads/downloads';
import { AddSolutions } from './addsolutions/addsolutions';
import { UserWiseReportComponent } from './user-wisereport/user-wisereport';
import { ViewHistory } from './viewhistory/viewhistory';
import { ManageDomainsSectors } from './managedomains_sectors/managedomains_sectors';
import { ManageModules } from './managemodules/managemodules';


export default [
     {path: 'manageusers', component: ManageUsers, title: 'Manage Users'},  
     {path: 'managerepos', component: ManageRepos, title: 'Manage Repositories'},
     {path: 'addsolutions', component: AddSolutions, title: 'Add Solutions'},
     {path: 'manageapprovals', component: ManageApprovals, title: 'Manage Approvals'},
     {path: 'managedownloads', component: ManageDownloads, title: 'Manage Downloads'},
     {path:'manage-domains-sectors', component: ManageDomainsSectors, title: 'Manage Domains & Sectors'},
     {path: 'manage-modules', component: ManageModules, title: 'Manage Modules'},
     {path: 'approved', component: ManageApprovalsReport, title: 'Approved Solutions'},
     {path: 'pending', component: ManagePendingReport, title: 'Pending Solutions'},
     {path: 'unapproved', component: ManageUnapprovedReport, title: 'Unapproved Solutions'},
     {path: 'rejected', component: ManageRejectedReport, title: 'Rejected Solutions'},
     {path: 'support', component: Support, title: 'Support'},
     {path: 'home', component: Home, title: 'Search Solutions'},
     {path: 'userwise', component: UserWiseReportComponent, title: 'UserWise Activity'},
     {path:'login-history', component: LoginHistory, title: 'Login History'},
     {path: 'manage-managers', component: ManageManagers, title: 'Manage Managers'},
     {path: 'download-history', component: DownloadHistory, title: 'Download History'},
     {path: 'view-history', component: ViewHistory, title: 'View History'},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
