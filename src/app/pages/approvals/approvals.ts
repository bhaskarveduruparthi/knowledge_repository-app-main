import { Component, OnInit, signal, ViewChild, computed } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
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
import { FluidModule } from 'primeng/fluid';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthenticationService } from '../service/authentication.service';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ManageReposService, Repository } from '../service/managerepos.service';
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { User } from '../service/manageadmins.service';

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
    selector: 'app-approvals',
    standalone: true,
    styles: [`
        .background-wrapper {
            background-color: #e6f2ea;
            min-height: 100vh;
            width: 100%;
            padding: 32px 0;
        }

        .card {
            padding: 0;
            margin: 0 auto;
            border-radius: 24px;
            box-shadow: none;
            background: transparent;
        }

        .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 1rem;
            justify-items: stretch;
        }

        .approval-card {
            background: rgba(255, 255, 255, 0.13);
            border-radius: 24px;
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            padding: 1.5rem;
            color: #19202C;
            display: flex;
            flex-direction: column;
            min-height: 260px;
            width: 100%;
            margin: 0;
            transition: box-shadow 0.2s;
        }

        .approval-card:hover {
            box-shadow: 0 12px 40px rgba(31,38,135,0.18);
        }

        .approval-card h4 {
            margin-bottom: 1rem;
            color: #23304b;
        }

        .approval-card p {
            margin: 0.3rem 0;
            font-size: 1rem;
        }

        .approval-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            justify-content: flex-end;
        }

        .p-toolbar {
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        }

        .search-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .search-input-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-input-container .pi-search {
            position: absolute;
            left: 0.75rem;
            color: #6c757d;
            pointer-events: none;
            z-index: 1;
        }

        .search-input-container input {
            padding-left: 2.25rem;
            border-radius: 20px;
            border: 1px solid #c8e6c9;
            background: rgba(255,255,255,0.8);
            width: 280px;
            height: 38px;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input-container input:focus {
            border-color: #4caf50;
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.15);
        }

        .search-clear-btn {
            position: absolute;
            right: 0.5rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            display: flex;
            align-items: center;
            font-size: 0.8rem;
        }

        .search-clear-btn:hover {
            color: #333;
        }

        .search-result-count {
            font-size: 0.85rem;
            color: #6c757d;
            white-space: nowrap;
        }

        .no-results {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
            font-size: 1rem;
            grid-column: 1 / -1;
        }

        .no-results .pi {
            font-size: 3rem;
            color: #a5d6a7;
            display: block;
            margin-bottom: 1rem;
        }

        .error {
            border: 1px solid red;
        }

        @media (max-width: 700px) {
            .cards-container {
                grid-template-columns: 1fr;
            }
            .approval-card {
                min-width: 0;
            }
            .search-input-container input {
                width: 180px;
            }
        }
    `],
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
        FluidModule,
        PanelModule,
        AutoCompleteModule,
        PaginatorModule,
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
    template: `
        <div class="card">
            <p-toast />
            <div class="card">
                <p-toolbar styleClass="mb-6">
                    <ng-template #start>
                        <span><strong><h4>Manage Approvals</h4></strong></span>
                    </ng-template>

                    <ng-template #center>
                        <!-- Search Bar -->
                        
                    </ng-template>

                    <ng-template #end>
                        <div class="search-wrapper">
                            <div class="search-input-container">
                                <i class="pi pi-search"></i>
                                <input
                                    type="text"
                                    [value]="searchQuery()"
                                    placeholder="Search by name, module, domain, sector..."
                                    (input)="onSearchChange($event)"
                                />
                                <button
                                    *ngIf="searchQuery()"
                                    class="search-clear-btn"
                                    (click)="clearSearch()"
                                    title="Clear search">
                                    <i class="pi pi-times"></i>
                                </button>
                            </div>
                            <span class="search-result-count" *ngIf="searchQuery()">
                                {{ filteredRepositories().length }} of {{ repositories().length }} results
                            </span>
                        </div>
                        <span></span>
                        <!--<p-button
                            label="Go to Repository"
                            icon="pi pi-arrow-right"
                            severity="help"
                            (onClick)="gotoRepos()">
                        </p-button>-->
                    </ng-template>
                </p-toolbar>

                <div class="cards-container">
                    <!-- No results state -->
                    <div *ngIf="filteredRepositories().length === 0 && searchQuery()" class="no-results">
                        <i class="pi pi-search"></i>
                        <p>No repositories found for <b>"{{ searchQuery() }}"</b></p>
                        <p style="font-size:0.85rem">Try searching by customer name, module, domain, or sector.</p>
                        <button pButton type="button" label="Clear Search" icon="pi pi-times"
                            class="p-button-outlined p-button-sm" style="margin-top:0.75rem"
                            (click)="clearSearch()"></button>
                    </div>

                    <!-- Empty state (no data at all) -->
                    <div *ngIf="repositories().length === 0 && !searchQuery()" class="no-results">
                        <i class="pi pi-inbox"></i>
                        <p>No repositories pending approval.</p>
                    </div>

                    <div *ngFor="let repo of filteredRepositories()"
                         class="approval-card">
                        <h4>{{ repo.module_name }} - {{ repo.domain }}</h4>
                        <p><b>Customer:</b> {{ repo.customer_name }}</p>
                        <p><b>Sector:</b> {{ repo.sector }}</p>
                        <p><b>Standard/Custom:</b> {{ repo.standard_custom }}</p>
                        <p><b>Created by:</b> {{ repo.username }}</p>
                        <div class="approval-actions">
                            <button pButton type="button" label="Approve" icon="pi pi-check"
                                class="p-button-success" (click)="approve_dialog(repo)"
                                [disabled]="repo.Approval_status === 'Approved'"></button>
                            <button pButton type="button" label="Delegate" icon="pi pi-forward"
                                class="p-button-info" (click)="delegate_dialog(repo)"
                                [disabled]="repo.Approval_status === 'Approved'"></button>
                            <button pButton type="button" label="Reject" icon="pi pi-times"
                                class="p-button-danger" (click)="reject_dialog(repo)"
                                [disabled]="repo.Approval_status === 'Approved'"></button>
                            <button pButton type="button" label="More Info" icon="pi pi-info-circle"
                                (click)="showDetails(repo)"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <p-dialog header="Solution Details"
            [(visible)]="dialogVisible"
            [modal]="true"
            [style]="{width: '700px'}"
            (onHide)="closeDetails()">
            <div *ngIf="selectedRepo">
                <p><b>Customer Name:</b> {{ selectedRepo.customer_name }}</p>
                <p><b>Domain:</b> {{ selectedRepo.domain }}</p>
                <p><b>Sector:</b> {{ selectedRepo.sector }}</p>
                <p><b>Module Name:</b> {{ selectedRepo.module_name }}</p>
                <p><b>Detailed Requirement:</b> {{ selectedRepo.detailed_requirement }}</p>
                <p><b>Standard/Custom:</b> {{ selectedRepo.standard_custom }}</p>
                <p><b>Technical Details:</b> {{ selectedRepo.technical_details }}</p>
                <p><b>Customer Benefit:</b> {{ selectedRepo.customer_benefit }}</p>
                <p><b>Created by:</b> {{ selectedRepo.username }}</p>
            </div>
        </p-dialog>

        <p-dialog [(visible)]="approvedialog" header="Approve Solution" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                <span *ngIf="repository">
                    Are you sure you want to approve the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Solution?
                </span>
            </div>
            <br>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="sendforapprovaldialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Repoapproval(repository)"></button>
            </ng-template>
        </p-dialog>

        <p-dialog
            [(visible)]="delegatedialog"
            header="Delegate Solution"
            [modal]="true"
            [style]="{ width: '1020px' }">
            <div class="flex flex-column" style="gap: 1rem">
                <div class="flex align-items-center" style="gap: 0.75rem">
                    <i class="pi pi-exclamation-triangle" style="font-size: 1.8rem"></i>
                    <span>
                        Delegate
                        <b>{{ repository?.customer_name }}'s - {{ repository?.module_name }}</b>
                        to a user?
                    </span>
                </div>

                <div class="flex flex-column" style="gap: 0.25rem; padding: 0.75rem 1rem; border-radius: 8px; background: #f5f7fb">
                    <div class="flex">
                        <span class="font-bold" style="width: 130px">Domain:</span>
                        <span>{{ repository?.domain }}</span>
                    </div>
                    <div class="flex">
                        <span class="font-bold" style="width: 130px">Sector:</span>
                        <span>{{ repository?.sector }}</span>
                    </div>
                    <div class="flex">
                        <span class="font-bold" style="width: 130px">Technical Details:</span>
                        <span>{{ repository?.technical_details }}</span>
                    </div>
                    <div class="flex">
                        <span class="font-bold" style="width: 130px">Created by:</span>
                        <span>{{ repository?.username }}</span>
                    </div>
                </div>

                <div class="flex flex-column" style="gap: 0.25rem">
                    <label for="delegateUser" class="font-bold">Select User</label>
                    <p-select
                        id="delegateUser"
                        [(ngModel)]="selectedDelegateUserId"
                        [options]="delegateUsers"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Click to select user..."
                        class="w-full"
                        showClear="true"
                        filter="false">
                    </p-select>
                    <small *ngIf="!selectedDelegateUserId" class="p-error">
                        User selection is required.
                    </small>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end align-items-center w-full" style="gap: 0.75rem">
                    <button pButton pRipple type="button" icon="pi pi-times" class="p-button-text"
                        label="Cancel" (click)="delegatedialog = false"></button>
                    <button pButton pRipple type="button" icon="pi pi-share" class="p-button-info"
                        label="Delegate" [disabled]="!selectedDelegateUserId"
                        (click)="delegateRepository()"></button>
                </div>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="rejectdialog" header="Reject Solution" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                <span *ngIf="repository">
                    Are you sure you want to reject the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Solution?
                </span>
            </div>
            <br>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="rejectdialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Reporeject(repository)"></button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService, FormBuilder]
})
export class ManageApprovals implements OnInit {
    adminDialog: boolean = false;
    repositories = signal<Repository[]>([]);
    repository!: Repository;
    selectedrepositories: Repository[] = [];
    submitted: boolean = false;
    selectedFile: File | null = null;
    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    issent: boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    uploaddialog: boolean = false;
    approvedialog: boolean = false;
    createdialog: boolean = false;
    messages: any[] = [];
    selectedDelegateUserId: number | null = null;
    ApprovalCurrentPage!: number;
    page!: number;
    dialogVisible: boolean = false;
    selectedRepo: any = null;
    first!: number;

    loading: boolean = true;
    repoForm!: FormGroup;

    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
    sendforapproval: boolean = false;
    sendforapprovaldialog: boolean = false;
    deleteRepoDialog: boolean = false;
    rejectdialog: boolean = false;
    file: any;
    editrepodialog: boolean = false;
    business_justification: any;
    uploadcodeprocessdocdialog: boolean = false;
    delegatedialog: boolean = false;
    users = signal<User[]>([]);
    delegateUsers: User[] = [];

    // ── Search ──────────────────────────────────────────────────────────────
    // Must be a signal so computed() can reactively track it
    searchQuery = signal<string>('');

    filteredRepositories = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        if (!query) return this.repositories();

        return this.repositories().filter(repo => {
            return (
                repo.customer_name?.toLowerCase().includes(query) ||
                repo.module_name?.toLowerCase().includes(query) ||
                repo.domain?.toLowerCase().includes(query) ||
                repo.sector?.toLowerCase().includes(query) ||
                repo.standard_custom?.toLowerCase().includes(query) ||
                repo.technical_details?.toLowerCase().includes(query)
            );
        });
    });

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
    }

    clearSearch(): void {
        this.searchQuery.set('');
        const input = document.querySelector('.search-input-container input') as HTMLInputElement;
        if (input) input.value = '';
    }
    // ────────────────────────────────────────────────────────────────────────

    get isAdmin(): boolean {
        return this.downloadvalid === true;
    }

    get isExportEnabled(): boolean {
        if (this.isAdmin) {
            return this.selectedrepositories.length > 0;
        }
        return this.selectedrepositories.length > 0 && this.selectedrepositories.every((repo) => repo.Approval_status === 'Approved');
    }

    ngOnInit() {
        this.loadDemoData();
        this.loadUsers();
    }

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
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
            } else if (x?.type == 'manager') {
                this.isvalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
            } else {
                this.isvalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
            }
        });
    }

    showDetails(repo: any) {
        this.selectedRepo = repo;
        this.dialogVisible = true;
    }

    closeDetails() {
        this.dialogVisible = false;
        this.selectedRepo = null;
    }

    loadDemoData() {
        this.managereposervice.get_approval_repos().subscribe((data: any) => {
            this.repositories.set(data);
            this.loading = false;
        });
        this.cols = [
            { field: 'id', header: 'S.No.' },
            { field: 'customer_name', header: 'Customer Name' },
            { field: 'domain', header: 'Domain' },
            { field: 'sector', header: 'Sector' },
            { field: 'module_name', header: 'Module Name' },
            { field: 'detailed_requirement', header: 'Detailed Requirement' },
            { field: 'standard_custom', header: 'Standard/Custom' },
            { field: 'technical_details', header: 'Technical Details / Z Object Name' },
            { field: 'customer_benefit', header: 'Customer Benefit' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'attach_code_or_document', header: 'Code/Process Document' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    gotoRepos() {
        this.router.navigate(['/app/pages/managerepos']);
    }

    toggleRepoSelection(repo: Repository, checked: boolean) {
        if (checked) {
            this.selectedrepositories.push(repo);
        } else {
            this.selectedrepositories = this.selectedrepositories.filter((r) => r.id !== repo.id);
        }
    }

    approve_dialog(repository: Repository) {
        this.approvedialog = true;
        this.repository = { ...repository };
    }

    delegate_dialog(repository: Repository) {
        this.repository = { ...repository };
        console.log('delegateUsers at open:', Array.isArray(this.delegateUsers), this.delegateUsers);
        this.selectedDelegateUserId = null;
        this.delegatedialog = true;
    }

    reject_dialog(repository: Repository) {
        this.rejectdialog = true;
        this.repository = { ...repository };
    }

    loadUsers() {
        this.managereposervice.getUsers().subscribe({
            next: (data: any) => {
                console.log('RAW getUsers response:', data);

                let usersArray: User[] = [];

                if (Array.isArray(data)) {
                    usersArray = data as User[];
                } else if (Array.isArray(data?.data)) {
                    usersArray = data.data as User[];
                } else if (Array.isArray(data?.users)) {
                    usersArray = data.users as User[];
                } else if (Array.isArray(data?.results)) {
                    usersArray = data.results as User[];
                } else {
                    usersArray = data ? [data as User] : [];
                }

                console.log('Resolved usersArray:', usersArray);

                this.users.set(usersArray);
                this.delegateUsers = [...usersArray];

                console.log('delegateUsers final:', this.delegateUsers);
            },
            error: (error: any) => {
                console.error('getUsers error:', error);
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to load users: ${error.message || 'Unknown error'}`
                });
            }
        });
    }

    delegateRepository() {
        if (!this.selectedDelegateUserId || !this.repository?.id) {
            this.messageservice.add({
                severity: 'warn',
                summary: 'Missing data',
                detail: 'Please select a user to delegate.'
            });
            return;
        }

        const selectedUser = this.delegateUsers.find(u => u.id === this.selectedDelegateUserId);
        const payload = {
            id: this.repository.id,
            delegateUserId: this.selectedDelegateUserId,
            delegateUserName: selectedUser?.name
        };

        this.managereposervice.delegateRepository(payload).subscribe({
            next: () => {
                this.delegatedialog = false;
                this.selectedDelegateUserId = null;
                this.messageservice.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Delegated to ${selectedUser?.name}`
                });
                this.reloadPage();
            },
            error: (error: any) => {
                console.error('Delegate error:', error);
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.error?.message || 'Failed to delegate repository'
                });
            }
        });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    Repoapproval(repository: Repository) {
        this.managereposervice.RepoApproval(this.repository).subscribe((data: any) => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Approved', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    Reporeject(repository: Repository) {
        this.managereposervice.RepoRejection(this.repository).subscribe((data: any) => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Rejected', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    opendialog() {
        this.createdialog = true;
    }

    form_records() {
        this.managereposervice.get_approval_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() {
        window.location.reload();
    }
}