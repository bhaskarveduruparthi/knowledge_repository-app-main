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
    selector: 'app-managerepos',
    standalone: true,
    styles: `
        .custom-file-input {
            border: 1px solid #ced4da;
            border-radius: 6px;
            background-color: #f8f9fa;
            padding: 8px 12px;
            width: 100%;
            color: #333;
            font-size: 1rem;
            transition: border-color 0.2s;
        }

        .custom-file-input:hover {
            border-color: #007ad9;
            background-color: #e9ecef;
        }

        .custom-file-label {
            display: inline-block;
            margin-bottom: 4px;
            font-size: 0.95em;
            color: #5a5a5a;
            font-weight: 500;
        }

        .card {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 20px;
            color: #222;
            display: flex;
            flex-direction: column;
        }

        .responsive-form .custom-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        /* Adapt to single column on small screens */
        @media (max-width: 700px) {
            .responsive-form .custom-grid {
                grid-template-columns: 1fr;
            }
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            width: 100%;
        }

        .form-field {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        input[pInputText],
        textarea[pInputTextarea] {
            width: 100%;
        }

        @media (max-width: 700px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }

        label.required:after {
    content: "*";
    color: red;
    /* Or any preferred color */
    margin-left: 5px;
    /* Adjust as needed */
}

.error {
    border: 1px solid red;
}
    `,
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
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Create Repository" icon="pi pi-plus" severity="primary" (onClick)="opendialog()" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Upload Repos" icon="pi pi-upload" severity="help" (click)="upload_dialog()" />
                    <span style="margin-left: 1rem;"></span>
                    <p-button label="Export to Excel" icon="pi pi-download" severity="success" (onClick)="exportCSV()" [disabled]="!isExportEnabled" />
                </ng-template>
            </p-toolbar>
            <p-table
                #dt
                [value]="repositories() || []"
                [rows]="10"
                [loading]="loading"
                [rowHover]="true"
                [columns]="cols"
                dataKey="id"
                [globalFilterFields]="['customer_name', 'domain', 'sector', 'module_name']"
                [showCurrentPageReport]="true"
                [tableStyle]="{ 'min-width': '75rem' }"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h5 class="m-0">Manage Repository</h5>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th></th>
                        <!-- Checkbox header -->
                        
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Customer Name</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Domain</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Sector</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Module Name</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Detailed Requirement</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Standard/Custom</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Technical details(Z object name or Process developed/configured)</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Customer Benefit</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Remarks</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Code/Process Document</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Created On</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Business Justification</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Repo Status</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Repo Approver</th>
                        <th style="white-space: nowrap; font-weight: bold; color: #11224E;">Repo Approval Date</th>
                        <th style="font-weight: bold; color: #11224E;">Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-repo>
                    <tr>
                        <td>
                            <input type="checkbox" [checked]="isRepoSelected(repo)" (change)="onCheckboxChange(repo, $event)" [disabled]="!isAdmin && repo.Approval_status !== 'Approved'" />
                        </td>
                        
                        <td style="white-space: nowrap;">{{ repo.customer_name }}</td>
                        <td style="white-space: nowrap;">{{ repo.domain }}</td>
                        <td style="white-space: nowrap;">{{ repo.sector }}</td>
                        <td style="white-space: nowrap;">{{ repo.module_name }}</td>
                        <td>{{ repo.detailed_requirement }}</td>
                        <td>{{ repo.standard_custom }}</td>
                        <td>{{ repo.technical_details }}</td>
                        <td>{{ repo.customer_benefit }}</td>
                        <td>{{ repo.remarks }}</td>
                        <td>
                        <p-button label="Download" icon="pi pi-download" severity="primary" (click)="download_ref(repo, repo.id)" />
</td>       
                        <td style="white-space: nowrap;">{{ formatDate(repo.created_at) }}</td>
                        <td>{{repo.business_justification}}</td>
                        <td style="white-space: nowrap;">{{ repo.Approval_status }}</td>
                        <td style="white-space: nowrap;">{{ repo.Approver }}</td>
                        <td style="white-space: nowrap;">{{ repo.Approval_date }}</td>
                        <td>
                            <div class="flex" style="min-width: 100px;">
                                <button pButton pRipple icon="pi pi-send"  class="p-button-rounded p-button-help mr-2" *ngIf="sendforapproval"   (click)="sendforapproval_dialog(repo)" [disabled]="repo.Approval_status === 'Approved'"  ></button> 
                                <button pButton pRipple icon="pi pi-check" class="p-button-rounded p-button-info mr-2" *ngIf="isvalid" (click)="approve_dialog(repo)" [disabled]="repo.Approval_status === 'Approved'"></button>
                                <button pButton pRipple icon="pi pi-paperclip" class="p-button-rounded p-button-info mr-2" *ngIf="attachvalid" (click)="upload_ref(repo)"   ></button>
                                <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="delete_Repo(repo)"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="17">No Repositories found.</td>
                    </tr>
                </ng-template>
            </p-table>
            <p-paginator [totalRecords]="totalitems" [first]="first" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Repos" [showCurrentPageReport]="true" [rows]="10" (onPageChange)="onPageChange($event)"></p-paginator>
        </div>

<p-dialog [(visible)]="uploaddialog" header="Upload Repositories" [modal]="true" [style]="{ width: '450px' }">
    <div class="flex align-items-c justify-content-c">
        <div>
            <label class="custom-file-label">Choose Excel and Attachments</label>
            <input type="file" class="custom-file-input" multiple (change)="onFilesSelected($event)" accept=".xlsx,.pdf,.zip,.docx,.txt" />
        </div>
    </div>
    <ng-template pTemplate="footer">
        <button pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="uploaddialog = false"></button>
        <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Upload" (click)="uploadFiles()" [disabled]="!selectedFiles.length"></button>
    </ng-template>
</p-dialog>



        <!-- Your main form can be elsewhere in your template -->

<p-dialog [(visible)]="sendforapprovaldialog" header="Send the Repository for Approval" [modal]="true" [style]="{ width: '450px' }">
  <div class="flex align-items-c justify-content-c">
    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
    <span *ngIf="repository">
      Are you sure you want to Send the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository for Approval?
    </span>
  </div>
  <br>
  <ng-template pTemplate="content">
    <form [formGroup]="approvalForm">
      <label class="required" for="business_justification">Business Justification</label>
      <textarea id="business_justification" pInputTextarea rows="3" formControlName="business_justification"></textarea>

      <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['required'] && approvalForm.controls['business_justification'].touched"
        severity="error" text="Business Justification is required"></p-message>
      <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['minlength'] && approvalForm.controls['business_justification'].touched"
        severity="error" text="Minimum 10 characters required"></p-message>
      <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['maxlength'] && approvalForm.controls['business_justification'].touched"
        severity="error" text="Maximum 250 characters allowed"></p-message>
    </form>
  </ng-template>
  <ng-template pTemplate="footer">
    <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="sendforapprovaldialog = false"></button>
    <button pButton 
      pRipple 
      icon="pi pi-check" 
      class="p-button-text" 
      label="Yes" 
      (click)="Repo_approval(repository)" 
      [disabled]="approvalForm.invalid"></button>
  </ng-template>
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
    <button pButton 
      pRipple 
      icon="pi pi-check" 
      class="p-button-text" 
      label="Yes" 
      (click)="Repoapproval(repository)" 
      ></button>
  </ng-template>
</p-dialog>




<p-dialog [(visible)]="createdialog" header="Create Repository" [modal]="true" [style]="{ width: '1000px' }" [resizable]="false">
            <ng-template pTemplate="content">
                <form [formGroup]="repoForm" (ngSubmit)="onSubmit()" class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="required" for="customer_name">Customer Name</label>
                            <input id="customer_name" pInputText formControlName="customer_name" />
                            <p-message *ngIf="repoForm.controls['customer_name'].invalid && repoForm.controls['customer_name'].touched" severity="error" text="Customer Name is required"></p-message>
                        </div>
                        <div  class="form-field">
                            <label class="required" for="domain">Domain</label>
                            <input id="domain" pInputText formControlName="domain" />
                            <p-message *ngIf="repoForm.controls['domain'].invalid && repoForm.controls['domain'].touched" severity="error" text="Domain is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="sector">Sector</label>
                            <input id="sector" pInputText formControlName="sector" />
                            <p-message *ngIf="repoForm.controls['sector'].invalid && repoForm.controls['sector'].touched" severity="error" text="Sector is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="module_name">Module Name</label>
                            <input id="module_name" pInputText formControlName="module_name" />
                            <p-message *ngIf="repoForm.controls['module_name'].invalid && repoForm.controls['module_name'].touched" severity="error" text="Module Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="detailed_requirement">Detailed Requirement</label>
                            <textarea id="detailed_requirement" pInputTextarea rows="3" formControlName="detailed_requirement"></textarea>
                            <p-message *ngIf="repoForm.controls['detailed_requirement'].invalid && repoForm.controls['detailed_requirement'].touched" severity="error" text="Detailed Requirement is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="standard_custom">Standard/Custom</label>
                            <input id="standard_custom" pInputText formControlName="standard_custom" />
                            <p-message *ngIf="repoForm.controls['standard_custom'].invalid && repoForm.controls['standard_custom'].touched" severity="error" text="Standard/Custom is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="technical_details">Technical Details</label>
                            <textarea id="technical_details" pInputTextarea rows="3" formControlName="technical_details"></textarea>
                            <p-message *ngIf="repoForm.controls['technical_details'].invalid && repoForm.controls['technical_details'].touched" severity="error" text="Technical Details is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="customer_benefit">Customer Benefit</label>
                            <input id="customer_benefit" pInputText formControlName="customer_benefit" />
                            <p-message *ngIf="repoForm.controls['customer_benefit'].invalid && repoForm.controls['customer_benefit'].touched" severity="error" text="Customer Benefit is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="remarks">Remarks</label>
                            <input id="remarks" pInputText formControlName="remarks" />
                            <p-message *ngIf="repoForm.controls['remarks'].invalid && repoForm.controls['remarks'].touched" severity="error" text="Remarks is required"></p-message>
                        </div>
                        
                    </div>
                    
                </form>
            </ng-template>
             <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="createdialog = false"></button>
                <button pButton type="submit" pRipple icon="pi pi-check" class="p-button-text" label="Add" [disabled]="repoForm.invalid" (click)="onSubmit()"  ></button>
            </ng-template>
</p-dialog>

<p-dialog [(visible)]="editrepodialog" header="Create Repository" [modal]="true" [style]="{ width: '700px' }" [resizable]="false">
            <ng-template pTemplate="content">
                <form [formGroup]="repoForm" (ngSubmit)="onSubmit()" class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label for="customer_name">Customer Name</label>
                            <input id="customer_name" pInputText formControlName="customer_name" />
                            <p-message *ngIf="repoForm.controls['customer_name'].invalid && repoForm.controls['customer_name'].touched" severity="error" text="Customer Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="domain">Domain</label>
                            <input id="domain" pInputText formControlName="domain" />
                            <p-message *ngIf="repoForm.controls['domain'].invalid && repoForm.controls['domain'].touched" severity="error" text="Domain is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="sector">Sector</label>
                            <input id="sector" pInputText formControlName="sector" />
                            <p-message *ngIf="repoForm.controls['sector'].invalid && repoForm.controls['sector'].touched" severity="error" text="Sector is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="module_name">Module Name</label>
                            <input id="module_name" pInputText formControlName="module_name" />
                            <p-message *ngIf="repoForm.controls['module_name'].invalid && repoForm.controls['module_name'].touched" severity="error" text="Module Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="detailed_requirement">Detailed Requirement</label>
                            <textarea id="detailed_requirement" pInputTextarea rows="3" formControlName="detailed_requirement"></textarea>
                            <p-message *ngIf="repoForm.controls['detailed_requirement'].invalid && repoForm.controls['detailed_requirement'].touched" severity="error" text="Detailed Requirement is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="standard_custom">Standard/Custom</label>
                            <input id="standard_custom" pInputText formControlName="standard_custom" />
                            <p-message *ngIf="repoForm.controls['standard_custom'].invalid && repoForm.controls['standard_custom'].touched" severity="error" text="Standard/Custom is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="technical_details">Technical Details</label>
                            <textarea id="technical_details" pInputTextarea rows="3" formControlName="technical_details"></textarea>
                            <p-message *ngIf="repoForm.controls['technical_details'].invalid && repoForm.controls['technical_details'].touched" severity="error" text="Technical Details is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="customer_benefit">Customer Benefit</label>
                            <input id="customer_benefit" pInputText formControlName="customer_benefit" />
                            <p-message *ngIf="repoForm.controls['customer_benefit'].invalid && repoForm.controls['customer_benefit'].touched" severity="error" text="Customer Benefit is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="remarks">Remarks</label>
                            <input id="remarks" pInputText formControlName="remarks" />
                            <p-message *ngIf="repoForm.controls['remarks'].invalid && repoForm.controls['remarks'].touched" severity="error" text="Remarks is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label for="code_document">Code/Process Document</label>
                            <input id="code_document" pInputText formControlName="code_document" />
                            <p-message *ngIf="repoForm.controls['code_document'].invalid && repoForm.controls['code_document'].touched" severity="error" text="Code/Process Document is required"></p-message>
                        </div>
                    </div>
                    <div style="margin-top:24px;">
                        <button pButton type="submit" label="Submit" [disabled]="repoForm.invalid"></button>
                    </div>
                </form>
            </ng-template>
</p-dialog>


<p-dialog [(visible)]="uploadcodeprocessdocdialog" header="Attach Code/Process Document for Reference" [modal]="true" [style]="{ width: '450px' }">
    <div class="flex align-items-c justify-content-c">
        <div>
            <label class="custom-file-label">Choose Excel or Attachments</label>
            <input type="file" class="custom-file-input" multiple (change)="onUpload($event)" accept=".xlsx,.pdf,.zip,.docx,.txt" />
        </div>
    </div>
    <ng-template pTemplate="footer">
        <button pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="uploadcodeprocessdocdialog = false"></button>
        <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Attach" (click)="submitData(repository)"   ></button>
    </ng-template>
</p-dialog>

<p-dialog [(visible)]="deleteRepoDialog" header="Confirm" [modal]="true" [style]="{width:'450px'}">
    <div class="flex align-items-c justify-content-c">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem"></i>
      <span *ngIf="repository">
      Are you sure you want to delete the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?
    </span>
    </div>
    <ng-template pTemplate="footer">
      <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No"
        (click)="deleteRepoDialog = false"></button>
      <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes"
       (click)="delete_repo(repository)" ></button>
    </ng-template>
  </p-dialog>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class ManageRepos implements OnInit {
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
    CurrentPage!: number;
    page!: number;
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
        const storedPage = localStorage.getItem('CurrentPage');
        if (storedPage) {
            this.CurrentPage = parseInt(storedPage);
            this.loadDemoData(this.CurrentPage);
            this.first = (this.CurrentPage - 1) * 10;
        } else {
            this.CurrentPage = 1;
            localStorage.setItem('CurrentPage', this.CurrentPage.toString());
            this.loadDemoData(this.CurrentPage);
            this.first = (this.CurrentPage - 1) * 10;
        }
        this.form_records();
        this.repoForm = new FormGroup({
            customer_name: new FormControl('', Validators.required),
            domain: new FormControl('', Validators.required),
            sector: new FormControl('', Validators.required),
            module_name: new FormControl('', Validators.required),
            detailed_requirement: new FormControl('', Validators.required),
            standard_custom: new FormControl('', Validators.required),
            technical_details: new FormControl('', Validators.required),
            customer_benefit: new FormControl('', Validators.required),
            remarks: new FormControl('', Validators.required),
            
        });
        this.approvalForm = new FormGroup({
        business_justification: new FormControl('', [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(250)
        ])
        });
        this.messages = [];
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

    downloadWorkbook(id: number, filename: string) {
  this.managereposervice.downloadWorkbook(id).subscribe(
    (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Use real filename, not hardcoded 'workbook.xlsx'
      a.click();
      window.URL.revokeObjectURL(url);
    },
    (error) => {
        this.messageservice.add({ severity: 'error', summary: 'Error Downloading the File', detail: 'Via ExportService' })
    }
  );
}


    loadDemoData(page: number) {
        this.managereposervice.getallrepos(page).subscribe((data: any) => {
            if (Array.isArray(data)) {
                this.repositories.set(data);
            } else {
                console.error('Expected array but received:', data);
                this.repositories.set([]);
            }
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.selectedFile = file;
        } else {
            this.messageservice.add({ severity: 'error', summary: 'Please Select a Valid .xlsx Excel File', detail: 'Via UploadService' })
            this.selectedFile = null;
        }
    }

    Repo_approval(repository: any) {
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched();
      return;
    }

    

    const justification = this.approvalForm.get('business_justification')?.value;

    this.managereposervice.SendforApproval(repository.id, justification).subscribe({
      next: (res) => {
        this.messageservice.add({ severity: 'success', summary: 'Repository has successfully sent for Approval', detail: 'Via ApprovalService' });
        this.sendforapprovaldialog = false;
        this.reloadPage();
        this.approvalForm.reset();
      },
      error: (err) => {
        this.messageservice.add({ severity: 'error', summary: 'Error Found, Failed Sending for Approval', detail: 'Via ApprovalService' });
      }
    });

  }

    delete_Repo(repository: Repository) {
        this.deleteRepoDialog = true;
        this.repository = { ...repository };
    
    }

    upload_ref(repository: Repository){
        
        this.repository = {...repository};
        this.uploadcodeprocessdocdialog = true;
        console.log(this.repository);
    }

    onCheckboxChange(repo: Repository, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.toggleRepoSelection(repo, checked);
    }

    editRepo(repository: Repository) {
        this.repository = { ...repository };

        this.editrepodialog = true;
    }

    selectedFiles: File[] = [];

onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);
}

uploadFiles() {
    if (!this.selectedFiles.length) return;

    const formData = new FormData();
    let excelFile: File | null = null;
    const attachmentFiles: File[] = [];

    this.selectedFiles.forEach(file => {
        if (file.name.endsWith('.xlsx')) {
            excelFile = file;
        } else {
            attachmentFiles.push(file);
        }
    });

    if (!excelFile) {
        this.messageservice.add({ severity: 'error', summary: 'Please Select an Excel File', detail: 'Via UploadService' });
        return;
    }

    formData.append('file', excelFile);
    attachmentFiles.forEach(file => {
        formData.append('attachments', file, file.name);
    });

    this.managereposervice.uploadExcel(formData).subscribe({
        next: (res) => {
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Uploaded', detail: 'Via UploadService' });
            this.selectedFiles = [];
            this.uploaddialog = false;
            this.reloadPage();
        },
        error: (err) => {
            this.messageservice.add({ severity: 'error', summary: 'Repository Upload has been Failed', detail: 'Via DeleteService' })
        }
    });
}


    isRepoSelected(repo: Repository): boolean {
        return this.selectedrepositories.some((r) => r.id === repo.id);
    }

    exportCSV() {
        if (this.selectedrepositories.length === 0) return;

        // Prepare worksheet data as array of objects
        const worksheetData = this.selectedrepositories.map((repo) => {
            const row: any = {};
            this.exportColumns.forEach((col) => {
                row[col.title] = (repo as any)[col.dataKey];
            });
            return row;
        });

        // Create worksheet and workbook
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook: XLSX.WorkBook = {
            Sheets: { Repositories: worksheet },
            SheetNames: ['Repositories']
        };

        // Generate Excel file buffer
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save to file using FileSaver
        const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'selected_repositories.xlsx');
        this.messageservice.add({ severity: 'success', summary: 'Repository has been Exported', detail: 'Via ExportService' });
    }

    toggleRepoSelection(repo: Repository, checked: boolean) {
        if (checked) {
            this.selectedrepositories.push(repo);
        } else {
            this.selectedrepositories = this.selectedrepositories.filter((r) => r.id !== repo.id);
        }
    }

   onSubmit() {
  if (this.repoForm.valid) {
    const formValue = this.repoForm.value;
    this.managereposervice.createRepository(formValue).subscribe({
      next: _ => {
        this.messageservice.add({severity: 'success', summary: 'Repository has been Created', detail: 'Via CreateService'});
        this.loadDemoData(this.page);
        this.createdialog = false;
        this.repoForm.reset();
        
        
      },
      error: _ => {
        this.messageservice.add({severity: 'error', summary: 'Repository Creation is Failed', detail: 'Via CreateService'});
      }
    });
  } else {
    this.repoForm.markAllAsTouched();
  }
}

onUpload(event: any) {
    this.file = event.target.files[0];
    console.log(this.file);

  }

    submitData(repository: Repository) {
    let formData = new FormData();

    formData.set("file", this.file);
    this.managereposervice.uploadreference(this.repository, formData).subscribe((data: any) => {
     
      this.uploadcodeprocessdocdialog = false;

      this.messageservice.add({ severity: 'success', summary: 'Uploaded File Successfully', detail: 'Via UploadService' })

    }, (err) => {
      if (this.repository.attach_code_or_document == 'Not Attached') {
        this.messageservice.add({ severity: 'error', summary: ' No Uploaded File Found', detail: 'Via UploadService' });
      }
    })

  }


    onPageChange(event: any) {
        this.CurrentPage = event.page + 1;
        this.loadDemoData(this.CurrentPage);
        localStorage.setItem('CurrentPage', this.CurrentPage.toString());
    }

    cancelEdit() {
        this.repoForm.reset();
    }

    upload_dialog() {
        this.uploaddialog = true;
    }

    approve_dialog(repository: Repository) {
        this.approvedialog = true;
        this.repository = { ...repository };
    }

    sendforapproval_dialog(repository: Repository) {
        this.sendforapprovaldialog = true;
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

    opendialog() {
        this.createdialog = true;
    }

    form_records() {
        this.managereposervice.get_repo_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() {
        window.location.reload();
    }

    download_ref(repository: Repository, id: any) {
    this.repository = { ...repository };
   
   
      window.open('http://127.0.0.1:5000/repos/refdownload/' + id, '_blank');
    
    
    }

    delete_repo(repository:Repository): void {
    this.managereposervice.delete_repo(this.repository).subscribe(
      (data) => {
        this.deleteRepoDialog = false;
        this.messageservice.add({ severity: 'success', summary: 'Repository has been Deleted', detail: 'Via DeleteService' });
        this.reloadPage();
      });
  }
}
