import { Component, OnInit, signal, computed } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
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

interface Column { field: string; header: string; customExportHeader?: string; }
export interface Type { id?: number; type?: string; }
interface ExportColumn { title: string; dataKey: string; }

@Component({
    selector: 'app-managerejectedreport',
    standalone: true,
    styles: `
        /* ── Base ── */
        .custom-file-input {
            border: 1px solid #ced4da; border-radius: 6px; background-color: #f8f9fa;
            padding: 8px 12px; width: 100%; color: #333; font-size: 1rem; transition: border-color 0.2s;
        }
        .custom-file-input:hover { border-color: #007ad9; background-color: #e9ecef; }
        .p-toolbar { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }
        .card { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }
        label.required:after { content: "*"; color: red; margin-left: 5px; }
        .error { border: 1px solid red; }

        /* ── Toolbar row ── */
        .toolbar-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 0.75rem; gap: 1rem; flex-wrap: wrap;
        }
        .toolbar-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

        /* ── Search ── */
        .search-input-container { position: relative; display: flex; align-items: center; }
        .search-input-container .pi-search {
            position: absolute; left: 0.75rem; color: #6c757d; pointer-events: none; z-index: 1;
        }
        .search-input-container input {
            padding-left: 2.25rem; padding-right: 2rem; border-radius: 20px;
            border: 1px solid #c8e6c9; background: rgba(255,255,255,0.8);
            width: 300px; height: 36px; font-size: 0.92rem; outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input-container input:focus { border-color: #4caf50; box-shadow: 0 0 0 2px rgba(76,175,80,0.15); }
        .search-clear-btn {
            position: absolute; right: 0.5rem; background: none; border: none;
            cursor: pointer; color: #6c757d; padding: 0; font-size: 0.78rem; display: flex; align-items: center;
        }
        .search-clear-btn:hover { color: #333; }
        .search-result-count { font-size: 0.82rem; color: #6c757d; white-space: nowrap; }

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
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.25rem;
            margin-bottom: 1rem;
        }
        .repo-card {
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
        .repo-card:hover {
            box-shadow: 0 6px 28px 0 rgba(76,175,80,0.22);
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.25rem;
        }
        .card-title {
            font-size: 1rem;
            font-weight: 700;
            color: #11224E;
            line-height: 1.3;
        }
        .card-module {
            font-size: 0.82rem;
            color: #388e3c;
            font-weight: 600;
            margin-top: 2px;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.76rem;
            font-weight: 600;
            white-space: nowrap;
            background: #fff9c4;
            color: #f57f17;
            border: 1px solid #ffe082;
        }
        .status-badge.approved { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
        .status-badge.rejected { background: #ffebee; color: #c62828; border-color: #ef9a9a; }
        .status-badge.pending  { background: #fff9c4; color: #f57f17; border-color: #ffe082; }
        .card-divider { border: none; border-top: 1px solid #f0f4f0; margin: 0.4rem 0; }
        .card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem 1rem; }
        .card-meta-item { font-size: 0.81rem; color: #555; }
        .card-meta-item span { display: block; font-size: 0.73rem; color: #999; margin-bottom: 1px; }
        .card-detail { font-size: 0.83rem; color: #444; }
        .card-detail span { font-size: 0.73rem; color: #999; display: block; margin-bottom: 1px; }
        .card-detail p { margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-approvers { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
        .approver-chip {
            background: #e3f2fd; color: #1565c0; border-radius: 20px;
            padding: 2px 10px; font-size: 0.74rem; font-weight: 500;
        }
        .approver-chip.srm { background: #f3e5f5; color: #6a1b9a; }
        .approver-chip.buh { background: #e8f5e9; color: #2e7d32; }
        .approver-chip.bgh { background: #fff3e0; color: #e65100; }
        .empty-state { text-align: center; padding: 3rem; color: #888; }
        .empty-state i { font-size: 2rem; display: block; margin-bottom: 0.75rem; color: #ccc; }
    `,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, RippleModule, ToastModule,
        RouterModule, ToolbarModule, RatingModule, FluidModule, PanelModule, AutoCompleteModule,
        PaginatorModule, InputTextModule, TextareaModule, SelectModule, RadioButtonModule,
        InputNumberModule, DialogModule, TagModule, InputIconModule, IconFieldModule,
        ConfirmDialogModule, PasswordModule, MessageModule
    ],
    template: `
        <p-toast />
        <div class="card">

            <!-- ── Toolbar ── -->
            <div class="toolbar-row">
                <h5 class="m-0">Rejected</h5>
                <div class="toolbar-right">

                    <!-- Search -->
                    <div class="search-input-container">
                        <i class="pi pi-search"></i>
                        <input
                            type="text"
                            [value]="searchQuery()"
                            placeholder="Search current page..."
                            (input)="onSearchChange($event)"
                        />
                        <button *ngIf="searchQuery()" class="search-clear-btn" (click)="clearSearch()" title="Clear">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                    <span class="search-result-count" *ngIf="searchQuery()">
                        {{ filteredRepositories().length }} / {{ repositories().length }} rows
                    </span>

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
                                <th>Customer Name</th>
                                <th>Domain</th>
                                <th>Sector</th>
                                <th>Module Name</th>
                                <th>Detailed Requirement</th>
                                <th>Standard/Custom</th>
                                <th>Technical details</th>
                                <th>Customer Benefit</th>
                                <th>Created On</th>
                                <th>Created User</th>
                                <th>IRM</th>
                                <th>SRM</th>
                                <th>BUH</th>
                                <th>BGH</th>
                                <th>Business Justification</th>
                                <th>Repo Status</th>
                                <th>Repo Approver</th>
                                <th>Repo Approval Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let repo of filteredRepositories()">
                                <td style="white-space:nowrap">{{ repo.customer_name }}</td>
                                <td style="white-space:nowrap">{{ repo.domain }}</td>
                                <td style="white-space:nowrap">{{ repo.sector }}</td>
                                <td style="white-space:nowrap">{{ repo.module_name }}</td>
                                <td>{{ repo.detailed_requirement }}</td>
                                <td>{{ repo.standard_custom }}</td>
                                <td>{{ repo.technical_details }}</td>
                                <td>{{ repo.customer_benefit }}</td>
                                <td style="white-space:nowrap">{{ formatDate(repo.created_at) }}</td>
                                <td style="white-space:nowrap;text-align:center">{{ repo.username }}</td>
                                <td style="white-space:nowrap;text-align:center">{{ repo.irm }}</td>
                                <td style="white-space:nowrap;text-align:center">{{ repo.srm }}</td>
                                <td style="white-space:nowrap;text-align:center">{{ repo.buh }}</td>
                                <td style="white-space:nowrap;text-align:center">{{ repo.bgh }}</td>
                                <td>{{ repo.business_justification }}</td>
                                <td style="white-space:nowrap">{{ repo.Approval_status }}</td>
                                <td style="white-space:nowrap">{{ repo.Approver }}</td>
                                <td style="white-space:nowrap">{{ repo.Approval_date }}</td>
                            </tr>
                            <tr *ngIf="filteredRepositories().length === 0 && searchQuery() && !loading">
                                <td colspan="18" class="empty-state">
                                    <i class="pi pi-search"></i>
                                    No rows match <b>"{{ searchQuery() }}"</b> on this page.
                                    <button pButton type="button" label="Clear" icon="pi pi-times"
                                        class="p-button-text p-button-sm" style="margin-left:0.5rem"
                                        (click)="clearSearch()"></button>
                                </td>
                            </tr>
                            <tr *ngIf="repositories().length === 0 && !searchQuery() && !loading">
                                <td colspan="18" class="empty-state">No Repositories found.</td>
                            </tr>
                            <tr *ngIf="loading">
                                <td colspan="18" class="empty-state">Loading Data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </ng-container>

            <!-- ═══════════════ CARD VIEW ═══════════════ -->
            <ng-container *ngIf="viewMode === 'card'">

                <!-- Loading -->
                <div *ngIf="loading" class="empty-state">
                    <i class="pi pi-spin pi-spinner"></i>
                    Loading Data...
                </div>

                <!-- No results (search) -->
                <div *ngIf="!loading && filteredRepositories().length === 0 && searchQuery()" class="empty-state">
                    <i class="pi pi-search"></i>
                    No rows match <b>"{{ searchQuery() }}"</b> on this page.
                    <button pButton type="button" label="Clear" icon="pi pi-times"
                        class="p-button-text p-button-sm" style="margin-left:0.5rem"
                        (click)="clearSearch()"></button>
                </div>

                <!-- No data -->
                <div *ngIf="!loading && repositories().length === 0 && !searchQuery()" class="empty-state">
                    <i class="pi pi-inbox"></i>
                    No Repositories found.
                </div>

                <!-- Cards -->
                <div class="card-grid" *ngIf="!loading && filteredRepositories().length > 0">
                    <div class="repo-card" *ngFor="let repo of filteredRepositories()">

                        <!-- Header -->
                        <div class="card-header">
                            <div>
                                <div class="card-title">{{ repo.customer_name }}</div>
                                <div class="card-module">{{ repo.module_name }}</div>
                            </div>
                            <span class="status-badge"
                                [class.approved]="repo.Approval_status?.toLowerCase() === 'approved'"
                                [class.rejected]="repo.Approval_status?.toLowerCase() === 'rejected'"
                                [class.pending]="repo.Approval_status?.toLowerCase() === 'pending'">
                                {{ repo.Approval_status || 'Pending' }}
                            </span>
                        </div>

                        <hr class="card-divider" />

                        <!-- Meta grid -->
                        <div class="card-meta">
                            <div class="card-meta-item">
                                <span>Domain</span>{{ repo.domain || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Sector</span>{{ repo.sector || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Standard / Custom</span>{{ repo.standard_custom || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Created On</span>{{ formatDate(repo.created_at) || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Created By</span>{{ repo.username || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Rejected by</span>{{ repo.Approver || '—' }}
                            </div>
                            <div class="card-meta-item">
                                <span>Rejected Date</span>{{ repo.Approval_date || '—' }}
                            </div>
                        </div>

                        <!-- Detailed requirement -->
                        <div class="card-detail" *ngIf="repo.detailed_requirement">
                            <span>Detailed Requirement</span>
                            <p title="{{ repo.detailed_requirement }}">{{ repo.detailed_requirement }}</p>
                        </div>

                        <!-- Technical details -->
                        <div class="card-detail" *ngIf="repo.technical_details">
                            <span>Technical Details</span>
                            <p title="{{ repo.technical_details }}">{{ repo.technical_details }}</p>
                        </div>

                        <!-- Business justification -->
                        <div class="card-detail" *ngIf="repo.business_justification">
                            <span>Business Justification</span>
                            <p title="{{ repo.business_justification }}">{{ repo.business_justification }}</p>
                        </div>

                        <!-- Customer benefit -->
                        <div class="card-detail" *ngIf="repo.customer_benefit">
                            <span>Customer Benefit</span>
                            <p title="{{ repo.customer_benefit }}">{{ repo.customer_benefit }}</p>
                        </div>

                        <hr class="card-divider" />

                        <!-- Approvers row -->
                        <div class="card-approvers">
                            <span class="approver-chip" *ngIf="repo.irm" title="IRM">IRM: {{ repo.irm }}</span>
                            
                        </div>

                    </div>
                </div>
            </ng-container>

            <!-- Paginator -->
            <p-paginator
                [totalRecords]="totalitems" [first]="first"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Repos"
                [showCurrentPageReport]="true" [rows]="6"
                (onPageChange)="onPageChange($event)">
            </p-paginator>
        </div>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManageRejectedReport implements OnInit {
    adminDialog: boolean = false;
    repositories = signal<Repository[]>([]);
    repository!: Repository;
    selectedrepositories: Repository[] = [];
    submitted: boolean = false;
    selectedFile: File | null = null;
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    issent: boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    messages: any[] = [];
    RejectedCurrentPage!: number;
    page!: number;
    first!: number;
    loading: boolean = true;
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
    file: any;
    business_justification: any;

    /** 'table' | 'card' */
    viewMode: 'table' | 'card' = 'card';

    // ── Search ──────────────────────────────────────────────────────────────
    searchQuery = signal<string>('');

    filteredRepositories = computed(() => {
        const q = this.searchQuery().trim().toLowerCase();
        if (!q) return this.repositories();
        return this.repositories().filter(r =>
            r.customer_name?.toLowerCase().includes(q) ||
            r.module_name?.toLowerCase().includes(q) ||
            r.domain?.toLowerCase().includes(q) ||
            r.sector?.toLowerCase().includes(q) ||
            r.standard_custom?.toLowerCase().includes(q) ||
            r.technical_details?.toLowerCase().includes(q) ||
            r.username?.toLowerCase().includes(q) ||
            r.Approval_status?.toLowerCase().includes(q) ||
            r.Approver?.toLowerCase().includes(q)
        );
    });

    onSearchChange(event: Event): void {
        this.searchQuery.set((event.target as HTMLInputElement).value);
    }

    clearSearch(): void {
        this.searchQuery.set('');
        const input = document.querySelector('.search-input-container input') as HTMLInputElement;
        if (input) input.value = '';
    }
    // ────────────────────────────────────────────────────────────────────────

    get isAdmin(): boolean { return this.downloadvalid === true; }

    ngOnInit() {
        const storedPage = localStorage.getItem('RejectedCurrentPage');
        if (storedPage) {
            this.RejectedCurrentPage = parseInt(storedPage);
            this.first = (this.RejectedCurrentPage - 1) * 10;
        } else {
            this.RejectedCurrentPage = 1;
            localStorage.setItem('RejectedCurrentPage', '1');
            this.first = 0;
        }
        this.loadDemoData(this.RejectedCurrentPage);
        this.form_records();
    }

    constructor(
        private managereposervice: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin' || x?.type == 'manager') {
                this.isvalid = true;
            } else {
                this.router.navigate(['/auth/access']);
            }
        });
    }

    loadDemoData(page: number) {
        this.loading = true;
        this.managereposervice.getallrejectedrepos(page).subscribe((data: any) => {
            this.repositories.set(Array.isArray(data) ? data : []);
            this.loading = false;
        });
        this.cols = [
            { field: 'id', header: 'S.No.' }, { field: 'customer_name', header: 'Customer Name' },
            { field: 'domain', header: 'Domain' }, { field: 'sector', header: 'Sector' },
            { field: 'module_name', header: 'Module Name' }, { field: 'detailed_requirement', header: 'Detailed Requirement' },
            { field: 'standard_custom', header: 'Standard/Custom' }, { field: 'technical_details', header: 'Technical Details / Z Object Name' },
            { field: 'customer_benefit', header: 'Customer Benefit' }, { field: 'remarks', header: 'Remarks' },
            { field: 'attach_code_or_document', header: 'Code/Process Document' }
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    }

    onPageChange(event: any) {
        this.RejectedCurrentPage = event.page + 1;
        this.searchQuery.set('');
        this.loadDemoData(this.RejectedCurrentPage);
        localStorage.setItem('RejectedCurrentPage', this.RejectedCurrentPage.toString());
    }

    cancelEdit() { this.repoForm.reset(); }

    formatDate(dateString?: string): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
    }

    form_records() {
        this.managereposervice.getrejected_repo_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() { window.location.reload(); }

    download_ref(repository: Repository, id: any) {
        this.repository = { ...repository };
        const raw = localStorage.getItem('token');
        if (!raw) return;
        const jwt = JSON.parse(raw).access_token;
        window.open(`http://127.0.0.1:5001/repos/refdownload/${id}?access_token=${jwt}`, '_blank');
    }
}