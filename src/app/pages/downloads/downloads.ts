import { Component, OnInit, signal, computed } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { DownloadRequest, ManageReposService } from '../service/managerepos.service';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from "primeng/card";

@Component({
  selector: 'app-downloads',
  standalone: true,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

    * { font-family: 'DM Sans', sans-serif; }

    :host { display: block; }

    /* ── Page wrapper ── */
    .page-wrapper {
      min-height: 100vh;
      padding: 2rem;
    }

    /* ── Toolbar ── */
    .toolbar-shell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      border-radius: 18px;
      padding: 0.9rem 1.4rem;
      margin-bottom: 1.75rem;
      box-shadow: 0 2px 16px rgba(67, 160, 71, 0.10), 0 1px 4px rgba(0,0,0,0.05);
      border: 1px solid rgba(165, 214, 167, 0.35);
      gap: 1rem;
    }

    .toolbar-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.45rem;
      font-weight: 400;
      color: #1b5e20;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .toolbar-title span { color: #43a047; }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    /* ── Search pill ── */
    .search-pill {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-pill .pi-search {
      position: absolute;
      left: 0.85rem;
      color: #81c784;
      font-size: 0.85rem;
      pointer-events: none;
    }

    .search-pill input {
      padding: 0.5rem 2.2rem 0.5rem 2.3rem;
      border-radius: 50px;
      border: 1.5px solid #c8e6c9;
      background: #f9fafb;
      width: 290px;
      font-size: 0.875rem;
      color: #2e3a2f;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      font-family: 'DM Sans', sans-serif;
    }

    .search-pill input::placeholder { color: #aab5ab; }

    .search-pill input:focus {
      border-color: #43a047;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(67, 160, 71, 0.12);
    }

    .search-clear {
      position: absolute;
      right: 0.6rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #aab5ab;
      padding: 0;
      line-height: 1;
      font-size: 0.78rem;
      transition: color 0.15s;
    }

    .search-clear:hover { color: #43a047; }

    .result-badge {
      font-size: 0.8rem;
      color: #fff;
      background: linear-gradient(135deg, #43a047, #66bb6a);
      border-radius: 50px;
      padding: 0.2rem 0.7rem;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Grid ── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
    }

    /* ── Card ── */
    .repo-card {
      background: #fff;
      border-radius: 20px;
      border: 1px solid rgba(165, 214, 167, 0.6);
      box-shadow: 0 4px 20px rgba(67, 160, 71, 0.09), 0 1px 4px rgba(0,0,0,0.05);
      padding: 1.5rem 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      position: relative;
      overflow: hidden;
    }

    

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .repo-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(67, 160, 71, 0.15), 0 2px 8px rgba(0,0,0,0.06);
    }

    /* Card header */
    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .card-title-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      min-width: 0;
    }

    .card-module {
      font-family: 'DM Serif Display', serif;
      font-size: 1.1rem;
      font-weight: 400;
      color: #1b5e20;
      line-height: 1.25;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-customer {
      font-size: 0.78rem;
      font-weight: 700;
      color: #2e7d32;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    /* Status chip */
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.7rem;
      border-radius: 50px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .status-chip.pending  { background: #fff8e1; color: #f57f17; border: 1px solid #ffe082; }
    .status-chip.approved { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
    .status-chip.rejected { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

    .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
    .pending  .status-dot { background: #ffa000; }
    .approved .status-dot { background: #2e7d32; }
    .rejected .status-dot { background: #c62828; }

    /* Meta grid */
    .card-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem 0.75rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      min-width: 0;
    }

    .meta-item.full-width {
      grid-column: 1 / -1;
    }

    .meta-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #5d8a5e;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .meta-value {
      font-size: 0.855rem;
      color: #2e3a2f;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta-value.wrap {
      white-space: normal;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Divider */
    .card-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e8f5e9, #c8e6c9, #e8f5e9, transparent);
      margin: 0 -0.25rem 1rem;
    }

    /* Requester row */
    .card-requester {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.1rem;
    }

    .requester-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #42a5f5, #1565c0);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .requester-info {
      display: flex;
      flex-direction: column;
      gap: 0.05rem;
      min-width: 0;
    }

    .requester-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: #2e3a2f;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .requester-email {
      font-size: 0.74rem;
      color: #6b8c6b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Action buttons */
    .card-actions {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: flex-end;
      margin-top: auto;
    }

    .card-actions ::ng-deep .p-button {
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      padding: 0.4rem 0.85rem !important;
      border-radius: 10px !important;
      border-width: 1.5px !important;
      border-style: solid !important;
      transition: all 0.15s ease !important;
    }

    .card-actions ::ng-deep .p-button:not(:disabled):hover {
      transform: translateY(-1px) !important;
    }

    .card-actions ::ng-deep .p-button:disabled { opacity: 0.4 !important; }

    /* Approve */
    .card-actions ::ng-deep .btn-approve.p-button {
      background: #e8f5e9 !important;
      color: #1b5e20 !important;
      border-color: #66bb6a !important;
    }
    .card-actions ::ng-deep .btn-approve.p-button:not(:disabled):hover {
      background: #2e7d32 !important;
      color: #fff !important;
      border-color: #2e7d32 !important;
      box-shadow: 0 4px 14px rgba(46,125,50,0.32) !important;
    }

    /* Reject */
    .card-actions ::ng-deep .btn-reject.p-button {
      background: #ffebee !important;
      color: #b71c1c !important;
      border-color: #e57373 !important;
    }
    .card-actions ::ng-deep .btn-reject.p-button:not(:disabled):hover {
      background: #c62828 !important;
      color: #fff !important;
      border-color: #c62828 !important;
      box-shadow: 0 4px 14px rgba(198,40,40,0.30) !important;
    }

    /* ── State cards (empty / loading / no-results) ── */
    .state-card {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: #fff;
      border-radius: 20px;
      border: 1.5px dashed #c8e6c9;
      text-align: center;
      gap: 0.75rem;
    }

    .state-icon {
      font-size: 2.75rem;
      color: #a5d6a7;
    }

    .state-card p {
      margin: 0;
      color: #6b8c6b;
      font-size: 0.95rem;
    }

    .state-card p.sub {
      font-size: 0.82rem;
      color: #a5c8a6;
    }

    .state-clear-btn {
      margin-top: 0.5rem;
      padding: 0.45rem 1.1rem;
      border-radius: 50px;
      border: 1.5px solid #a5d6a7;
      background: transparent;
      color: #43a047;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
    }
    .state-clear-btn:hover { background: #43a047; color: #fff; }

    /* ── Paginator ── */
    .paginator-wrapper {
      margin-top: 1.75rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid rgba(165, 214, 167, 0.35);
      box-shadow: 0 2px 16px rgba(67, 160, 71, 0.08);
      overflow: hidden;
    }

    .paginator-wrapper ::ng-deep .p-paginator {
      background: transparent !important;
      border: none !important;
      padding: 0.5rem 0.75rem !important;
      justify-content: center;
      gap: 0.25rem;
    }

    .paginator-wrapper ::ng-deep .p-paginator-page,
    .paginator-wrapper ::ng-deep .p-paginator-next,
    .paginator-wrapper ::ng-deep .p-paginator-prev,
    .paginator-wrapper ::ng-deep .p-paginator-first,
    .paginator-wrapper ::ng-deep .p-paginator-last {
      border-radius: 10px !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      color: #2e7d32 !important;
      min-width: 2.2rem !important;
      height: 2.2rem !important;
      transition: all 0.15s ease !important;
      border: 1.5px solid transparent !important;
    }

    .paginator-wrapper ::ng-deep .p-paginator-page:not(.p-highlight):hover,
    .paginator-wrapper ::ng-deep .p-paginator-next:not(.p-disabled):hover,
    .paginator-wrapper ::ng-deep .p-paginator-prev:not(.p-disabled):hover,
    .paginator-wrapper ::ng-deep .p-paginator-first:not(.p-disabled):hover,
    .paginator-wrapper ::ng-deep .p-paginator-last:not(.p-disabled):hover {
      background: #e8f5e9 !important;
      border-color: #c8e6c9 !important;
    }

    .paginator-wrapper ::ng-deep .p-paginator-page.p-highlight {
      background: linear-gradient(135deg, #43a047, #2e7d32) !important;
      color: #fff !important;
      font-weight: 700 !important;
      border-color: transparent !important;
      box-shadow: 0 3px 10px rgba(46, 125, 50, 0.35) !important;
    }

    .paginator-wrapper ::ng-deep .p-paginator-current {
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.82rem !important;
      color: #6b8c6b !important;
    }

    .paginator-wrapper ::ng-deep .p-paginator-icon {
      color: #43a047 !important;
    }

    .paginator-wrapper ::ng-deep .p-disabled .p-paginator-icon {
      color: #c8e6c9 !important;
    }

    /* ── Responsive ── */
    @media (max-width: 700px) {
      .page-wrapper { padding: 1rem; }
      .toolbar-shell { flex-direction: column; align-items: flex-start; }
      .search-pill input { width: 200px; }
      .cards-grid { grid-template-columns: 1fr; }
    }
  `],
  imports: [
    CommonModule, TableModule, FormsModule, ReactiveFormsModule,
    ButtonModule, RippleModule, ToastModule, RouterModule, ToolbarModule,
    RatingModule, FluidModule, PanelModule, AutoCompleteModule, PaginatorModule,
    InputTextModule, TextareaModule, SelectModule, RadioButtonModule,
    InputNumberModule, DialogModule, TagModule, InputIconModule, IconFieldModule,
    ConfirmDialogModule, PasswordModule, MessageModule,
    CardModule
  ],
  template: `
    <p-card>
    <p-toast></p-toast>

    <div class="page-wrapper">

      <!-- ── Toolbar ── -->
      <div class="toolbar-shell">
        <div class="toolbar-title">
          Download <span>Requests</span>
        </div>
        <div class="toolbar-right">
          <div class="search-pill">
            <i class="pi pi-search"></i>
            <input
              type="text"
              [value]="searchQuery()"
              placeholder="Search customer, module, name, email…"
              (input)="onSearchChange($event)"
            />
            <button
              *ngIf="searchQuery()"
              class="search-clear"
              (click)="clearSearch()"
              title="Clear search">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <span *ngIf="searchQuery()" class="result-badge">
            {{ filteredRequests().length }} / {{ allRequests().length }}
          </span>
        </div>
      </div>

      <!-- ── Cards Grid ── -->
      <div class="cards-grid">

        <!-- No search results -->
        <div *ngIf="filteredRequests().length === 0 && searchQuery()" class="state-card">
          <i class="pi pi-search state-icon"></i>
          <p>No results for <b>"{{ searchQuery() }}"</b></p>
          <p class="sub">Try customer name, module, requester name or email.</p>
          <button class="state-clear-btn" (click)="clearSearch()">
            <i class="pi pi-times" style="font-size:0.75rem; margin-right:0.3rem"></i>Clear Search
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="state-card">
          <i class="pi pi-spin pi-spinner state-icon"></i>
          <p>Loading download requests…</p>
        </div>

        <!-- Empty state -->
        <div *ngIf="allRequests().length === 0 && !searchQuery() && !loading" class="state-card">
          <i class="pi pi-inbox state-icon"></i>
          <p>No download requests found.</p>
          <p class="sub">Check back later or refresh the page.</p>
        </div>

        <!-- Request Cards — uses pagedRequests() for 6-per-page slicing -->
        <div *ngFor="let req of pagedRequests()" class="repo-card">

          <!-- Header: module + status chip -->
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-module" [title]="req.repo_module_name">{{ req.repo_module_name }}</div>
              <div class="card-customer">{{ req.repo_customer_name }}</div>
            </div>
            <span class="status-chip"
              [ngClass]="{
                'approved': req.status === 'Approved',
                'rejected': req.status === 'Rejected',
                'pending':  req.status !== 'Approved' && req.status !== 'Rejected'
              }">
              <span class="status-dot"></span>
              {{ req.status === 'Approved' ? 'Approved' : req.status === 'Rejected' ? 'Rejected' : 'Pending' }}
            </span>
          </div>

          <!-- Meta grid -->
          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-label">Requested At</span>
              <span class="meta-value">{{ formatDate(req.requested_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Status</span>
              <span class="meta-value">{{ req.status }}</span>
            </div>
            <div class="meta-item full-width">
              <span class="meta-label">Business Justification</span>
              <span class="meta-value wrap" [title]="req.justification">{{ req.justification || 'NA' }}</span>
            </div>
          </div>

          <div class="card-divider"></div>

          <!-- Requester info -->
          <div class="card-requester">
            <div class="requester-avatar">
              {{ (req.requested_by_name || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="requester-info">
              <span class="requester-name">{{ req.requested_by_name }}</span>
              <span class="requester-email">{{ req.requested_by_email }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions">
            <p-button
              label="Approve" icon="pi pi-check"
              styleClass="btn-approve"
              (onClick)="openApproveDialog(req)"
              [disabled]="req.status === 'Approved'">
            </p-button>
            <p-button
              label="Reject" icon="pi pi-times"
              styleClass="btn-reject"
              (onClick)="openRejectDialog(req)"
              [disabled]="req.status === 'Rejected'">
            </p-button>
          </div>
        </div>

      </div>

      <!-- ── Paginator ── -->
      <div class="paginator-wrapper" *ngIf="filteredRequests().length > pageSize">
        <p-paginator
          [rows]="pageSize"
          [totalRecords]="filteredRequests().length"
          [first]="currentPage() * pageSize"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          (onPageChange)="onPageChange($event)">
        </p-paginator>
      </div>

    </div>
    </p-card>

    <!-- ── Approve Dialog ── -->
    <p-dialog [(visible)]="approveDialogVisible" header="Approve Download Request"
              [modal]="true" [style]="{ width: '440px' }">
      <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.25rem 0" *ngIf="selectedRequest">
        <i class="pi pi-check-circle" style="font-size:2rem; color:#43a047; flex-shrink:0; margin-top:0.1rem"></i>
        <span style="font-size:0.95rem; color:#2e3a2f; line-height:1.55">
          Approve download request for
          <b>{{ selectedRequest.repo_customer_name }} — {{ selectedRequest.repo_module_name }}</b>
          requested by <b>{{ selectedRequest.requested_by_name }}</b>?
          <br><span style="font-size:0.82rem; color:#81c784">The requester will be granted access to download.</span>
        </span>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-text" icon="pi pi-times" label="Cancel"
                (click)="approveDialogVisible = false"></button>
        <button pButton class="p-button-success" icon="pi pi-check" label="Approve"
                (click)="approveSelected()"></button>
      </ng-template>
    </p-dialog>

    <!-- ── Reject Dialog ── -->
    <p-dialog [(visible)]="rejectDialogVisible" header="Reject Download Request"
              [modal]="true" [style]="{ width: '440px' }">
      <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.25rem 0" *ngIf="selectedRequest">
        <i class="pi pi-times-circle" style="font-size:2rem; color:#e53935; flex-shrink:0; margin-top:0.1rem"></i>
        <span style="font-size:0.95rem; color:#2e3a2f; line-height:1.55">
          Reject download request for
          <b>{{ selectedRequest.repo_customer_name }} — {{ selectedRequest.repo_module_name }}</b>
          requested by <b>{{ selectedRequest.requested_by_name }}</b>?
          <br><span style="font-size:0.82rem; color:#ef9a9a">The requester will be denied access.</span>
        </span>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-text" icon="pi pi-times" label="Cancel"
                (click)="rejectDialogVisible = false"></button>
        <button pButton class="p-button-danger" icon="pi pi-ban" label="Reject"
                (click)="rejectSelected()"></button>
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManageDownloads implements OnInit {
  allRequests = signal<DownloadRequest[]>([]);
  searchQuery = signal<string>('');

  // ── Pagination ──
  pageSize: number = 6;
  currentPage = signal<number>(0);

  filteredRequests = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.allRequests();

    return this.allRequests().filter(req =>
      req.repo_customer_name?.toLowerCase().includes(query) ||
      req.repo_module_name?.toLowerCase().includes(query) ||
      req.requested_by_name?.toLowerCase().includes(query) ||
      req.requested_by_email?.toLowerCase().includes(query) ||
      req.status?.toLowerCase().includes(query) ||
      req.justification?.toLowerCase().includes(query)
    );
  });

  // Returns only the current page slice of filtered results
  pagedRequests = computed(() => {
    const all = this.filteredRequests();
    const start = this.currentPage() * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  onPageChange(event: any): void {
    this.currentPage.set(event.page);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(0); // Reset to first page on search
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(0); // Reset to first page on clear
    const input = document.querySelector('.search-pill input') as HTMLInputElement;
    if (input) input.value = '';
  }

  loading = true;
  selectedRequest: DownloadRequest | null = null;
  approveDialogVisible = false;
  rejectDialogVisible = false;
  isvalid: boolean = false;

  get requests(): DownloadRequest[] {
    return this.allRequests();
  }

  constructor(
    private managereposervice: ManageReposService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private confirmationService: ConfirmationService,
    public router: Router
  ) {
    this.authservice.user.subscribe((x) => {
      if (x?.type === 'Superadmin') {
        this.isvalid = true;
        this.loadRequests();
      } else {
        this.isvalid = false;
        this.router.navigate(['/auth/access']);
      }
    });
  }

  ngOnInit() {}

  loadRequests() {
    this.loading = true;
    this.managereposervice.getDownloadRequests().subscribe({
      next: (data: DownloadRequest[]) => {
        this.allRequests.set(data);
        this.currentPage.set(0); // Reset page when data reloads
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageservice.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load download requests'
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  gotoRepos() {
    this.router.navigate(['/app/pages/managerepos']);
  }

  openApproveDialog(req: DownloadRequest) {
    this.selectedRequest = req;
    this.approveDialogVisible = true;
  }

  openRejectDialog(req: DownloadRequest) {
    this.selectedRequest = req;
    this.rejectDialogVisible = true;
  }

  approveSelected() {
    if (!this.selectedRequest) return;
    this.managereposervice.approveDownloadRequest(this.selectedRequest.id).subscribe({
      next: () => {
        this.messageservice.add({ severity: 'success', summary: 'Approved', detail: 'Download request approved' });
        this.approveDialogVisible = false;
        this.loadRequests();
      },
      error: () => {
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve request' });
      }
    });
  }

  rejectSelected() {
    if (!this.selectedRequest) return;
    this.managereposervice.rejectDownloadRequest(this.selectedRequest.id).subscribe({
      next: () => {
        this.messageservice.add({ severity: 'success', summary: 'Rejected', detail: 'Download request rejected' });
        this.rejectDialogVisible = false;
        this.loadRequests();
      },
      error: () => {
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject request' });
      }
    });
  }
}