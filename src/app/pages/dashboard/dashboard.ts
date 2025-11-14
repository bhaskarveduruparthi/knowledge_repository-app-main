import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

import { ManageReposService } from '../service/managerepos.service';
import { AuthenticationService } from '../service/authentication.service';
import { ManageAdminsService } from '../service/manageadmins.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    RouterModule,
    ToolbarModule,
    RatingModule,
    PanelModule,
    AutoCompleteModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    PasswordModule,
    MessageModule
  ],
  providers: [
    MessageService,
    ManageAdminsService,
    ConfirmationService
    // No need to add ManageReposService here if its service has `providedIn: 'root'`
  ],
   styles: `
    .card {
  background: rgba(255, 255, 255, 0.2);           /* Glassy transparency */
  border-radius: 15px;                            /* Smooth corners */
  backdrop-filter: blur(10px);                    /* Glass blur effect */
  -webkit-backdrop-filter: blur(10px);            /* Safari support */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);      /* Soft glass shadow */
  border: 1px solid rgba(255, 255, 255, 0.3);     /* Subtle border */
  padding: 20px;                                  /* Content spacing */
  color: #222;                                    /* Text color */
  display: flex;                                  /* Optional for layout */
  flex-direction: column;                         /* Optional for layout */
}

    `,
  template: `
    <div class="card">
        <p-toolbar styleClass="mb-6">
                <ng-template #start>
                  <span class="text-lg font-medium"><strong style="color: #11224E;">{{ greetingMessage }}, {{ username }}!</strong></span>
                </ng-template>
                <ng-template #end>
                   
                </ng-template>
            </p-toolbar>
         <div class="bg-surface-50 dark:bg-surface-950 px-6 py-8 md:px-12 lg:px-20">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">

        <div class="bg-surface-0 dark:bg-surface-900 shadow-sm p-5 rounded-2xl">
          <div class="flex justify-between gap-4">
            <div class="flex flex-col gap-2">
              <span class="text-surface-700 dark:text-surface-300 font-normal leading-tight">Total Repositories</span>
            </div>
            <div class="flex items-center justify-center bg-linear-to-b from-cyan-400 dark:from-cyan-300 to-cyan-600 dark:to-cyan-500 rounded-lg w-10 h-10">
              <i class="pi pi-book text-surface-0 dark:text-surface-900 text-xl! leading-none!"></i>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl! leading-tight!">
              {{ allReposCount }}
            </div>
          </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 shadow-sm p-5 rounded-2xl">
          <div class="flex justify-between gap-4">
            <div class="flex flex-col gap-2">
              <span class="text-surface-700 dark:text-surface-300 font-normal leading-tight">Approved Repositories</span>
            </div>
            <div class="flex items-center justify-center bg-linear-to-b from-orange-400 dark:from-orange-300 to-orange-600 dark:to-orange-500 rounded-lg w-10 h-10">
              <i class="pi pi-file text-surface-0 dark:text-surface-900 text-xl! leading-none!"></i>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl! leading-tight!">
              {{ approvedReposCount }}
            </div>
          </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 shadow-sm p-5 rounded-2xl">
          <div class="flex justify-between gap-4">
            <div class="flex flex-col gap-2">
              <span class="text-surface-700 dark:text-surface-300 font-normal leading-tight">Un Approved Repositories</span>
            </div>
            <div class="flex items-center justify-center bg-linear-to-b from-slate-400 dark:from-slate-300 to-slate-600 dark:to-slate-500 rounded-lg w-10 h-10">
              <i class="pi pi-file text-surface-0 dark:text-surface-900 text-xl! leading-none!"></i>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl! leading-tight!">
              {{ unapprovedReposCount }}
            </div>
          </div>
        </div>

        <div *ngIf="isvalid" class="bg-surface-0 dark:bg-surface-900 shadow-sm p-5 rounded-2xl">
          <div class="flex justify-between gap-4">
            <div class="flex flex-col gap-2">
              <span class="text-surface-700 dark:text-surface-300 font-normal leading-tight">Users Present</span>
            </div>
            <div class="flex items-center justify-center bg-linear-to-b from-violet-400 dark:from-violet-300 to-violet-600 dark:to-violet-500 rounded-lg w-10 h-10">
              <i class="pi pi-users text-surface-0 dark:text-surface-900 text-xl! leading-none!"></i>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-surface-900 dark:text-surface-0 font-semibold text-2xl! leading-tight!">
              {{ usersCount }}
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
   
  `
})
export class Dashboard implements OnInit {

  allReposCount = 0;
  approvedReposCount = 0;
  unapprovedReposCount = 0;
  usersCount = 0;

  isvalid = true;

  greetingMessage: string = '';
  username: string = '';

  constructor(
    private managereposervice: ManageReposService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private confirmationService: ConfirmationService,
    public router: Router
  ) {
     this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin') {
                this.isvalid = true;
            } else {
                this.isvalid = false;
            }
        });
  }

  ngOnInit() {
    this.fetchCounts();
    this.setGreetingMessage();
    this.getUsername();
  }

  setGreetingMessage() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (hour < 18) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }
  }

  getUsername() {
    // Assuming authservice.user is an observable with user object including username
    this.authservice.user.subscribe(user => {
      if (user?.name) {
        this.username = user.name;
      } else {
        this.username = 'User';
      }
    });
  }

  fetchCounts() {
    this.managereposervice.fetchCounts().subscribe({
      next: (data: any) => {
        this.allReposCount = data.all_repos_count;
        this.approvedReposCount = data.approved_repos_count;
        this.unapprovedReposCount = data.unapproved_repos_count;
        this.usersCount = data.users_count;
      },
      error: (err) => {
        console.error('Error loading counts', err);
      }
    });
  }
}
