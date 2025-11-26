import { LoginService } from './../../pages/service/login.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '@/pages/service/authentication.service';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Menu } from 'primeng/menu';
import { Toast } from "primeng/toast";
import { Panel } from "primeng/panel";

@Component({
  selector: 'app-topbar',
  standalone: true,
  providers: [MessageService],
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    DialogModule,
    PasswordModule,
    ButtonModule,
    FormsModule,
    Menu,
    Toast,
    Panel
],
styles:`
  .profile-initials-circle {
  width: 6.42rem;
  height: 6.42rem;
  border-radius: 50%;
  background-color: #11224E; /* Example dark blue background */
  color: white;
  font-weight: bold;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-transform: uppercase;
}

::ng-deep .p-table thead th {
  font-weight: bold;
  color: #11224E;
}

`,

  template: `
    <p-toast/>
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars"></i>
        </button>
        <a class="layout-topbar-logo" routerLink="/app">
 
  <span><strong style="color:#11224E">Knowledge Repository</strong></span>
</a>

      </div>
      
      <div class="layout-topbar-actions">
       
        <div class="layout-config-menu">
          <!--<button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
            <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
          </button>-->
          <div class="relative">
            <button
              class="layout-topbar-action layout-topbar-action-highlight"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
            >
              <i class="pi pi-palette"></i>
            </button>
            <app-configurator />
          </div>
        </div>
         
        <button
          class="layout-topbar-menu-button layout-topbar-action"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <!--<button type="button" class="layout-topbar-action" (click)="changeUser_Password()">
              <i class="pi pi-key"></i>
              <span>Change Password</span>
            </button>
            <button type="button" class="layout-topbar-action" (click)="togglelogout()">
              <i class="pi pi-user"></i>
              <span>Profile</span>
            </button>-->
            
    <p-menu #menu [model]="items" [popup]="true" />
    <button  type="button" class="layout-topbar-action"  (click)="menu.toggle($event)">
      <i class="pi pi-cog"></i>
      <span>Profile Menu</span>

    </button>

          </div>
        </div>
      </div>
    </div>

    <p-dialog [(visible)]="changePasswordDialog" [style]="{width: '450px'}" header="Change Password" [modal]="true" class="p-fluid">
      <ng-template pTemplate="content">
        <div class="flex flex-column align-items-center justify-content-center">
          <div>
            <label for="oldPassword" class="block text-900 text-xl font-medium mb-2">Old Password</label>
            <p-password
              id="oldPassword"
              [(ngModel)]="old_password"
              [feedback]="false"
              placeholder="Enter Old Password"
              [toggleMask]="true"
              styleClass="mb-5"
              inputStyleClass="w-full p-3 md:w-30rem"
            ></p-password>

            <label for="newPassword" class="block text-900 font-medium text-xl mb-2">New Password</label>
            <p-password
              id="newPassword"
              [(ngModel)]="new_password"
              [feedback]="false"
              placeholder="Enter New Password"
              [toggleMask]="true"
              styleClass="mb-5"
              inputStyleClass="w-full p-3 md:w-30rem"
            ></p-password>
            <small *ngIf="new_password && !isPasswordValid()" class="p-error" style="color:red">
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
            </small>

            <label for="confirmPassword" class="block text-900 font-medium text-xl mb-2">Confirm Password</label>
            <p-password
              id="confirmPassword"
              [(ngModel)]="retype_password"
              [feedback]="false"
              placeholder="Confirm New Password"
              [toggleMask]="true"
              styleClass="mb-5"
              inputStyleClass="w-full p-3 md:w-30rem"
            ></p-password>
            <small *ngIf="retype_password && !doPasswordsMatch()" class="p-error" style="color:red">
              Passwords do not match.
            </small>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <p-button type="button" icon="pi pi-times" (click)="hideDialog()" label="Cancel"></p-button>
        <p-button type="button" icon="pi pi-check" label="Confirm" (click)="confirmChangePassword(old_password,new_password,retype_password)"  [disabled]="!isFormValid()"></p-button>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="logoutdialog" header="Confirm" [modal]="true" [style]="{ width: '450px' }">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
        <span>Are you sure you want to <b>Logout</b>?</span>
      </div>
      <ng-template pTemplate="footer">
        <p-button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="hidelogout()"></p-button>
        <p-button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="logout()"></p-button>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="profiledialog" header="Profile" [modal]="true" [maximizable]="true" [resizable]="true" [style]="{ width: '1000px' }">
  <ng-template pTemplate="content">
    <div class="bg-surface-0 dark:bg-surface-950 px-6 py-8 md:px-12 lg:px-20">
      <div class="flex items-center flex-col lg:flex-row lg:justify-between">
        <div class="flex items-start flex-col md:flex-row gap-8">
           <div 
          class="profile-initials-circle"
          aria-label="User profile initials"
        >
          {{ getUserInitials() }}
        </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-center">
              <span class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ userName }}</span>
            </div>
            <div class="flex items-center flex-wrap gap-8">
              <div>
                <span class="text-surface-500 dark:text-surface-300">Yash Id</span>
                <div class="text-surface-700 dark:text-surface-100 mt-1 text-sm font-semibold">{{ userYashId }}</div>
              </div>
              <div>
                <span class="text-surface-500 dark:text-surface-300">Email</span>
                <div class="text-surface-700 dark:text-surface-100 mt-1 text-sm font-semibold">{{ userEmail }}</div>
              </div>
              <div>
                <span class="text-surface-500 dark:text-surface-300">Business Unit</span>
                <div class="text-surface-700 dark:text-surface-100 mt-1 text-sm font-semibold">{{ userBusinessUnit }}</div>
              </div>
              <div>
                <span class="text-surface-500 dark:text-surface-300">Role</span>
                <div class="text-surface-700 dark:text-surface-100 mt-1 text-sm font-semibold">{{ userRole }}</div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
  </ng-template>
</p-dialog>

  `,
})
export class AppTopbar implements OnInit {
  old_password: string = '';
  new_password: string = '';
  retype_password: string = '';
  changePasswordDialog: boolean = false;
  profiledialog:boolean= false;
  logoutdialog: boolean = false;

  items: MenuItem[] | undefined;

  userName: string = '';
  userEmail: string = '';
  userYashId: string = '';
  userBusinessUnit: string = '';
  userRole: string = '';

  constructor(public layoutService: LayoutService,public messageservice: MessageService, private authservice: AuthenticationService, private loginservice: LoginService) {}

  ngOnInit(): void {
   const darkTheme = JSON.parse(localStorage.getItem('darkTheme') ?? 'false');
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme,
    }));

    this.initializeMenuItems(darkTheme);
    this.loadUserDetails();
  }

    initializeMenuItems(isDarkMode: boolean) {
    this.items = [
      {
        label: 'Settings',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => this.openprofile(),
          },
          /*{
            label: isDarkMode ? 'Turn Dark Mode Off' : 'Turn Dark Mode On',
            icon: 'pi pi-moon',
            command: () => this.toggleDarkMode(),
          },*/
          {
            label: 'Change Password',
            icon: 'pi pi-key',
            command: () => this.changeUser_Password(),
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.togglelogout(),
          },
        ],
      },
    ];
  }
  
  loadUserDetails() {
  this.loginservice.getUserDetails().subscribe({
    next: (user: any) => {
      // Assuming user has the properties you need
      this.userName = user.name || 'Unknown User';
      this.userEmail = user.email || 'No Email';
      this.userYashId = user.yash_id || 'No Id';
      this.userBusinessUnit = user.b_unit || 'N/A';
      this.userRole = user.type || 'N/A';
    },
    error: () => {
      // Handle error or set default values
      this.userName = 'Unknown User';
      this.userEmail = 'No Email';
      this.userYashId = 'No Id';
      this.userBusinessUnit = 'N/A';
      this.userRole = 'N/A';
    }
  });
}

getUserInitials(): string {
  if (!this.userName) return '';
  const words = this.userName.trim().split(' ');
  const firstLetter = words[0]?.charAt(0).toUpperCase() || '';
  const secondLetter = words.length > 1 ? words[1].charAt(0).toUpperCase() : '';
  return firstLetter + secondLetter;
}


 toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => {
      const newDarkTheme = !state.darkTheme;
      localStorage.setItem('darkTheme', JSON.stringify(newDarkTheme));
      this.initializeMenuItems(newDarkTheme); // update menu label on theme change
      return { ...state, darkTheme: newDarkTheme };
    });
  }

  openprofile(){
    this.profiledialog = true;

  }

  isPasswordValid(): boolean {
    const password = this.new_password;
    const lengthCheck = password.length >= 8;
    const upperCaseCheck = /[A-Z]/.test(password);
    const lowerCaseCheck = /[a-z]/.test(password);
    const numberCheck = /[0-9]/.test(password);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthCheck && upperCaseCheck && lowerCaseCheck && numberCheck && specialCharCheck;
  }

  doPasswordsMatch(): boolean {
    return this.new_password === this.retype_password;
  }

  isFormValid(): boolean {
    return this.isPasswordValid() && this.doPasswordsMatch() && this.old_password.length > 0;
  }

  hideDialog() {
    this.changePasswordDialog = false;
    this.old_password = '';
    this.new_password = '';
    this.retype_password = '';
  }

  changeUser_Password() {
    this.changePasswordDialog = true;
  }

  confirmChangePassword(old_password:string, new_password:string, retype_password:string) {
    if (this.isFormValid()) {
      this.loginservice.changePassword(this.old_password, this.new_password).subscribe((data:any)=>{
        this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Password Updated Successfully' });
        this.changePasswordDialog = false;
      },(err)=>{
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Error Changing Password' });
      });
    }
  }

  togglelogout() {
    this.logoutdialog = true;
  }

  hidelogout() {
    this.logoutdialog = false;
  }

  logout() {
    this.authservice.logout();
    localStorage.removeItem('CurrentPage');
    localStorage.removeItem('ApprovalCurrentPage');
    localStorage.removeItem('LHistoryCurrentPage');
    localStorage.removeItem('PendingCurrentPage');
    localStorage.removeItem('RejectedCurrentPage');
    localStorage.removeItem('UnApprovedCurrentPage');
    
  }
}
