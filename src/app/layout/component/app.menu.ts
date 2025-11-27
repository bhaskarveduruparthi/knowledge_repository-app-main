import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { User } from '@/pages/service/manageadmins.service';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '@/pages/service/authentication.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of display_menu; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`
})
export class AppMenu implements OnInit {
    // Full menus stored separately
    admin_menu: MenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] },
        { label: 'Search', icon: 'pi pi-fw pi-search', routerLink: ['/app/pages/home'] }
        ],

        },
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Manage Users', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/manageusers'] },
                { label: 'Knowledge Repository', icon: 'pi pi-fw pi-book', routerLink: ['/app/pages/managerepos'] },
                

            ]
        },
        {
            label: 'Actions',
            icon: '',
            items:[
                { label: 'Manage Approvals', icon: 'pi pi-fw pi-check', routerLink: ['/app/pages/manageapprovals'] }
            ]
        },
        {
            label: 'Reports',
            icon: 'pi pi-fw pi-file',
            items: [
                
                { label: 'Approved', icon: 'pi pi-fw pi-file-check', routerLink: ['/app/pages/approved'] },
                {label: 'Unapproved', icon: 'pi pi-fw pi-file-edit', routerLink: ['/app/pages/unapproved'] },
                {label: 'Pending', icon: 'pi pi-fw pi-file-o', routerLink: ['/app/pages/pending'] },
                { label: 'Rejected', icon: 'pi pi-fw pi-file-excel', routerLink: ['/app/pages/rejected'] }
                

            ]
        },
        
        {
            label: 'Logs',
            icon: '',
            items:[
                { label: 'User History', icon: 'pi pi-fw pi-history', routerLink: ['/app/pages/login-history'] },
                { label: 'Download History', icon: 'pi pi-fw pi-history', routerLink: ['/app/pages/download-history'] }
            ]
        },
        
        {
            label: 'Support',
            icon: '',
            items:[
                { label: 'Ask Community', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/support'] }
            ]
        }
    ];

    user_menu: MenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] },
        { label: 'Search', icon: 'pi pi-fw pi-search', routerLink: ['/app/pages/home'] }]
        },
        {
            label: 'User',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Knowledge Repository', icon: 'pi pi-fw pi-book', routerLink: ['/app/pages/managerepos'] }
            ]
        },
        {
            label: 'Support',
            icon: '',
            items:[
                { label: 'Ask Community', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/support'] }
            ]
        }
    ];

    // The menu currently displayed
    display_menu: MenuItem[] = [];

    user: User | null = null;

    constructor(public layoutService: LayoutService, private authenticationService: AuthenticationService) {}

    ngOnInit() {
        this.authenticationService.user.subscribe(user => {
            this.user = user;
            if (user?.type === 'Superadmin' || user?.type === 'manager') {
                // Show admin menu for Superadmin and manager
                this.display_menu = this.admin_menu;
            } else {
                // Show user menu for other users
                this.display_menu = this.user_menu;
            }
        });
    }
}
