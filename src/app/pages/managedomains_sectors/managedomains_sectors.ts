import { style } from '@angular/animations';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';

import { Domain, ManageReposService, Sector } from '../service/managerepos.service';

@Component({
    selector: 'app-managedomains-sectors',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        DialogModule,
        InputTextModule,
        ConfirmDialogModule,
        TagModule,
        PaginatorModule,
        TooltipModule,
        MessageModule,
    ],
    styles: [`
        .page-card {
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5);
            padding: 1.5rem;
        }

        /* Search */
        .search-wrap { position: relative; max-width: 320px; }
        .search-wrap i {
            position: absolute; left: 10px; top: 50%;
            transform: translateY(-50%); color: #9aa3b5; font-size: .9rem;
        }
        .search-wrap input {
            padding-left: 2rem; border: 1px solid #d0d7e8; border-radius: 8px;
            height: 36px; font-size: .88rem; width: 100%;
            outline: none; transition: border-color .2s;
        }
        .search-wrap input:focus { border-color: #3b82f6; }

        /* Table */
        .table-wrap {
            width: 100%; overflow-x: auto;
            border-radius: 10px; border: 1px solid #e4eaf4;
        }
        table { width: 100%; border-collapse: collapse; font-size: .88rem; }
        thead th {
            background: #cce4f7; color: #000; padding: .75rem 1rem;
            text-align: left; white-space: nowrap;
            font-weight: 600; letter-spacing: .02em;
        }
        thead th:first-child { border-radius: 10px 0 0 0; }
        thead th:last-child  { border-radius: 0 10px 0 0; }
        tbody tr { transition: background .15s; }
        tbody tr:nth-child(even) { background: #f7f9fd; }
        tbody tr:hover           { background: #eef4ff; }
        tbody td {
            padding: .7rem 1rem; border-bottom: 1px solid #edf0f7;
            vertical-align: middle; color: #2d3748;
        }

        /* Domain row */
        .domain-row td {  font-weight: 700; }
        .domain-name {
            font-size: .93rem; color: #1e3a6e;
            display: flex; align-items: center; gap: .5rem;
        }
        .domain-badge {
            font-size: .68rem; background: #dce8fb; color: #1e3a6e;
            border-radius: 20px; padding: 1px 10px; font-weight: 700;
        }

        /* Sector chips */
        .sector-chips { display: flex; flex-wrap: wrap; gap: .35rem; }
        .chip {
            display: inline-flex; align-items: center; gap: .3rem;
            background: #e8f5e9; color: #2e7d32; border-radius: 20px;
            padding: 2px 10px; font-size: .78rem; font-weight: 600;
            transition: background .15s;
        }
        .chip:hover { background: #c8e6c9; }
        .chip-del {
            background: none; border: none; cursor: pointer;
            color: #c62828; font-size: .7rem; padding: 0;
            line-height: 1; display: flex; align-items: center;
        }

        /* Actions */
        .action-cell { display: flex; gap: .4rem; align-items: center; }

        /* Empty / loading */
        .empty-row td {
            text-align: center; padding: 2.5rem;
            color: #9aa3b5; font-style: italic;
        }

        /* Dialog form */
        .dlg-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: .9rem; }
        .dlg-field label {
            font-size: .75rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: .05em; color: #4a5568;
        }
        .dlg-field label.req::after { content: ' *'; color: #e53e3e; }
        .dlg-field input {
            border: 1px solid #d0d7e8; border-radius: 8px;
            padding: .5rem .75rem; font-size: .9rem;
            outline: none; transition: border-color .2s;
            width: 100%; box-sizing: border-box;
        }
        .dlg-field input:focus { border-color: #3b82f6; }
        .dlg-field input.ng-invalid.ng-touched { border-color: #e53e3e; }
        .err-msg { color: #e53e3e; font-size: .75rem; margin-top: 2px; }

        /* Tag builder */
        .tag-input-wrap { display: flex; gap: .5rem; }
        .tag-input-wrap input { flex: 1; }
        .sector-list { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .5rem; }
        .sector-tag {
            display: inline-flex; align-items: center; gap: .3rem;
            background: #dce8fb; color: #1e3a6e; border-radius: 20px;
            padding: 2px 10px; font-size: .78rem; font-weight: 600;
        }
        .sector-tag button {
            background: none; border: none; cursor: pointer;
            color: #c62828; font-size: 1.5rem; padding: 0; line-height: 1;
        }

        /* Stats bar */
        .stats-bar { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .stat-pill {
            background: #f0f4ff; border-radius: 8px; padding: .35rem .9rem;
            font-size: .8rem; color: #1e3a6e; font-weight: 600;
            display: flex; align-items: center; gap: .4rem;
        }
        .stat-pill i { font-size: .85rem; }

        /* Inline add sector */
        .add-sector-inline { display: flex; align-items: center; gap: .5rem; margin-top: .2rem; }
        .add-sector-inline input {
            border: 1px dashed #90a4ae; border-radius: 6px;
            padding: 2px 8px; font-size: .78rem; outline: none; width: 130px;
        }
    `],
    template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-card">

      <!-- Toolbar -->
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <p-button label="Add Domain" icon="pi pi-plus" severity="primary"
            (onClick)="openCreateDomainDialog()" />
        </ng-template>
        <ng-template #end>
          <div class="search-wrap">
            <i class="pi pi-search"></i>
            <input type="text" placeholder="Search..."
              [(ngModel)]="searchText" (ngModelChange)="applyFilter()" />
          </div>
        </ng-template>
      </p-toolbar>

      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat-pill"><i class="pi pi-globe"></i> Domains: {{ totalDomains }}</div>
        <div class="stat-pill"><i class="pi pi-tags"></i>  Sectors: {{ totalSectors }}</div>
        <div class="stat-pill" *ngIf="searchText">
          <i class="pi pi-filter"></i> Showing {{ filteredDomains().length }} results
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:220px">Domain</th>
              <th>Sectors</th>
              <th style="width:80px;  text-align:center">Count</th>
              <th style="width:140px; text-align:center">Actions</th>
            </tr>
          </thead>
          <tbody>

            <tr *ngIf="loading" class="empty-row">
              <td colspan="4">
                <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>&nbsp; Loading…
              </td>
            </tr>

            <tr *ngIf="!loading && filteredDomains().length === 0" class="empty-row">
              <td colspan="4">
                <i class="pi pi-inbox" style="font-size:2rem;display:block;margin-bottom:.5rem;"></i>
                No domains found.
              </td>
            </tr>

            <ng-container *ngFor="let domain of pagedDomains">
              <tr class="domain-row">

                <!-- Domain name -->
                <td style="min-width:100px">
                  <div class="domain-name">
                    <i class="pi pi-globe" style=";font-size:.85rem"></i>
                    {{ domain.name }}
                    
                  </div>
                </td>

                <!-- Sector chips + inline add -->
                <td>
                  <div class="sector-chips">
                    <span class="chip" *ngFor="let s of domain.sectors">
                      {{ s.name }}
                      <!--<button class="chip-del"
                        pTooltip="Remove sector" tooltipPosition="top"
                        (click)="confirmDeleteSector(s, domain)">
                        <i class="pi pi-times"></i>
                      </button>-->
                    </span>

                    <!--<div class="add-sector-inline">
                      <input type="text" placeholder="+ Add sector"
                        [(ngModel)]="inlineNewSector[domain.id]"
                        (keydown.enter)="inlineAddSector(domain)" />
                      <button pButton icon="pi pi-plus"
                        class="p-button-rounded p-button-text p-button-sm"
                        pTooltip="Add" (click)="inlineAddSector(domain)"
                        style="width:24px;height:24px;padding:0">
                      </button>
                    </div>-->
                  </div>
                </td>

                <!-- Count -->
                <td style="text-align:center">
                  <p-tag [value]="domain.sectors.length + ''" severity="info" [rounded]="true" />
                </td>

                <!-- Actions -->
                <td>
                  <div class="action-cell" style="justify-content:center">
                    <p-button icon="pi pi-pencil" severity="secondary"
                      [rounded]="true" [text]="true"
                      pTooltip="Edit Domain" tooltipPosition="top"
                      (onClick)="openEditDomainDialog(domain)" />

                    <p-button icon="pi pi-plus-circle" severity="success"
                      [rounded]="true" [text]="true"
                      pTooltip="Add Sectors" tooltipPosition="top"
                      (onClick)="openAddSectorsDialog(domain)" />

                    <p-button icon="pi pi-trash" severity="danger"
                      [rounded]="true" [text]="true"
                      pTooltip="Delete Domain" tooltipPosition="top"
                      (onClick)="confirmDeleteDomain(domain)" />
                  </div>
                </td>
              </tr>
            </ng-container>

          </tbody>
        </table>
      </div>

      <!-- Paginator -->
      <p-paginator
        [totalRecords]="filteredDomains().length"
        [first]="paginatorFirst"
        [rows]="rowsPerPage"
        [rowsPerPageOptions]="[10, 20, 50]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} domains"
        [showCurrentPageReport]="true"
        (onPageChange)="onPageChange($event)"
        styleClass="mt-3" />
    </div>


    <!-- ═══════════════════════════ CREATE DOMAIN ════════════════════════════ -->
    <p-dialog [(visible)]="createDomainVisible" header="Add New Domain"
      [modal]="true" [style]="{ width: '520px' }" [resizable]="false">

      <form [formGroup]="domainForm">
        <div class="dlg-field">
          <label class="req">Domain Name</label>
          <input pInputText formControlName="name" placeholder="e.g. Technology" />
          <span class="err-msg"
            *ngIf="domainForm.controls['name'].invalid && domainForm.controls['name'].touched">
            Domain name is required.
          </span>
        </div>

        <div class="dlg-field">
          <label>Sectors
            <span style="color:#9aa3b5;font-weight:400;text-transform:none">
              (optional – press Enter or click +)
            </span>
          </label>
          <div class="tag-input-wrap">
            <input type="text" placeholder="Type a sector and press Enter…"
              [(ngModel)]="newSectorTag" [ngModelOptions]="{standalone:true}"
              (keydown.enter)="addSectorTag()" />
            <p-button icon="pi pi-plus" severity="secondary" (onClick)="addSectorTag()" />
          </div>
          <div class="sector-list">
            <span class="sector-tag" *ngFor="let s of newDomainSectors; let i = index">
              {{ s }}
              <button type="button" (click)="removeSectorTag(i)">
                <i class="pi pi-times"></i>
              </button>
            </span>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true"
          (onClick)="createDomainVisible = false" />
        <p-button label="Create" icon="pi pi-check"
          (onClick)="createDomain()" [disabled]="domainForm.invalid" />
      </ng-template>
    </p-dialog>


    <!-- ═══════════════════════════ EDIT DOMAIN ══════════════════════════════ -->
    <p-dialog [(visible)]="editDomainVisible" header="Edit Domain"
      [modal]="true" [style]="{ width: '420px' }" [resizable]="false">

      <form [formGroup]="domainForm">
        <div class="dlg-field">
          <label class="req">Domain Name</label>
          <input pInputText formControlName="name" />
          <span class="err-msg"
            *ngIf="domainForm.controls['name'].invalid && domainForm.controls['name'].touched">
            Domain name is required.
          </span>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true"
          (onClick)="editDomainVisible = false" />
        <p-button label="Save" icon="pi pi-check"
          (onClick)="updateDomain()" [disabled]="domainForm.invalid" />
      </ng-template>
    </p-dialog>


    <!-- ═══════════════════════════ ADD SECTORS (bulk) ═══════════════════════ -->
    <p-dialog [(visible)]="addSectorsVisible"
      [header]="'Add Sectors to: ' + (selectedDomain?.name || '')"
      [modal]="true" [style]="{ width: '480px' }" [resizable]="false">

      <div class="dlg-field">
        <label>New Sectors
          <span style="color:#9aa3b5;font-weight:400;text-transform:none">
            (press Enter or click +)
          </span>
        </label>
        <div class="tag-input-wrap">
          <input type="text" placeholder="Type sector name…"
            [(ngModel)]="newSectorTag" (keydown.enter)="addSectorTag()" />
          <p-button icon="pi pi-plus" severity="secondary" (onClick)="addSectorTag()" />
        </div>
        <div class="sector-list" *ngIf="newDomainSectors.length">
          <span class="sector-tag" *ngFor="let s of newDomainSectors; let i = index">
            {{ s }}
            <button type="button" (click)="removeSectorTag(i)">
              <i class="pi pi-times"></i>
            </button>
          </span>
        </div>
      </div>

      <div *ngIf="selectedDomain?.sectors?.length" style="margin-top:.5rem">
        <label style="font-size:.72rem;color:#9aa3b5;font-weight:600;
                      text-transform:uppercase;letter-spacing:.04em;">
          Existing sectors
        </label>
        <div class="sector-chips" style="margin-top:.4rem">
          <span class="chip" *ngFor="let s of selectedDomain!.sectors">{{ s.name }}</span>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true"
          (onClick)="addSectorsVisible = false" />
        <p-button label="Add Sectors" icon="pi pi-check"
          (onClick)="bulkAddSectors()" [disabled]="!newDomainSectors.length" />
      </ng-template>
    </p-dialog>


    <!-- ═══════════════════════════ EDIT SECTOR ══════════════════════════════ -->
    <p-dialog [(visible)]="editSectorVisible" header="Edit Sector"
      [modal]="true" [style]="{ width: '380px' }" [resizable]="false">

      <form [formGroup]="sectorForm">
        <div class="dlg-field">
          <label class="req">Sector Name</label>
          <input pInputText formControlName="name" />
          <span class="err-msg"
            *ngIf="sectorForm.controls['name'].invalid && sectorForm.controls['name'].touched">
            Sector name is required.
          </span>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" severity="secondary" [text]="true"
          (onClick)="editSectorVisible = false" />
        <p-button label="Save" icon="pi pi-check"
          (onClick)="updateSector()" [disabled]="sectorForm.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class ManageDomainsSectors implements OnInit {

    // ── State ─────────────────────────────────────────────────────────────
    allDomains      = signal<Domain[]>([]);
    filteredDomains = signal<Domain[]>([]);
    loading         = true;
    searchText      = '';

    // Pagination
    paginatorFirst = 0;
    rowsPerPage    = 10;

    // Inline add-sector keyed by domain.id
    inlineNewSector: { [domainId: number]: string } = {};

    // Computed stats
    get totalDomains() { return this.allDomains().length; }
    get totalSectors() {
        return this.allDomains().reduce((acc, d) => acc + d.sectors.length, 0);
    }

    // Current page slice
    get pagedDomains(): Domain[] {
        const all = this.filteredDomains();
        return all.slice(this.paginatorFirst, this.paginatorFirst + this.rowsPerPage);
    }

    // ── Dialog visibility flags ───────────────────────────────────────────
    createDomainVisible = false;
    editDomainVisible   = false;
    addSectorsVisible   = false;
    editSectorVisible   = false;

    selectedDomain: Domain | null = null;
    selectedSector: Sector | null = null;

    // ── Reactive forms ────────────────────────────────────────────────────
    domainForm!: FormGroup;
    sectorForm!: FormGroup;

    // Tag builder state
    newSectorTag      = '';
    newDomainSectors: string[] = [];

    constructor(
        private domainsService: ManageReposService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.domainForm = new FormGroup({
            name: new FormControl('', [Validators.required, Validators.minLength(2)])
        });
        this.sectorForm = new FormGroup({
            name: new FormControl('', [Validators.required, Validators.minLength(2)])
        });
        this.loadDomains();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DATA LOADING & FILTER
    // ════════════════════════════════════════════════════════════════════════

    loadDomains() {
        this.loading = true;
        this.domainsService.getAllDomains().subscribe({
            next: (data) => {
                this.allDomains.set(data);
                this.filteredDomains.set(data);
                this.loading = false;
            },
            error: () => {
                this.toast('error', 'Load Failed', 'Could not load domains from server.');
                this.loading = false;
            }
        });
    }

    applyFilter() {
        const q = this.searchText.toLowerCase().trim();
        this.filteredDomains.set(
            !q ? this.allDomains()
               : this.allDomains().filter(d =>
                    d.name.toLowerCase().includes(q) ||
                    d.sectors.some((s:any) => s.name.toLowerCase().includes(q))
                )
        );
        this.paginatorFirst = 0;
    }

    onPageChange(event: any) {
        this.paginatorFirst = event.first;
        this.rowsPerPage    = event.rows;
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DOMAIN CRUD  →  uses ManageDomainsService
    // ════════════════════════════════════════════════════════════════════════

    openCreateDomainDialog() {
        this.domainForm.reset();
        this.newDomainSectors = [];
        this.newSectorTag     = '';
        this.createDomainVisible = true;
    }

    createDomain() {
        if (this.domainForm.invalid) { this.domainForm.markAllAsTouched(); return; }

        const payload = {
            name:    this.domainForm.value.name.trim(),
            sectors: this.newDomainSectors
        };

        this.domainsService.createDomain(payload).subscribe({
            next: (created) => {
                this.allDomains.update(list =>
                    [...list, created].sort((a, b) => a.name.localeCompare(b.name))
                );
                this.applyFilter();
                this.createDomainVisible = false;
                this.toast('success', 'Domain Created', `"${created.name}" added successfully.`);
            },
            error: (err) =>
                this.toast('error', 'Error', err.error?.error || 'Failed to create domain.')
        });
    }

    openEditDomainDialog(domain: Domain) {
        this.selectedDomain = domain;
        this.domainForm.patchValue({ name: domain.name });
        this.editDomainVisible = true;
    }

    updateDomain() {
        if (!this.selectedDomain || this.domainForm.invalid) {
            this.domainForm.markAllAsTouched(); return;
        }

        this.domainsService
            .updateDomain(this.selectedDomain.id, { name: this.domainForm.value.name.trim() })
            .subscribe({
                next: (updated) => {
                    this.allDomains.update(list =>
                        list.map(d => d.id === updated.id ? { ...d, name: updated.name } : d)
                            .sort((a, b) => a.name.localeCompare(b.name))
                    );
                    this.applyFilter();
                    this.editDomainVisible = false;
                    this.toast('success', 'Domain Updated', `Renamed to "${updated.name}".`);
                },
                error: (err) =>
                    this.toast('error', 'Error', err.error?.error || 'Failed to update domain.')
            });
    }

    confirmDeleteDomain(domain: Domain) {
        this.confirmationService.confirm({
            message: `Delete domain <b>${domain.name}</b> and all its
                      ${domain.sectors.length} sector(s)?`,
            header:  'Confirm Delete',
            icon:    'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Delete',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteDomain(domain)
        });
    }

    private deleteDomain(domain: Domain) {
        this.domainsService.deleteDomain(domain.id).subscribe({
            next: () => {
                this.allDomains.update(list => list.filter(d => d.id !== domain.id));
                this.applyFilter();
                this.toast('success', 'Deleted', `Domain "${domain.name}" removed.`);
            },
            error: () => this.toast('error', 'Error', 'Failed to delete domain.')
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  SECTOR CRUD  →  uses ManageDomainsService
    // ════════════════════════════════════════════════════════════════════════

    // Tag builder helpers
    addSectorTag() {
        const v = this.newSectorTag.trim();
        if (v && !this.newDomainSectors.includes(v)) { this.newDomainSectors.push(v); }
        this.newSectorTag = '';
    }
    removeSectorTag(i: number) { this.newDomainSectors.splice(i, 1); }

    // ── Inline single-sector add ──────────────────────────────────────────
    inlineAddSector(domain: Domain) {
        const name = (this.inlineNewSector[domain.id] || '').trim();
        if (!name) return;

        this.domainsService.createSector(domain.id, { name }).subscribe({
            next: (sector) => {
                this.allDomains.update(list =>
                    list.map(d => d.id === domain.id
                        ? { ...d, sectors: [...d.sectors, sector] }
                        : d)
                );
                this.applyFilter();
                this.inlineNewSector[domain.id] = '';
                this.toast('success', 'Sector Added', `"${sector.name}" added.`);
            },
            error: (err) =>
                this.toast('error', 'Error', err.error?.error || 'Failed to add sector.')
        });
    }

    // ── Bulk add dialog ───────────────────────────────────────────────────
    openAddSectorsDialog(domain: Domain) {
        this.selectedDomain   = domain;
        this.newDomainSectors = [];
        this.newSectorTag     = '';
        this.addSectorsVisible = true;
    }

    bulkAddSectors() {
        if (!this.selectedDomain || !this.newDomainSectors.length) return;

        this.domainsService
            .bulkCreateSectors(this.selectedDomain.id, this.newDomainSectors)
            .subscribe({
                next: (res) => {
                    // Refresh the domain from server to get the updated sector list
                    this.domainsService.getDomainById(this.selectedDomain!.id).subscribe(updated => {
                        this.allDomains.update(list =>
                            list.map(d => d.id === updated.id ? updated : d)
                        );
                        this.applyFilter();
                    });
                    const msg = `${res.created.length} added, ${res.skipped.length} skipped (duplicates).`;
                    this.toast('success', 'Sectors Added', msg);
                    this.addSectorsVisible = false;
                },
                error: () => this.toast('error', 'Error', 'Failed to add sectors.')
            });
    }

    // ── Edit sector dialog ────────────────────────────────────────────────
    openEditSectorDialog(sector: Sector, domain: Domain) {
        this.selectedSector = sector;
        this.selectedDomain = domain;
        this.sectorForm.patchValue({ name: sector.name });
        this.editSectorVisible = true;
    }

    updateSector() {
        if (!this.selectedSector || this.sectorForm.invalid) {
            this.sectorForm.markAllAsTouched(); return;
        }

        this.domainsService
            .updateSector(this.selectedSector.id, { name: this.sectorForm.value.name.trim() })
            .subscribe({
                next: (updated) => {
                    this.allDomains.update(list =>
                        list.map(d => d.id === updated.domain_id
                            ? { ...d, sectors: d.sectors.map((s:any) => s.id === updated.id ? updated : s) }
                            : d)
                    );
                    this.applyFilter();
                    this.editSectorVisible = false;
                    this.toast('success', 'Sector Updated', `Renamed to "${updated.name}".`);
                },
                error: (err) =>
                    this.toast('error', 'Error', err.error?.error || 'Failed to update sector.')
            });
    }

    // ── Delete sector ─────────────────────────────────────────────────────
    confirmDeleteSector(sector: Sector, domain: Domain) {
        this.confirmationService.confirm({
            message: `Remove sector <b>${sector.name}</b> from <b>${domain.name}</b>?`,
            header:  'Remove Sector',
            icon:    'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Remove',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteSector(sector)
        });
    }

    private deleteSector(sector: Sector) {
        this.domainsService.deleteSector(sector.id).subscribe({
            next: () => {
                this.allDomains.update(list =>
                    list.map(d => d.id === sector.domain_id
                        ? { ...d, sectors: d.sectors.filter((s:any) => s.id !== sector.id) }
                        : d)
                );
                this.applyFilter();
                this.toast('success', 'Removed', `Sector "${sector.name}" removed.`);
            },
            error: () => this.toast('error', 'Error', 'Failed to delete sector.')
        });
    }

    // ── Utility ───────────────────────────────────────────────────────────
    private toast(severity: string, summary: string, detail: string) {
        this.messageService.add({ severity, summary, detail, life: 3500 });
    }
}