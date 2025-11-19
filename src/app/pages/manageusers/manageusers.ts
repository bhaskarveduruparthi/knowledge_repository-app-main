import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Router, RouterModule } from '@angular/router';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User, ManageAdminsService } from '../service/manageadmins.service';
import { AuthenticationService } from '../service/authentication.service';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';


interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface Type {
  id?: number;
  type?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-manageusers',
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
        MessageModule,
        
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

/* Adapt to single column on small screens */
        @media (max-width: 700px) {
            .responsive-form .custom-grid {
                grid-template-columns: 1fr;
            }
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            width: 100%;
        }

        .responsive-form .custom-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        input[pInputText],
        textarea[pInputTextarea] {
            width: 100%;
        }

        @media (max-width: 700px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }

    `,
    template: `
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                  <p-button label="Create User" icon="pi pi-plus" severity="primary" (onClick)="openNew()"  />
                </ng-template>
                <ng-template #end>
                    <p-button label="Export to Excel" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                </ng-template>
            </p-toolbar>
            <p-table
                #dt
                [value]="users()"
                [rows]="10"
                [columns]="cols"
                [loading]="loading"
                [paginator]="true"
                [globalFilterFields]="['name','email', 'yash_id', 'b_unit',]"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedusers"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Users"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h5 class="m-0">Manage Users</h5>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                       <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Yash ID</th>
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">User Name</th>
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Email</th>
        
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Business Unit</th>
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Type</th>
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Active</th>
        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-user>
                    <tr>
                        <td style="min-width: 100px;  background-color: rgba(150, 201, 244, 0.3)">
          <b>{{user.yash_id}}</b>
        </td>
        <td style="min-width: 200px;">
          {{user.name}}
        </td>
        <td style="min-width: 200px;">
          {{user.email}}
        </td>
       
        <td style="min-width: 100px;">
          {{user.b_unit}}
        </td>
        <td style="min-width: 40px;">
          <b>{{user.type}}</b>
        </td>
        <td style="min-width: 40px; text-align: c;">
          {{user.active}}
        </td>
        <td >
          <div class="flex" style="min-width: 100px;">
            <button pButton pRipple icon="pi pi-user-edit" class="p-button-rounded p-button-success mr-2"
              (click)="editUser(user)"></button>
            <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger"
              (click)="deleteUser(user)"></button>
          </div>
        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="5">No Users found.</td>
      </tr>
    </ng-template>
            </p-table>
</div>


   <p-dialog [(visible)]="userDialog" [style]="{width: '700px'}" header="Add User" [modal]="true" class="p-fluid">
  <ng-template pTemplate="content">
    <div class="responsive-form">
      <div class="form-grid">
        <!-- User Type Dropdown -->
        <div class="form-field">
          <label class="required" for="type">Type</label>
          <p-autocomplete
  [dropdown]="true"
  [suggestions]="filteredTypes"
  (completeMethod)="filterTypes($event)"
  [(ngModel)]="user.type"
  optionLabel="label"
  optionValue="value"
  placeholder="Select a Type"
  [forceSelection]="true"
  [showClear]="true"
  [required]="true"
  #type="ngModel"
  [ngClass]="{'ng-invalid ng-dirty': submitted && !user.type}">
</p-autocomplete>
<p-message *ngIf="((type.touched || type.dirty || submitted) && type.invalid)" severity="error" text="User Type is required"></p-message>
        </div>

        <!-- Business Unit Dropdown -->
        <div class="form-field">
          <label class="required" for="b_unit">Business Unit</label>
          <p-autocomplete
  [dropdown]="true"
  [suggestions]="filteredBusinessUnits"
  (completeMethod)="filterBusinessUnits($event)"
  [(ngModel)]="user.b_unit"
  optionLabel="label"
  optionValue="value"
  placeholder="Select Business Unit"
  [forceSelection]="true"
  [showClear]="true"
  [required]="true"
  #b_unit="ngModel"
  [ngClass]="{'ng-invalid ng-dirty': submitted && !user.b_unit}">
</p-autocomplete>
<p-message *ngIf="((b_unit.touched || b_unit.dirty || submitted) && b_unit.invalid)" severity="error" text="Business Unit is required"></p-message>
        </div>
        
        <!-- Yash ID -->
        <div class="form-field">
          <label class="required" for="yash_id">Yash ID</label>
          <input type="text" pInputText id="yash_id"
                 [(ngModel)]="user.yash_id"
                 required
                 #yash_id="ngModel"
                 [pattern]="integerRegex"
                 [ngClass]="{error: yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)}">
          <div *ngIf="yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)">
            <p-message *ngIf="yash_id.errors['required']" severity="error" text="Yash ID is required"></p-message>
            <p-message *ngIf="yash_id.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
          </div>
        </div>

        <!-- User Name -->
        <div class="form-field">
          <label class="required" for="name">User Name</label>
          <input type="text" pInputText id="name"
                 [(ngModel)]="user.name"
                 #name="ngModel"
                 required
                 [ngClass]="{'ng-invalid ng-dirty': submitted && !user.name}" />
          <p-message *ngIf="((name.touched || name.dirty || submitted) && name.invalid)" severity="error" text="User Name is required"></p-message>
        </div>

        <!-- Password -->
        <div class="form-field">
          <label class="required" for="password">Password</label>
          <p-password id="password"
                      [(ngModel)]="user.password"
                      required
                      #password="ngModel"
                      [toggleMask]="true"
                      styleClass="mb-5"
                      inputStyleClass="w-full p-3 md:w-40rem"
                      [ngClass]="{'ng-invalid ng-dirty': submitted && !user.password}">
          </p-password>
          <p-message *ngIf="((password.touched || password.dirty || submitted) && password.invalid)" severity="error" text="Password is required"></p-message>
        </div>

        <!-- Email -->
        <div class="form-field">
          <label class="required" for="email">Email</label>
          <input type="email" pInputText id="email"
                 [(ngModel)]="user.email"
                 #email="ngModel"
                 [pattern]="emailRegex"
                 required
                 [ngClass]="{error: email.errors && ((email.touched || email.dirty || submitted) && email.invalid)}" />
          <div *ngIf="email.errors && ((email.touched || email.dirty || submitted) && email.invalid)">
            <p-message *ngIf="email.errors['required']" severity="error" text="Email is required"></p-message>
            <p-message *ngIf="email.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
          </div>
        </div>
      </div>
    </div>
  </ng-template>
  <ng-template pTemplate="footer">
    <button pButton pRipple label="Cancel" icon="pi pi-times" class="p-button-text" (click)="userDialog = false"></button>
    <button pButton pRipple label="Add" icon="pi pi-check" class="p-button-text" (click)="addUser(user)"></button>
  </ng-template>
</p-dialog>



  <p-dialog [(visible)]="userEditDialog" [style]="{width: '700px'}" header="Edit User Details" [modal]="true"
    class="p-fluid">
    <ng-template pTemplate="content">
    <div class="responsive-form">
      <div class="form-grid">
        <!-- User Type Dropdown -->
        <div class="form-field">
          <label class="required" for="type">Type</label>
          <p-autocomplete
  [dropdown]="true"
  [suggestions]="filteredTypes"
  (completeMethod)="filterTypes($event)"
  [(ngModel)]="user.type"
  optionLabel="label"
  optionValue="value"
  placeholder="Select a Type"
  [forceSelection]="true"
  [showClear]="true"
  [required]="true"
  #type="ngModel"
  [ngClass]="{'ng-invalid ng-dirty': submitted && !user.type}">
</p-autocomplete>
<p-message *ngIf="((type.touched || type.dirty || submitted) && type.invalid)" severity="error" text="User Type is required"></p-message>
        </div>

        <!-- Business Unit Dropdown -->
        <div class="form-field">
          <label class="required" for="b_unit">Business Unit</label>
          <p-autocomplete
  [dropdown]="true"
  [suggestions]="filteredBusinessUnits"
  (completeMethod)="filterBusinessUnits($event)"
  [(ngModel)]="user.b_unit"
  optionLabel="label"
  optionValue="value"
  placeholder="Select Business Unit"
  [forceSelection]="true"
  [showClear]="true"
  [required]="true"
  #b_unit="ngModel"
  [ngClass]="{'ng-invalid ng-dirty': submitted && !user.b_unit}">
</p-autocomplete>
<p-message *ngIf="((b_unit.touched || b_unit.dirty || submitted) && b_unit.invalid)" severity="error" text="Business Unit is required"></p-message>
        </div>
        
        <!-- Yash ID -->
        <div class="form-field">
          <label class="required" for="yash_id">Yash ID</label>
          <input type="text" pInputText id="yash_id"
                 [(ngModel)]="user.yash_id"
                 required
                 #yash_id="ngModel"
                 [pattern]="integerRegex"
                 [ngClass]="{error: yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)}">
          <div *ngIf="yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)">
            <p-message *ngIf="yash_id.errors['required']" severity="error" text="Yash ID is required"></p-message>
            <p-message *ngIf="yash_id.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
          </div>
        </div>

        <!-- User Name -->
        <div class="form-field">
          <label class="required" for="name">User Name</label>
          <input type="text" pInputText id="name"
                 [(ngModel)]="user.name"
                 #name="ngModel"
                 required
                 [ngClass]="{'ng-invalid ng-dirty': submitted && !user.name}" />
          <p-message *ngIf="((name.touched || name.dirty || submitted) && name.invalid)" severity="error" text="User Name is required"></p-message>
        </div>

        <!-- Password -->
        <div class="form-field">
          <label class="required" for="password">Password</label>
          <p-password id="password"
                      [(ngModel)]="user.password"
                      required
                      #password="ngModel"
                      [toggleMask]="true"
                      styleClass="mb-5"
                      inputStyleClass="w-full p-3 md:w-40rem"
                      [ngClass]="{'ng-invalid ng-dirty': submitted && !user.password}">
          </p-password>
          <p-message *ngIf="((password.touched || password.dirty || submitted) && password.invalid)" severity="error" text="Password is required"></p-message>
        </div>

        <!-- Email -->
        <div class="form-field">
          <label class="required" for="email">Email</label>
          <input type="email" pInputText id="email"
                 [(ngModel)]="user.email"
                 #email="ngModel"
                 [pattern]="emailRegex"
                 required
                 [ngClass]="{error: email.errors && ((email.touched || email.dirty || submitted) && email.invalid)}" />
          <div *ngIf="email.errors && ((email.touched || email.dirty || submitted) && email.invalid)">
            <p-message *ngIf="email.errors['required']" severity="error" text="Email is required"></p-message>
            <p-message *ngIf="email.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
          </div>
        </div>
      </div>
    </div>
  </ng-template>

    <ng-template pTemplate="footer">
      <button pButton pRipple label="Cancel" icon="pi pi-times" class="p-button-text"
       (click)="userEditDialog = false" ></button>
      <button pButton pRipple label="Edit Details" icon="pi pi-check" class="p-button-text" (click)="update_user(this.user)"
        ></button>
    </ng-template>

    <!--Delete Dialog-->
  </p-dialog>

  <p-dialog [(visible)]="deleteUserDialog" header="Confirm" [modal]="true" [style]="{width:'450px'}">
    <div class="flex align-items-c justify-content-c">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
      <span *ngIf="user">Are you sure you want to delete <b>{{user.name}}</b>?</span>
    </div>
    <ng-template pTemplate="footer">
      <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No"
        (click)="deleteUserDialog = false"></button>
      <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes"
       (click)="delete_User(user.yash_id)" ></button>
    </ng-template>
  </p-dialog>

     




    `,
    providers: [MessageService, ManageAdminsService, ConfirmationService]
})
export class ManageUsers implements OnInit {
    adminDialog: boolean = false;

    users = signal<User[]>([]);
    user!: User;
    selectedusers!: User[] | null;
    submitted: boolean = false;

    integerRegex = /^\d+$/;
    emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    cols!: Column[];

    yash_id!: number;

    types: Type[] = [];

    businessunits: any[] = [];


    
    messages: any[] = [];
    userEditDialog: boolean = false;
    deleteUserDialog: boolean = false;

    loading: boolean = true;
    userDialog: boolean = false;
  userTypes = [
    { label: 'Superadmin', value: 'Superadmin' },
    { label: 'manager', value: 'manager' },
    { label: 'user', value: 'user' }
  ];
  filteredTypes: any[] = [];

  businessUnits = [
    { label: 'BG6-BU1', value: 'BG6-BU1' },
    { label: 'BG6-BU2', value: 'BG6-BU2' },
    { label: 'BG6-BU3', value: 'BG6-BU3' },
    { label: 'BG6-BU4', value: 'BG6-BU4' },
    { label: 'BG6-BU5', value: 'BG6-BU5' },
    { label: 'BG6-BU6', value: 'BG6-BU6' },
    { label: 'BG6-BU7', value: 'BG6-BU7' },
    { label: 'BG6-BU8', value: 'BG6-BU8' },
  ];
  filteredBusinessUnits: any[] = [];

    constructor(
        private fb: FormBuilder,
        private manageadminservice: ManageAdminsService,
        public messageService: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin') {
                this.isvalid = true;
            } else {
                this.router.navigate(['/auth/access']);
            }
        });
    }

    ngOnInit() {
        this.loadDemoData();
        
        this.messages = [];

        
        

    }

    loadDemoData() {
        this.manageadminservice.getUsers().subscribe((data: any) => {
            this.users.set(data);
            this.loading = false;
        });
       this.cols = [
      { field: 'yash_id', header: 'Yash ID' },
      { field: 'name', header: 'User Name' },
      { field: 'email', header: 'Email' },
      
      { field: 'b_unit', header: 'BUH' },
      { field: 'type', header: 'Type' },
      { field: 'active', header: 'Active' },

    ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    
    openNew() {
    this.user = {};
    this.submitted = false;
    this.userDialog = true;
    }
    

    exportCSV() {
        this.dt.exportCSV();
    }

    

filterTypes(event: { query: string }) {
  const query = event.query.toLowerCase();
  this.filteredTypes = this.userTypes.filter(type =>
    type.label.toLowerCase().startsWith(query));
}

filterBusinessUnits(event: { query: string }) {
  const query = event.query.toLowerCase();
  this.filteredBusinessUnits = this.businessUnits.filter(unit =>
    unit.label.toLowerCase().startsWith(query));
}


    editUser(user: User) {
    this.user = { ...user };
    
    this.userEditDialog = true;
  }

  deleteUser(user: User) {
    this.deleteUserDialog = true;
    this.user = { ...user };

  }

  addUser(user: User) {
  this.submitted = true;

  

  // Add user logic if validation passes
  this.manageadminservice.add_user(user).subscribe(createdUser => {
    this.userDialog = false;
    this.submitted = false;
    this.user = {};
    // Add the created user to the local signal list
    this.users.update(users => [...users, createdUser]);
    this.messageService.add({ severity: 'success', summary: 'User Added', detail: 'Via AddService' });
  });
}



  update_user(user: User) {
    this.manageadminservice.edit_User(this.user).subscribe(
      (data: any) => {
        
        this.submitted = true;
        this.userEditDialog = false;
        this.messageService.add({ severity: 'success', summary: 'User has been Edited', detail: 'Via EditService' });
        this.reloadPage();
      }
    )
  }


  delete_User(yash_id: any): void {
    this.manageadminservice.delete_user(yash_id).subscribe(
      (data) => {
        this.deleteUserDialog = false;
        this.messageService.add({ severity: 'success', summary: 'User has been Deleted', detail: 'Via DeleteService' });
        this.reloadPage();
      });
  }

  reloadPage() {
    window.location.reload();
  }

    
}
