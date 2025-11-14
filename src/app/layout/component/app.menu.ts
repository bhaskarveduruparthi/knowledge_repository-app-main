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
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    user_model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }]
            },
            
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-briefcase',
                
                items: [
                    {
                        label: 'Manage Users',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/app/pages/manageusers']
                    },
                    {
                        label: 'Manage Repository',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/app/pages/managerepos']
                    }
                    
                ]
            }
            
        ];
        this.user_model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app'] }]
            },
            
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-briefcase',
                
                items: [
                    
                    {
                        label: 'Manage My Repositories',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/app/pages/managerepos']
                    }
                    
                ]
            }
            
        ];
    }
    user : User | null = {}
    constructor(public layoutService: LayoutService,private authenticationService: AuthenticationService) {
      this.authenticationService.user.subscribe((x) => {
        if(x?.type == 'SuperAdmin') {
          this.model = this.model;
        }
        else if(x?.type == 'Admin'){
            this.model = this.model;
        }
        else{
            this.model = this.user_model;
        }
      });
    }
}
