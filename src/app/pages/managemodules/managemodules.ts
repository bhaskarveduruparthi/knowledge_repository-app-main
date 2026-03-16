import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ManageReposService } from '../service/managerepos.service';

export interface Module {
    id?: number;
    module_name?: string;
    key_name?: string;
}

@Component({
    selector: 'app-managemodules',
    standalone: true,
    styles: `
        /* ── Card shell ───────────────────────────────────────────────────── */
        .page-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5);
            padding: 1.5rem;
        }

        /* ── Page header ──────────────────────────────────────────────────── */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
        }

        .page-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #11224E;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .page-title i {
            font-size: 1.1rem;
            color: #2457b3;
        }

        /* ── Toolbar ──────────────────────────────────────────────────────── */
        .toolbar {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }

        .search-wrap {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            background: #f4f6fb;
            border: 1px solid #dce3f0;
            border-radius: 8px;
            padding: 0.35rem 0.75rem;
            flex: 1;
            min-width: 200px;
            max-width: 360px;
        }

        .search-wrap i { color: #8a96b0; font-size: 0.9rem; }

        .search-wrap input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 0.88rem;
            color: #222;
            width: 100%;
        }

        /* ── Table ────────────────────────────────────────────────────────── */
        .table-wrap {
            width: 100%;
            overflow-x: auto;
            border-radius: 8px;
            border: 1px solid #e8edf5;
            margin-bottom: 1rem;
        }

        .mod-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
        }

        .mod-table thead th {
            text-align: left;
            padding: 0.85rem 1rem;
            font-weight: 700;
            color: #11224E;
            background: #cce4f7;
            border-bottom: 2px solid #b5d4ed;
            white-space: nowrap;
            user-select: none;
        }

        .mod-table thead th.sortable { cursor: pointer; }
        .mod-table thead th.sortable:hover { background: #b8d8f0; }

        .mod-table tbody td {
            padding: 0.78rem 1rem;
            border-bottom: 1px solid #eef2f7;
            vertical-align: middle;
            color: #222;
        }

        .mod-table tbody tr:last-child td { border-bottom: none; }
        .mod-table tbody tr:hover { background: #f4f8ff; }

        .col-num {
            width: 52px;
            text-align: center;
            color: #8a96b0;
            font-size: 0.8rem;
        }

        .col-actions {
            width: 100px;
            text-align: center;
            white-space: nowrap;
        }

        .action-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 6px;
            padding: 5px 7px;
            transition: background 0.18s;
            line-height: 1;
        }

        .action-btn:hover { background: #eef2f7; }
        .action-btn.edit  { color: #2457b3; }
        .action-btn.del   { color: #c62828; }

        .key-pill {
            display: inline-block;
            font-size: 0.75rem;
            padding: 2px 10px;
            border-radius: 20px;
            background: #e8f0fb;
            color: #2457b3;
            font-weight: 600;
            letter-spacing: 0.03em;
            font-family: monospace;
        }

        /* ── Empty / loading states ───────────────────────────────────────── */
        .state-row td {
            text-align: center;
            padding: 3rem;
            color: #8a96b0;
        }

        .state-row i {
            font-size: 2.2rem;
            display: block;
            margin-bottom: 0.6rem;
            opacity: 0.5;
        }

        /* ── Dialog form ──────────────────────────────────────────────────── */
        .dlg-body {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 0.25rem 0;
        }

        .dlg-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .dlg-label {
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #11224E;
            opacity: 0.75;
        }

        .dlg-label.req::after { content: ' *'; color: #c0392b; }

        /* ── Delete confirm ───────────────────────────────────────────────── */
        .del-confirm {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.5rem 0;
        }

        .del-confirm i { font-size: 2rem; color: #c62828; flex-shrink: 0; }

        .del-confirm p {
            margin: 0;
            font-size: 0.95rem;
            color: #333;
            line-height: 1.5;
        }

        @media (max-width: 600px) { .search-wrap { max-width: 100%; } }
    `,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        InputTextModule,
        TextareaModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        MessageModule,
        PaginatorModule,
        TooltipModule,
    ],
    template: `
        <p-toast />

        <div class="page-card">

            <!-- Header -->
            <div class="page-header">
                <div class="page-title">
                    
                    Manage Modules
                </div>
                <p-button
                    label="Add Module"
                    icon="pi pi-plus"
                    severity="success"
                    (click)="openAddDialog()">
                </p-button>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-wrap">
                    <i class="pi pi-search"></i>
                    <input
                        type="text"
                        placeholder="Search..."
                        [(ngModel)]="searchTerm"
                        (input)="onSearch()" />
                    <i
                        *ngIf="searchTerm"
                        class="pi pi-times"
                        style="cursor:pointer;"
                        (click)="searchTerm = ''; onSearch()">
                    </i>
                </div>

                <p-button
                    icon="pi pi-refresh"
                    severity="secondary"
                    [rounded]="true"
                    [text]="true"
                    pTooltip="Refresh"
                    tooltipPosition="top"
                    (click)="loadModules()"
                    [loading]="loading">
                </p-button>

                <span style="font-size:0.82rem; color:#8a96b0; margin-left:auto;">
                    {{ filteredList.length }} module{{ filteredList.length !== 1 ? 's' : '' }}
                </span>
            </div>

            <!-- Table -->
            <div class="table-wrap">
                <table class="mod-table">
                    <thead>
                        <tr>
                            <th class="col-num">#</th>
                            <th class="sortable" (click)="sort('module_name')">
                                Module Name
                                <i class="pi"
                                   [ngClass]="sortField === 'module_name'
                                       ? (sortAsc ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down-alt')
                                       : 'pi-sort-alt'"
                                   style="font-size:0.75rem; margin-left:4px; opacity:0.6">
                                </i>
                            </th>
                            <th class="sortable" (click)="sort('key_name')">
                                Key Name
                                <i class="pi"
                                   [ngClass]="sortField === 'key_name'
                                       ? (sortAsc ? 'pi-sort-amount-up-alt' : 'pi-sort-amount-down-alt')
                                       : 'pi-sort-alt'"
                                   style="font-size:0.75rem; margin-left:4px; opacity:0.6">
                                </i>
                            </th>
                            <th class="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngIf="loading" class="state-row">
                            <td colspan="4">
                                <i class="pi pi-spin pi-spinner"></i>
                                Loading modules…
                            </td>
                        </tr>

                        <tr *ngIf="!loading && filteredList.length === 0" class="state-row">
                            <td colspan="4">
                                <i class="pi pi-inbox"></i>
                                {{ searchTerm ? 'No modules match your search.' : 'No modules found.' }}
                            </td>
                        </tr>

                        <tr *ngFor="let mod of pagedList; let i = index">
                            <td class="col-num">
                                {{ (currentPage - 1) * pageSize + i + 1 }}
                            </td>
                            <td style="font-weight:600; color:#11224E;">
                                {{ mod.module_name }}
                            </td>
                            <td>
                                <span class="key-pill">{{ mod.key_name }}</span>
                            </td>
                            <td class="col-actions">
                                <button class="action-btn edit" pTooltip="Edit" tooltipPosition="top" (click)="openEditDialog(mod)">
                                    <i class="pi pi-pencil"></i>
                                </button>
                                <button class="action-btn del" pTooltip="Delete" tooltipPosition="top" (click)="openDeleteDialog(mod)">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Paginator -->
            <p-paginator
                *ngIf="filteredList.length > pageSize"
                [totalRecords]="filteredList.length"
                [first]="(currentPage - 1) * pageSize"
                [rows]="pageSize"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} modules"
                [showCurrentPageReport]="true"
                (onPageChange)="onPageChange($event)">
            </p-paginator>

        </div>

        <!-- ════ ADD DIALOG ════ -->
        <p-dialog
            [(visible)]="addDialog"
            header="Add Module"
            [modal]="true"
            [style]="{ width: '440px' }"
            [resizable]="false"
            (onHide)="moduleForm.reset()">
            <ng-template pTemplate="content">
                <form [formGroup]="moduleForm" class="dlg-body">
                    <div class="dlg-field">
                        <label class="dlg-label req">Module Name</label>
                        <input pInputText formControlName="module_name" placeholder="e.g. Financial Accounting" />
                        <p-message
                            *ngIf="moduleForm.controls['module_name'].invalid && moduleForm.controls['module_name'].touched"
                            severity="error" text="Module Name is required">
                        </p-message>
                    </div>
                    <div class="dlg-field">
                        <label class="dlg-label req">Key Name</label>
                        <input pInputText formControlName="key_name" placeholder="e.g. FI" />
                        <small style="color:#6b7a99; font-size:0.76rem;">
                            Short unique identifier used internally (e.g. FI, CO, MM).
                        </small>
                        <p-message
                            *ngIf="moduleForm.controls['key_name'].invalid && moduleForm.controls['key_name'].touched"
                            severity="error" text="Key Name is required">
                        </p-message>
                    </div>
                </form>
            </ng-template>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true" (click)="addDialog = false"></p-button>
                <p-button label="Add Module" icon="pi pi-check" severity="success" [loading]="saving" [disabled]="moduleForm.invalid" (click)="submitAdd()"></p-button>
            </ng-template>
        </p-dialog>

        <!-- ════ EDIT DIALOG ════ -->
        <p-dialog
            [(visible)]="editDialog"
            header="Edit Module"
            [modal]="true"
            [style]="{ width: '440px' }"
            [resizable]="false"
            (onHide)="moduleForm.reset()">
            <ng-template pTemplate="content">
                <form [formGroup]="moduleForm" class="dlg-body">
                    <div class="dlg-field">
                        <label class="dlg-label req">Module Name</label>
                        <input pInputText formControlName="module_name" placeholder="e.g. Financial Accounting" />
                        <p-message
                            *ngIf="moduleForm.controls['module_name'].invalid && moduleForm.controls['module_name'].touched"
                            severity="error" text="Module Name is required">
                        </p-message>
                    </div>
                    <div class="dlg-field">
                        <label class="dlg-label req">Key Name</label>
                        <input pInputText formControlName="key_name" placeholder="e.g. FI" />
                        <small style="color:#6b7a99; font-size:0.76rem;">
                            Short unique identifier used internally (e.g. FI, CO, MM).
                        </small>
                        <p-message
                            *ngIf="moduleForm.controls['key_name'].invalid && moduleForm.controls['key_name'].touched"
                            severity="error" text="Key Name is required">
                        </p-message>
                    </div>
                </form>
            </ng-template>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true" (click)="editDialog = false"></p-button>
                <p-button label="Save Changes" icon="pi pi-check" severity="primary" [loading]="saving" [disabled]="moduleForm.invalid" (click)="submitEdit()"></p-button>
            </ng-template>
        </p-dialog>

        <!-- ════ DELETE DIALOG ════ -->
        <p-dialog
            [(visible)]="deleteDialog"
            header="Confirm Delete"
            [modal]="true"
            [style]="{ width: '420px' }"
            [resizable]="false">
            <ng-template pTemplate="content">
                <div class="del-confirm">
                    <i class="pi pi-exclamation-triangle"></i>
                    <p *ngIf="selectedModule">
                        Are you sure you want to delete
                        <strong>{{ selectedModule.module_name }}</strong>
                        <span style="color:#6b7a99"> ({{ selectedModule.key_name }})</span>?
                        This action cannot be undone.
                    </p>
                </div>
            </ng-template>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true" (click)="deleteDialog = false"></p-button>
                <p-button label="Delete" icon="pi pi-trash" severity="danger" [loading]="saving" (click)="submitDelete()"></p-button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService]
})
export class ManageModules implements OnInit {

    // ── Data ──────────────────────────────────────────────────────────────────
    allModules:    Module[] = [];
    filteredList:  Module[] = [];
    pagedList:     Module[] = [];
    selectedModule!: Module;

    // ── UI state ──────────────────────────────────────────────────────────────
    loading:      boolean = false;
    saving:       boolean = false;
    addDialog:    boolean = false;
    editDialog:   boolean = false;
    deleteDialog: boolean = false;

    // ── Search / sort / page ──────────────────────────────────────────────────
    searchTerm:  string         = '';
    sortField:   keyof Module   = 'module_name';
    sortAsc:     boolean        = true;
    currentPage: number         = 1;
    pageSize:    number         = 10;

    // ── Form (shared add + edit) ──────────────────────────────────────────────
    moduleForm!: FormGroup;

    constructor(
        private repoService: ManageReposService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.moduleForm = new FormGroup({
            module_name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
            key_name:    new FormControl('', [Validators.required, Validators.maxLength(255)]),
        });
        this.loadModules();
    }

    // ── Load ──────────────────────────────────────────────────────────────────
    loadModules() {
        this.loading = true;
        (this.repoService.getmodules() as Observable<Module[]>).subscribe({
            next: (data: Module[]) => {
                this.allModules = Array.isArray(data) ? data : [];
                this.applyFilterAndSort();
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load modules.' });
                this.loading = false;
            }
        });
    }

    // ── Search ────────────────────────────────────────────────────────────────
    onSearch() {
        this.currentPage = 1;
        this.applyFilterAndSort();
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
    sort(field: keyof Module) {
        this.sortAsc = this.sortField === field ? !this.sortAsc : true;
        this.sortField = field;
        this.applyFilterAndSort();
    }

    // ── Filter + sort + page ──────────────────────────────────────────────────
    private applyFilterAndSort() {
        const term = this.searchTerm.toLowerCase().trim();

        let list = term
            ? this.allModules.filter(m =>
                m.module_name?.toLowerCase().includes(term) ||
                m.key_name?.toLowerCase().includes(term))
            : [...this.allModules];

        list.sort((a, b) => {
            const av = (a[this.sortField] ?? '') as string;
            const bv = (b[this.sortField] ?? '') as string;
            return this.sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
        });

        this.filteredList = list;
        this.updatePage();
    }

    onPageChange(event: any) {
        this.currentPage = event.page + 1;
        this.updatePage();
    }

    private updatePage() {
        const start = (this.currentPage - 1) * this.pageSize;
        this.pagedList = this.filteredList.slice(start, start + this.pageSize);
    }

    // ── Add ───────────────────────────────────────────────────────────────────
    openAddDialog() {
        this.moduleForm.reset();
        this.addDialog = true;
    }

    submitAdd() {
        if (this.moduleForm.invalid) { this.moduleForm.markAllAsTouched(); return; }
        this.saving = true;
        this.repoService.addModule(this.moduleForm.value).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Module Added', detail: 'New module created successfully.' });
                this.addDialog = false;
                this.saving = false;
                this.loadModules();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error ?? 'Failed to add module.' });
                this.saving = false;
            }
        });
    }

    // ── Edit ──────────────────────────────────────────────────────────────────
    openEditDialog(mod: Module) {
        this.selectedModule = { ...mod };
        this.moduleForm.patchValue({ module_name: mod.module_name, key_name: mod.key_name });
        this.editDialog = true;
    }

    submitEdit() {
        if (this.moduleForm.invalid) { this.moduleForm.markAllAsTouched(); return; }
        this.saving = true;
        this.repoService.editModule(this.selectedModule.id!, this.moduleForm.value).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Module Updated', detail: 'Changes saved successfully.' });
                this.editDialog = false;
                this.saving = false;
                this.loadModules();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error ?? 'Failed to update module.' });
                this.saving = false;
            }
        });
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    openDeleteDialog(mod: Module) {
        this.selectedModule = { ...mod };
        this.deleteDialog = true;
    }

    submitDelete() {
        this.saving = true;
        this.repoService.deleteModule(this.selectedModule.id!).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Module Deleted', detail: `'${this.selectedModule.module_name}' removed.` });
                this.deleteDialog = false;
                this.saving = false;
                this.loadModules();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.error ?? 'Failed to delete module.' });
                this.saving = false;
            }
        });
    }
}