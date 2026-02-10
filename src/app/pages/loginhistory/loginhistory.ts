import { Component, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { LoginLog, ManageReposService, Repository } from '../service/managerepos.service';
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
    selector: 'app-loginhistory',
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

        .custom-table-container {
            width: 100%;
            overflow-x: auto;
            margin-bottom: 1rem;
            border-radius: 8px;
        }

        .glass-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 75rem;
            font-size: 0.95rem;
        }

        .glass-table thead th {
            text-align: left;
            padding: 1rem;
            font-weight: bold;
            color: #11224E;
            border-bottom: 2px solid rgba(255, 255, 255, 0.4);
            white-space: nowrap;
            background-color: #cce4f7;
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

        .glass-table tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }

        .glass-table input[type="checkbox"] {
            accent-color: #11224E;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

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

        .error {
            border: 1px solid red;
        }

        .p-toolbar {
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        }

        .card {
            box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
        }

        .download-btn {
            margin-left: auto;
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
            <div class="flex items-center justify-between mb-3">
                <h5 class="m-0">User Login-History</h5>
                <p-button 
                    label="Download All Data" 
                    icon="pi pi-download" 
                    severity="success"
                    (onClick)="downloadAllData()"
                    [loading]="isDownloading"
                    class="download-btn">
                </p-button>
            </div>

            <div class="custom-table-container">
                <table class="glass-table">
                    <thead>
                        <tr>
                            <th>Yash Id</th>
                            <th>IP Address</th>
                            <th>User Agent</th>
                            <th>Success</th>
                            <th>Message</th>
                            <th>TimeStamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let log of logs()">
                            <td style="white-space: nowrap;">{{ log.yash_id || '-' }}</td>
                            <td style="white-space: nowrap;">{{ log.ip_address || '-' }}</td>
                            <td style="white-space: nowrap;">{{ log.user_agent || '-' }}</td>
                            <td style="white-space: nowrap;">
                                <p-tag
                                    [severity]="log.success ? 'success' : 'danger'"
                                    [value]="log.success ? 'Success' : 'Failed'">
                                </p-tag>
                            </td>
                            <td>{{ log.message || '-' }}</td>
                            <td style="white-space: nowrap;">{{ formatDate(log.timestamp) }}</td>
                        </tr>
                        <tr *ngIf="logs().length === 0 && !loading">
                            <td colspan="6" style="text-align:center; padding: 2rem;">No Logs found.</td>
                        </tr>
                        <tr *ngIf="loading">
                            <td colspan="6" style="text-align:center; padding: 2rem;">Loading Data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p-paginator 
                [totalRecords]="totalitems" 
                [first]="first" 
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Logs" 
                [showCurrentPageReport]="true" 
                [rows]="10" 
                (onPageChange)="onPageChange($event)">
            </p-paginator>
        </div>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class LoginHistory implements OnInit {
    adminDialog: boolean = false;
    logs = signal<LoginLog[]>([]);
    log!: LoginLog;
    selectedlogs: LoginLog[] = [];
    submitted: boolean = false;
    selectedFile: File | null = null;
    searchTerm: string = '';
    filteredRepoList: Repository[] = [];
    exportColumns!: ExportColumn[];
    isvalid: boolean = false;
    issent: boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    uploaddialog: boolean = false;
    approvedialog: boolean = false;
    createdialog: boolean = false;
    messages: any[] = [];
    LHistoryCurrentPage!: number;
    page!: number;
    first!: number;
    loading: boolean = true;
    isDownloading: boolean = false;
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
    file: any;
    business_justification: any;

    ngOnInit() {
        const storedPage = localStorage.getItem('LHistoryCurrentPage');
        if (storedPage) {
            this.LHistoryCurrentPage = parseInt(storedPage);
            this.loadDemoData(this.LHistoryCurrentPage);
            this.first = (this.LHistoryCurrentPage - 1) * 10;
        } else {
            this.LHistoryCurrentPage = 1;
            localStorage.setItem('LHistoryCurrentPage', this.LHistoryCurrentPage.toString());
            this.loadDemoData(this.LHistoryCurrentPage);
            this.first = (this.LHistoryCurrentPage - 1) * 10;
        }
        this.form_records();
    }

    constructor(
        private managereposervice: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin') {
                this.isvalid = true;
            } else {
                this.isvalid = false;
                this.router.navigate(['/auth/access']);
            }
        });
    }

    loadDemoData(page: number) {
        this.managereposervice.getalllogs(page).subscribe((data: any) => {
            if (Array.isArray(data)) {
                this.logs.set(data);
            } else {
                console.error('Expected array but received:', data);
                this.logs.set([]);
            }
            this.loading = false;
        });
    }

    onPageChange(event: any) {
        this.LHistoryCurrentPage = event.page + 1;
        this.loadDemoData(this.LHistoryCurrentPage);
        localStorage.setItem('LHistoryCurrentPage', this.LHistoryCurrentPage.toString());
    }

    cancelEdit() {
        this.repoForm.reset();
    }

    formatDate(dateString?: string): string {
        if (!dateString) {
            return "";
        }
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    form_records() {
        this.managereposervice.get_log_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() {
        window.location.reload();
    }

    /**
     * Download all login history data as Excel file
     */
    downloadAllData() {
        this.isDownloading = true;
        
        // Call the service method to get all logs data
        this.managereposervice.downloadAllLogs().subscribe({
            next: (data: any) => {
                if (Array.isArray(data) && data.length > 0) {
                    this.exportToExcel(data);
                    this.messageservice.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Data downloaded successfully'
                    });
                } else {
                    this.messageservice.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'No data available to download'
                    });
                }
                this.isDownloading = false;
            },
            error: (error:any) => {
                console.error('Error downloading data:', error);
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to download data'
                });
                this.isDownloading = false;
            }
        });
    }

    /**
     * Export data to Excel file
     */
    private exportToExcel(data: LoginLog[]) {
        // Prepare data for export
        const exportData = data.map(log => ({
            'Yash ID': log.yash_id || '-',
            'IP Address': log.ip_address || '-',
            'User Agent': log.user_agent || '-',
            'Success': log.success ? 'Success' : 'Failed',
            'Message': log.message || '-',
            'Timestamp': this.formatDate(log.timestamp)
        }));

        // Create worksheet
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const columnWidths = [
            { wch: 15 }, // Yash ID
            { wch: 20 }, // IP Address
            { wch: 40 }, // User Agent
            { wch: 10 }, // Success
            { wch: 30 }, // Message
            { wch: 15 }  // Timestamp
        ];
        worksheet['!cols'] = columnWidths;

        // Create workbook
        const workbook: XLSX.WorkBook = {
            Sheets: { 'Login History': worksheet },
            SheetNames: ['Login History']
        };

        // Generate Excel file
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });

        // Save file
        const fileName = `Login_History_${new Date().toISOString().split('T')[0]}.xlsx`;
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, fileName);
    }
}