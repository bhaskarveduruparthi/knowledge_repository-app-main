import { Component, OnInit } from '@angular/core';
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
import { ManageAdminsService } from '../service/manageadmins.service';
import { debounceTime, Subject } from 'rxjs';

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
    ManageAdminsService,
    ConfirmationService
  ],
  styles: [`
    .center-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
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
      to { opacity: 1; transform: translateY(0); }
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
    .filter-dropdown.placeholder-active {
      color: #9ca3af;
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
  `],
  template: `
    <p-toast></p-toast>
    <div class="center-wrapper">
      <div class="greeting">Hello, {{ username }}!</div>
      <div class="search-wrapper">
        <div class="search-container">
          <select 
            [(ngModel)]="selectedFilter" 
            class="filter-dropdown" 
            [ngClass]="{'placeholder-active': !selectedFilter}"
            aria-label="Filter By"
          >
            <option value="" disabled selected hidden>Filter By</option>
            <option *ngFor="let option of filterOptions" [value]="option">{{ option }}</option>
          </select>
          <div class="divider"></div>
          <input 
            type="text" 
            [(ngModel)]="searchText" 
            placeholder="Search Repository..." 
            (ngModelChange)="onSearchInputChange($event)"
            class="search-input"
          />
          <button class="search-button" (click)="onSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>
          <button 
            *ngIf="searchText.trim()" 
            class="search-button" 
            style="background-color: #6b7280; margin-left: 8px;" 
            (click)="clearSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Clear</span>
          </button>
        </div>
      </div>
      <span
        *ngIf="searchResults.length > 0"
        style="display: block; margin-bottom: 1rem; font-size: 1.1rem; color: #3b82f6; font-weight: 500;"
      >
        Search Results
      </span>
      <span
        *ngIf="searchResults.length === 0 && searchText.trim()"
        style="display: block; margin-bottom: 1rem; font-size: 1.1rem; color: #ef4444; font-weight: 500;"
      >
        No Results Found
      </span>
      <div class="cards-container" [ngClass]="{'single-card': searchResults.length === 1}" >
        <p-card 
          *ngFor="let repo of searchResults" 
          header="{{ repo.module_name }} - {{ repo.domain }}"
        >
          <ng-template pTemplate="content">
            <div class="card-content">
              <p><b>Customer:</b> {{ repo.customer_name }}</p>
              <p><b>Sector:</b> {{ repo.sector }}</p>
              <p><b>Standard/Custom:</b> {{ repo.standard_custom }}</p>
              <div class="more-info-row">
                <button pButton type="button" label="More Info" (click)="showDetails(repo)"></button>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>
      <p-dialog 
        header="Repository Details" 
        [(visible)]="dialogVisible" 
        [modal]="true" 
        [style]="{width: '700px'}"
        (onHide)="closeDetails()"
      >
        <div *ngIf="selectedRepo">
          <p><b>Customer Name:</b> {{ selectedRepo.customer_name }}</p>
          <p><b>Domain:</b> {{ selectedRepo.domain }}</p>
          <p><b>Sector:</b> {{ selectedRepo.sector }}</p>
          <p><b>Module Name:</b> {{ selectedRepo.module_name }}</p>
          <p><b>Detailed Requirement:</b> {{ selectedRepo.detailed_requirement }}</p>
          <p><b>Standard/Custom:</b> {{ selectedRepo.standard_custom }}</p>
          <p><b>Technical Details:</b> {{ selectedRepo.technical_details }}</p>
          <p><b>Customer Benefit:</b> {{ selectedRepo.customer_benefit }}</p>
          <p><b>Remarks:</b> {{ selectedRepo.remarks }}</p>
        </div>
        <div style="margin-top: 2rem; text-align: right;"  >
            <button 
              pButton 
              type="button" 
              label="Open Solution Attachment " 
              (click)="openAttachment(selectedRepo.id)"
              *ngIf="selectedRepo?.attach_code_or_document === 'ATTACHED'"
              >
            </button>
        </div>
      </p-dialog>
    </div>
  `
})
export class Home implements OnInit {
  greetingMessage: string = '';
  username: string = '';

  filterOptions: string[] = [
    'Domain',
    'Module',
    'Customer Name',
    'Sector',
    'Standard/Custom'
  ];
  searchText: string = '';
  selectedFilter: string = '';

  searchResults: any[] = [];
  dialogVisible: boolean = false;
  selectedRepo: any = null;

  searchInputChanged: Subject<string> = new Subject();

  constructor(
    private authservice: AuthenticationService,
    public messageservice: MessageService,
    private managereposervice: ManageReposService
  ) {
    this.authservice.user.subscribe(x => {
      this.username = x?.name || 'User';
    });
  }

  ngOnInit() {
    this.setGreetingMessage();
    this.searchInputChanged.pipe(
      debounceTime(300)
    ).subscribe(value => {
      if (value.trim()) {
        this.onSearch();
      } else {
        this.searchResults = [];
      }
    });
  }

  setGreetingMessage() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (hour < 18) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }
  }

  onSearch() {
    if (!this.selectedFilter && this.searchText.trim() === '') {
      this.messageservice.add({ severity: 'error', summary: 'Please enter search text or select filter' });
      return;
    }

    this.managereposervice.searchRepositories(this.selectedFilter, this.searchText).subscribe({
      next: (response) => {
        this.searchResults = response;
      },
      error: (err) => {
        this.messageservice.add({ severity: 'error', summary: 'Search Error', detail: err.message || 'Unknown error' });
      }
    });
  }

  clearSearch() {
    this.selectedFilter = '';
    this.searchText = '';
    this.searchResults = [];
  }

  showDetails(repo: any) {
    this.selectedRepo = repo;
    this.dialogVisible = true;
  }

  onSearchInputChange(value: string) {
    this.searchInputChanged.next(value);
  }

  closeDetails() {
    this.selectedRepo = null;
    this.dialogVisible = false;
  }

  openAttachment(attachmentId: number) {
    // use your actual Flask endpoint base URL as needed
    const url = `http://127.0.0.1:5001/repos/refview/${attachmentId}`;
    window.open(url, '_blank');
  }
}
