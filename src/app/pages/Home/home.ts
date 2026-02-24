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
import { SecureFileViewerComponent } from "../securefileviewer/securefileviewer";

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
    MessageModule,
    SecureFileViewerComponent
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

    :host {
      --color-bg:       #EEF4E9;
      --color-surface:  #FFFFFF;
      --color-border:   #D8E8CC;
      --color-primary:  #2D6A4F;
      --color-primary-light: #52B788;
      --color-accent:   #B7E4C7;
      --color-text:     #1B2D24;
      --color-muted:    #6B8F77;
      --color-tag-bg:   #D8F3DC;
      --color-tag-text: #1B4332;
      --radius-card:    16px;
      --shadow-card:    0 2px 12px rgba(45, 106, 79, 0.08), 0 1px 3px rgba(45, 106, 79, 0.06);
      --shadow-hover:   0 8px 32px rgba(45, 106, 79, 0.15), 0 2px 8px rgba(45, 106, 79, 0.08);
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Page shell ── */
    .page {
      min-height: 100vh;
      background-color: var(--color-bg);
      padding: 40px 24px 60px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Heading ── */
    .heading {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(2rem, 5vw, 3.25rem);
      color: var(--color-text);
      margin: 0 0 8px;
      letter-spacing: -0.5px;
      text-align: center;
      animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .subheading {
      font-size: 1rem;
      color: var(--color-muted);
      margin: 0 0 36px;
      font-weight: 400;
      text-align: center;
      animation: slideDown 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Search bar ── */
    .search-shell {
      width: 100%;
      max-width: 720px;
      margin-bottom: 12px;
      animation: slideDown 0.6s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: var(--color-surface);
      border: 1.5px solid var(--color-border);
      border-radius: 14px;
      padding: 6px 8px 6px 0;
      gap: 0;
      box-shadow: var(--shadow-card);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-bar:focus-within {
      border-color: var(--color-primary-light);
      box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.18), var(--shadow-card);
    }
    .filter-select {
      appearance: none;
      background: transparent;
      border: none;
      padding: 10px 36px 10px 18px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-primary);
      cursor: pointer;
      outline: none;
      min-width: 130px;
      font-family: 'DM Sans', sans-serif;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232D6A4F' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 10px center;
      background-repeat: no-repeat;
      background-size: 1.1em;
    }
    .vr {
      width: 1px;
      height: 28px;
      background: var(--color-border);
      flex-shrink: 0;
    }
    .search-input {
      flex: 1;
      border: none;
      padding: 10px 14px;
      font-size: 15px;
      color: var(--color-text);
      outline: none;
      background: transparent;
      font-family: 'DM Sans', sans-serif;
    }
    .search-input::placeholder { color: #a8bcb0; }

    .btn-search {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 9px 20px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.18s, transform 0.1s;
      flex-shrink: 0;
    }
    .btn-search:hover  { background: #1e4d39; }
    .btn-search:active { transform: scale(0.97); }
    .btn-search:disabled { background: #86bda5; cursor: not-allowed; }

    .btn-clear {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: var(--color-muted);
      border: none;
      padding: 9px 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: color 0.18s;
      flex-shrink: 0;
    }
    .btn-clear:hover { color: var(--color-primary); }

    /* ── Status line ── */
    .status {
      font-size: 13.5px;
      font-weight: 500;
      margin-bottom: 24px;
      height: 20px;
    }
    .status.found    { color: var(--color-primary); }
    .status.empty    { color: #c0392b; }
    .status.all      { color: var(--color-muted); }

    /* ── Loading ── */
    .spinner-wrap {
      display: flex;
      justify-content: center;
      margin: 48px 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-accent);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Card grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 1280px;
    }
    .grid.single { grid-template-columns: minmax(320px, 480px); justify-content: center; }

    /* ── Repo card ── */
    .repo-card {
      background: var(--color-surface);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.16,1,0.3,1),
                  box-shadow 0.2s cubic-bezier(0.16,1,0.3,1),
                  border-color 0.2s;
      animation: cardIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
    }
    .repo-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: var(--color-primary-light);
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Card color bar */
    

    .card-body {
      padding: 22px 24px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Card header row */
    .card-header-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 16px;
    }
    .card-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: var(--color-tag-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .card-icon svg { color: var(--color-primary); }
    .card-title-group { flex: 1; min-width: 0; }
    .card-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.05rem;
      color: var(--color-text);
      margin: 0 0 3px;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-domain-pill {
      display: inline-flex;
      align-items: center;
      background: var(--color-tag-bg);
      color: var(--color-tag-text);
      font-size: 11.5px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 99px;
      letter-spacing: 0.02em;
    }

    /* Card meta rows */
    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .meta-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-muted);
      width: 90px;
      flex-shrink: 0;
    }
    .meta-value {
      font-size: 13.5px;
      color: var(--color-text);
      font-weight: 400;
    }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-standard {
      background: #e0f2fe;
      color: #0369a1;
    }
    .badge-custom {
      background: #fef3c7;
      color: #92400e;
    }

    /* divider */
    .card-divider {
      height: 1px;
      background: var(--color-border);
      margin: 0 0 16px;
    }

    /* Card footer */
    .card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-author {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .author-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .author-name {
      font-size: 12.5px;
      color: var(--color-muted);
      font-weight: 500;
    }
    .btn-details {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 7px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.18s, transform 0.1s;
    }
    .btn-details:hover  { background: #1e4d39; }
    .btn-details:active { transform: scale(0.97); }
    .btn-details svg { flex-shrink: 0; }

    /* ── Details dialog (keep existing, minor polish) ── */
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table tr { border-bottom: 1px solid #f0f4f0; }
    .detail-table tr:last-child { border-bottom: none; }
    .detail-table td { padding: 13px 16px; font-size: 14px; vertical-align: top; }
    .detail-table .dt-label {
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-muted);
      width: 190px;
      background: #f7faf7;
    }
    .detail-table .dt-value { color: var(--color-text); }
  `],
  template: `
    
    <p-toast></p-toast>
    <div class="page">

      <!-- Heading -->
      <h1 class="heading">Search Solutions</h1>
      <p class="subheading">Explore, and Discover Approved solutions</p>

      <!-- Search bar -->
      <div class="search-shell">
        <div class="search-bar">
          <select [(ngModel)]="selectedFilter" class="filter-select"
            (change)="onFilterChange()" aria-label="Filter By">
            <option *ngFor="let opt of filterOptions" [value]="opt">{{ opt }}</option>
          </select>

          <div class="vr"></div>

          <input
            type="text"
            [(ngModel)]="searchText"
            placeholder="Search knowledge repository…"
            (ngModelChange)="onSearchInputChange($event)"
            (keydown.enter)="onSearch()"
            class="search-input"
          />

          <button *ngIf="searchText.trim()" class="btn-clear" (click)="clearSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="2" y2="12"/><line x1="2" y1="2" x2="12" y2="12"/>
            </svg>
            Clear
          </button>

          <button class="btn-search" (click)="onSearch()" [disabled]="isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="6.5" cy="6.5" r="5.5"/>
              <line x1="10.9" y1="10.9" x2="14" y2="14"/>
            </svg>
            Search
          </button>
        </div>
      </div>

      <!-- Status -->
      <ng-container *ngIf="!isLoading">
        <div *ngIf="isSearchActive && displayedRepos.length > 0" class="status found">
          {{ displayedRepos.length }} result{{ displayedRepos.length !== 1 ? 's' : '' }} found for "{{ lastSearchText }}"
        </div>
        <div *ngIf="isSearchActive && displayedRepos.length === 0" class="status empty">
          No results found for "{{ lastSearchText }}"
        </div>
        <div *ngIf="!isSearchActive && displayedRepos.length > 0" class="status all">
          Showing all {{ displayedRepos.length }} approved repositories
        </div>
        <div *ngIf="!isSearchActive && displayedRepos.length === 0 && !isLoading" class="status all">
          &nbsp;
        </div>
      </ng-container>

      <!-- Loading -->
      <div class="spinner-wrap" *ngIf="isLoading">
        <div class="spinner"></div>
      </div>

      <!-- Card Grid -->
      <div class="grid" [ngClass]="{'single': displayedRepos.length === 1}" *ngIf="!isLoading">

        <div class="repo-card" *ngFor="let repo of displayedRepos; let i = index"
          [style.animation-delay]="(i * 0.05) + 's'">

          <!-- Accent bar -->
          <div class="card-bar"></div>

          <div class="card-body">

            <!-- Header -->
            <div class="card-header-row">
              <div class="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                  stroke="#2D6A4F" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2V4a2 2 0 0 0-2-2z"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                  <line x1="9" y1="17" x2="11" y2="17"/>
                </svg>
              </div>
              <div class="card-title-group">
                <div class="card-title" [title]="repo.module_name">{{ repo.module_name }}</div>
                <span class="card-domain-pill">Domain: {{ repo.domain }}</span>
                
                
              </div>
            </div>

            <!-- Meta -->
            <div class="card-meta">
              <div class="meta-row">
                <span class="meta-label">Sector</span>
                <span class="meta-value">{{ repo.sector }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Object Type</span>
                <span class="badge"
                  [ngClass]="repo.standard_custom === 'Standard' ? 'badge-standard' : 'badge-custom'">
                  {{ repo.standard_custom }}
                </span>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Footer -->
            <div class="card-footer">
              <div class="card-author">
                <div class="author-avatar">{{ (repo.username || '?')[0].toUpperCase() }}</div>
                <span class="author-name">{{ repo.username }}</span>
              </div>
              <button class="btn-details" (click)="showDetails(repo)">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="2" y1="7" x2="12" y2="7"/>
                  <polyline points="8 3 12 7 8 11"/>
                </svg>
              </button>
            </div>

          </div>
        </div>

      </div><!-- /grid -->


      <!-- Details Dialog -->
      <p-dialog
        header="Repository Details"
        [(visible)]="dialogVisible"
        [modal]="true"
        [style]="{width: '90vw', maxWidth: '800px', height: '90vh'}"
        [contentStyle]="{height: 'calc(100% - 60px)', overflow: 'auto'}"
        (onHide)="closeDetails()"
      >
        <ng-template pTemplate="content">
          <div *ngIf="selectedRepo" style="padding: 1rem;">
            <table class="detail-table">
              <tbody>
                <tr>
                  <td class="dt-label">Domain</td>
                  <td class="dt-value">{{ selectedRepo.domain }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Sector</td>
                  <td class="dt-value">{{ selectedRepo.sector }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Module Name</td>
                  <td class="dt-value">{{ selectedRepo.module_name }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Detailed Requirement</td>
                  <td class="dt-value">{{ selectedRepo.detailed_requirement }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Standard / Custom</td>
                  <td class="dt-value">{{ selectedRepo.standard_custom }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Technical Details</td>
                  <td class="dt-value">{{ selectedRepo.technical_details }}</td>
                </tr>
                <tr>
                  <td class="dt-label">Customer Benefit</td>
                  <td class="dt-value">{{ selectedRepo.customer_benefit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <ng-container *ngIf="selectedRepo">
            <app-secure-file-viewer
              [repoId]="selectedRepo.id"
              [filename]="selectedRepo.attachment_filename || ''"
              [disabled]="selectedRepo.attach_code_or_document === 'UPLOADED'"
              apiBase="http://10.6.102.245:5002">
            </app-secure-file-viewer>

            <button
              pButton type="button"
              [label]="isAttachmentLoading ? 'Loading…' : 'Open Solution Attachment'"
              [disabled]="isAttachmentLoading"
              (click)="openAttachment(selectedRepo)"
              *ngIf="selectedRepo.attach_code_or_document === 'ATTACHED' && selectedRepo.download_approved === true"
            ></button>

            <button
              pButton type="button"
              label="Request Download Access"
              severity="secondary"
              (click)="requestDownload(selectedRepo)"
              *ngIf="selectedRepo.attach_code_or_document === 'ATTACHED' && selectedRepo.download_approved !== true"
            ></button>
          </ng-container>
        </ng-template>
      </p-dialog>

    </div>
  `
})
export class Home implements OnInit, OnDestroy {

  filterOptions: string[] = ['Any', 'Domain', 'Module', 'Sector'];
  selectedFilter: string = 'Any';
  searchText: string = '';

  isAttachmentLoading: boolean = false;

  allRepos: any[] = [];
  displayedRepos: any[] = [];

  isLoading: boolean = false;
  isSearchActive: boolean = false;
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
    this.searchInput$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      const trimmed = value.trim();
      if (trimmed) {
        this.executeSearch(trimmed);
      } else {
        this.displayedRepos  = this.allRepos;
        this.isSearchActive  = false;
        this.lastSearchText  = '';
      }
    });

    this.loadAllRepos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  onSearch() {
    const trimmed = this.searchText.trim();
    if (!trimmed) {
      this.displayedRepos = this.allRepos;
      this.isSearchActive = false;
      return;
    }
    this.executeSearch(trimmed);
  }

  onSearchInputChange(value: string) {
    this.searchInput$.next(value);
  }

  onFilterChange() {
    if (this.searchText.trim()) {
      this.executeSearch(this.searchText.trim());
    }
  }

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
    const token   = localStorage.getItem('access_token') || localStorage.getItem('token') || '';

    if (!token) {
      this.messageservice.add({ severity: 'warn', summary: 'Not logged in', detail: 'You must be logged in to view attachments.' });
      return;
    }

    this.isAttachmentLoading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(fileUrl, { headers, responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.isAttachmentLoading = false;
        const objectUrl = URL.createObjectURL(blob);
        const newTab    = window.open(objectUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

        if (!newTab) {
          this.messageservice.add({ severity: 'info', summary: 'Popup Blocked', detail: 'Your browser blocked the popup. The file will download instead.' });
          const a    = document.createElement('a');
          a.href     = objectUrl;
          a.download = repo.attachment_filename || `repository_${repo.id}`;
          a.target   = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: (err: any) => {
        this.isAttachmentLoading = false;
        if (err.status === 403) {
          this.messageservice.add({ severity: 'warn', summary: 'Access Denied', detail: 'You need Superadmin approval before you can view this attachment.' });
        } else if (err.status === 401) {
          this.messageservice.add({ severity: 'error', summary: 'Unauthorised', detail: 'Please log in again.' });
        } else {
          this.messageservice.add({ severity: 'error', summary: 'Failed to open attachment', detail: err.message || 'Could not load the file. Please try again.' });
        }
      }
    });
  }

  requestDownload(repo: any) {
    this.managereposervice.requestDownload(repo.id, '').subscribe({
      next: () => {
        this.messageservice.add({ severity: 'success', summary: 'Request Sent', detail: 'Your download request has been sent to the Superadmin for approval.' });
      },
      error: (err) => {
        if (err.status === 400) {
          this.messageservice.add({ severity: 'info', summary: 'Already Requested', detail: 'Your request is already pending approval.' });
        } else {
          this.messageservice.add({ severity: 'error', summary: 'Request Failed', detail: err.message || 'Could not send request. Please try again.' });
        }
      }
    });
  }
}