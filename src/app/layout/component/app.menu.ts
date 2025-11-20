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
            label: 'Databases',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'User Database', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/manageusers'] },
                { label: 'Repository Database', icon: 'pi pi-fw pi-book', routerLink: ['/app/pages/managerepos'] },
                

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
            label: 'Support',
            icon: '',
            items:[
                { label: 'Ask Community', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/manageapprovals'] }
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
            label: 'Menu',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Manage My Repositories', icon: 'pi pi-fw pi-book', routerLink: ['/app/pages/managerepos'] }
            ]
        },
        {
            label: 'Support',
            icon: '',
            items:[
                { label: 'Ask Community', icon: 'pi pi-fw pi-users', routerLink: ['/app/pages/manageapprovals'] }
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
