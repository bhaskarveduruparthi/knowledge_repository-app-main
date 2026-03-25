import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { SecureFileViewerComponent } from '../securefileviewer/securefileviewer';
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
import { ManageReposService, Repository, Domain } from '../service/managerepos.service';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
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
    selector: 'app-addsolutions',
    standalone: true,
    styles: `
    /* ── View toggle ─────────────────────────────────────────────────────── */
    .view-toggle {
        display: flex; align-items: center; gap: 0.25rem;
        background: #eef2f7; border-radius: 8px; padding: 4px;
    }
    .view-toggle button {
        border: none; background: transparent; border-radius: 6px;
        padding: 6px 10px; cursor: pointer; color: #666;
        transition: background 0.2s, color 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .view-toggle button.active {
        background: #fff; color: #11224E;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    }

    /* ── Card grid ───────────────────────────────────────────────────────── */
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
        gap: clamp(0.75rem, 2vw, 1.25rem);
        margin-bottom: 1rem;
    }
    .repo-card {
        background: #fff; border-radius: 12px;
        box-shadow: 0 2px 12px rgba(17,34,78,0.10);
        border: 1px solid #e4eaf4;
        padding: clamp(0.75rem, 2vw, 1.25rem);
        display: flex; flex-direction: column; gap: 0.6rem;
        transition: box-shadow 0.2s, transform 0.2s; position: relative;
    }
    .repo-card:hover { box-shadow: 0 6px 24px rgba(17,34,78,0.16); transform: translateY(-2px); }
    .repo-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
    .repo-card-title { font-size: clamp(0.875rem, 1.5vw, 1rem); font-weight: 700; color: #11224E; line-height: 1.3; }
    .repo-card-subtitle { font-size: clamp(0.75rem, 1.2vw, 0.82rem); color: #6b7a99; margin-top: 2px; }
    .repo-card-select { position: absolute; top: 1rem; left: 1rem; accent-color: #11224E; width: 16px; height: 16px; cursor: pointer; }
    .repo-card.has-checkbox { padding-left: 2.25rem; }
    .repo-card-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .badge { font-size: 0.75rem; padding: 2px 10px; border-radius: 20px; font-weight: 600; letter-spacing: 0.01em; }
    .badge-domain { background: #e8f0fb; color: #2457b3; }
    .badge-sector { background: #f0f7ee; color: #2e7d32; }
    .repo-card-field { font-size: clamp(0.78rem, 1.3vw, 0.83rem); color: #444; line-height: 1.5; }
    .repo-card-field strong { color: #11224E; font-weight: 600; }
    .repo-card-divider { border: none; border-top: 1px solid #eef2f7; margin: 0.25rem 0; }
    .repo-card-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
    .repo-card-meta { font-size: clamp(0.7rem, 1.1vw, 0.77rem); color: #8a96b0; }
    .repo-card-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }

    /* ── Table ───────────────────────────────────────────────────────────── */
    .custom-file-input {
        border: 1px solid #ced4da; border-radius: 6px; background-color: #f8f9fa;
        padding: 8px 12px; width: 100%; color: #333; font-size: 1rem; transition: border-color 0.2s;
    }
    .custom-file-input:hover { border-color: #007ad9; background-color: #e9ecef; }
    .custom-file-label { display: inline-block; margin-bottom: 4px; font-size: 0.95em; color: #5a5a5a; font-weight: 500; }
    .custom-table-container { width: 100%; overflow-x: auto; margin-bottom: 1rem; border-radius: 8px; }
    .glass-table { width: 100%; border-collapse: collapse; min-width: 75rem; font-size: 0.95rem; }
    .glass-table thead th {
        text-align: left; padding: 1rem; font-weight: bold; color: #11224E;
        border-bottom: 2px solid rgba(255,255,255,0.4); white-space: nowrap; background-color: #cce4f7;
    }
    .glass-table tbody td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.2); vertical-align: middle; color: #222; }
    .glass-table tbody tr { transition: background-color 0.2s; }
    .glass-table tbody tr:hover { background-color: rgba(255,255,255,0.3); }
    .glass-table input[type="checkbox"] { accent-color: #11224E; width: 16px; height: 16px; cursor: pointer; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%; }
    .form-field { display: flex; flex-direction: column; width: 100%; }
    @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } .card-grid { grid-template-columns: 1fr; } }

    label.required:after { content: "*"; color: red; margin-left: 5px; }
    .error { border: 1px solid red; }
    .p-toolbar { box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5); }
    .card { box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5); }

    .attachment-notice {
        background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;
        padding: 10px 14px; margin-bottom: 12px; font-size: 0.88rem; color: #856404;
        display: flex; align-items: center; gap: 8px;
    }

    /* ══ CREATE DIALOG — zoom-proof ═══════════════════════════════════════ */
    .cd-wrap {
        display: flex; flex-direction: column; gap: 0;
        /* ensure the form fills whatever width PrimeNG gives the dialog content */
        width: 100%; box-sizing: border-box;
    }
    .cd-dialog-header {
        display: flex; align-items: center; gap: 0.75rem;
        padding-bottom: 0.6rem; margin-bottom: 0.75rem; border-bottom: 2px solid #c8e6c9;
    }
    .cd-dialog-header-icon {
        width: 36px; height: 36px; border-radius: 9px; background: #c8e6c9; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center; color: #1b5e20; font-size: 1rem;
    }
    .cd-dialog-header-text { flex: 1; min-width: 0; }
    .cd-dialog-header-text h3 { margin: 0; font-size: clamp(0.9rem, 2vw, 1rem); font-weight: 700; color: #1b5e20; line-height: 1.2; }
    .cd-dialog-header-text p  { margin: 1px 0 0; font-size: clamp(0.68rem, 1.5vw, 0.75rem); color: #558b5a; }

    .cd-section { margin-bottom: 0.75rem; }
    .cd-section-label {
        display: flex; align-items: center; gap: 0.4rem;
        font-size: clamp(0.6rem, 1.2vw, 0.65rem); font-weight: 800;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: #2e7d32; margin-bottom: 0.45rem;
        padding-bottom: 0.35rem; border-bottom: 1px solid #e8f5e9;
    }
    .cd-section-label i { font-size: 0.7rem; opacity: 0.7; }

    .cd-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .cd-field-label {
        font-size: clamp(0.62rem, 1.2vw, 0.68rem); font-weight: 700;
        letter-spacing: 0.06em; text-transform: uppercase; color: #1b5e20; opacity: 0.75;
    }
    .cd-field-label.req::after { content: ' *'; color: #c0392b; font-size: 0.72rem; }

    /* ── The two-column grid: fills 100% of dialog, never overflows ────── */
    .cd-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));   /* minmax(0,1fr) prevents blowout */
        gap: clamp(0.4rem, 1.5vw, 0.75rem) clamp(0.5rem, 2vw, 1rem);
        width: 100%;
    }
    .cd-grid-2 .span-2 { grid-column: 1 / -1; }

    /* Make all PrimeNG inputs fill their cell */
    .cd-grid-2 input.p-inputtext,
    .cd-grid-2 p-autoComplete,
    .cd-grid-2 p-select,
    .cd-grid-2 textarea { width: 100%; box-sizing: border-box; }

    .cd-footer {
        display: flex; justify-content: flex-end; align-items: center;
        gap: clamp(0.4rem, 1.5vw, 0.75rem);
        padding-top: 0.65rem; margin-top: 0.35rem; border-top: 1px solid #e0efe1;
        flex-wrap: wrap;
    }
    .cd-wrap textarea { resize: none; }
    .cd-wrap p-message { margin-top: 1px; }

    /* ── Saving state on the Submit button ─────────────────────────────── */
    .cd-save-btn-inner {
        display: flex; align-items: center; gap: 6px;
    }
    .cd-save-spinner {
        display: inline-block; width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.4);
        border-top-color: #fff; border-radius: 50%;
        animation: cd-spin 0.7s linear infinite;
        flex-shrink: 0;
    }
    @keyframes cd-spin { to { transform: rotate(360deg); } }

    /* Loading pill shown while dropdowns fetch */
    .dropdown-loading-hint {
        font-size: 0.72rem; color: #6b7a99; font-style: italic;
        display: flex; align-items: center; gap: 4px; margin-top: 2px;
    }

    @media (max-width: 600px) {
        .cd-grid-2 { grid-template-columns: 1fr; }
        .cd-grid-2 .span-2 { grid-column: 1; }
        .cd-footer { justify-content: stretch; }
        .cd-footer button { flex: 1; }
    }
`,
    imports: [
        CommonModule,
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
        SecureFileViewerComponent,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        PasswordModule,
        MessageModule,
        TooltipModule
    ],
    template: `
        <p-toast />
        <div class="card">
            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Upload Solution" icon="pi pi-plus" severity="primary" (onClick)="opendialog()" />
                </ng-template>
                <ng-template #end>
                    <p-button label="Upload(Bulk)" icon="pi pi-upload" severity="help" (click)="upload_dialog()" />
                    <span style="margin-left: 1rem;"></span>
                    <p-button label="Export to Excel" icon="pi pi-download" severity="success" (onClick)="exportCSV()" [disabled]="!isExportEnabled" />
                </ng-template>
            </p-toolbar>

            <!-- Header row -->
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <h5 class="m-0">Add Solutions</h5>
                <div class="view-toggle">
                    <button [class.active]="viewMode === 'table'" (click)="viewMode = 'table'; saveViewMode()" pTooltip="Table view" tooltipPosition="top">
                        <i class="pi pi-table"></i>
                    </button>
                    <button [class.active]="viewMode === 'card'" (click)="viewMode = 'card'; saveViewMode()" pTooltip="Card view" tooltipPosition="top">
                        <i class="pi pi-th-large"></i>
                    </button>
                </div>
            </div>

            <!-- TABLE VIEW -->
            <ng-container *ngIf="viewMode === 'table'">
                <div class="custom-table-container">
                    <table class="glass-table">
                        <thead>
                            <tr>
                                <th>Select</th>
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
                                <th>IRM</th>
                                <th>SRM</th>
                                <th>BUH</th>
                                <th>BGH</th>
                                <th>Status</th>
                                <th>By User</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let repo of repositories()">
                                <td>
                                    <input type="checkbox" [checked]="isRepoSelected(repo)" (change)="onCheckboxChange(repo, $event)" [disabled]="!isAdmin && repo.Approval_status !== 'Approved'" />
                                </td>
                                <td *ngIf="customervalid" style="white-space:nowrap">{{ repo.customer_name }}</td>
                                <td style="white-space:nowrap">{{ repo.domain }}</td>
                                <td style="white-space:nowrap">{{ repo.sector }}</td>
                                <td style="white-space:nowrap">{{ repo.module_name }}</td>
                                <td>{{ repo.detailed_requirement }}</td>
                                <td>{{ repo.standard_custom }}</td>
                                <td>{{ repo.technical_details }}</td>
                                <td>{{ repo.customer_benefit }}</td>
                                <td>
                                    <div class="flex" style="min-width:100px; gap:0.5rem">
                                        <app-secure-file-viewer [repoId]="repo.id" [filename]="repo.attachment_filename || ''" [disabled]="repo.attach_code_or_document === 'UPLOADED'" apiBase="http://10.6.102.245:5002"></app-secure-file-viewer>
                                        <ng-container *ngIf="isAdmin; else normalUserBlock">
                                            <p-button label="Download" icon="pi pi-download" severity="primary" (click)="download_ref(repo, repo.id)" [disabled]="repo.attach_code_or_document === 'UPLOADED'"></p-button>
                                        </ng-container>
                                        <ng-template #normalUserBlock>
                                            <ng-container *ngIf="repo.download_approved; else requestBlock">
                                                <p-button label="Download" icon="pi pi-download" severity="primary" (click)="download_ref(repo, repo.id)" [disabled]="repo.attach_code_or_document === 'UPLOADED'"></p-button>
                                            </ng-container>
                                            <ng-template #requestBlock>
                                                <p-button label="Request" icon="pi pi-send" severity="help" (click)="openDownloadRequestDialog(repo)" [disabled]="repo.attach_code_or_document === 'UPLOADED'"></p-button>
                                            </ng-template>
                                        </ng-template>
                                    </div>
                                </td>
                                <td style="white-space:nowrap">{{ formatDate(repo.created_at) }}</td>
                                <td style="white-space:nowrap; text-align:center">{{ repo.username }}</td>
                                <td style="white-space:nowrap; text-align:center">{{ repo.irm }}</td>
                                <td style="white-space:nowrap; text-align:center">{{ repo.srm }}</td>
                                <td style="white-space:nowrap; text-align:center">{{ repo.buh }}</td>
                                <td style="white-space:nowrap; text-align:center">{{ repo.bgh }}</td>
                                <td style="white-space:nowrap; text-align:center">
                                    <p-tag [value]="repo.Approval_status" [severity]="getApprovalSeverity(repo.Approval_status)" [rounded]="true"></p-tag>
                                </td>
                                <td style="white-space:nowrap; text-align:center">
                                    <ng-container *ngIf="repo.Approval_status === 'Sent for Approval'; else validated">Solution with {{ repo.username }}</ng-container>
                                    <ng-template #validated>Validated by {{ repo.Approver }}</ng-template>
                                </td>
                                <td>
                                    <div class="flex" style="min-width:100px; gap:0.5rem">
                                        <button pButton pRipple icon="pi pi-paperclip" class="p-button-rounded p-button-info" *ngIf="attachvalid" (click)="upload_ref(repo)"></button>
                                        <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="delete_Repo(repo)"></button>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="repositories().length === 0 && !loading">
                                <td colspan="17" style="text-align:center; padding:2rem">No Repositories found.</td>
                            </tr>
                            <tr *ngIf="loading">
                                <td colspan="17" style="text-align:center; padding:2rem">Loading Data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </ng-container>

            <!-- CARD VIEW -->
            <ng-container *ngIf="viewMode === 'card'">
                <div *ngIf="loading" style="text-align:center; padding:2rem; color:#666">
                    <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
                    <p>Loading Data...</p>
                </div>
                <div *ngIf="!loading && repositories().length === 0" style="text-align:center; padding:3rem; color:#888"><i class="pi pi-inbox" style="font-size:3rem; display:block; margin-bottom:1rem"></i>No Repositories found.</div>
                <div class="card-grid" *ngIf="!loading && repositories().length > 0">
                    <div class="repo-card has-checkbox" *ngFor="let repo of repositories()">
                        <input type="checkbox" class="repo-card-select" [checked]="isRepoSelected(repo)" (change)="onCheckboxChange(repo, $event)" [disabled]="!isAdmin && repo.Approval_status !== 'Approved'" /><br />
                        <div class="repo-card-header">
                            <div>
                                <div class="repo-card-title">{{ repo.module_name }}</div>
                                <div class="repo-card-subtitle" *ngIf="customervalid">{{ repo.customer_name }}</div>
                            </div>
                            <p-tag [value]="repo.Approval_status" [severity]="getApprovalSeverity(repo.Approval_status)" [rounded]="true" style="flex-shrink:0"></p-tag>
                        </div>
                        <div class="repo-card-badges">
                            <span class="badge badge-domain">Domain: {{ repo.domain }}</span>
                            <span class="badge badge-sector">Sector: {{ repo.sector }}</span>
                        </div>
                        <hr class="repo-card-divider" />
                        <div class="repo-card-field" *ngIf="repo.detailed_requirement"><strong>Detailed Requirement:</strong> {{ repo.detailed_requirement }}</div>
                        <div class="repo-card-field" *ngIf="repo.technical_details"><strong>Technical Details:</strong> {{ repo.technical_details }}</div>
                        <div class="repo-card-field" *ngIf="repo.customer_benefit"><strong>Customer Benefit:</strong> {{ repo.customer_benefit }}</div>
                        <div class="repo-card-field" *ngIf="repo.standard_custom"><strong>Object Type:</strong> {{ repo.standard_custom }}</div>
                        <div class="repo-card-field" *ngIf="repo.irm"><strong>IRM:</strong> {{ repo.irm }}</div>
                        <hr class="repo-card-divider" />
                        <div class="repo-card-footer">
                            <div class="repo-card-meta"><i class="pi pi-calendar" style="margin-right:4px"></i>{{ formatDate(repo.created_at) }} &nbsp;&nbsp;<i class="pi pi-user" style="margin-right:4px"></i>{{ repo.username }}</div>
                            <div class="repo-card-actions">
                                <app-secure-file-viewer [repoId]="repo.id" [filename]="repo.attachment_filename || ''" [disabled]="repo.attach_code_or_document === 'UPLOADED'" apiBase="http://10.6.102.245:5002"></app-secure-file-viewer>
                                <ng-container *ngIf="isAdmin; else cardNormalUser">
                                    <p-button
                                        icon="pi pi-download"
                                        severity="primary"
                                        [rounded]="true"
                                        pTooltip="Download"
                                        tooltipPosition="top"
                                        (click)="download_ref(repo, repo.id)"
                                        [disabled]="repo.attach_code_or_document === 'UPLOADED'"
                                    ></p-button>
                                </ng-container>
                                <ng-template #cardNormalUser>
                                    <ng-container *ngIf="repo.download_approved; else cardRequest">
                                        <p-button
                                            icon="pi pi-download"
                                            severity="primary"
                                            [rounded]="true"
                                            pTooltip="Download"
                                            tooltipPosition="top"
                                            (click)="download_ref(repo, repo.id)"
                                            [disabled]="repo.attach_code_or_document === 'UPLOADED'"
                                        ></p-button>
                                    </ng-container>
                                    <ng-template #cardRequest>
                                        <p-button
                                            icon="pi pi-send"
                                            severity="help"
                                            [rounded]="true"
                                            pTooltip="Request Access"
                                            tooltipPosition="top"
                                            (click)="openDownloadRequestDialog(repo)"
                                            [disabled]="repo.attach_code_or_document === 'UPLOADED'"
                                        ></p-button>
                                    </ng-template>
                                </ng-template>
                                <p-button *ngIf="attachvalid" icon="pi pi-paperclip" severity="info" [rounded]="true" pTooltip="Attach Document" tooltipPosition="top" (click)="upload_ref(repo)"></p-button>
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" pTooltip="Delete" tooltipPosition="top" (click)="delete_Repo(repo)"></p-button>
                            </div>
                        </div>
                        <div class="repo-card-meta" style="margin-top:2px">
                            <ng-container *ngIf="repo.Approval_status === 'Sent for Approval'; else cardValidated"> <i class="pi pi-clock" style="margin-right:4px"></i>Solution with {{ repo.username }} </ng-container>
                            <ng-template #cardValidated> <i class="pi pi-check-circle" style="margin-right:4px; color:#2e7d32"></i>Validated by {{ repo.Approver }} </ng-template>
                        </div>
                    </div>
                </div>
            </ng-container>

            <p-paginator [totalRecords]="totalitems" [first]="first" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Repos" [showCurrentPageReport]="true" [rows]="6" (onPageChange)="onPageChange($event)"></p-paginator>
        </div>

        <!-- BULK UPLOAD DIALOG -->
        <p-dialog [(visible)]="uploaddialog" header="Upload Solutions" [modal]="true" [style]="{ width: '450px' }">
            <div><label class="custom-file-label">Choose Excel and Attachments</label> <input type="file" class="custom-file-input" multiple (change)="onFilesSelected($event)" accept=".xlsx,.pdf,.zip,.docx,.txt" /></div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="uploaddialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Upload" (click)="uploadFiles()" [disabled]="!selectedFiles.length"></button>
            </ng-template>
        </p-dialog>

        <!-- SEND FOR APPROVAL -->
        <p-dialog [(visible)]="sendforapprovaldialog" header="Send the Repository for Approval" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size:2rem"></i>
                <span *ngIf="repository"
                    >Are you sure you want to Send the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository for Approval?</span
                >
            </div>
            <br />
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

        <!-- APPROVE DIALOG -->
        <p-dialog [(visible)]="approvedialog" header="Approve the Repository" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size:2rem"></i>
                <span *ngIf="repository"
                    >Are you sure you want to approve the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?</span
                >
            </div>
            <br />
            <ng-template pTemplate="content">
                <label for="business_justification">Business Justification</label>
                <div id="business_justification" style="min-height:72px; padding:0.5rem; border:1px solid #ccc; border-radius:4px; background:#f9f9f9">{{ repository.business_justification }}</div>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="sendforapprovaldialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Repoapproval(repository)"></button>
            </ng-template>
        </p-dialog>

        <!-- REJECT DIALOG -->
        <p-dialog [(visible)]="rejectdialog" header="Reject the Repository" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size:2rem"></i>
                <span *ngIf="repository"
                    >Are you sure you want to reject the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?</span
                >
            </div>
            <br />
            <ng-template pTemplate="content">
                <label for="business_justification">Business Justification</label>
                <div id="business_justification" style="min-height:72px; padding:0.5rem; border:1px solid #ccc; border-radius:4px; background:#f9f9f9">{{ repository.business_justification }}</div>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="rejectdialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="Reporeject(repository)"></button>
            </ng-template>
        </p-dialog>

        <!-- CREATE REPOSITORY DIALOG -->
        <p-dialog [(visible)]="createdialog" [modal]="true" [showHeader]="false"
    [style]="{ width: '860px', maxWidth: '94vw' }"
    [contentStyle]="{ padding: '1.25rem 1.5rem', overflow: 'visible' }"
    [resizable]="false" [draggable]="true">
            <ng-template pTemplate="content">
                <div class="cd-wrap">
                    <div class="cd-dialog-header">
                        <div class="cd-dialog-header-icon"><i class="pi pi-file-edit"></i></div>
                        <div class="cd-dialog-header-text">
                            <h3>Create Repository</h3>
                            <p>Complete all fields below — an attachment will be required in the next step.</p>
                        </div>
                        <button pButton pRipple type="button" icon="pi pi-times" class="p-button-text p-button-rounded p-button-plain" (click)="createdialog = false"></button>
                    </div>

                    <form [formGroup]="repoForm" (ngSubmit)="onSubmit()">
                        <!-- §1 Identity -->
                        <div class="cd-section">
                            <div class="cd-section-label"><i class="pi pi-building"></i> Identity</div>
                            <div class="cd-grid-2">
                                <div class="cd-field">
                                    <label class="cd-field-label req">Customer Name</label>
                                    <input id="customer_name" pInputText formControlName="customer_name" placeholder="e.g. Acme Corporation" />
                                    <p-message *ngIf="repoForm.controls['customer_name'].invalid && repoForm.controls['customer_name'].touched" severity="error" text="Customer Name is required"></p-message>
                                </div>
                                <div class="cd-field">
                                    <label class="cd-field-label req">Domain</label>
                                    <!-- Loading hint -->
                                    <div *ngIf="dropdownsLoading" class="dropdown-loading-hint"><i class="pi pi-spin pi-spinner"></i> Loading domains…</div>
                                    <p-autoComplete
                                        *ngIf="!dropdownsLoading"
                                        inputId="domain"
                                        formControlName="domain"
                                        [suggestions]="filteredDomains"
                                        (completeMethod)="filterDomain($event)"
                                        [dropdown]="true"
                                        minLength="0"
                                        placeholder="Select Domain"
                                        (onSelect)="onDomainSelect($event)"
                                        styleClass="w-full"
                                    >
                                    </p-autoComplete>
                                    <p-message *ngIf="repoForm.controls['domain'].invalid && repoForm.controls['domain'].touched" severity="error" text="Domain is required"></p-message>
                                </div>
                            </div>
                        </div>

                        <!-- §2 Classification -->
                        <div class="cd-section">
                            <div class="cd-section-label"><i class="pi pi-tag"></i> Classification</div>
                            <div class="cd-grid-2">
                                <div class="cd-field">
                                    <label class="cd-field-label req">Sector</label>
                                    <div *ngIf="dropdownsLoading" class="dropdown-loading-hint"><i class="pi pi-spin pi-spinner"></i> Loading sectors…</div>
                                    <p-autoComplete
                                        *ngIf="!dropdownsLoading"
                                        inputId="sector"
                                        formControlName="sector"
                                        [suggestions]="filteredSectors"
                                        (completeMethod)="filterSector($event)"
                                        [dropdown]="true"
                                        minLength="0"
                                        placeholder="Select Sector"
                                        [disabled]="!selectedDomain"
                                        styleClass="w-full"
                                    >
                                    </p-autoComplete>
                                    <p-message *ngIf="repoForm.controls['sector'].invalid && repoForm.controls['sector'].touched" severity="error" text="Sector is required"></p-message>
                                </div>
                                <div class="cd-field">
                                    <label class="cd-field-label req">Module Name</label>
                                    <div *ngIf="dropdownsLoading" class="dropdown-loading-hint"><i class="pi pi-spin pi-spinner"></i> Loading modules…</div>
                                    <p-autoComplete
                                        *ngIf="!dropdownsLoading"
                                        inputId="modulename"
                                        formControlName="module_name"
                                        [suggestions]="filteredModules"
                                        (completeMethod)="filterModule($event)"
                                        appendTo="body"
                                        [dropdown]="true"
                                        [minLength]="0"
                                        placeholder="Select Module"
                                        styleClass="w-full"
                                    >
                                    </p-autoComplete>
                                    <p-message *ngIf="repoForm.controls['module_name'].invalid && repoForm.controls['module_name'].touched" severity="error" text="Module Name is required"></p-message>
                                </div>
                                <div class="cd-field">
                                    <label class="cd-field-label req">Object Type</label>
                                    <p-select inputId="standard_custom" formControlName="standard_custom" [options]="standardCustomOptions" placeholder="Select Type" styleClass="w-full"></p-select>
                                    <p-message *ngIf="repoForm.controls['standard_custom'].invalid && repoForm.controls['standard_custom'].touched" severity="error" text="Object Type is required"></p-message>
                                </div>
                                <div class="cd-field">
                                    <label class="cd-field-label req">Customer Benefit</label>
                                    <input id="customer_benefit" pInputText formControlName="customer_benefit" placeholder="Key outcome for the customer" />
                                    <p-message *ngIf="repoForm.controls['customer_benefit'].invalid && repoForm.controls['customer_benefit'].touched" severity="error" text="Customer Benefit is required"></p-message>
                                </div>
                            </div>
                        </div>

                        <!-- §3 Details -->
                        <div class="cd-section">
                            <div class="cd-section-label"><i class="pi pi-align-left"></i> Details</div>
                            <div class="cd-grid-2">
                                <div class="cd-field span-2">
                                    <label class="cd-field-label req">Detailed Requirement</label>
                                    <textarea id="detailed_requirement" pInputTextarea rows="5" formControlName="detailed_requirement" placeholder="Describe the business requirement in detail…"></textarea>
                                    <p-message *ngIf="repoForm.controls['detailed_requirement'].invalid && repoForm.controls['detailed_requirement'].touched" severity="error" text="Detailed Requirement is required"></p-message>
                                </div>
                                <div class="cd-field span-2">
                                    <label class="cd-field-label req">Technical Details</label>
                                    <textarea id="technical_details" pInputTextarea rows="5" formControlName="technical_details" placeholder="Z-object name, ABAP class, API endpoint…"></textarea>
                                    <p-message *ngIf="repoForm.controls['technical_details'].invalid && repoForm.controls['technical_details'].touched" severity="error" text="Technical Details is required"></p-message>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="cd-footer">
                            <button pButton pRipple type="button" icon="pi pi-times" class="p-button-outlined p-button-plain" label="Cancel" (click)="createdialog = false"></button>
                            <button pButton pRipple type="button" icon="pi pi-paperclip" label="Next: Attach Document" [disabled]="repoForm.invalid" (click)="onSubmit()"></button>
                        </div>
                    </form>
                </div>
            </ng-template>
        </p-dialog>

        <!-- ATTACH DIALOG -->
        <p-dialog
            [(visible)]="uploadcodeprocessdocdialog"
            [header]="isNewRepoAttachment ? 'Attach Code/Process Document (Required)' : 'Attach Code/Process Document for Reference'"
            [modal]="true"
            [style]="{ width: '450px' }"
            [closable]="!isNewRepoAttachment"
        >
            <div class="attachment-notice" *ngIf="isNewRepoAttachment">
                <i class="pi pi-exclamation-circle" style="font-size:1.2rem"></i>
                <span>Add Attachment <strong>required</strong> with Max size of 16mb</span>
            </div>
            <div class="flex align-items-c justify-content-c">
                <div style="width:100%">
                    <label class="custom-file-label">Choose File<span *ngIf="isNewRepoAttachment" style="color:red"> *</span></label>
                    <input #fileInput type="file" class="custom-file-input" (change)="onUpload($event)" accept=".xlsx,.pdf,.zip,.docx,.txt" />
                    <small *ngIf="isNewRepoAttachment && !file" style="color:#856404; margin-top:4px; display:block">Please select a file to proceed.</small>
                    <small *ngIf="file" style="color:#198754; margin-top:4px; display:block"><i class="pi pi-check-circle"></i> {{ file.name }}</small>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button *ngIf="isNewRepoAttachment" pButton pRipple icon="pi pi-arrow-left" class="p-button-text" label="Back" (click)="onAttachmentBack()"></button>
                <button *ngIf="!isNewRepoAttachment" pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="uploadcodeprocessdocdialog = false"></button>
                <button *ngIf="isNewRepoAttachment" pButton pRipple
    class="p-button-text"
    [label]="isSaving ? 'Saving…' : 'Save Solution'"
    [icon]="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
    (click)="submitNewRepoWithAttachment()"
    [disabled]="!file || isSaving">
</button>
                <button *ngIf="!isNewRepoAttachment" pButton pRipple icon="pi pi-check" class="p-button-text" label="Attach" (click)="submitData(repository)" [disabled]="!file"></button>
            </ng-template>
        </p-dialog>

        <!-- DELETE DIALOG -->
        <p-dialog [(visible)]="deleteRepoDialog" header="Confirm" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex align-items-c justify-content-c">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size:2rem"></i>
                <span *ngIf="repository"
                    >Are you sure you want to delete the <b>{{ repository.customer_name }}'s - {{ repository.module_name }}</b> Repository?</span
                >
            </div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="No" (click)="deleteRepoDialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-text" label="Yes" (click)="delete_repo(repository)"></button>
            </ng-template>
        </p-dialog>

        <!-- DOWNLOAD REQUEST DIALOG -->
        <p-dialog [(visible)]="downloadRequestDialog" header="Request Download Access" [modal]="true" [style]="{ width: '450px' }">
            <form [formGroup]="downloadRequestForm">
                <label class="required" for="justification">Business Justification</label>
                <textarea id="justification" pInputTextarea rows="3" formControlName="justification"></textarea>
                <p-message *ngIf="downloadRequestForm.controls['justification'].errors?.['required'] && downloadRequestForm.controls['justification'].touched" severity="error" text="Business Justification is required"></p-message>
            </form>
            <ng-template pTemplate="footer">
                <button pButton type="button" class="p-button-text" label="Cancel" (click)="downloadRequestDialog = false"></button>
                <button pButton type="button" class="p-button-text" label="Send Request" (click)="submitDownloadRequest()" [disabled]="downloadRequestForm.invalid"></button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class AddSolutions implements OnInit, AfterViewInit {
    // ── Repo state ────────────────────────────────────────────────────────
    repositories = signal<Repository[]>([]);
    repository!: Repository;
    selectedrepositories: Repository[] = [];
    exportColumns!: ExportColumn[];
    cols!: Column[];

    // ── UI flags ──────────────────────────────────────────────────────────
    loading = true;
    dropdownsLoading = false; // true while API calls for dropdowns run
    adminDialog = false;
    uploaddialog = false;
    approvedialog = false;
    createdialog = false;
    sendforapprovaldialog = false;
    deleteRepoDialog = false;
    rejectdialog = false;
    editrepodialog = false;
    uploadcodeprocessdocdialog = false;
    downloadRequestDialog = false;
    isNewRepoAttachment = false;
    isvalid = false;
    issent = false;
    customervalid = false;
    downloadvalid = false;
    attachvalid = false;
    sendforapproval = false;

    // ── Pagination ────────────────────────────────────────────────────────
    AddSolCurrentPage!: number;
    first!: number;
    totalitems!: number;
    totalrecords: any;

    // ── View mode ─────────────────────────────────────────────────────────
    viewMode: 'table' | 'card' = 'card';

    // ── Forms ─────────────────────────────────────────────────────────────
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    downloadRequestForm!: FormGroup;
    messages: any[] = [];
    isSaving: boolean = false;

    // ── File handling ─────────────────────────────────────────────────────
    file: any;
    selectedFile: File | null = null;
    selectedFiles: File[] = [];
    pendingRepoData: any = null;

    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    // ── Dropdown – static ─────────────────────────────────────────────────
    standardCustomOptions = ['Standard', 'Custom'];

    // ── Dropdown – from API ───────────────────────────────────────────────
    /** All domain names fetched from ManageDomainsService */
    domainOptions: string[] = [];
    /** Map of domain name → its sector names, built from API response */
    sectorOptions: { [domain: string]: string[] } = {};
    /** All module_name strings fetched from ManageReposService */
    moduleOptions: string[] = [];

    // Autocomplete suggestion arrays (subset shown while typing)
    filteredDomains: string[] = [];
    filteredSectors: string[] = [];
    filteredModules: string[] = [];

    selectedDomain = '';

    // Misc
    searchTerm = '';
    filteredRepoList: Repository[] = [];
    selectedDownloadRepo!: Repository;
    business_justification: any;

    get isAdmin(): boolean {
        return this.downloadvalid === true;
    }
    get isExportEnabled(): boolean {
        if (this.isAdmin) return this.selectedrepositories.length > 0;
        return this.selectedrepositories.length > 0 && this.selectedrepositories.every((r) => r.Approval_status === 'Approved');
    }

    constructor(
        private managereposervice: ManageReposService,
        private domainsService: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type === 'Superadmin') {
                this.isvalid = true;
                this.customervalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
            } else if (x?.type === 'manager') {
                this.isvalid = true;
                this.attachvalid = true;
            } else {
                this.isvalid = false;
                this.customervalid = false;
                this.downloadvalid = false;
                this.sendforapproval = true;
                this.attachvalid = true;
            }
        });
    }

    ngOnInit() {
        // ── Restore page ──────────────────────────────────────────────────
        const storedPage = localStorage.getItem('AddSolCurrentPage');
        this.AddSolCurrentPage = storedPage ? parseInt(storedPage) : 1;
        if (!storedPage) localStorage.setItem('AddSolCurrentPage', '1');
        this.loadDemoData(this.AddSolCurrentPage);
        this.first = (this.AddSolCurrentPage - 1) * 10;

        // ── Restore view ──────────────────────────────────────────────────
        const savedView = localStorage.getItem('addSolViewMode');
        if (savedView === 'card' || savedView === 'table') this.viewMode = savedView;

        // ── Forms ─────────────────────────────────────────────────────────
        this.form_records();
        this.repoForm = new FormGroup({
            customer_name: new FormControl('', Validators.required),
            domain: new FormControl('', Validators.required),
            sector: new FormControl('', Validators.required),
            module_name: new FormControl('', Validators.required),
            detailed_requirement: new FormControl('', Validators.required),
            standard_custom: new FormControl('', Validators.required),
            technical_details: new FormControl('', Validators.required),
            customer_benefit: new FormControl('', Validators.required)
        });
        this.approvalForm = new FormGroup({
            business_justification: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(250)])
        });
        this.downloadRequestForm = new FormGroup({
            justification: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(250)])
        });
        this.messages = [];

        // ── Load dropdown data from APIs ──────────────────────────────────
        this.loadDropdownData();
    }

    ngAfterViewInit() {
        // When domain changes in the form → update sector suggestions
        this.repoForm.get('domain')?.valueChanges.subscribe((domain) => {
            this.selectedDomain = domain || '';
            this.filteredSectors = [];
            this.repoForm.patchValue({ sector: '' }, { emitEvent: false });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DROPDOWN DATA  —  loaded from ManageDomainsService + ManageReposService
    // ════════════════════════════════════════════════════════════════════════

    loadDropdownData() {
        this.dropdownsLoading = true;

        forkJoin({
            domains: this.domainsService.getAllDomains(),
            modules: this.managereposervice.getmodules()
        }).subscribe({
            next: ({ domains, modules }) => {
                // ── Domains ───────────────────────────────────────────────
                this.domainOptions = (domains as Domain[])
                    .map((d) => d.name)
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b));

                // ── Sectors map: domain name → sector names ───────────────
                this.sectorOptions = {};
                (domains as Domain[]).forEach((d) => {
                    this.sectorOptions[d.name] = d.sectors
                        .map((s: any) => s.name)
                        .filter(Boolean)
                        .sort((a: any, b: any) => a.localeCompare(b));
                });

                // ── Modules ───────────────────────────────────────────────
                const modArr: any[] = Array.isArray(modules) ? modules : [];
                this.moduleOptions = modArr
                    .map((m: any) => m.module_name)
                    .filter(Boolean)
                    .sort((a: string, b: string) => a.localeCompare(b));

                this.dropdownsLoading = false;
            },
            error: () => {
                this.dropdownsLoading = false;
                this.messageservice.add({
                    severity: 'warn',
                    summary: 'Dropdown Load Failed',
                    detail: 'Could not load domains/sectors/modules from server.'
                });
            }
        });
    }

    // ── AutoComplete filter methods ───────────────────────────────────────

    filterDomain(event: any) {
        const q = event.query.toLowerCase();
        this.filteredDomains = this.domainOptions.filter((o) => o.toLowerCase().includes(q));
    }

    filterSector(event: any) {
        const q = event.query.toLowerCase();
        const sectors = this.selectedDomain ? this.sectorOptions[this.selectedDomain] || [] : [];
        this.filteredSectors = sectors.filter((o) => o.toLowerCase().includes(q));
    }

    filterModule(event: any) {
        const q = event.query.toLowerCase();
        this.filteredModules = this.moduleOptions.filter((o) => o.toLowerCase().includes(q));
    }

    onDomainSelect(event: any) {
        this.selectedDomain = event.value;
        this.repoForm.patchValue({ sector: '' });
        this.filteredSectors = this.sectorOptions[this.selectedDomain] || [];
    }

    // ════════════════════════════════════════════════════════════════════════
    //  REST OF THE COMPONENT  (unchanged business logic)
    // ════════════════════════════════════════════════════════════════════════

    saveViewMode() {
        localStorage.setItem('addSolViewMode', this.viewMode);
    }

    loadDemoData(page: number) {
        this.managereposervice.getalladdedrepos(page).subscribe((data: any) => {
            this.repositories.set(Array.isArray(data) ? data : []);
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
        this.exportColumns = this.cols.map((c) => ({ title: c.header, dataKey: c.field }));
    }

    form_records() {
        this.managereposervice.get_addedrepo_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    onPageChange(event: any) {
        this.AddSolCurrentPage = event.page + 1;
        this.loadDemoData(this.AddSolCurrentPage);
        localStorage.setItem('AddSolCurrentPage', this.AddSolCurrentPage.toString());
    }

    isRepoSelected(repo: Repository) {
        return this.selectedrepositories.some((r) => r.id === repo.id);
    }
    onCheckboxChange(repo: Repository, event: Event) {
        this.toggleRepoSelection(repo, (event.target as HTMLInputElement).checked);
    }
    toggleRepoSelection(repo: Repository, checked: boolean) {
        checked ? this.selectedrepositories.push(repo) : (this.selectedrepositories = this.selectedrepositories.filter((r) => r.id !== repo.id));
    }

    getApprovalSeverity(status: string | undefined): string {
        switch (status ?? 'Not Approved') {
            case 'Approved':
                return 'success';
            case 'Rejected':
                return 'danger';
            case 'Sent for Approval':
                return 'warn';
            default:
                return 'info';
        }
    }

    formatDate(dateString?: string): string {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }

    opendialog() {
        this.createdialog = true;
    }
    upload_dialog() {
        this.uploaddialog = true;
    }

    delete_Repo(repository: Repository) {
        this.deleteRepoDialog = true;
        this.repository = { ...repository };
    }
    reject_dialog(repository: Repository) {
        this.rejectdialog = true;
        this.repository = { ...repository };
    }
    approve_dialog(repository: Repository) {
        this.approvedialog = true;
        this.repository = { ...repository };
    }
    sendforapproval_dialog(repository: Repository) {
        this.sendforapprovaldialog = true;
        this.repository = { ...repository };
    }
    editRepo(repository: Repository) {
        this.repository = { ...repository };
        this.editrepodialog = true;
    }

    upload_ref(repository: Repository) {
        this.repository = { ...repository };
        this.isNewRepoAttachment = false;
        this.file = null;
        this.clearFileInput();
        this.uploadcodeprocessdocdialog = true;
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
        this.managereposervice.requestDownload(this.selectedDownloadRepo.id, this.downloadRequestForm.get('justification')?.value).subscribe({
            next: (_) => {
                this.messageservice.add({ severity: 'success', summary: 'Download request submitted', detail: 'Waiting for Superadmin approval' });
                this.downloadRequestDialog = false;
                this.downloadRequestForm.reset();
            },
            error: (_) => {
                this.messageservice.add({ severity: 'error', summary: 'Failed to submit request', detail: 'Please try again later' });
            }
        });
    }

    onSubmit() {
        if (this.repoForm.valid) {
            this.pendingRepoData = this.repoForm.value;
            this.createdialog = false;
            this.file = null;
            this.clearFileInput();
            this.isNewRepoAttachment = true;
            this.uploadcodeprocessdocdialog = true;
        } else {
            this.repoForm.markAllAsTouched();
        }
    }

    submitNewRepoWithAttachment() {
        if (!this.file) {
            this.messageservice.add({ severity: 'warn', summary: 'Attachment Required', detail: 'Please select a file before saving.' });
            return;
        }
        this.isSaving = true;
        this.managereposervice.createRepository(this.pendingRepoData).subscribe({
            next: (res: any) => {
                this.repository = { id: res.id } as Repository;
                const fd = new FormData();
                fd.set('file', this.file);
                this.managereposervice.uploadreference(this.repository, fd).subscribe({
                    next: () => {
                        this.messageservice.add({ severity: 'success', summary: 'Solution Saved Successfully', detail: 'Repository and attachment uploaded.' });
                        this.isSaving = false;
                        this.resetNewRepoState();
                    },
                    error: () => {
                        this.messageservice.add({ severity: 'error', summary: 'Attachment Upload Failed', detail: 'Repository was created. Use the paperclip icon to retry.' });
                        this.isSaving = false;
                        this.resetNewRepoState();
                    }
                });
            },
            error: () => {
                this.messageservice.add({ severity: 'error', summary: 'Repository Creation Failed', detail: 'Please try again.' });
                this.isSaving = false;
            }
        });
    }

    private resetNewRepoState() {
        this.uploadcodeprocessdocdialog = false;
        this.isNewRepoAttachment = false;
        this.file = null;
        this.pendingRepoData = null;
        this.repoForm.reset();
        this.loadDemoData(this.AddSolCurrentPage);
    }

    submitData(repository: Repository) {
        if (!this.file) {
            this.messageservice.add({ severity: 'warn', summary: 'No File Selected', detail: 'Please select a file before attaching.' });
            return;
        }
        const fd = new FormData();
        fd.set('file', this.file);
        this.managereposervice.uploadreference(this.repository, fd).subscribe(
            () => {
                this.uploadcodeprocessdocdialog = false;
                this.file = null;
                this.messageservice.add({ severity: 'success', summary: 'Uploaded File Successfully', detail: 'Via UploadService' });
                this.loadDemoData(this.AddSolCurrentPage);
            },
            () => {
                this.messageservice.add({ severity: 'error', summary: 'Upload Failed', detail: 'Via UploadService' });
            }
        );
    }

    onAttachmentBack() {
        this.uploadcodeprocessdocdialog = false;
        this.isNewRepoAttachment = false;
        this.file = null;
        this.clearFileInput();
        if (this.pendingRepoData) this.repoForm.patchValue(this.pendingRepoData);
        this.createdialog = true;
    }

    private clearFileInput() {
        if (this.fileInputRef?.nativeElement) this.fileInputRef.nativeElement.value = '';
    }

    onUpload(event: any) {
        const selected = event.target.files[0];
        if (!selected) return;
        const maxBytes = 16 * 1024 * 1024;
        if (selected.size > maxBytes) {
            this.messageservice.add({ severity: 'error', summary: 'File Too Large', detail: 'File size exceeds 16MB limit.' });
            this.file = null;
            this.clearFileInput();
            return;
        }
        this.file = selected;
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        this.selectedFile = file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? file : null;
        if (!this.selectedFile) this.messageservice.add({ severity: 'error', summary: 'Please Select a Valid .xlsx Excel File', detail: 'Via UploadService' });
    }

    onFilesSelected(event: any) {
        this.selectedFiles = Array.from(event.target.files);
    }

    uploadFiles() {
        if (!this.selectedFiles.length) return;
        const fd = new FormData();
        let excelFile: File | null = null;
        this.selectedFiles.forEach((f) => {
            if (f.name.endsWith('.xlsx')) {
                excelFile = f;
            } else {
                fd.append('attachments', f, f.name);
            }
        });
        if (!excelFile) {
            this.messageservice.add({ severity: 'error', summary: 'Please Select an Excel File', detail: 'Via UploadService' });
            return;
        }
        fd.append('file', excelFile);
        this.managereposervice.uploadExcel(fd).subscribe({
            next: () => {
                this.messageservice.add({ severity: 'success', summary: 'Repository has been Uploaded', detail: 'Via UploadService' });
                this.selectedFiles = [];
                this.uploaddialog = false;
                this.reloadPage();
            },
            error: () => {
                this.messageservice.add({ severity: 'error', summary: 'Repository Upload has been Failed', detail: 'Via DeleteService' });
            }
        });
    }

    exportCSV() {
        if (!this.selectedrepositories.length) return;
        const worksheetData = this.selectedrepositories.map((repo) => {
            const row: any = {};
            this.exportColumns.forEach((c) => {
                row[c.title] = (repo as any)[c.dataKey];
            });
            return row;
        });
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb: XLSX.WorkBook = { Sheets: { Repositories: ws }, SheetNames: ['Repositories'] };
        saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' }), 'selected_repositories.xlsx');
        this.messageservice.add({ severity: 'success', summary: 'Repository has been Exported', detail: 'Via ExportService' });
    }

    Repo_approval(repository: any) {
        if (this.approvalForm.invalid) {
            this.approvalForm.markAllAsTouched();
            return;
        }
        this.managereposervice.SendforApproval(repository.id, this.approvalForm.get('business_justification')?.value).subscribe({
            next: () => {
                this.messageservice.add({ severity: 'success', summary: 'Repository sent for Approval', detail: 'Via ApprovalService' });
                this.sendforapprovaldialog = false;
                this.reloadPage();
                this.approvalForm.reset();
            },
            error: () => {
                this.messageservice.add({ severity: 'error', summary: 'Failed Sending for Approval', detail: 'Via ApprovalService' });
            }
        });
    }

    Repoapproval(repository: Repository) {
        this.managereposervice.RepoApproval(this.repository).subscribe(() => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Approved', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    Reporeject(repository: Repository) {
        this.managereposervice.RepoRejection(this.repository).subscribe(() => {
            this.approvedialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Rejected', detail: 'Via ApprovalService' });
            this.reloadPage();
        });
    }

    delete_repo(repository: Repository): void {
        this.managereposervice.delete_repo(this.repository).subscribe(() => {
            this.deleteRepoDialog = false;
            this.messageservice.add({ severity: 'success', summary: 'Repository has been Deleted', detail: 'Via DeleteService' });
            this.reloadPage();
        });
    }

    download_ref(repository: Repository, id: any) {
        this.repository = { ...repository };
        const raw = localStorage.getItem('token');
        if (!raw) return;
        const jwt = JSON.parse(raw).access_token;
        window.open(`http://10.6.102.245:5002/repos/refdownload/${id}?access_token=${jwt}`, '_blank');
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchTerm = value;
        this.first = 0;
        this.filteredRepoList = value
            ? this.repositories().filter((r) => r.customer_name?.toLowerCase().includes(value) || r.module_name?.toLowerCase().includes(value) || r.domain?.toLowerCase().includes(value) || r.sector?.toLowerCase().includes(value))
            : this.repositories();
    }

    cancelEdit() {
        this.repoForm.reset();
    }
    reloadPage() {
        window.location.reload();
    }
    openAttachment(id: number) {
        window.open(`http://127.0.0.1:5001/repos/refview/${id}`, '_blank');
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
            () => {
                this.messageservice.add({ severity: 'error', summary: 'Error Downloading the File', detail: 'Via ExportService' });
            }
        );
    }
}
