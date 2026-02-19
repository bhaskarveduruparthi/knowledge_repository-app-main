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

@Component({
  selector: 'app-downloads',
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
    .error {
      border: 1px solid red;
    }

    /* ── Search styles ── */
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
    <p-toast></p-toast>

    <div class="background-wrapper">
      <div class="card">
        <p-toolbar styleClass="mb-6">
          <ng-template #start>
            <span><strong><h4>Download Requests</h4></strong></span>
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
                  placeholder="Search by customer, module, name, email..."
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
                {{ filteredRequests().length }} of {{ allRequests().length }} results
              </span>
            </div>
            <!--<p-button
              label="Go to Repository"
              icon="pi pi-arrow-right"
              severity="help"
              (onClick)="gotoRepos()">
            </p-button>-->
          </ng-template>
        </p-toolbar>

        <div class="cards-container">

          <!-- No search results -->
          <div *ngIf="filteredRequests().length === 0 && searchQuery()" class="no-results">
            <i class="pi pi-search"></i>
            <p>No requests found for <b>"{{ searchQuery() }}"</b></p>
            <p style="font-size:0.85rem">Try searching by customer name, module, requester name or email.</p>
            <button pButton type="button" label="Clear Search" icon="pi pi-times"
              class="p-button-outlined p-button-sm" style="margin-top:0.75rem"
              (click)="clearSearch()"></button>
          </div>

          <!-- Empty state (no data at all) -->
          <div *ngIf="allRequests().length === 0 && !searchQuery() && !loading" class="no-results">
            <i class="pi pi-inbox"></i>
            <p>No download requests found.</p>
          </div>

          <!-- Loading state -->
          <div *ngIf="loading" class="no-results">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Loading download requests...</p>
          </div>

          <div *ngFor="let req of filteredRequests()" class="approval-card">
            <h4>{{ req.repo_customer_name }} - {{ req.repo_module_name }}</h4>
            <p><b>Requested By:</b> {{ req.requested_by_name }} ({{ req.requested_by_email }})</p>
            <p><b>Status:</b> {{ req.status }}</p>
            <p><b>Requested At:</b> {{ formatDate(req.requested_at) }}</p>
            <p><b>Business Justification:</b> {{ req.justification }}</p>

            <div class="approval-actions">
              <button pButton type="button" label="Approve" icon="pi pi-check"
                class="p-button-success"
                (click)="openApproveDialog(req)"
                [disabled]="req.status === 'Approved'">
              </button>
              <button pButton type="button" label="Reject" icon="pi pi-times"
                class="p-button-danger"
                (click)="openRejectDialog(req)"
                [disabled]="req.status === 'Rejected'">
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <p-dialog [(visible)]="approveDialogVisible" header="Approve Download Request"
              [modal]="true" [style]="{ width: '450px' }">
      <div class="flex align-items-c justify-content-c" *ngIf="selectedRequest">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
        <span>
          Approve download for
          <b>{{ selectedRequest.repo_customer_name }} - {{ selectedRequest.repo_module_name }}</b>
          requested by <b>{{ selectedRequest.requested_by_name }}</b>?
        </span>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-text" icon="pi pi-times" label="No"
                (click)="approveDialogVisible = false"></button>
        <button pButton class="p-button-text" icon="pi pi-check" label="Yes"
                (click)="approveSelected()"></button>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="rejectDialogVisible" header="Reject Download Request"
              [modal]="true" [style]="{ width: '450px' }">
      <div class="flex align-items-c justify-content-c" *ngIf="selectedRequest">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
        <span>
          Reject download for
          <b>{{ selectedRequest.repo_customer_name }} - {{ selectedRequest.repo_module_name }}</b>
          requested by <b>{{ selectedRequest.requested_by_name }}</b>?
        </span>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-text" icon="pi pi-times" label="No"
                (click)="rejectDialogVisible = false"></button>
        <button pButton class="p-button-text" icon="pi pi-check" label="Yes"
                (click)="rejectSelected()"></button>
      </ng-template>
    </p-dialog>
  `,
  providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManageDownloads implements OnInit {
  // ── Store all requests as a signal so computed() can track them ──
  allRequests = signal<DownloadRequest[]>([]);

  // ── Search query as a signal ──
  searchQuery = signal<string>('');

  // ── Computed: filters allRequests based on searchQuery ──
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

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    const input = document.querySelector('.search-input-container input') as HTMLInputElement;
    if (input) input.value = '';
  }

  loading = true;
  selectedRequest: DownloadRequest | null = null;
  approveDialogVisible = false;
  rejectDialogVisible = false;
  isvalid: boolean = false;

  // Keep plain array for backward compat (not used in template anymore)
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
        this.allRequests.set(data);   // ← set signal instead of plain array
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
        this.messageservice.add({
          severity: 'success',
          summary: 'Approved',
          detail: 'Download request approved'
        });
        this.approveDialogVisible = false;
        this.loadRequests();
      },
      error: () => {
        this.messageservice.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve request'
        });
      }
    });
  }

  rejectSelected() {
    if (!this.selectedRequest) return;
    this.managereposervice.rejectDownloadRequest(this.selectedRequest.id).subscribe({
      next: () => {
        this.messageservice.add({
          severity: 'success',
          summary: 'Rejected',
          detail: 'Download request rejected'
        });
        this.rejectDialogVisible = false;
        this.loadRequests();
      },
      error: () => {
        this.messageservice.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reject request'
        });
      }
    });
  }
}