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
    selector: 'app-managependingreport',
    standalone: true,
    styles: `
        .custom-file-input {
            border: 1px solid #ced4da; border-radius: 6px; background-color: #f8f9fa;
            padding: 8px 12px; width: 100%; color: #333; font-size: 1rem; transition: border-color 0.2s;
        }
        .custom-file-input:hover { border-color: #007ad9; background-color: #e9ecef; }
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
        .glass-table input[type="checkbox"] { accent-color: #11224E; width: 16px; height: 16px; cursor: pointer; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%; }
        @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }
        label.required:after { content: "*"; color: red; margin-left: 5px; }
        .error { border: 1px solid red; }
        .p-toolbar { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }
        .card { box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5); }

        /* ── Search styles ── */
        .search-bar-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 0.75rem; gap: 1rem; flex-wrap: wrap;
        }
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
            <div class="search-bar-row">
                <h5 class="m-0">Pending</h5>
                <div style="display:flex; align-items:center; gap:0.75rem;">
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
                </div>
            </div>

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
                            <th>Immediate Response Manager(IRM)</th>
                            <th>Secondary Response Manager(SRM)</th>
                            <th>Business Unit Head(BUH)</th>
                            <th>Business Group Head(BGH)</th>
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
                            <td colspan="18" style="text-align:center;padding:2rem;color:#888">
                                <i class="pi pi-search" style="font-size:1.5rem;display:block;margin-bottom:0.5rem"></i>
                                No rows match <b>"{{ searchQuery() }}"</b> on this page.
                                <button pButton type="button" label="Clear" icon="pi pi-times"
                                    class="p-button-text p-button-sm" style="margin-left:0.5rem"
                                    (click)="clearSearch()"></button>
                            </td>
                        </tr>
                        <tr *ngIf="repositories().length === 0 && !searchQuery() && !loading">
                            <td colspan="18" style="text-align:center;padding:2rem">No Repositories found.</td>
                        </tr>
                        <tr *ngIf="loading">
                            <td colspan="18" style="text-align:center;padding:2rem">Loading Data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p-paginator
                [totalRecords]="totalitems" [first]="first"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Repos"
                [showCurrentPageReport]="true" [rows]="10"
                (onPageChange)="onPageChange($event)">
            </p-paginator>
        </div>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManagePendingReport implements OnInit {
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
    PendingCurrentPage!: number;
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
        const storedPage = localStorage.getItem('PendingCurrentPage');
        if (storedPage) {
            this.PendingCurrentPage = parseInt(storedPage);
            this.first = (this.PendingCurrentPage - 1) * 10;
        } else {
            this.PendingCurrentPage = 1;
            localStorage.setItem('PendingCurrentPage', '1');
            this.first = 0;
        }
        this.loadDemoData(this.PendingCurrentPage);
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
        this.managereposervice.getallpendingrepos(page).subscribe((data: any) => {
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
        this.PendingCurrentPage = event.page + 1;
        this.searchQuery.set(''); // reset search on page change
        this.loadDemoData(this.PendingCurrentPage);
        localStorage.setItem('PendingCurrentPage', this.PendingCurrentPage.toString());
    }

    cancelEdit() { this.repoForm.reset(); }

    formatDate(dateString?: string): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
    }

    form_records() {
        this.managereposervice.getpending_repo_records().subscribe((data: any) => {
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