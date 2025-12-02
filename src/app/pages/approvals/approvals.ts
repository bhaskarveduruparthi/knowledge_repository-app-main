import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
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

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

export interface Type {
    id?: number;
    type?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-approvals',
    standalone: true,
    styles: [`
        .background-wrapper {
            background-color: #e6f2ea;  /* Soft green background, matches other screens */
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
            background: rgba(255, 255, 255, 0.13);    /* Glass effect */
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
            margin: 0; /* Ensures perfect grid fit */
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

        .p-toolbar{
      
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        
        }

        .error {
            border: 1px solid red;
        }

        /* Responsive adjustments (optional) */
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
        <div class="card">
            <p-toast />
            <div class="card">
                <p-toolbar styleClass="mb-6">
                    <ng-template #start>
                        <span><strong><h4>Manage Approvals</h4></strong></span>
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
                <div class="cards-container">
                    <div *ngFor="let repo of repositories()" 
                         class="approval-card">
                        <h4>{{ repo.module_name }} - {{ repo.domain }}</h4>
                        <p><b>Customer:</b> {{ repo.customer_name }}</p>
                        <p><b>Sector:</b> {{ repo.sector }}</p>
                        <p><b>Standard/Custom:</b> {{ repo.standard_custom }}</p>
                        <div class="approval-actions">
                            <button pButton type="button" label="Approve" icon="pi pi-check"
                                class="p-button-success" (click)="approve_dialog(repo)"
                                [disabled]="repo.Approval_status === 'Approved'"></button>
                            <button pButton type="button" label="Reject" icon="pi pi-times"
                                class="p-button-danger" (click)="reject_dialog(repo)"
                                [disabled]="repo.Approval_status === 'Approved'"></button>
                            <button pButton type="button" label="More Info" icon="pi pi-info-circle"
                                (click)="showDetails(repo)"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            

            <p-dialog header="Repository Details"
                [(visible)]="dialogVisible"
                [modal]="true"
                [style]="{width: '700px'}"
                (onHide)="closeDetails()">
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
            </p-dialog>

            <p-dialog [(visible)]="approvedialog" header="Approve the Repository" [modal]="true" [style]="{ width: '450px' }">
                <div class="flex align-items-c justify-content-c">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                    <span *ngIf="repository">
                        Are you sure you want to approve the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?
                    </span>
                </div>
                <br>
                <ng-template pTemplate="content">
                    <label for="business_justification">Business Justification</label>
                    <div id="business_justification" style="min-height: 72px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;">
                        {{ repository.business_justification }}
                    </div>
                </ng-template>
                <ng-template pTemplate="footer">
                    <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="sendforapprovaldialog = false"></button>
                    <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Repoapproval(repository)"></button>
                </ng-template>
            </p-dialog>

            <p-dialog [(visible)]="rejectdialog" header="Approve the Repository" [modal]="true" [style]="{ width: '450px' }">
                <div class="flex align-items-c justify-content-c">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
                    <span *ngIf="repository">
                        Are you sure you want to reject the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?
                    </span>
                </div>
                <br>
                <ng-template pTemplate="content">
                    <label for="business_justification">Business Justification</label>
                    <div id="business_justification" style="min-height: 72px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;">
                        {{ repository.business_justification }}
                    </div>
                </ng-template>
                <ng-template pTemplate="footer">
                    <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="rejectdialog = false"></button>
                    <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Reporeject(repository)"></button>
                </ng-template>
            </p-dialog>
        
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManageApprovals implements OnInit {
    adminDialog: boolean = false;
    repositories = signal<Repository[]>([]);
    repository!: Repository;
    selectedrepositories: Repository[] = [];
    submitted: boolean = false;
    selectedFile: File | null = null;
    @ViewChild('dt') dt!: Table;
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    issent:boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    uploaddialog: boolean = false;
    approvedialog: boolean = false;
    createdialog: boolean = false;
    messages: any[] = [];
    ApprovalCurrentPage!: number;
    page!: number;
    dialogVisible: boolean = false;
    selectedRepo: any = null;
    first!: number;
    loading: boolean = true;
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
    sendforapproval:boolean = false;
    sendforapprovaldialog: boolean = false;
    deleteRepoDialog: boolean = false;
    rejectdialog: boolean = false;
    file: any;
    editrepodialog: boolean = false;
    business_justification: any;
    uploadcodeprocessdocdialog: boolean = false;

    get isAdmin(): boolean {
        return this.downloadvalid === true;
    }

    get isExportEnabled(): boolean {
        if (this.isAdmin) {
            return this.selectedrepositories.length > 0;
        }
        return this.selectedrepositories.length > 0 && this.selectedrepositories.every((repo) => repo.Approval_status === 'Approved');
    }

    ngOnInit() {
        this.loadDemoData();
    }

    constructor(
        private managereposervice: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin') {
                this.isvalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false
            } else {
                this.isvalid = false;
                this.downloadvalid = false;
                this.sendforapproval = true;
                this.attachvalid = true;
            }
        });
    }

    

    showDetails(repo: any) {
        this.selectedRepo = repo;
        this.dialogVisible = true;
    }

    closeDetails() {
        this.dialogVisible = false;
        this.selectedRepo = null;
    }

    loadDemoData() {
        this.managereposervice.get_approval_repos().subscribe((data: any) => {
            
            this.repositories.set(data);
           
            this.loading = false;
        });
        this.cols = [
            { field: 'id', header: 'S.No.' },
            { field: 'customer_name', header: 'Customer Name' },
            { field: 'domain', header: 'Domain' },
            { field: 'sector', header: 'Sector' },
            { field: 'module_name', header: 'Module Name' },
            { field: 'detailed_requirement', header: 'Detailed Requirement' },
            { field: 'standard_custom', header: 'Standard/Custom' },
            { field: 'technical_details', header: 'Technical Details / Z Object Name' },
            { field: 'customer_benefit', header: 'Customer Benefit' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'attach_code_or_document', header: 'Code/Process Document' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    

    

    

    gotoRepos() {
  this.router.navigate(['/app/pages/managerepos']);
    }

   

    

    toggleRepoSelection(repo: Repository, checked: boolean) {
        if (checked) {
            this.selectedrepositories.push(repo);
        } else {
            this.selectedrepositories = this.selectedrepositories.filter((r) => r.id !== repo.id);
        }
    }

    

    

    

    

    approve_dialog(repository: Repository) {
        this.approvedialog = true;
        this.repository = { ...repository };
    }

    reject_dialog(repository: Repository) {
        this.rejectdialog = true;
        this.repository = { ...repository };
    }

    

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    Repoapproval(repository: Repository) {
        this.managereposervice.RepoApproval(this.repository).subscribe((data: any) => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Approved', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    Reporeject(repository: Repository) {
        this.managereposervice.RepoRejection(this.repository).subscribe((data: any) => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Rejected', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    opendialog() {
        this.createdialog = true;
    }

    form_records() {
        this.managereposervice.get_approval_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() {
        window.location.reload();
    }

    

    
}
