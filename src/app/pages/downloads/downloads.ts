import { Component, OnInit } from '@angular/core';
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
    @media (max-width: 700px) {
      .cards-container {
        grid-template-columns: 1fr;
      }
      .approval-card {
        min-width: 0;
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
          <ng-template #end>
            <p-button
              label="Go to Repository"
              icon="pi pi-arrow-right"
              severity="help"
              (onClick)="gotoRepos()">
            </p-button>
          </ng-template>
        </p-toolbar>

        <div class="cards-container" *ngIf="!loading && requests.length; else emptyState">
          <div *ngFor="let req of requests" class="approval-card">
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

        <ng-template #emptyState>
          <div style="padding: 2rem; text-align: center;" *ngIf="!loading">
            No download requests found.
          </div>
          <div style="padding: 2rem; text-align: center;" *ngIf="loading">
            Loading download requests...
          </div>
        </ng-template>
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
  requests: DownloadRequest[] = [];
  loading = true;
  selectedRequest: DownloadRequest | null = null;
  approveDialogVisible = false;
  rejectDialogVisible = false;
  isvalid: boolean = false;

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
        // only load requests after confirming access
        this.loadRequests();
      } else {
        this.isvalid = false;
        this.router.navigate(['/auth/access']);
      }
    });
  }

  ngOnInit() {
    // optional: if you prefer, you can move loadRequests() here
    // and ensure auth guard is handled by route
  }

  loadRequests() {
    this.loading = true;
    this.managereposervice.getDownloadRequests().subscribe({
      next: (data: DownloadRequest[]) => {
        this.requests = data;
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
