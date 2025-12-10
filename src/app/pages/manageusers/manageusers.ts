import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
// Removed TableModule
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
import { PaginatorModule } from 'primeng/paginator'; // Added Paginator explicitly
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
        // TableModule, // REMOVED
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
        PaginatorModule 
    ],
    styles: `
    /*.card {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 20px;
        color: #222;
        display: flex;
        flex-direction: column;
    }*/

    /* --- CUSTOM TABLE STYLES --- */
    .custom-table-container {
        width: 100%;
        overflow-x: auto;
        margin-bottom: 1rem;
        border-radius: 8px;
    }

    .glass-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 75rem;
        font-size: 0.95rem;
    }

    .glass-table thead th {
        text-align: left;
        padding: 1rem;
        font-weight: bold;
        color: #11224E;
        border-bottom: 2px solid rgba(255, 255, 255, 0.4);
        white-space: nowrap;
    }

    .glass-table tbody td {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        vertical-align: middle;
        color: #222;
    }

    .glass-table tbody tr {
        transition: background-color 0.2s;
    }

    .glass-table tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
    /* --------------------------- */

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

    .glass-table thead th {
    text-align: left;
    padding: 1rem;
    font-weight: bold;
    color: #11224E;
    border-bottom: 2px solid rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    background-color: #cce4f7; /* Add your desired background color here */
}


    .p-toolbar{
      
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        
    }

    input[pInputText],
    textarea[pInputTextarea] {
        width: 100%;
    }

    .card{
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
    }

    @media (max-width: 700px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }
    
    label.required:after {
        content: "*";
        color: red;
        margin-left: 5px;
    }

    .error {
        border: 1px solid red;
    }
    `,
    template: `
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                  <p-button label="Add User" icon="pi pi-plus" severity="primary" (onClick)="openNew()"  />
                </ng-template>
                <ng-template #end>
                    <p-button label="Export to Excel" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                </ng-template>
            </p-toolbar>

            <div class="flex items-center justify-between mb-3">
                <h5 class="m-0">Manage Users</h5>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onSearch($event)" placeholder="Search..." />
                </p-iconfield>
            </div>

            <div class="custom-table-container">
                <table class="glass-table">
                    <thead>
                        <tr>
                            <th>Yash ID</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Business Unit</th>
                            <th>IRM</th>
                            <th>SRM</th>
                            <th>BUH</th>
                            <th>BGH</th>
                            <th>Type</th>
                            
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let user of paginatedUsers">
                            <td style="min-width: 100px; background-color: rgba(150, 201, 244, 0.3)">
                                <b>{{user.yash_id}}</b>
                            </td>
                            <td style="min-width: 200px;">{{user.name}}</td>
                            <td style="min-width: 200px;">{{user.email}}</td>
                            <td style="min-width: 100px;">{{user.b_unit}}</td>
                            <td style="white-space: nowrap;">{{user.irm}}</td>
                            <td style="white-space: nowrap;">{{user.srm}}</td>
                            <td style="white-space: nowrap;">{{user.buh}}</td>
                            <td style="white-space: nowrap;">{{user.bgh}}</td>
                            <td style="min-width: 40px;"><b>{{user.type}}</b></td>
                            
                            <td>
                                <div class="flex" style="min-width: 100px;">
                                    <button pButton pRipple icon="pi pi-user-edit" class="p-button-rounded p-button-success mr-2"
                                        (click)="editUser(user)"></button>
                                    <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger"
                                        (click)="deleteUser(user)"></button>
                                </div>
                            </td>
                        </tr>
                        <tr *ngIf="paginatedUsers.length === 0 && !loading">
                            <td colspan="7" style="text-align:center; padding: 2rem;">No Users found.</td>
                        </tr>
                        <tr *ngIf="loading">
                             <td colspan="7" style="text-align:center; padding: 2rem;">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p-paginator 
                [totalRecords]="filteredUsersList.length" 
                [rows]="rows" 
                [first]="first"
                [rowsPerPageOptions]="[10, 20, 30]"
                (onPageChange)="onPageChange($event)"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Users"
                [showCurrentPageReport]="true">
            </p-paginator>
        </div>

        <p-dialog [(visible)]="userDialog" [style]="{width: '700px'}" header="Add User" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="required" for="type">Type</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes" (completeMethod)="filterTypes($event)" [(ngModel)]="user.type" optionLabel="label" optionValue="value" placeholder="Select a Type" [forceSelection]="true" [showClear]="true" [required]="true" #type="ngModel" [ngClass]="{'ng-invalid ng-dirty': submitted && !user.type}"></p-autocomplete>
                            <p-message *ngIf="((type.touched || type.dirty || submitted) && type.invalid)" severity="error" text="User Type is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="b_unit">Business Unit</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits" (completeMethod)="filterBusinessUnits($event)" [(ngModel)]="user.b_unit" optionLabel="label" optionValue="value" placeholder="Select Business Unit" [forceSelection]="true" [showClear]="true" [required]="true" #b_unit="ngModel" [ngClass]="{'ng-invalid ng-dirty': submitted && !user.b_unit}"></p-autocomplete>
                            <p-message *ngIf="((b_unit.touched || b_unit.dirty || submitted) && b_unit.invalid)" severity="error" text="Business Unit is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="yash_id">Yash ID</label>
                            <input type="text" pInputText id="yash_id" [(ngModel)]="user.yash_id" required #yash_id="ngModel" [pattern]="integerRegex" [ngClass]="{error: yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)}">
                            <div *ngIf="yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)">
                                <p-message *ngIf="yash_id.errors['required']" severity="error" text="Yash ID is required"></p-message>
                                <p-message *ngIf="yash_id.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
                            </div>
                        </div>
                        <div class="form-field">
                            <label class="required" for="name">User Name</label>
                            <input type="text" pInputText id="name" [(ngModel)]="user.name" #name="ngModel" required [ngClass]="{'ng-invalid ng-dirty': submitted && !user.name}" />
                            <p-message *ngIf="((name.touched || name.dirty || submitted) && name.invalid)" severity="error" text="User Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="password">Password</label>
                            <p-password id="password" [(ngModel)]="user.password" required #password="ngModel" [toggleMask]="true" styleClass="mb-5" inputStyleClass="w-full p-3 md:w-40rem" [ngClass]="{'ng-invalid ng-dirty': submitted && !user.password}"></p-password>
                            <p-message *ngIf="((password.touched || password.dirty || submitted) && password.invalid)" severity="error" text="Password is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="email">Email</label>
                            <input type="email" pInputText id="email" [(ngModel)]="user.email" #email="ngModel" [pattern]="emailRegex" required [ngClass]="{error: email.errors && ((email.touched || email.dirty || submitted) && email.invalid)}" />
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

        <p-dialog [(visible)]="userEditDialog" [style]="{width: '700px'}" header="Edit User Details" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                 <div class="responsive-form">
                    <div class="form-grid">
                         <div class="form-field">
                            <label class="required" for="edit_type">Type</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes" (completeMethod)="filterTypes($event)" [(ngModel)]="user.type" optionLabel="label" optionValue="value" [forceSelection]="true" ></p-autocomplete>
                        </div>
                         <div class="form-field">
                            <label class="required" for="edit_b_unit">Business Unit</label>
                             <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits" (completeMethod)="filterBusinessUnits($event)" [(ngModel)]="user.b_unit" optionLabel="label" optionValue="value" [forceSelection]="true"></p-autocomplete>
                        </div>
                         <div class="form-field">
                            <label class="required" for="edit_yash_id">Yash ID</label>
                            <input type="text" pInputText [(ngModel)]="user.yash_id" required>
                        </div>
                         <div class="form-field">
                            <label class="required" for="edit_name">User Name</label>
                            <input type="text" pInputText [(ngModel)]="user.name" required />
                        </div>
                        
                         <div class="form-field">
                            <label class="required" for="edit_email">Email</label>
                            <input type="email" pInputText [(ngModel)]="user.email" required />
                        </div>
                    </div>
                </div>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton pRipple label="Cancel" icon="pi pi-times" class="p-button-text" (click)="userEditDialog = false"></button>
                <button pButton pRipple label="Edit Details" icon="pi pi-check" class="p-button-text" (click)="update_user(user)"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="deleteUserDialog" header="Confirm" [modal]="true" [style]="{width:'450px'}">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                <span *ngIf="user">Are you sure you want to delete <b>{{user.name}}</b>?</span>
            </div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="deleteUserDialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="delete_User(user.yash_id)"></button>
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

    // Pagination & Filtering state
    filteredUsersList: User[] = [];
    first: number = 0;
    rows: number = 10;
    searchTerm: string = '';

    integerRegex = /^\d+$/;
    emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

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
        
        
        { label: 'User', value: 'user' },
        {label: 'Manager', value: 'manager'}
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
            this.filteredUsersList = data; // Initialize filtered list
            this.loading = false;
        });
        this.cols = [
            { field: 'yash_id', header: 'Yash ID' },
            { field: 'name', header: 'User Name' },
            { field: 'email', header: 'Email' },
            { field: 'b_unit', header: 'BUH' },
            { field: 'type', header: 'Type' },
            {field: 'irm', header: "IRM"},
            {field: 'srm', header: "SRM"},
            {field: 'buh', header: "BUH"},
            {field: 'bgh', header: "BGH"},

            { field: 'active', header: 'Active' },
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    // MANUAL SEARCH: Filters the list based on input
    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchTerm = value;
        this.first = 0; // Reset to first page on search

        if (!value) {
            this.filteredUsersList = this.users();
        } else {
            this.filteredUsersList = this.users().filter(user => 
                user.name?.toLowerCase().includes(value) || 
                user.email?.toLowerCase().includes(value) || 
                user.yash_id?.toString().includes(value) || 
                user.b_unit?.toLowerCase().includes(value)
            );
        }
    }

    // MANUAL PAGINATION: Slices the array for the current view
    get paginatedUsers(): User[] {
        const start = this.first;
        const end = this.first + this.rows;
        return this.filteredUsersList.slice(start, end);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    // MANUAL EXPORT: Generates XLSX file
    exportCSV() {
        if (this.filteredUsersList.length === 0) return;

        // Prepare worksheet data
        const worksheetData = this.filteredUsersList.map((user: any) => {
            const row: any = {};
            this.exportColumns.forEach((col) => {
                row[col.title] = user[col.dataKey];
            });
            return row;
        });

        // Create worksheet and workbook
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook: XLSX.WorkBook = {
            Sheets: { Users: worksheet },
            SheetNames: ['Users']
        };

        // Generate Excel file buffer
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save to file using FileSaver
        const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'users_list.xlsx');
        this.messageService.add({ severity: 'success', summary: 'Users Exported', detail: 'Via ExportService' });
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
        this.manageadminservice.add_user(user).subscribe(createdUser => {
            this.userDialog = false;
            this.submitted = false;
            this.user = {};
            // Update signal and reset filtered list
            this.users.update(users => [...users, createdUser]);
            this.onSearch({ target: { value: this.searchTerm } } as any); // Re-apply filter if active
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