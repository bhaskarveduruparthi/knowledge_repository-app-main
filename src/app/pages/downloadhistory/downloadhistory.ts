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
import { DownloadLog, LoginLog, ManageReposService, Repository } from '../service/managerepos.service';
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
    selector: 'app-downloadhistory',
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
            

            <div class="flex items-center justify-between mb-3">
                <h5 class="m-0">Download History</h5>
                <!--<p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onSearch($event)" placeholder="Search..." />
                </p-iconfield>-->
            </div>

            <div class="custom-table-container">
                <table class="glass-table">
                    <thead>
                        <tr>
                           
                            <th>Yash Id</th>
                            <th>User name</th>
                            <th>Repository Id</th>
                            <th>File Name</th>
                            <th>IP Address</th>
                            <th>User Agent</th>
                            <th>TimeStamp</th>
                            
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let log of logs()" >
                           
                           <td style="white-space: nowrap;">{{ log.yash_id || '-' }}</td>
    <td style="white-space: nowrap;">{{ log.username || '-' }}</td>
    <td style="white-space: nowrap;">{{ log.file_id || '-' }}</td>
    <td style="white-space: nowrap;">{{ log.filename || '-' }}</td>
    <td style="white-space: nowrap;">{{ log.ip_address || '-' }}</td>
    <td style="white-space: nowrap;">{{ log.user_agent || '-' }}</td>
    <td style="white-space: nowrap;">{{ formatDate(log.timestamp) }}</td>
          
                            
                            
                        </tr>
                        <tr *ngIf="logs().length === 0 && !loading">
                            <td colspan="17" style="text-align:center; padding: 2rem;">No Logs found.</td>
                        </tr>
                         <tr *ngIf="loading">
                            <td colspan="17" style="text-align:center; padding: 2rem;">Loading Data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p-paginator [totalRecords]="totalitems" [first]="first" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Logs" [showCurrentPageReport]="true" [rows]="10" (onPageChange)="onPageChange($event)"></p-paginator>
        
        </div>
        
    `,
    providers: [MessageService, ManageReposService, ConfirmationService]
})
export class DownloadHistory implements OnInit {
    adminDialog: boolean = false;
    logs= signal<DownloadLog[]>([]);
    log!: DownloadLog;
    selectedlogs: DownloadLog[] = [];
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
    DHistoryCurrentPage!: number;
    page!: number;
    first!: number;
    loading: boolean = true;
    repoForm!: FormGroup;
    approvalForm!: FormGroup;
    totalitems!: number;
    totalrecords: any;
    attachvalid: boolean = false;
   

    file: any;
    

    

    
    business_justification: any;
   

    

    

    ngOnInit() {
        const storedPage = localStorage.getItem('DHistoryCurrentPage');
        if (storedPage) {
            this.DHistoryCurrentPage = parseInt(storedPage);
            this.loadDemoData(this.DHistoryCurrentPage);
            this.first = (this.DHistoryCurrentPage - 1) * 10;
        } else {
            this.DHistoryCurrentPage = 1;
            localStorage.setItem('DHistoryCurrentPage', this.DHistoryCurrentPage.toString());
            this.loadDemoData(this.DHistoryCurrentPage);
            this.first = (this.DHistoryCurrentPage - 1) * 10;
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
        this.managereposervice.getalldownloadlogs(page).subscribe((data: any) => {
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
        this.DHistoryCurrentPage = event.page + 1;
        this.loadDemoData(this.DHistoryCurrentPage);
        localStorage.setItem('DHistoryCurrentPage', this.DHistoryCurrentPage.toString());
    }

    cancelEdit() {
        this.repoForm.reset();
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


    

    form_records() {
        this.managereposervice.get_downloadlog_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() {
        window.location.reload();
    }

    

    
}