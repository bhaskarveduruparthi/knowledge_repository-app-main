import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { ManageReposService } from '../service/managerepos.service';
import { ManageAdminsService } from '../service/manageadmins.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';

interface UserStats {
    yash_id: string;
    name: string;
    email: string;
    b_unit: string;
    irm: string;
    type: string;
    total_solutions: number;
    approved: number;
    pending: number;
    rejected: number;
    login_count: number;
    last_login: string;
    solutions: any[];
}

interface MonthOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-user-wise-report',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, ToastModule,
        ToolbarModule, InputTextModule, SelectModule, DialogModule, TableModule,
        TagModule, ChartModule, CardModule
    ],
    providers: [MessageService, ManageAdminsService, ManageReposService],
    styles: `
       
        :host {
            display: block;
            min-height: 100vh;
            background: #f4f7f5;
            font-family: 'Arial', sans-serif;
        }

        /* ─── CSS Variables ─── */
        :root {
            --forest:    #1a3d2e;
            --pine:      #245c41;
            --fern:      #2e7d52;
            --moss:      #3a9465;
            --sage:      #5aad7a;
            --mint:      #86c99e;
            --dew:       #b8e0c6;
            --frost:     #e3f2eb;
            --cream:     #f4f7f5;
            --leaf-gold: #a8b87a;
            --amber:     #d4872a;
            --clay:      #c5614a;
        }

        /* ─── Layout Shell ─── */
        .shell {
            display: grid;
            grid-template-columns: 260px 1fr;
            min-height: 100vh;
        }

        /* ─── Left Sidebar ─── */
        .sidebar {
            background: #1c4535;
            padding: 2rem 1.5rem;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            border-right: 1px solid #163828;
            box-shadow: 4px 0 20px rgba(0,0,0,0.15);
        }

        .sidebar-brand {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.15);
        }

        .sidebar-icon {
            width: 46px;
            height: 46px;
            background: rgba(255,255,255,0.18);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            color: #ffffff;
            margin-bottom: 0.65rem;
            border: 1px solid rgba(255,255,255,0.25);
        }

        .sidebar-title {
            font-family: 'DM Serif Display', serif;
            font-size: 1.25rem;
            color: #ffffff;
            line-height: 1.2;
            text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .sidebar-subtitle {
            font-size: 0.7rem;
            color: #a8d5b8;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
        }

        /* Sidebar Stat Pills */
        .sidebar-stats {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .sidebar-stat-label {
            font-size: 0.68rem;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #a8d5b8;
            margin-bottom: 0.4rem;
            font-weight: 700;
        }

        .sidebar-pill {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.7rem 0.9rem;
            border-radius: 9px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.14);
            transition: background 0.2s;
        }

        .sidebar-pill:hover {
            background: rgba(255,255,255,0.16);
        }

        .sidebar-pill-left {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .sidebar-pill-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .sidebar-pill-text {
            font-size: 0.82rem;
            color: #e0f0e8;
            font-weight: 500;
        }

        .sidebar-pill-num {
            font-size: 1.05rem;
            font-weight: 800;
        }

        .sidebar-pill.total .sidebar-pill-dot    { background: #7dd4a0; }
        .sidebar-pill.approved .sidebar-pill-dot { background: #5de87a; }
        .sidebar-pill.pending .sidebar-pill-dot  { background: #ffd060; }
        .sidebar-pill.rejected .sidebar-pill-dot { background: #ff7f7a; }
        .sidebar-pill.users .sidebar-pill-dot    { background: #a0dfc0; }

        .sidebar-pill.total .sidebar-pill-num    { color: #7dd4a0; }
        .sidebar-pill.approved .sidebar-pill-num { color: #5de87a; }
        .sidebar-pill.pending .sidebar-pill-num  { color: #ffd060; }
        .sidebar-pill.rejected .sidebar-pill-num { color: #ff7f7a; }
        .sidebar-pill.users .sidebar-pill-num    { color: #a0dfc0; }

        /* Sidebar Filters */
        .sidebar-filters {
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
            flex: 1;
        }

        .sidebar-filter-label {
            font-size: 0.68rem;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #a8d5b8;
            margin-bottom: 0.2rem;
            font-weight: 700;
        }

        .sidebar-filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            margin-bottom: 0.4rem;
        }

        .sidebar-filter-group label {
            font-size: 0.78rem;
            color: #c8e8d4;
            font-weight: 600;
        }

        ::ng-deep .sidebar-filters .p-select {
            background: rgba(255,255,255,0.12) !important;
            border: 1px solid rgba(255,255,255,0.22) !important;
            border-radius: 8px !important;
            width: 100%;
        }

        ::ng-deep .sidebar-filters .p-select:hover {
            border-color: rgba(255,255,255,0.4) !important;
        }

        ::ng-deep .sidebar-filters .p-select .p-select-label {
            color: #ffffff !important;
            font-size: 0.82rem !important;
            padding: 0.6rem 0.9rem !important;
            font-weight: 500;
        }

        ::ng-deep .sidebar-filters .p-select .p-select-dropdown {
            color: #c8e8d4 !important;
        }

        .sidebar-search {
            background: rgba(255,255,255,0.12) !important;
            border: 1px solid rgba(255,255,255,0.22) !important;
            border-radius: 8px !important;
            color: #ffffff !important;
            font-size: 0.82rem !important;
            padding: 0.62rem 0.9rem !important;
            width: 100%;
            box-sizing: border-box;
            font-weight: 500;
        }

        .sidebar-search::placeholder {
            color: rgba(255,255,255,0.45) !important;
        }

        .sidebar-search:focus {
            outline: none;
            border-color: rgba(255,255,255,0.5) !important;
            background: rgba(255,255,255,0.16) !important;
        }

        .sidebar-btn-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .btn-clear {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.65rem 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.25);
            background: rgba(255,255,255,0.1);
            color: #e0f0e8;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'DM Sans', sans-serif;
        }

        .btn-clear:hover {
            background: rgba(255,255,255,0.18);
            color: #ffffff;
            border-color: rgba(255,255,255,0.4);
        }

        .btn-export {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.65rem 1rem;
            border-radius: 8px;
            border: none;
            background: linear-gradient(135deg, #3aab66, #5de87a);
            color: #0d2b1a;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 2px 10px rgba(61,200,110,0.35);
        }

        .btn-export:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(61,200,110,0.5);
            background: linear-gradient(135deg, #45bc74, #68f08a);
        }

        .btn-export:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        /* ─── Main Content ─── */
        .main {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Top Bar */
        .topbar {
            background: white;
            padding: 1.25rem 2.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e4ede8;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .topbar-breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.82rem;
            color: #7a9a87;
        }

        .topbar-breadcrumb span:last-child {
            color: #1c4535;
            font-weight: 600;
        }

        .topbar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .refresh-btn {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            border: 1px solid #c8ddd1;
            background: white;
            color: #245c41;
            font-size: 0.82rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'DM Sans', sans-serif;
        }

        .refresh-btn:hover {
            background: #e3f2eb;
            border-color: #2e7d52;
        }

        /* Content Area */
        .content {
            padding: 2rem 2.5rem;
            overflow-y: auto;
            flex: 1;
        }

        /* Page Heading */
        .page-heading {
            margin-bottom: 2rem;
        }

        .page-heading h1 {
            font-family: 'DM Serif Display', serif;
            font-size: 2rem;
            color: #1c4535;
            margin: 0 0 0.4rem 0;
            line-height: 1.15;
        }

        .page-heading p {
            color: #7a9a87;
            font-size: 0.9rem;
            margin: 0;
            font-weight: 400;
        }

        /* ─── Charts Grid ─── */
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .chart-card {
            background: white;
            border-radius: 16px;
            padding: 1.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
            border: 1px solid #e4ede8;
        }

        .chart-card.full-width {
            grid-column: 1 / -1;
        }

        .chart-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
        }

        .chart-card-title {
            font-family: 'DM Serif Display', serif;
            font-size: 1.05rem;
            color: #1c4535;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .chart-card-title i {
            color: #2e7d52;
            font-size: 1rem;
        }

        .chart-badge {
            font-size: 0.72rem;
            background: #e3f2eb;
            color: #245c41;
            padding: 0.25rem 0.65rem;
            border-radius: 20px;
            font-weight: 600;
            border: 1px solid #b8e0c6;
        }

        ::ng-deep .chart-card .p-chart {
            height: 280px !important;
        }

        /* ─── Data Table ─── */
        .table-card {
            background: white;
            border-radius: 16px;
            padding: 1.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
            border: 1px solid #e4ede8;
        }

        .table-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .table-card-title {
            font-family: 'DM Serif Display', serif;
            font-size: 1.15rem;
            color: #1c4535;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .count-chip {
            background: #1c4535;
            color: white;
            padding: 0.2rem 0.7rem;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th,
        ::ng-deep .p-datatable-thead > tr > th,
        ::ng-deep th.p-sortable-column,
        ::ng-deep th[psortablecolumn] {
            background: #1c4535 !important;
            background-color: #1c4535 !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            padding: 0.95rem 1rem !important;
            border: none !important;
            border-bottom: 3px solid #163828 !important;
            font-size: 0.78rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.6px !important;
            font-family: 'DM Sans', sans-serif !important;
            white-space: nowrap;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th .p-sortable-column-icon,
        ::ng-deep .p-datatable .p-datatable-thead > tr > th .p-icon,
        ::ng-deep .p-datatable .p-datatable-thead > tr > th svg {
            color: rgba(255,255,255,0.65) !important;
            fill: rgba(255,255,255,0.65) !important;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th.p-sortable-column:hover,
        ::ng-deep .p-datatable .p-datatable-thead > tr > th:hover {
            background: #245c41 !important;
            background-color: #245c41 !important;
            color: #ffffff !important;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th:first-child {
            border-radius: 10px 0 0 0 !important;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th:last-child {
            border-radius: 0 10px 0 0 !important;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 1rem !important;
            border-bottom: 1px solid #eef4f0 !important;
            vertical-align: middle;
            font-size: 0.875rem;
            font-family: 'DM Sans', sans-serif;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:last-child > td {
            border-bottom: none !important;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr {
            transition: background 0.15s;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
            background: #f7faf8 !important;
        }

        ::ng-deep .p-datatable .p-paginator {
            border: none !important;
            border-top: 1px solid #eef4f0 !important;
            padding: 1rem 0 0 0 !important;
        }

        /* User Cell */
        .user-cell {
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }

        .avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #245c41, #2e7d52);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.8rem;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(36,92,65,0.25);
        }

        .user-name {
            font-weight: 600;
            color: #1c4535;
            font-size: 0.88rem;
            line-height: 1.2;
        }

        .user-id {
            font-size: 0.75rem;
            color: #99b5a5;
            font-weight: 400;
        }

        /* Stat Cell Badges */
        .num-total {
            font-size: 1rem;
            font-weight: 700;
            color: #2e7d52;
        }

        .num-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 24px;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 0 0.45rem;
        }

        .num-badge.approved { background: #e6f9ec; color: #1e8c3a; }
        .num-badge.pending  { background: #fff8e6; color: #c47c00; }
        .num-badge.rejected { background: #fdecea; color: #c03520; }

        .login-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: #e8f0fe;
            color: #2c5fbf;
            padding: 0.3rem 0.7rem;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 600;
        }

        .date-text {
            font-size: 0.8rem;
            color: #7a9a87;
            font-weight: 400;
        }

        ::ng-deep .p-tag {
            font-weight: 600 !important;
            font-size: 0.75rem !important;
            padding: 0.3rem 0.75rem !important;
            border-radius: 20px !important;
        }

        /* IRM Tag */
        .irm-tag {
            display: inline-block;
            padding: 0.25rem 0.7rem;
            background: #e3f2eb;
            color: #245c41;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 600;
            border: 1px solid #b8e0c6;
        }

        /* View Button */
        .view-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.4rem 0.8rem;
            border-radius: 7px;
            border: 1px solid #c8ddd1;
            background: white;
            color: #245c41;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            font-family: 'DM Sans', sans-serif;
        }

        .view-btn:hover {
            background: #e3f2eb;
            border-color: #2e7d52;
            color: #1c4535;
        }

        /* ─── Loading ─── */
        .loading-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1.25rem;
        }

        .leaf-spinner {
            width: 52px;
            height: 52px;
            border: 3px solid #e3f2eb;
            border-top: 3px solid #2e7d52;
            border-radius: 50%;
            animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            font-family: 'DM Serif Display', serif;
            font-size: 1.1rem;
            color: #245c41;
        }

        /* ─── Empty ─── */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #aac4b3;
        }

        .empty-state i {
            font-size: 3rem;
            display: block;
            margin-bottom: 1rem;
            color: #b8e0c6;
        }

        .empty-state p {
            font-family: 'DM Serif Display', serif;
            font-size: 1rem;
            color: #7a9a87;
        }

        /* ─── Dialog ─── */
        ::ng-deep .solutions-dialog .p-dialog {
            max-width: 92vw !important;
            width: 1100px !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            box-shadow: 0 25px 60px rgba(0,0,0,0.25) !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header {
            background: linear-gradient(135deg, #1c4535 0%, #245c41 100%) !important;
            color: white !important;
            padding: 1.5rem 2rem !important;
            border-radius: 0 !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header .p-dialog-title {
            font-family: 'DM Serif Display', serif !important;
            font-size: 1.3rem !important;
            color: #ffffff !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header-icons .p-dialog-header-icon {
            color: rgba(255,255,255,0.8) !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header-icons .p-dialog-header-icon:hover {
            background: rgba(255,255,255,0.15) !important;
            color: #ffffff !important;
            border-radius: 50% !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-content {
            padding: 0 !important;
            overflow: hidden !important;
            border-radius: 0 0 16px 16px !important;
        }

        /* Dialog table — contained inside dialog, no overflow */
        ::ng-deep .solutions-dialog .p-datatable {
            border-radius: 0 0 16px 16px !important;
            overflow: hidden !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-wrapper {
            border-radius: 0 !important;
            overflow-x: auto !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-thead > tr > th:first-child {
            border-radius: 0 !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-thead > tr > th:last-child {
            border-radius: 0 !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-paginator {
            border-radius: 0 0 16px 16px !important;
            border: none !important;
            border-top: 1px solid #eef4f0 !important;
            padding: 1rem 1.5rem !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.9rem 1rem !important;
            font-size: 0.875rem !important;
        }

        /* ─── Responsive Overrides ─── */
        @media (max-width: 1200px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 960px) {
            .shell {
                grid-template-columns: 1fr;
            }

            .sidebar {
                position: relative;
                height: auto;
                padding: 1.5rem;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .sidebar-brand { 
                width: 100%;
                padding-bottom: 1rem;
                margin-bottom: 0;
            }

            .sidebar-stats, .sidebar-filters {
                flex: 1;
                min-width: 220px;
            }

            .topbar {
                padding: 1rem 1.5rem;
            }

            .content {
                padding: 1.5rem;
            }
        }

        @media (max-width: 640px) {
            .sidebar {
                flex-direction: column;
            }

            .page-heading h1 {
                font-size: 1.6rem;
            }

            .charts-grid {
                gap: 1rem;
            }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f4f7f5; }
        ::-webkit-scrollbar-thumb { background: #b8e0c6; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #86c99e; }
    `,
    template: `
        <p-toast />

        <div class="shell">

            <!-- ── Left Sidebar ── -->
            <aside class="sidebar">

                <div class="sidebar-brand">
                    <div class="sidebar-icon">
                        <i class="pi pi-users"></i>
                    </div>
                    <div class="sidebar-title">User Activity<br>Report</div>
                    <div class="sidebar-subtitle">Knowledge Repository</div>
                </div>

                <!-- Live Summary Pills -->
                <div class="sidebar-stats" *ngIf="!loading">
                    <div class="sidebar-stat-label">Summary</div>

                    <div class="sidebar-pill users">
                        <div class="sidebar-pill-left">
                            <div class="sidebar-pill-dot"></div>
                            <div class="sidebar-pill-text">Active Users</div>
                        </div>
                        <div class="sidebar-pill-num">{{ filteredStats.length }}</div>
                    </div>

                    <div class="sidebar-pill total">
                        <div class="sidebar-pill-left">
                            <div class="sidebar-pill-dot"></div>
                            <div class="sidebar-pill-text">Total Solutions</div>
                        </div>
                        <div class="sidebar-pill-num">{{ getTotalSolutions() }}</div>
                    </div>

                    <div class="sidebar-pill approved">
                        <div class="sidebar-pill-left">
                            <div class="sidebar-pill-dot"></div>
                            <div class="sidebar-pill-text">Approved</div>
                        </div>
                        <div class="sidebar-pill-num">{{ getTotalApproved() }}</div>
                    </div>

                    <div class="sidebar-pill pending">
                        <div class="sidebar-pill-left">
                            <div class="sidebar-pill-dot"></div>
                            <div class="sidebar-pill-text">Pending</div>
                        </div>
                        <div class="sidebar-pill-num">{{ getTotalPending() }}</div>
                    </div>

                    <div class="sidebar-pill rejected">
                        <div class="sidebar-pill-left">
                            <div class="sidebar-pill-dot"></div>
                            <div class="sidebar-pill-text">Rejected</div>
                        </div>
                        <div class="sidebar-pill-num">{{ getTotalRejected() }}</div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="sidebar-filters">
                    <div class="sidebar-filter-label">Filters</div>

                    <div class="sidebar-filter-group">
                        <label>Month</label>
                        <p-select
                            [options]="monthOptions"
                            [(ngModel)]="selectedMonth"
                            placeholder="All Months"
                            [showClear]="true"
                            optionLabel="label"
                            optionValue="value"
                            (onChange)="applyFilters()"
                            styleClass="w-full"
                        />
                    </div>

                    <div class="sidebar-filter-group">
                        <label>IRM</label>
                        <p-select
                            [options]="irmOptions"
                            [(ngModel)]="selectedIRM"
                            placeholder="All IRMs"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            styleClass="w-full"
                        />
                    </div>

                    <div class="sidebar-filter-group">
                        <label>Search</label>
                        <input
                            class="sidebar-search"
                            type="text"
                            [(ngModel)]="searchText"
                            (input)="applyFilters()"
                            placeholder="Name or User ID…"
                        />
                    </div>

                    <div class="sidebar-btn-group">
                        <button class="btn-clear" (click)="clearFilters()">
                            <i class="pi pi-filter-slash"></i> Clear Filters
                        </button>
                        <button
                            class="btn-export"
                            (click)="exportToExcel()"
                            [disabled]="loading || filteredStats.length === 0">
                            <i class="pi pi-file-excel"></i> Export Excel
                        </button>
                    </div>
                </div>

            </aside>

            <!-- ── Main Content ── -->
            <div class="main">

                <!-- Top Bar -->
                <div class="topbar">
                    <div class="topbar-breadcrumb">
                        <span>Reports</span>
                        <i class="pi pi-angle-right" style="font-size: 0.7rem;"></i>
                        <span>User Activity</span>
                    </div>
                    <div class="topbar-actions">
                        <button class="refresh-btn" (click)="loadReportData()">
                            <i class="pi pi-refresh"></i> Refresh
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="content">

                    <div class="page-heading">
                        <h1>User Activity &amp; Solutions</h1>
                        <p>Track contributions, login patterns and solution performance across your team.</p>
                    </div>

                    <!-- Loading -->
                    <div *ngIf="loading" class="loading-overlay">
                        <div class="leaf-spinner"></div>
                        <div class="loading-text">Loading report data…</div>
                    </div>

                    <ng-container *ngIf="!loading">

                        <!-- Charts Grid -->
                        <div class="charts-grid">

                            <div class="chart-card">
                                <div class="chart-card-header">
                                    <div class="chart-card-title">
                                        <i class="pi pi-trophy"></i>
                                        Top 10 Contributors
                                    </div>
                                    <span class="chart-badge">Stacked</span>
                                </div>
                                <p-chart type="bar" [data]="topContributorsChartData" [options]="barChartOptions" />
                            </div>

                            <div class="chart-card">
                                <div class="chart-card-header">
                                    <div class="chart-card-title">
                                        <i class="pi pi-sign-in"></i>
                                        Most Active Users
                                    </div>
                                    <span class="chart-badge">By Logins</span>
                                </div>
                                <p-chart type="bar" [data]="loginActivityChartData" [options]="loginChartOptions" />
                            </div>

                            <div class="chart-card" *ngIf="!selectedIRM">
                                <div class="chart-card-header">
                                    <div class="chart-card-title">
                                        <i class="pi pi-sitemap"></i>
                                        Solutions by IRM
                                    </div>
                                    <span class="chart-badge">Donut</span>
                                </div>
                                <p-chart type="doughnut" [data]="irmChartData" [options]="pieChartOptions" />
                            </div>

                            <div class="chart-card" [class.full-width]="!!selectedIRM">
                                <div class="chart-card-header">
                                    <div class="chart-card-title">
                                        <i class="pi pi-calendar"></i>
                                        Monthly Solutions Added
                                    </div>
                                    <span class="chart-badge">Trend</span>
                                </div>
                                <p-chart type="bar" [data]="monthlySolutionsChartData" [options]="monthlyBarChartOptions" />
                            </div>

                        </div>

                        <!-- Data Table -->
                        <div class="table-card">
                            <div class="table-card-header">
                                <div class="table-card-title">
                                    <i class="pi pi-table" style="color: #2e7d52; font-size: 1rem;"></i>
                                    User Details
                                    <span class="count-chip">{{ filteredStats.length }}</span>
                                </div>
                            </div>

                            <p-table
                                [value]="filteredStats"
                                [paginator]="true"
                                [rows]="10"
                                [rowsPerPageOptions]="[10, 25, 50, 100]"
                                [showCurrentPageReport]="true"
                                currentPageReportTemplate="Showing {first}–{last} of {totalRecords}"
                                responsiveLayout="scroll"
                            >
                                <ng-template pTemplate="header">
                                    <tr>
                                        <th pSortableColumn="name" style="min-width: 190px;">
                                            User <p-sortIcon field="name" />
                                        </th>
                                        <th pSortableColumn="irm">
                                            IRM <p-sortIcon field="irm" />
                                        </th>
                                        <th pSortableColumn="login_count" class="text-center">
                                            Logins <p-sortIcon field="login_count" />
                                        </th>
                                        <th class="text-center">Last Login</th>
                                        <th pSortableColumn="total_solutions" class="text-center">
                                            Total <p-sortIcon field="total_solutions" />
                                        </th>
                                        <th pSortableColumn="approved" class="text-center">
                                            Approved <p-sortIcon field="approved" />
                                        </th>
                                        <th pSortableColumn="pending" class="text-center">
                                            Pending <p-sortIcon field="pending" />
                                        </th>
                                        <th pSortableColumn="rejected" class="text-center">
                                            Rejected <p-sortIcon field="rejected" />
                                        </th>
                                        <th class="text-center">Actions</th>
                                    </tr>
                                </ng-template>

                                <ng-template pTemplate="body" let-user>
                                    <tr>
                                        <td>
                                            <div class="user-cell">
                                                <div class="avatar">{{ getInitials(user.name) }}</div>
                                                <div>
                                                    <div class="user-name">{{ user.name }}</div>
                                                    <div class="user-id">{{ user.yash_id }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="irm-tag">{{ user.irm || 'N/A' }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="login-badge">
                                                <i class="pi pi-sign-in"></i>
                                                {{ user.login_count }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <span class="date-text">{{ formatDateOnly(user.last_login) }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="num-total">{{ user.total_solutions }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="num-badge approved">{{ user.approved }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="num-badge pending">{{ user.pending }}</span>
                                        </td>
                                        <td class="text-center">
                                            <span class="num-badge rejected">{{ user.rejected }}</span>
                                        </td>
                                        <td class="text-center">
                                            <button class="view-btn" (click)="viewUserSolutions(user)">
                                                <i class="pi pi-eye"></i> View
                                            </button>
                                        </td>
                                    </tr>
                                </ng-template>

                                <ng-template pTemplate="emptymessage">
                                    <tr>
                                        <td colspan="9">
                                            <div class="empty-state">
                                                <i class="pi pi-inbox"></i>
                                                <p>No user data matches your current filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>

                    </ng-container>
                </div>
            </div>
        </div>

        <!-- Solutions Dialog -->
        <p-dialog
            [(visible)]="showSolutionsDialog"
            [modal]="true"
            [style]="{ width: '90vw', maxWidth: '1100px', overflow: 'hidden', borderRadius: '16px' }"
            [contentStyle]="{ padding: '0', overflow: 'hidden', borderRadius: '0 0 16px 16px' }"
            [draggable]="false"
            [resizable]="false"
            styleClass="solutions-dialog"
        >
            <ng-template pTemplate="header">
                <div>
                    <div style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.35rem;">
                        Solutions — {{ selectedUser?.name }}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.75;">
                        {{ selectedUser?.yash_id }} &nbsp;·&nbsp; {{ selectedUser?.total_solutions }} Solutions &nbsp;·&nbsp; {{ selectedUser?.login_count }} Logins
                    </div>
                </div>
            </ng-template>

            <p-table
                [value]="selectedUser?.solutions || []"
                [paginator]="true"
                [rows]="5"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Showing {first}–{last} of {totalRecords}"
                responsiveLayout="scroll"
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th>Customer</th>
                        <th>Module</th>
                        <th>Domain</th>
                        <th>Sector</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Approver</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-solution>
                    <tr>
                        <td>{{ solution.customer_name }}</td>
                        <td>{{ solution.module_name }}</td>
                        <td>{{ solution.domain }}</td>
                        <td>{{ solution.sector }}</td>
                        <td>{{ formatDate(solution.created_at) }}</td>
                        <td>
                            <p-tag
                                [value]="solution.Approval_status || 'Pending'"
                                [severity]="getStatusSeverity(solution.Approval_status)"
                            />
                        </td>
                        <td>{{ solution.Approver || 'N/A' }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>
    `
})
export class UserWiseReportComponent implements OnInit {
    loading = true;
    userStats: UserStats[] = [];
    filteredStats: UserStats[] = [];
    allSolutions: any[] = [];
    loginHistory: any[] = [];

    selectedMonth: string = '';
    selectedIRM: string = '';
    searchText: string = '';

    monthOptions: MonthOption[] = [];
    irmOptions: string[] = [];

    showSolutionsDialog = false;
    selectedUser: UserStats | null = null;

    topContributorsChartData: any;
    loginActivityChartData: any;
    irmChartData: any;
    monthlySolutionsChartData: any;

    barChartOptions: any;
    loginChartOptions: any;
    pieChartOptions: any;
    monthlyBarChartOptions: any;

    constructor(
        private repoService: ManageReposService,
        private adminService: ManageAdminsService,
        private messageService: MessageService,
        private authService: AuthenticationService,
        private router: Router
    ) {
        this.initializeChartOptions();
    }

    ngOnInit() {
        this.checkAuthorization();
        this.loadReportData();
    }

    checkAuthorization() {
        this.authService.user.subscribe((user) => {
            if (user?.type !== 'Superadmin' && user?.type !== 'manager') {
                this.router.navigate(['/auth/access']);
            }
        });
    }

    loadReportData() {
        this.loading = true;
        forkJoin({
            users: this.adminService.getUsers(),
            repos: this.repoService.get_allrepos(),
            loginHistory: this.repoService.get_log_records()
        }).subscribe({
            next: (data: any) => {
                this.allSolutions = Array.isArray(data.repos) ? data.repos : [];
                const usersData = Array.isArray(data.users) ? data.users : [];
                this.loginHistory = Array.isArray(data.loginHistory) ? data.loginHistory : [];

                const regularUsers = usersData.filter((user: any) =>
                    user.type && user.type.toLowerCase() === 'user'
                );

                this.userStats = this.processUserStats(regularUsers, this.allSolutions);
                this.generateMonthOptions();
                this.generateIRMOptions();
                this.applyFilters();
                this.loading = false;

                if (this.userStats.length === 0) {
                    this.messageService.add({ severity: 'info', summary: 'No Data', detail: 'No user data available' });
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load report data' });
                this.loading = false;
            }
        });
    }

    processUserStats(users: any[], solutions: any[]): UserStats[] {
        return users.map((user) => {
            const userSolutions = solutions.filter(s =>
                s.yash_id === user.yash_id || s.username === user.name
            );
            const approved = userSolutions.filter(s => s.Approval_status?.toLowerCase() === 'approved').length;
            const pending  = userSolutions.filter(s => !s.Approval_status || s.Approval_status.toLowerCase() === 'sent for approval').length;
            const rejected = userSolutions.filter(s => s.Approval_status?.toLowerCase() === 'rejected').length;

            const userLogins = this.loginHistory.filter(login => {
                const matchesId   = String(login.yash_id || '') === String(user.yash_id || '');
                const matchesName = login.username === user.name;
                const isSuccess   = login.success === true || login.message === 'Login successful' || login.status === 'success';
                return (matchesId || matchesName) && isSuccess;
            });

            let lastLogin = 'Never';
            if (userLogins.length > 0) {
                const sorted = [...userLogins].sort((a, b) =>
                    new Date(b.timestamp || b.login_time || b.created_at || 0).getTime() -
                    new Date(a.timestamp || a.login_time || a.created_at || 0).getTime()
                );
                lastLogin = sorted[0].timestamp || sorted[0].login_time || sorted[0].created_at || 'Never';
            }

            return {
                yash_id: user.yash_id, name: user.name, email: user.email || '',
                b_unit: user.b_unit || 'N/A', irm: user.irm || 'N/A', type: user.type || 'user',
                total_solutions: userSolutions.length, approved, pending, rejected,
                login_count: userLogins.length, last_login: lastLogin, solutions: userSolutions
            };
        }).filter(s => s.total_solutions > 0 || s.login_count > 0);
    }

    generateMonthOptions() {
        const months = new Set<string>();
        this.allSolutions.forEach(s => {
            if (s.created_at) {
                const d = new Date(s.created_at);
                months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        this.monthOptions = Array.from(months).sort().reverse().map(mv => {
            const [y, m] = mv.split('-');
            return { label: new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), value: mv };
        });
    }

    generateIRMOptions() {
        const irms = new Set<string>();
        this.userStats.forEach(s => { if (s.irm && s.irm !== 'N/A') irms.add(s.irm); });
        this.irmOptions = Array.from(irms).sort();
    }

    applyFilters() {
        let filtered = [...this.userStats];
        if (this.selectedIRM) filtered = filtered.filter(s => s.irm === this.selectedIRM);
        if (this.searchText?.trim()) {
            const q = this.searchText.trim().toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(q) || s.yash_id?.toString().toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q) || s.irm?.toLowerCase().includes(q)
            );
        }
        if (this.selectedMonth) {
            filtered = filtered.map(stat => {
                const sols = stat.solutions.filter(s => {
                    if (!s.created_at) return false;
                    const d = new Date(s.created_at);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === this.selectedMonth;
                });
                const approved = sols.filter(s => s.Approval_status?.toLowerCase() === 'approved').length;
                const pending  = sols.filter(s => !s.Approval_status || s.Approval_status.toLowerCase() === 'sent for approval').length;
                const rejected = sols.filter(s => s.Approval_status?.toLowerCase() === 'rejected').length;

                const logins = this.loginHistory.filter(l => {
                    const matchId   = String(l.yash_id || '') === String(stat.yash_id || '');
                    const matchName = l.username === stat.name;
                    const isSuccess = l.success === true || l.message === 'Login successful' || l.status === 'success';
                    if (!(matchId || matchName) || !isSuccess) return false;
                    const ts = l.timestamp || l.login_time || l.created_at;
                    if (!ts) return false;
                    const d = new Date(ts);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === this.selectedMonth;
                });

                let lastLogin = 'Never';
                if (logins.length > 0) {
                    const sorted = [...logins].sort((a, b) =>
                        new Date(b.timestamp || b.login_time || b.created_at || 0).getTime() -
                        new Date(a.timestamp || a.login_time || a.created_at || 0).getTime()
                    );
                    lastLogin = sorted[0].timestamp || sorted[0].login_time || sorted[0].created_at || 'Never';
                }
                return { ...stat, total_solutions: sols.length, approved, pending, rejected, login_count: logins.length, last_login: lastLogin, solutions: sols };
            }).filter(s => s.total_solutions > 0 || s.login_count > 0);
        }
        this.filteredStats = filtered.sort((a, b) => b.total_solutions - a.total_solutions);
        this.updateCharts();
    }

    getTotalSolutions() { return this.filteredStats.reduce((s, u) => s + u.total_solutions, 0); }
    getTotalApproved()  { return this.filteredStats.reduce((s, u) => s + u.approved, 0); }
    getTotalPending()   { return this.filteredStats.reduce((s, u) => s + u.pending, 0); }
    getTotalRejected()  { return this.filteredStats.reduce((s, u) => s + u.rejected, 0); }

    updateCharts() {
        this.updateTopContributorsChart();
        this.updateLoginActivityChart();
        this.updateIRMChart();
        this.updateMonthlySolutionsChart();
    }

    updateTopContributorsChart() {
        const top = [...this.filteredStats].slice(0, 10);
        this.topContributorsChartData = {
            labels: top.map(s => s.name),
            datasets: [
                { label: 'Approved', data: top.map(s => s.approved),  backgroundColor: '#3aab66' },
                { label: 'Pending',  data: top.map(s => s.pending),   backgroundColor: '#f0b429' },
                { label: 'Rejected', data: top.map(s => s.rejected),  backgroundColor: '#e87870' }
            ]
        };
    }

    updateLoginActivityChart() {
        const top = [...this.filteredStats].sort((a, b) => b.login_count - a.login_count).slice(0, 10);
        this.loginActivityChartData = {
            labels: top.map(s => s.name),
            datasets: [{ label: 'Logins', data: top.map(s => s.login_count), backgroundColor: '#2c6e9e', borderColor: '#1e4f75', borderWidth: 1 }]
        };
    }

    updateIRMChart() {
        const groups = new Map<string, number>();
        this.filteredStats.forEach(s => { const k = s.irm || 'N/A'; groups.set(k, (groups.get(k) || 0) + s.total_solutions); });
        const sorted = Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);
        const palette = ['#1a3d2e','#2e7d52','#3aab66','#5aad7a','#86c99e','#a8d8b8','#c8e6c9','#e3f2eb'];
        this.irmChartData = {
            labels: sorted.map(([k]) => k),
            datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: palette, hoverBackgroundColor: palette }]
        };
    }

    updateMonthlySolutionsChart() {
        const monthly = new Map<string, number>();
        const ids = new Set(this.filteredStats.map(s => s.yash_id));
        const names = new Set(this.filteredStats.map(s => s.name));
        this.allSolutions.forEach(s => {
            if ((ids.has(s.yash_id) || names.has(s.username)) && s.created_at) {
                const d = new Date(s.created_at);
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthly.set(k, (monthly.get(k) || 0) + 1);
            }
        });
        const sorted = Array.from(monthly.keys()).sort();
        this.monthlySolutionsChartData = {
            labels: sorted.map(mv => { const [y, m] = mv.split('-'); return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }),
            datasets: [{ label: 'Solutions', data: sorted.map(k => monthly.get(k) || 0), backgroundColor: '#2e7d52', borderColor: '#1a3d2e', borderWidth: 1 }]
        };
    }

    initializeChartOptions() {
        const base = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 11, weight: 600 }, color: '#1a3d2e' } },
                tooltip: { backgroundColor: 'rgba(26,61,46,0.92)', padding: 10, titleFont: { size: 11, weight: 600 }, bodyFont: { size: 10 } }
            }
        };
        this.barChartOptions = { ...base, scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 }, color: '#7a9a87' } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0, font: { size: 9 }, color: '#7a9a87' }, grid: { color: '#eef4f0' } } } };
        this.loginChartOptions = { ...base, plugins: { ...base.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#7a9a87' } }, y: { beginAtZero: true, ticks: { precision: 0, font: { size: 9 }, color: '#7a9a87' }, grid: { color: '#eef4f0' } } } };
        this.pieChartOptions  = { ...base, plugins: { ...base.plugins, legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14, font: { size: 10, weight: 600 }, color: '#1a3d2e' } } } };
        this.monthlyBarChartOptions = { ...base, plugins: { ...base.plugins, legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#7a9a87' } }, y: { beginAtZero: true, ticks: { precision: 0, font: { size: 9 }, color: '#7a9a87' }, grid: { color: '#eef4f0' } } } };
    }

    viewUserSolutions(user: UserStats) { this.selectedUser = user; this.showSolutionsDialog = true; }
    clearFilters() { this.selectedMonth = ''; this.selectedIRM = ''; this.searchText = ''; this.applyFilters(); }

    getInitials(name: string): string {
        if (!name) return '?';
        const p = name.trim().split(' ');
        return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    formatDate(d?: string): string {
        if (!d || d === 'Never') return d || 'N/A';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return 'Invalid';
            return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
        } catch { return 'Invalid'; }
    }

    formatDateOnly(d?: string): string {
        if (!d || d === 'Never') return d || 'N/A';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return 'Invalid';
            return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
        } catch { return 'Invalid'; }
    }

    getStatusSeverity(status?: string): 'success' | 'warning' | 'danger' {
        const s = status?.toLowerCase();
        if (s === 'approved') return 'success';
        if (s === 'rejected') return 'danger';
        return 'warning';
    }

    exportToExcel() {
        try {
            const summary = this.filteredStats.map(s => ({
                'User ID': s.yash_id, 'Name': s.name, 'Email': s.email, 'IRM': s.irm,
                'Logins': s.login_count, 'Last Login': this.formatDateOnly(s.last_login),
                'Total': s.total_solutions, 'Approved': s.approved, 'Pending': s.pending, 'Rejected': s.rejected
            }));
            const details = this.filteredStats.flatMap(s => s.solutions.map(sol => ({
                'User ID': s.yash_id, 'Name': s.name, 'IRM': s.irm,
                'Customer': sol.customer_name, 'Module': sol.module_name,
                'Domain': sol.domain, 'Sector': sol.sector,
                'Created': this.formatDate(sol.created_at),
                'Status': sol.Approval_status || 'Pending',
                'Approver': sol.Approver || 'N/A', 'Approval Date': sol.Approval_date || 'N/A'
            })));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'User Summary');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(details), 'Detailed Solutions');
            const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([out], { type: 'application/octet-stream' }), `User_Activity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'Report downloaded successfully' });
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Export failed' });
        }
    }
}