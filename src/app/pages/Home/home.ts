import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
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
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
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
    ChartModule,
    CardModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    PasswordModule,
    MessageModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  styles: [`
    .center-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      width: 100%;
      background-color: #ECF4E8;
      padding: 20px;
      box-sizing: border-box;
    }
    .greeting {
      font-size: 2.5rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 2rem;
      text-align: center;
      letter-spacing: -0.025em;
      animation: fadeIn 0.8s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .search-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    .search-container {
      display: flex;
      align-items: center;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 50px;
      box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
      padding: 4px 12px;
      width: 100%;
      max-width: 700px;
      transition: all 0.3s ease;
    }
    .filter-dropdown {
      appearance: none;
      background-color: transparent;
      border: none;
      padding: 12px 24px 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      outline: none;
      min-width: 150px;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 12px center;
      background-repeat: no-repeat;
      background-size: 1.25em 1.25em;
    }
    .divider {
      width: 1px;
      height: 32px;
      background-color: #e5e7eb;
      margin: 0 12px;
    }
    .search-input {
      flex: 1;
      border: none;
      padding: 12px 16px;
      font-size: 16px;
      color: #1f2937;
      outline: none;
      background: transparent;
      border-radius: 40px;
    }
    .search-input::placeholder {
      color: #9ca3af;
    }
    .search-button {
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 40px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-left: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-button:hover {
      background-color: #2563eb;
    }
    .search-button:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
    }
    .clear-button {
      background-color: #6b7280;
      color: white;
      border: none;
      border-radius: 40px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-left: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .clear-button:hover {
      background-color: #4b5563;
    }
    .status-bar {
      display: block;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .status-bar.results    { color: #3b82f6; }
    .status-bar.no-results { color: #ef4444; }
    .status-bar.all-repos  { color: #6b7280; }

    .cards-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: stretch;
      gap: 1rem;
    }
    .cards-container p-card {
      flex: 1 1 320px;
      max-width: 420px;
      min-width: 320px;
      min-height: 260px;
      box-sizing: border-box;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.125);
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .cards-container p-card:hover {
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.18);
    }
    .cards-container .card-content {
      padding: 1.5rem;
      color: #19202C;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .more-info-row {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex: 1;
    }
    .cards-container p-card .p-card-header {
      background: rgba(255,255,255,0.15);
      border-bottom: 1px solid rgba(255,255,255,0.18);
      padding: 1rem 1.5rem;
      font-weight: 600;
      font-size: 1.1rem;
      border-radius: 24px 24px 0 0;
    }
    .cards-container.single-card p-card {
      flex: 0 1 420px;
      max-width: 520px;
      min-width: 320px;
      margin: auto;
    }
    .card-content p {
      margin: 0.25rem 0;
    }
    .content-wrapper {
      width: 100%;
      max-width: 1200px;
      margin-top: 1.5rem;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  template: `
    <p-toast></p-toast>
    <div class="center-wrapper">

      <div class="greeting">Search Solutions</div>

      <!-- ── Search bar ── -->
      <div class="search-wrapper">
        <div class="search-container">

          <!-- Filter dropdown -->
          <select
            [(ngModel)]="selectedFilter"
            class="filter-dropdown"
            (change)="onFilterChange()"
            aria-label="Filter By"
          >
            <option *ngFor="let option of filterOptions" [value]="option">{{ option }}</option>
          </select>

          <div class="divider"></div>

          <!-- Search input -->
          <input
            type="text"
            [(ngModel)]="searchText"
            placeholder="Search Knowledge Repository..."
            (ngModelChange)="onSearchInputChange($event)"
            (keydown.enter)="onSearch()"
            class="search-input"
          />

          <!-- Search button -->
          <button
            class="search-button"
            (click)="onSearch()"
            [disabled]="isLoading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>

          <!-- Clear button -->
          <button
            *ngIf="searchText.trim()"
            class="clear-button"
            (click)="clearSearch()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              fill="none" stroke="white" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18"></line>
              <line x1="6"  y1="6"  x2="18" y2="18"></line>
            </svg>
            <span>Clear</span>
          </button>

        </div>
      </div>

      <!-- ── Loading spinner ── -->
      <div class="loading-spinner" *ngIf="isLoading">
        <div class="spinner"></div>
      </div>

      <!-- ── Status bar ── -->
      <ng-container *ngIf="!isLoading">
        <span *ngIf="isSearchActive && displayedRepos.length > 0"
          class="status-bar results">
          {{ displayedRepos.length }} result{{ displayedRepos.length !== 1 ? 's' : '' }} found
        </span>
        <span *ngIf="isSearchActive && displayedRepos.length === 0"
          class="status-bar no-results">
          No results found for "{{ lastSearchText }}"
        </span>
        <span *ngIf="!isSearchActive && displayedRepos.length > 0"
          class="status-bar all-repos">
          Showing all {{ displayedRepos.length }} approved repositories
        </span>
      </ng-container>

      <!-- ── Cards ── -->
      <div
        class="cards-container"
        [ngClass]="{'single-card': displayedRepos.length === 1}"
        *ngIf="!isLoading"
      >
        <p-card
          *ngFor="let repo of displayedRepos"
          header="{{ repo.module_name }} - {{ repo.domain }}"
        >
          <ng-template pTemplate="content">
            <div class="card-content">
              <p><b>Domain:</b> {{ repo.domain }}</p>
              <p><b>Sector:</b> {{ repo.sector }}</p>
              <p><b>Standard/Custom:</b> {{ repo.standard_custom }}</p>
              <p><b>User Created:</b> {{ repo.username }}</p>
              <div class="more-info-row">
                <button pButton type="button" label="More Info" (click)="showDetails(repo)"></button>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>

      <!-- ── Details dialog ── -->
      <p-dialog
        header="Repository Details"
        [(visible)]="dialogVisible"
        [modal]="true"
        [style]="{width: '700px'}"
        (onHide)="closeDetails()"
      >
        <div *ngIf="selectedRepo">
          <p><b>Domain:</b>               {{ selectedRepo.domain }}</p>
          <p><b>Sector:</b>               {{ selectedRepo.sector }}</p>
          <p><b>Module Name:</b>          {{ selectedRepo.module_name }}</p>
          <p><b>Detailed Requirement:</b> {{ selectedRepo.detailed_requirement }}</p>
          <p><b>Standard/Custom:</b>      {{ selectedRepo.standard_custom }}</p>
          <p><b>Technical Details:</b>    {{ selectedRepo.technical_details }}</p>
          <p><b>Customer Benefit:</b>     {{ selectedRepo.customer_benefit }}</p>
        </div>
        <div style="margin-top: 2rem; text-align: right;">
          <!-- Button for Superadmin: always visible if attachment exists -->
  <button
    pButton
    type="button"
    [label]="isAttachmentLoading ? 'Loading...' : 'Open Solution Attachment'"
    [disabled]="isAttachmentLoading"
    (click)="openAttachment(selectedRepo)"
    *ngIf="selectedRepo?.attach_code_or_document === 'ATTACHED' && selectedRepo?.download_approved === true"
  ></button>

  <!-- Button for regular users: show Request Download if not yet approved -->
  <button
    pButton
    type="button"
    label="Request Download Access"
    severity="secondary"
    (click)="requestDownload(selectedRepo)"
    *ngIf="selectedRepo?.attach_code_or_document === 'ATTACHED' && selectedRepo?.download_approved !== true"
  ></button>
        </div>
      </p-dialog>

    </div>
  `
})
export class Home implements OnInit, OnDestroy {

  filterOptions: string[] = ['Any', 'Domain', 'Module', 'Sector'];
  selectedFilter: string = 'Any';
  searchText: string = '';

  isAttachmentLoading: boolean = false;

  /** All repos loaded on init */
  allRepos: any[] = [];
  /** What's currently shown in the cards */
  displayedRepos: any[] = [];

  isLoading: boolean = false;
  /** true when the cards reflect a search query rather than the full list */
  isSearchActive: boolean = false;
  /** remembers the last executed query text for the "no results" message */
  lastSearchText: string = '';

  dialogVisible: boolean = false;
  selectedRepo: any = null;

  private searchInput$ = new Subject<string>();
  private destroy$    = new Subject<void>();

  constructor(
    private authservice: AuthenticationService,
    private messageservice: MessageService,
    private managereposervice: ManageReposService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // Wire up debounced live search
    this.searchInput$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      const trimmed = value.trim();
      if (trimmed) {
        this.executeSearch(trimmed);
      } else {
        // Input cleared → fall back to full list
        this.displayedRepos  = this.allRepos;
        this.isSearchActive  = false;
        this.lastSearchText  = '';
      }
    });

    // Load all repos on startup
    this.loadAllRepos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data loading ──────────────────────────────────────────────────────────

  loadAllRepos() {
    this.isLoading = true;
    this.managereposervice.getAllRepositories().subscribe({
      next: (repos) => {
        this.allRepos       = repos;
        this.displayedRepos = repos;
        this.isLoading      = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageservice.add({
          severity: 'error',
          summary: 'Failed to load repositories',
          detail: err.message || 'Unknown error'
        });
      }
    });
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  /** Called by button click and Enter key */
  onSearch() {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      // No text → show everything
      this.displayedRepos = this.allRepos;
      this.isSearchActive = false;
      return;
    }
    this.executeSearch(trimmed);
  }

  /** Called by the debounce pipe (live typing) */
  onSearchInputChange(value: string) {
    this.searchInput$.next(value);
  }

  /** Called when the filter dropdown changes */
  onFilterChange() {
    if (this.searchText.trim()) {
      // Text already present → re-run search with new filter immediately
      this.executeSearch(this.searchText.trim());
    }
    // No text → nothing to do, filter will apply on next search
  }

  /** Shared search execution – single source of truth */
  private executeSearch(query: string) {
    this.isLoading      = true;
    this.lastSearchText = query;

    this.managereposervice.searchRepositories(this.selectedFilter, query).subscribe({
      next: (results) => {
        this.displayedRepos = results;
        this.isSearchActive = true;
        this.isLoading      = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageservice.add({
          severity: 'error',
          summary: 'Search Error',
          detail: err.message || 'Unknown error'
        });
      }
    });
  }

  clearSearch() {
    this.searchText     = '';
    this.selectedFilter = 'Any';
    this.displayedRepos = this.allRepos;
    this.isSearchActive = false;
    this.lastSearchText = '';
  }

  // ─── Dialog ────────────────────────────────────────────────────────────────

  showDetails(repo: any) {
    this.selectedRepo  = repo;
    this.dialogVisible = true;
  }

  closeDetails() {
    this.selectedRepo  = null;
    this.dialogVisible = false;
  }

  

  

openAttachment(repo: any) {
  const base    = 'http://10.6.102.245:5002'; 
  const fileUrl = `${base}/repos/refview/${repo.id}`;

  // Read JWT from wherever your app stores it (adjust key name if different)
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';

  if (!token) {
    this.messageservice.add({
      severity: 'warn',
      summary: 'Not logged in',
      detail: 'You must be logged in to view attachments.'
    });
    return;
  }

  this.isAttachmentLoading = true;

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.get(fileUrl, { headers, responseType: 'blob' }).subscribe({
    next: (blob: Blob) => {
      this.isAttachmentLoading = false;

      const objectUrl = URL.createObjectURL(blob);
      const newTab    = window.open(objectUrl, '_blank');

      // Revoke blob URL after 60s to free memory
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

      if (!newTab) {
        // Popup blocked — fall back to anchor download
        this.messageservice.add({
          severity: 'info',
          summary: 'Popup Blocked',
          detail: 'Your browser blocked the popup. The file will download instead.'
        });
        const a    = document.createElement('a');
        a.href     = objectUrl;
        a.download = repo.attachment_filename || `repository_${repo.id}`;
        a.target   = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    },
    error: (err:any) => {
      this.isAttachmentLoading = false;

      if (err.status === 403) {
        this.messageservice.add({
          severity: 'warn',
          summary: 'Access Denied',
          detail: 'You need Superadmin approval before you can view this attachment.'
        });
      } else if (err.status === 401) {
        this.messageservice.add({
          severity: 'error',
          summary: 'Unauthorised',
          detail: 'Please log in again.'
        });
      } else {
        this.messageservice.add({
          severity: 'error',
          summary: 'Failed to open attachment',
          detail: err.message || 'Could not load the file. Please try again.'
        });
      }
    }
  });
}

requestDownload(repo: any) {
  this.managereposervice.requestDownload(repo.id, '').subscribe({
    next: () => {
      this.messageservice.add({
        severity: 'success',
        summary: 'Request Sent',
        detail: 'Your download request has been sent to the Superadmin for approval.'
      });
    },
    error: (err) => {
      // If already pending, show a friendly message instead of an error
      if (err.status === 400) {
        this.messageservice.add({
          severity: 'info',
          summary: 'Already Requested',
          detail: 'Your request is already pending approval.'
        });
      } else {
        this.messageservice.add({
          severity: 'error',
          summary: 'Request Failed',
          detail: err.message || 'Could not send request. Please try again.'
        });
      }
    }
  });
}



}