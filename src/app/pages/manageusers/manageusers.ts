import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Column { field: string; header: string; customExportHeader?: string; }
export interface Type { id?: number; type?: string; }
interface ExportColumn { title: string; dataKey: string; }

@Component({
    selector: 'app-manageusers',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, RippleModule, ToastModule,
        RouterModule, ToolbarModule, RatingModule, PanelModule, AutoCompleteModule, InputTextModule,
        TextareaModule, SelectModule, RadioButtonModule, InputNumberModule, DialogModule, TagModule,
        InputIconModule, IconFieldModule, ConfirmDialogModule, PasswordModule, MessageModule, PaginatorModule
    ],
    styles: `
        /* ── Base ── */
        .p-toolbar { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }
        .card { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }
        label.required:after { content: "*"; color: red; margin-left: 5px; }
        .error { border: 1px solid red; }
        input[pInputText], textarea[pInputTextarea] { width: 100%; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%; }
        .form-field { display: flex; flex-direction: column; width: 100%; }
        .responsive-form .custom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .responsive-form .custom-grid { grid-template-columns: 1fr; } }

        /* ── Toolbar row ── */
        .toolbar-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 0.75rem; gap: 1rem; flex-wrap: wrap;
        }
        .toolbar-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

        /* ── View toggle ── */
        .view-toggle { display: flex; gap: 0; border-radius: 8px; overflow: hidden; border: 1px solid #c8e6c9; }
        .view-toggle button {
            background: #fff; border: none; padding: 6px 14px; cursor: pointer;
            color: #6c757d; font-size: 1rem; transition: background 0.18s, color 0.18s;
            display: flex; align-items: center; gap: 5px;
        }
        .view-toggle button.active { background: #4caf50; color: #fff; }
        .view-toggle button:hover:not(.active) { background: #e8f5e9; color: #388e3c; }

        /* ── TABLE view ── */
        .custom-table-container { width: 100%; overflow-x: auto; margin-bottom: 1rem; border-radius: 8px; }
        .glass-table { width: 100%; border-collapse: collapse; min-width: 75rem; font-size: 0.95rem; }
        .glass-table thead th {
            text-align: left; padding: 1rem; font-weight: bold; color: #11224E;
            border-bottom: 2px solid rgba(255,255,255,0.4); white-space: nowrap;
            background-color: #cce4f7;
        }
        .glass-table tbody td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.2); vertical-align: middle; color: #222; }
        .glass-table tbody tr { transition: background-color 0.2s; }
        .glass-table tbody tr:hover { background-color: rgba(255,255,255,0.3); }

        /* ── CARD view ── */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.25rem;
            margin-bottom: 1rem;
        }
        .user-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e0f0e9;
            box-shadow: 0 2px 14px 0 rgba(76,175,80,0.10);
            padding: 1.25rem 1.4rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            transition: box-shadow 0.2s, transform 0.2s;
            position: relative;
            overflow: hidden;
        }
        .user-card:hover {
            box-shadow: 0 6px 28px 0 rgba(76,175,80,0.22);
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .card-avatar {
            width: 44px; height: 44px; border-radius: 50%;
            background: linear-gradient(135deg, #4caf50, #81c784);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 700; font-size: 1.1rem;
            flex-shrink: 0;
        }
        .card-name-block { flex: 1; margin-left: 0.75rem; }
        .card-name { font-size: 1rem; font-weight: 700; color: #11224E; line-height: 1.3; }
        .card-email { font-size: 0.8rem; color: #666; margin-top: 2px; word-break: break-all; }
        .type-badge {
            display: inline-block; padding: 3px 10px; border-radius: 20px;
            font-size: 0.74rem; font-weight: 600; white-space: nowrap;
            background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9;
        }
        .type-badge.superadmin { background: #fce4ec; color: #880e4f; border-color: #f48fb1; }
        .type-badge.manager    { background: #fff3e0; color: #e65100; border-color: #ffcc80; }
        .type-badge.user       { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
        .card-divider { border: none; border-top: 1px solid #f0f4f0; margin: 0.4rem 0; }
        .card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem 1rem; }
        .card-meta-item { font-size: 0.82rem; color: #444; }
        .card-meta-item span { display: block; font-size: 0.72rem; color: #999; margin-bottom: 1px; }
        .card-approvers { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .approver-chip {
            border-radius: 20px; padding: 2px 9px; font-size: 0.73rem; font-weight: 500;
            background: #e3f2fd; color: #1565c0;
        }
        .approver-chip.srm { background: #f3e5f5; color: #6a1b9a; }
        .approver-chip.buh { background: #e8f5e9; color: #2e7d32; }
        .approver-chip.bgh { background: #fff3e0; color: #e65100; }
        .card-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
        .empty-state { text-align: center; padding: 3rem; color: #888; }
        .empty-state i { font-size: 2rem; display: block; margin-bottom: 0.75rem; color: #ccc; }
    `,
    template: `
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Add User" icon="pi pi-plus" severity="primary" (onClick)="openNew()" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Export to Excel" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                </ng-template>
            </p-toolbar>

            <!-- ── Toolbar row ── -->
            <div class="toolbar-row">
                <h5 class="m-0">Manage Users</h5>
                <div class="toolbar-right">
                    <!-- Search -->
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onSearch($event)" placeholder="Search..." />
                    </p-iconfield>

                    <!-- View toggle -->
                    <div class="view-toggle">
                        <button [class.active]="viewMode === 'table'" (click)="viewMode = 'table'" title="Table view">
                            <i class="pi pi-list"></i>
                        </button>
                        <button [class.active]="viewMode === 'card'" (click)="viewMode = 'card'" title="Card view">
                            <i class="pi pi-th-large"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- ═══════════════ TABLE VIEW ═══════════════ -->
            <ng-container *ngIf="viewMode === 'table'">
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
                                <td style="min-width:100px;background-color:rgba(150,201,244,0.3)"><b>{{user.yash_id}}</b></td>
                                <td style="min-width:200px">{{user.name}}</td>
                                <td style="min-width:200px">{{user.email}}</td>
                                <td style="min-width:100px">{{user.b_unit}}</td>
                                <td style="white-space:nowrap">{{user.irm}}</td>
                                <td style="white-space:nowrap">{{user.srm}}</td>
                                <td style="white-space:nowrap">{{user.buh}}</td>
                                <td style="white-space:nowrap">{{user.bgh}}</td>
                                <td style="min-width:40px"><b>{{user.type}}</b></td>
                                <td>
                                    <div class="flex" style="min-width:100px">
                                        <button pButton pRipple icon="pi pi-user-edit" class="p-button-rounded p-button-success mr-2" (click)="editUser(user)"></button>
                                        <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="deleteUser(user)"></button>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="paginatedUsers.length === 0 && !loading">
                                <td colspan="10" class="empty-state">No Users found.</td>
                            </tr>
                            <tr *ngIf="loading">
                                <td colspan="10" class="empty-state">Loading...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </ng-container>

            <!-- ═══════════════ CARD VIEW ═══════════════ -->
            <ng-container *ngIf="viewMode === 'card'">

                <div *ngIf="loading" class="empty-state">
                    <i class="pi pi-spin pi-spinner"></i>
                    Loading...
                </div>

                <div *ngIf="!loading && paginatedUsers.length === 0" class="empty-state">
                    <i class="pi pi-users"></i>
                    No Users found.
                </div>

                <div class="card-grid" *ngIf="!loading && paginatedUsers.length > 0">
                    <div class="user-card" *ngFor="let user of paginatedUsers">

                        <!-- Header: avatar + name + type badge -->
                        <div class="card-header">
                            <div class="card-avatar">{{ getInitials(user.name) }}</div>
                            <div class="card-name-block">
                                <div class="card-name">{{ user.name }}</div>
                                <div class="card-email">{{ user.email }}</div>
                            </div>
                            <span class="type-badge"
                                [class.superadmin]="user.type?.toLowerCase() === 'superadmin'"
                                [class.manager]="user.type?.toLowerCase() === 'manager'"
                                [class.user]="user.type?.toLowerCase() === 'user'">
                                {{ user.type }}
                            </span>
                        </div>

                        <hr class="card-divider" />

                        <!-- Meta grid -->
                        <div class="card-meta">
                            <div class="card-meta-item">
                                <span>Yash ID</span>{{ user.yash_id || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Business Unit</span>{{ user.b_unit || '—' }}
                            </div>
                        </div>

                        <!-- Approvers -->
                        <div class="card-approvers" *ngIf="user.irm || user.srm || user.buh || user.bgh">
                            <span class="approver-chip" *ngIf="user.irm" title="IRM">IRM: {{ user.irm }}</span>
                           
                        </div>

                        <hr class="card-divider" />

                        <!-- Actions -->
                        <div class="card-actions">
                            <button pButton pRipple icon="pi pi-user-edit" label="Edit"
                                class="p-button-outlined p-button-success p-button-sm" style="flex:1"
                                (click)="editUser(user)"></button>
                            <button pButton pRipple icon="pi pi-trash" label="Delete"
                                class="p-button-outlined p-button-danger p-button-sm" style="flex:1"
                                (click)="deleteUser(user)"></button>
                        </div>

                    </div>
                </div>
            </ng-container>

            <!-- Paginator -->
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

        <!-- ── Add User Dialog ── -->
        <p-dialog [(visible)]="userDialog" [style]="{width:'700px'}" header="Add User" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="required">Type</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes" (completeMethod)="filterTypes($event)"
                                [(ngModel)]="user.type" optionLabel="label" optionValue="value" placeholder="Select a Type"
                                [forceSelection]="true" [showClear]="true" [required]="true" #type="ngModel"
                                [ngClass]="{'ng-invalid ng-dirty': submitted && !user.type}"></p-autocomplete>
                            <p-message *ngIf="((type.touched || type.dirty || submitted) && type.invalid)" severity="error" text="User Type is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required">Business Unit</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits" (completeMethod)="filterBusinessUnits($event)"
                                [(ngModel)]="user.b_unit" optionLabel="label" optionValue="value" placeholder="Select Business Unit"
                                [forceSelection]="true" [showClear]="true" [required]="true" #b_unit="ngModel"
                                [ngClass]="{'ng-invalid ng-dirty': submitted && !user.b_unit}"></p-autocomplete>
                            <p-message *ngIf="((b_unit.touched || b_unit.dirty || submitted) && b_unit.invalid)" severity="error" text="Business Unit is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required">Yash ID</label>
                            <input type="text" pInputText [(ngModel)]="user.yash_id" required #yash_id="ngModel" [pattern]="integerRegex"
                                [ngClass]="{error: yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)}">
                            <div *ngIf="yash_id.errors && ((yash_id.touched || yash_id.dirty || submitted) && yash_id.invalid)">
                                <p-message *ngIf="yash_id.errors['required']" severity="error" text="Yash ID is required"></p-message>
                                <p-message *ngIf="yash_id.errors['pattern']" severity="error" text="Not a Valid Format"></p-message>
                            </div>
                        </div>
                        <div class="form-field">
                            <label class="required">User Name</label>
                            <input type="text" pInputText [(ngModel)]="user.name" #name="ngModel" required
                                [ngClass]="{'ng-invalid ng-dirty': submitted && !user.name}" />
                            <p-message *ngIf="((name.touched || name.dirty || submitted) && name.invalid)" severity="error" text="User Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required">Password</label>
                            <p-password [(ngModel)]="user.password" required #password="ngModel" [toggleMask]="true"
                                styleClass="mb-5" inputStyleClass="w-full p-3 md:w-40rem"
                                [ngClass]="{'ng-invalid ng-dirty': submitted && !user.password}"></p-password>
                            <p-message *ngIf="((password.touched || password.dirty || submitted) && password.invalid)" severity="error" text="Password is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required">Email</label>
                            <input type="email" pInputText [(ngModel)]="user.email" #email="ngModel" [pattern]="emailRegex" required
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

        <!-- ── Edit User Dialog ── -->
        <p-dialog [(visible)]="userEditDialog" [style]="{width:'700px'}" header="Edit User Details" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="required">Type</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredTypes" (completeMethod)="filterTypes($event)"
                                [(ngModel)]="user.type" optionLabel="label" optionValue="value" [forceSelection]="true"></p-autocomplete>
                        </div>
                        <div class="form-field">
                            <label class="required">Business Unit</label>
                            <p-autocomplete [dropdown]="true" [suggestions]="filteredBusinessUnits" (completeMethod)="filterBusinessUnits($event)"
                                [(ngModel)]="user.b_unit" optionLabel="label" optionValue="value" [forceSelection]="true"></p-autocomplete>
                        </div>
                        <div class="form-field">
                            <label class="required">Yash ID</label>
                            <input type="text" pInputText [(ngModel)]="user.yash_id" required>
                        </div>
                        <div class="form-field">
                            <label class="required">User Name</label>
                            <input type="text" pInputText [(ngModel)]="user.name" required />
                        </div>
                        <div class="form-field">
                            <label class="required">Email</label>
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

        <!-- ── Delete Confirm Dialog ── -->
        <p-dialog [(visible)]="deleteUserDialog" header="Confirm" [modal]="true" [style]="{width:'450px'}">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size:2rem"></i>
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

    /** 'table' | 'card' */
    viewMode: 'table' | 'card' = 'card';

    userTypes = [
        { label: 'User', value: 'user' },
        { label: 'Manager', value: 'manager' }
    ];
    filteredTypes: any[] = [];

    businessUnits = [
        { label: 'BG6-BU1', value: 'BG6-BU1' }, { label: 'BG6-BU2', value: 'BG6-BU2' },
        { label: 'BG6-BU3', value: 'BG6-BU3' }, { label: 'BG6-BU4', value: 'BG6-BU4' },
        { label: 'BG6-BU5', value: 'BG6-BU5' }, { label: 'BG6-BU6', value: 'BG6-BU6' },
        { label: 'BG6-BU7', value: 'BG6-BU7' }, { label: 'BG6-BU8', value: 'BG6-BU8' },
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
            this.filteredUsersList = data;
            this.loading = false;
        });
        this.cols = [
            { field: 'yash_id', header: 'Yash ID' }, { field: 'name', header: 'User Name' },
            { field: 'email', header: 'Email' }, { field: 'b_unit', header: 'BUH' },
            { field: 'type', header: 'Type' }, { field: 'irm', header: 'IRM' },
            { field: 'srm', header: 'SRM' }, { field: 'buh', header: 'BUH' },
            { field: 'bgh', header: 'BGH' }, { field: 'active', header: 'Active' },
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchTerm = value;
        this.first = 0;
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

    get paginatedUsers(): User[] {
        return this.filteredUsersList.slice(this.first, this.first + this.rows);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
    }

    /** Returns up-to-2-letter initials from a name */
    getInitials(name?: string): string {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    exportCSV() {
        if (this.filteredUsersList.length === 0) return;
        const worksheetData = this.filteredUsersList.map((user: any) => {
            const row: any = {};
            this.exportColumns.forEach(col => { row[col.title] = user[col.dataKey]; });
            return row;
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook: XLSX.WorkBook = { Sheets: { Users: worksheet }, SheetNames: ['Users'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'users_list.xlsx');
        this.messageService.add({ severity: 'success', summary: 'Users Exported', detail: 'Via ExportService' });
    }

    filterTypes(event: { query: string }) {
        const query = event.query.toLowerCase();
        this.filteredTypes = this.userTypes.filter(t => t.label.toLowerCase().startsWith(query));
    }

    filterBusinessUnits(event: { query: string }) {
        const query = event.query.toLowerCase();
        this.filteredBusinessUnits = this.businessUnits.filter(u => u.label.toLowerCase().startsWith(query));
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
            this.users.update(users => [...users, createdUser]);
            this.onSearch({ target: { value: this.searchTerm } } as any);
            this.messageService.add({ severity: 'success', summary: 'User Added', detail: 'Via AddService' });
        });
    }

    update_user(user: User) {
        this.manageadminservice.edit_User(this.user).subscribe((data: any) => {
            this.submitted = true;
            this.userEditDialog = false;
            this.messageService.add({ severity: 'success', summary: 'User has been Edited', detail: 'Via EditService' });
            this.reloadPage();
        });
    }

    delete_User(yash_id: any): void {
        this.manageadminservice.delete_user(yash_id).subscribe((data) => {
            this.deleteUserDialog = false;
            this.messageService.add({ severity: 'success', summary: 'User has been Deleted', detail: 'Via DeleteService' });
            this.reloadPage();
        });
    }

    reloadPage() { window.location.reload(); }
}