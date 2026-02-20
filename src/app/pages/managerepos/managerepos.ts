import { Component, OnInit, signal } from '@angular/core'; // Removed ViewChild
import { ConfirmationService, MessageService } from 'primeng/api';
// Removed Table, TableModule imports
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
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
        /* --- Existing Styles --- */
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

        /*.card {
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
        }*/

        /* --- NEW CUSTOM TABLE STYLES --- */
        .custom-table-container {
            width: 100%;
            overflow-x: auto; /* Horizontal scroll for small screens */
            margin-bottom: 1rem;
            border-radius: 8px;
        }

        .glass-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 75rem; /* Match previous tableStyle min-width */
            font-size: 0.95rem;
        }

        .glass-table thead th {
            text-align: left;
            padding: 1rem;
            font-weight: bold;
            color: #11224E;
            border-bottom: 2px solid rgba(255, 255, 255, 0.4);
            white-space: nowrap;
        }

        .glass-table tbody td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            vertical-align: middle;
            color: #222;
        }

        .glass-table tbody tr {
            transition: background-color 0.2s;
        }

        /* Hover effect matching glass theme */
        .glass-table tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }

        /* Checkbox styling */
        .glass-table input[type="checkbox"] {
            accent-color: #11224E;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        /* --- Form Styles --- */
        .responsive-form .custom-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

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
            margin-left: 5px;
        }

        .glass-table thead th {
    text-align: left;
    padding: 1rem;
    font-weight: bold;
    color: #11224E;
    border-bottom: 2px solid rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    background-color: #cce4f7; /* Add your desired background color here */
}

        .error {
            border: 1px solid red;
        }

        .p-toolbar{
      
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        
    }

        .card{
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        }
    `,
    imports: [
        CommonModule,
        // TableModule, // REMOVED
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
            <p-toolbar styleClass="mb-6" *ngIf="isadmin">
                <ng-template #start>
                    <p-button label="Upload Solution" icon="pi pi-plus" severity="primary" (onClick)="opendialog()" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Upload(Bulk)" icon="pi pi-upload" severity="help" (click)="upload_dialog()" />
                    <span style="margin-left: 1rem;"></span>
                    <p-button label="Export to Excel" icon="pi pi-download" severity="success" (onClick)="exportCSV()" [disabled]="!isExportEnabled" />
                </ng-template>
            </p-toolbar>

            <div class="flex items-center justify-between mb-3">
                <h5 class="m-0">Manage Solutions</h5>
                <!--<p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onSearch($event)" placeholder="Search..." />
                </p-iconfield>-->
            </div>

            <div class="custom-table-container">
                <table class="glass-table">
                    <thead>
                        <tr>
                            <th *ngIf="isadmin">
                                Select
                            </th>
                            <th *ngIf="customervalid">Customer Name</th>
                            <th>Domain</th>
                            <th>Sector</th>
                            <th>Module Name</th>
                            <th>Detailed Requirement</th>
                            <th>Object Type</th>
                            <th>Technical details</th>
                            <th>Customer Benefit</th>
                            <th>Code/Process Document</th>
                            <th>Created On</th>
                            <th>Created User</th>
                            <th>Immediate Response Manager(IRM)</th>
                            <th>Secondary Response Manager(SRM)</th>
                            <th>Business Unit Head(BUH)</th>
                            <th>Business Group Head(BGH)</th>
                            <th>Status</th>
                            <th>By User</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let repo of repositories()" >
                            <td *ngIf="isadmin">
                                <input type="checkbox" 
                                    [checked]="isRepoSelected(repo)" 
                                    (change)="onCheckboxChange(repo, $event)" 
                                    [disabled]="!isAdmin && repo.Approval_status !== 'Approved'" />
                            </td>
                            <td *ngIf="customervalid" style="white-space: nowrap;">{{ repo.customer_name }}</td>
                            <td style="white-space: nowrap;">{{ repo.domain }}</td>
                            <td style="white-space: nowrap;">{{ repo.sector }}</td>
                            <td style="white-space: nowrap;">{{ repo.module_name }}</td>
                            <td>{{ repo.detailed_requirement }}</td>
                            <td>{{ repo.standard_custom }}</td>
                            <td>{{ repo.technical_details }}</td>
                            <td>{{ repo.customer_benefit }}</td>
                            <td>
                                <div class="flex" style="min-width: 100px; gap: 0.5rem;">
                                    
            
  <ng-container *ngIf="isAdmin; else normalUserBlock">
    <p-button
      label="Download"
      icon="pi pi-download"
      severity="primary"
      (click)="download_ref(repo, repo.id)"
      [disabled]="repo.attach_code_or_document === 'UPLOADED'">
    </p-button>
  </ng-container>

  <ng-template #normalUserBlock>
    <ng-container *ngIf="repo.download_approved; else requestBlock">
      <p-button
        label="Download"
        icon="pi pi-download"
        severity="primary"
        (click)="download_ref(repo, repo.id)"
        [disabled]="repo.attach_code_or_document === 'UPLOADED'">
      </p-button>
    </ng-container>

    <ng-template #requestBlock>
      <p-button
        label="Request Download"
        icon="pi pi-send"
        severity="help"
        (click)="openDownloadRequestDialog(repo)"
        [disabled]="repo.attach_code_or_document === 'UPLOADED'">
      </p-button>
    </ng-template>
  </ng-template>
                                </div>

  

</td>


                            <td style="white-space: nowrap;">{{ formatDate(repo.created_at) }}</td>
                            <td style="white-space: nowrap; text-align: center">{{ repo.username }}</td>
                            <td style="white-space: nowrap; text-align: center">{{ repo.irm }}</td>
                            <td style="white-space: nowrap; text-align: center">{{ repo.srm }}</td>
                            <td style="white-space: nowrap; text-align: center">{{ repo.buh }}</td>
                            <td style="white-space: nowrap; text-align: center">{{ repo.bgh }}</td>
                             <td style="white-space: nowrap; text-align: center">
  <p-tag
    [value]="repo.Approval_status"
    [severity]="getApprovalSeverity(repo.Approval_status)"
    [rounded]="true"
  ></p-tag>
</td>

                            <td style="white-space: nowrap; text-align: center">
  <ng-container *ngIf="repo.Approval_status === 'Sent for Approval'; else validated">
    Solution with {{ repo.username }}
  </ng-container>
  <ng-template #validated>
    Validated by {{ repo.Approver }}
  </ng-template>
</td>

                            <td>
                                <div class="flex" style="min-width: 100px; gap: 0.5rem;">
                                    
                                    
                                   
                                    <button pButton pRipple icon="pi pi-paperclip" class="p-button-rounded p-button-info" *ngIf="attachvalid" (click)="upload_ref(repo)"></button>
                                    <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="delete_Repo(repo)"></button>
                                </div>
                            </td>
                        </tr>
                        <tr *ngIf="repositories().length === 0 && !loading">
                            <td colspan="17" style="text-align:center; padding: 2rem;">No Repositories found.</td>
                        </tr>
                         <tr *ngIf="loading">
                            <td colspan="17" style="text-align:center; padding: 2rem;">Loading Data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p-paginator [totalRecords]="totalitems" [first]="first" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Repos" [showCurrentPageReport]="true" [rows]="10" (onPageChange)="onPageChange($event)"></p-paginator>
        
        </div>
        <p-dialog [(visible)]="uploaddialog" header="Upload Solutions" [modal]="true" [style]="{ width: '450px' }">
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
                    <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['required'] && approvalForm.controls['business_justification'].touched" severity="error" text="Business Justification is required"></p-message>
                    <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['minlength'] && approvalForm.controls['business_justification'].touched" severity="error" text="Minimum 10 characters required"></p-message>
                    <p-message *ngIf="approvalForm.controls['business_justification'].errors?.['maxlength'] && approvalForm.controls['business_justification'].touched" severity="error" text="Maximum 250 characters allowed"></p-message>
                </form>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="sendforapprovaldialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Repo_approval(repository)" [disabled]="approvalForm.invalid"></button>
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
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Repoapproval(repository)"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="rejectdialog" header="Reject the Repository" [modal]="true" [style]="{ width: '450px' }">
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

        <p-dialog [(visible)]="createdialog" header="Create Repository" [modal]="true" [style]="{ width: '1000px' }" [resizable]="false">
            <ng-template pTemplate="content">
                <form [formGroup]="repoForm" (ngSubmit)="onSubmit()" class="responsive-form">
                    <div class="form-grid">
                        <div class="form-field">
                            <label class="required" for="customer_name">Customer Name</label>
                            <input id="customer_name" pInputText formControlName="customer_name" />
                            <p-message *ngIf="repoForm.controls['customer_name'].invalid && repoForm.controls['customer_name'].touched" severity="error" text="Customer Name is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="domain">Domain</label>
                            <p-autoComplete 
            inputId="domain" 
            formControlName="domain" 
            [suggestions]="filteredDomains" 
            (completeMethod)="filterDomain($event)" 
            forceSelection="true" 
            dropdown="true" 
            minLength="1" 
            placeholder="Select Domain"
            (onSelect)="onDomainSelect($event)">
          </p-autoComplete>
                            <p-message *ngIf="repoForm.controls['domain'].invalid && repoForm.controls['domain'].touched" severity="error" text="Domain is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="sector">Sector</label>
                            <p-autoComplete 
            inputId="sector" 
            formControlName="sector" 
            [suggestions]="filteredSectors" 
            (completeMethod)="filterSector($event)" 
            forceSelection="true" 
            dropdown="true" 
            minLength="1" 
            placeholder="Select Sector"
            [disabled]="!selectedDomain">
          </p-autoComplete>
                            <p-message *ngIf="repoForm.controls['sector'].invalid && repoForm.controls['sector'].touched" severity="error" text="Sector is required"></p-message>
                        </div>
                        <div class="form-field">
                            <label class="required" for="module_name">Module Name</label>
                            <p-autoComplete inputId="modulename" formControlName="module_name" [suggestions]="filteredModules" (completeMethod)="filterModule($event)" [forceSelection]="true" [dropdown]="true" [minLength]="1" placeholder="Select Module"></p-autoComplete>
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
                        
                    </div>
                </form>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="createdialog = false"></button>
                <button pButton type="submit" pRipple icon="pi pi-check" class="p-button-text" label="Add" [disabled]="repoForm.invalid" (click)="onSubmit()"></button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="editrepodialog" header="Create Repository" [modal]="true" [style]="{ width: '700px' }" [resizable]="false">
             <ng-template pTemplate="content">
                <form [formGroup]="repoForm" (ngSubmit)="onSubmit()" class="responsive-form">
                    <div class="form-grid">
                       <div class="form-field">
                            <label for="customer_name">Customer Name</label>
                            <input id="customer_name" pInputText formControlName="customer_name" />
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
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Attach" (click)="submitData(repository)"></button>
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
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="deleteRepoDialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="delete_repo(repository)"></button>
            </ng-template>
        </p-dialog>

        <p-dialog
  [(visible)]="downloadRequestDialog"
  header="Request Download Access"
  [modal]="true"
  [style]="{ width: '450px' }">

  <form [formGroup]="downloadRequestForm">
    <label class="required" for="justification">Business Justification</label>
    <textarea
      id="justification"
      pInputTextarea
      rows="3"
      formControlName="justification">
    </textarea>

    <p-message
      *ngIf="downloadRequestForm.controls['justification'].errors?.['required'] &&
             downloadRequestForm.controls['justification'].touched"
      severity="error"
      text="Business Justification is required">
    </p-message>
  </form>

  <ng-template pTemplate="footer">
    <button pButton type="button" class="p-button-text"
            label="Cancel"
            (click)="downloadRequestDialog = false"></button>
    <button pButton type="button" class="p-button-text"
            label="Send Request"
            (click)="submitDownloadRequest()"
            [disabled]="downloadRequestForm.invalid"></button>
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
    searchTerm: string = '';
    filteredRepoList: Repository[] = [];
    downloadRequestDialog: boolean = false;
    downloadRequestForm!: FormGroup;
    selectedDownloadRepo!: Repository;
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    issent: boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    uploaddialog: boolean = false;
    approvedialog: boolean = false;
    createdialog: boolean = false;
    messages: any[] = [];
    CurrentPage!: number;
    page!: number;
    first!: number;
    customervalid: boolean = false;
    loading: boolean = true;
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
    sendforapproval: boolean = false;
    sendforapprovaldialog: boolean = false;
    deleteRepoDialog: boolean = false;
    rejectdialog:boolean = false;
    domainOptions: string[] = [];
  sectorOptions: { [key: string]: string[] } = {};
  filteredDomains: string[] = [];
  filteredSectors: string[] = [];
  selectedDomain: string = '';

    file: any;
    
    moduleOptions = [
        'FI: Financial Accounting',
'CO: Controlling',
'MM: Materials Management',
'SD: Sales and Distribution',
'HCM: Human Capital Management',
'PP: Production Planning',
'PM: Plant Maintenance',
'QM: Quality Management',
'PS: Project System',
'FSCM: Financial Supply Chain Management',
'SRM: Supplier Relationship Management',
'CRM: Customer Relationship Management',
'LE: Logistics Execution',
'WM: Warehouse Management',
'EWM: Extended Warehouse Management',
'TRM: Treasury and Risk Management',
'FM: Funds Management',
'IM: Investment Management',
'PLM: Product Lifecycle Management',
'BI/BW: Business Intelligence / Business Warehouse',
'GRC: Governance, Risk, and Compliance',
'MDM: Master Data Management',
'EHS: Environment, Health, and Safety',
'SEM: Strategic Enterprise Management',
'BASIS: SAP Basis (technical administration)',
'ABAP: Advanced Business Application Programming (development)',
'PI/XI: Process Integration / Exchange Infrastructure (middleware)',
'EP: Enterprise Portal',
'SOLMAN: SAP Solution Manager',
'Fiori: SAP Fiori (UX and apps)',
'FLM: File Lifecycle Management',
'CPI: Cloud Platform Integration',
'BTP: Business Technology Platform',
'AI: Artificial Intelligence',
'Cloud ALM: Cloud Application Lifecycle Management',
'API: Application Programming Interface',
'SAC: SAP Analytics Cloud',
'Python: Python Programming Language',
'Salesforce: Salesforce Customer 360 Platform'
    ];

    filteredModules: string[] = [];
    isadmin: boolean = false;
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
        this.loadDomainsAndSectors();
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
            

        });
        this.approvalForm = new FormGroup({
            business_justification: new FormControl('', [
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(250)
            ])
        });
        this.messages = [];

        this.downloadRequestForm = new FormGroup({
    justification: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(250)
    ])
  });
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
                this.isadmin = true;
                this.customervalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false
            }
            else if (x?.type == 'manager') {
                this.isvalid = true;
                this.isadmin = false;
                
                
                this.attachvalid = false
            } else {
                this.isvalid = false;
                this.isadmin = false;
                this.customervalid = false;
                this.downloadvalid = false;
                this.sendforapproval = true;
                this.attachvalid = true;
            }
        });
    }


    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchTerm = value;
        this.first = 0; // Reset to first page on search

        if (!value) {
            this.filteredRepoList = this.repositories();
        } else {
            this.filteredRepoList = this.repositories().filter(repository => 
                repository.customer_name?.includes(value) || 
                repository.module_name?.includes(value) || 
                repository.domain?.includes(value) || 
                repository.sector?.includes(value)
            );
        }
    }

    openDownloadRequestDialog(repo: Repository) {
  if (repo.id == null) return;
  this.selectedDownloadRepo = repo;
  this.downloadRequestDialog = true;
}


submitDownloadRequest() {
  if (this.downloadRequestForm.invalid) {
    this.downloadRequestForm.markAllAsTouched();
    return;
  }

  const justification = this.downloadRequestForm.get('justification')?.value;

  this.managereposervice
    .requestDownload(this.selectedDownloadRepo.id, justification)
    .subscribe({
      next: _ => {
        this.messageservice.add({
          severity: 'success',
          summary: 'Download request submitted',
          detail: 'Waiting for Superadmin approval'
        });
        this.downloadRequestDialog = false;
        this.downloadRequestForm.reset();
      },
      error: _ => {
        this.messageservice.add({
          severity: 'error',
          summary: 'Failed to submit request',
          detail: 'Please try again later'
        });
      }
    });
}

    downloadWorkbook(id: number, filename: string) {
        this.managereposervice.downloadWorkbook(id).subscribe(
            (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            (error) => {
                this.messageservice.add({ severity: 'error', summary: 'Error Downloading the File', detail: 'Via ExportService' })
            }
        );
    }

    openAttachment(attachmentId: number) {
    // use your actual Flask endpoint base URL as needed
    const url = `http://127.0.0.1:5001/repos/refview/${attachmentId}`;
    window.open(url, '_blank');
  }

  

    getApprovalSeverity(status: string | undefined): string {
  const safeStatus = status ?? 'Not Approved';
  
  switch(safeStatus) {
    case 'Approved': return 'success';     // Green tag
    case 'Rejected': return 'danger';      // Red tag
    case 'Sent for Approval': return 'warn';  // Orange/yellow tag
    case 'Not Approved': return 'info';    // Blue tag (default)
    default: return 'info';
  }
}



    filterModule(event: any) {
        const query = event.query.toLowerCase();
        this.filteredModules = this.moduleOptions.filter(option =>
            option.toLowerCase().includes(query)
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

    /* NOTE: Because you removed the PrimeNG Table, 'dt.filterGlobal' is no longer available.
       You must implement a custom pipe or backend filter to handle search. 
       I have commented this out to prevent errors.
    */
    // onGlobalFilter(table: Table, event: Event) {
    //     table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    // }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.selectedFile = file;
        } else {
            this.messageservice.add({ severity: 'error', summary: 'Please Select a Valid .xlsx Excel File', detail: 'Via UploadService' })
            this.selectedFile = null;
        }
    }

    Reporeject(repository: Repository) {
        this.managereposervice.RepoRejection(this.repository).subscribe((data: any) => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Rejected', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
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

    reject_dialog(repository: Repository) {
        this.rejectdialog = true;
        this.repository = { ...repository };
    }

    upload_ref(repository: Repository) {

        this.repository = { ...repository };
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
                    this.messageservice.add({ severity: 'success', summary: 'Repository has been Created', detail: 'Via CreateService' });
                    this.loadDemoData(this.page);
                    this.createdialog = false;
                    this.repoForm.reset();


                },
                error: _ => {
                    this.messageservice.add({ severity: 'error', summary: 'Repository Creation is Failed', detail: 'Via CreateService' });
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

    formatDate(dateString?: string): string {
    if (!dateString) {
        return ""; // or any default fallback
    }
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

  const raw = localStorage.getItem('token');          // e.g. '{"access_token":"eyJhbGciOi..."}'
  if (!raw) { return; }

  const parsed = JSON.parse(raw);                     // { access_token: "eyJhbGciOi..." }
  const jwt = parsed.access_token;                    // <-- actual JWT string

  const url = `http://10.6.102.245:5002/repos/refdownload/${id}?access_token=${jwt}`;
  window.open(url, '_blank');
}



    delete_repo(repository: Repository): void {
        this.managereposervice.delete_repo(this.repository).subscribe(
            (data) => {
                this.deleteRepoDialog = false;
                this.messageservice.add({ severity: 'success', summary: 'Repository has been Deleted', detail: 'Via DeleteService' });
                this.reloadPage();
            });
    }

    loadDomainsAndSectors() {
    // Extract unique domains and their sectors from Excel data [file:2]
    const excelData = [
      { domain: 'Technology', sectors: ['Software', 'Hardware', 'IT Services', 'AI Data Science'] },
      { domain: 'Healthcare', sectors: ['Hospitals', 'Pharmaceuticals', 'Biotechnology', 'Medical Devices'] },
      { domain: 'Finance', sectors: ['Banking', 'Insurance', 'Investment', 'FinTech'] },
      { domain: 'Education', sectors: ['Schools', 'Universities', 'EdTech', 'Vocational Training'] },
      { domain: 'Manufacturing', sectors: ['Automotive', 'Electronics', 'Textiles', 'Machinery'] },
      { domain: 'Energy', sectors: ['Oil Gas', 'Renewables', 'Utilities', 'Mining'] },
      { domain: 'Retail', sectors: ['E-commerce', 'FMCG', 'Luxury Goods', 'Consumer Electronics'] },
      { domain: 'Agriculture', sectors: ['Farming', 'AgriTech', 'Food Processing', 'Dairy'] },
      { domain: 'Transport', sectors: ['Aviation', 'Shipping', 'Railways', 'Logistics'] },
      { domain: 'Media Entertainment', sectors: ['Film', 'Television', 'Gaming', 'Publishing'] },
      { domain: 'Government', sectors: ['Public Sector Defense', 'Administration', 'Infrastructure', 'Policy'] },
      { domain: 'Telecommunications', sectors: ['Mobile Networks', 'Broadband', 'Satellite', 'IoT'] },
      { domain: 'Real Estate', sectors: ['Residential', 'Commercial', 'Industrial', 'Smart Cities'] },
      { domain: 'Hospitality', sectors: ['Hotels', 'Restaurants', 'Travel Agencies', 'Tourism'] },
      { domain: 'Legal', sectors: ['Law Firms', 'Corporate Law', 'Intellectual Property', 'Compliance'] },
      { domain: 'Environmental Services', sectors: ['Waste Management', 'Recycling', 'Water Treatment', 'Sustainability'] },
      { domain: 'Consulting', sectors: ['Construction Civil Engineering', 'Urban Development', 'Smart Infrastructure', 'Housing Projects'] },
      { domain: 'Fashion', sectors: ['Apparel', 'Footwear', 'Accessories', 'Luxury Brands'] },
      { domain: 'Sports', sectors: ['Professional Teams', 'Sportswear', 'Events Management', 'Fitness'] },
      { domain: 'Food Beverage', sectors: ['Restaurants', 'Packaged Foods', 'Beverages', 'Nutrition'] },
      { domain: 'Aerospace Defense', sectors: ['Aviation', 'Commercial Airlines', 'Space Exploration', 'Drones'] },
      { domain: 'Chemicals', sectors: ['Industrial Chemicals', 'Petrochemicals', 'Agrochemicals', 'Specialty Chemicals'] },
      { domain: 'Logistics', sectors: ['Supply Chain Warehousing', 'Distribution', 'Freight Forwarding', 'Cold Chain'] },
      { domain: 'Non-Profit', sectors: ['NGOs Charities', 'Foundations', 'Social Work', 'Community Development'] },
      { domain: 'Cybersecurity', sectors: ['Network Security', 'Data Protection', 'Cloud Security', 'Risk Management'] },
      { domain: 'Human Resources', sectors: ['Recruitment', 'Training', 'Payroll', 'Employee Engagement'] },
      { domain: 'Art Culture', sectors: ['Museums', 'Performing Arts', 'Heritage Conservation', 'Design'] }
    ];

    // Populate domains and sectors
    this.domainOptions = [...new Set(excelData.map(item => item.domain))];
    excelData.forEach(item => {
      this.sectorOptions[item.domain] = item.sectors;
    });
  }

  // Domain autocomplete filter
  filterDomain(event: any) {
    const query = event.query.toLowerCase();
    this.filteredDomains = this.domainOptions.filter(option => 
      option.toLowerCase().includes(query)
    );
  }

  // Update form controls to watch domain changes
  ngAfterViewInit() {
    // Watch domain changes to update sector options
    this.repoForm.get('domain')?.valueChanges.subscribe(domain => {
      this.selectedDomain = domain || '';
      this.filteredSectors = [];
      this.repoForm.patchValue({ sector: '' });
      if (domain && this.sectorOptions[domain]) {
        this.filteredSectors = this.sectorOptions[domain];
      }
    });
  }

  // Sector autocomplete filter
  filterSector(event: any) {
    const query = event.query.toLowerCase();
    if (this.selectedDomain && this.sectorOptions[this.selectedDomain]) {
      this.filteredSectors = this.sectorOptions[this.selectedDomain].filter(option => 
        option.toLowerCase().includes(query)
      );
    }
  }

  // Add this method to handle domain selection
onDomainSelect(event: any) {
  this.selectedDomain = event.value;
  this.repoForm.patchValue({ sector: '' });
  this.filteredSectors = this.sectorOptions[this.selectedDomain] || [];
}


}
