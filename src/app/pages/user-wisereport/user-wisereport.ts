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
import * as XLSX from 'xlsx-js-style';
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        :host {
            display: block;
            min-height: 100vh;
            background: #f0f4f8;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Page Wrapper ── */
        .page-wrap {
            max-width: 1600px;
            margin: 0 auto;
            padding: 0;
        }

        /* ── Hero Header ── */
        .hero {
            background: linear-gradient(135deg, #1c4535 0%, #2e7d52 50%, #1565a8 100%);
            padding: 2.25rem 3rem 0 3rem;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: -60px; right: -60px;
            width: 280px; height: 280px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
        }

        .hero::after {
            content: '';
            position: absolute;
            bottom: -40px; left: 40%;
            width: 200px; height: 200px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
        }

        .hero-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 2;
        }

        .hero-brand {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .hero-icon {
            width: 52px; height: 52px;
            background: rgba(255,255,255,0.18);
            border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; color: #fff;
            border: 1px solid rgba(255,255,255,0.3);
        }

        .hero-title-wrap h1 {
            font-size: 1.85rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 0.25rem 0;
            letter-spacing: -0.5px;
        }

        .hero-title-wrap p {
            font-size: 0.88rem;
            color: rgba(255,255,255,0.72);
            margin: 0;
        }

        .hero-actions {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }

        .btn-hero {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.6rem 1.2rem;
            border-radius: 9px;
            font-size: 0.83rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: 'Plus Jakarta Sans', sans-serif;
            border: none;
        }

        .btn-hero.outline {
            background: rgba(255,255,255,0.12);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.28);
        }

        .btn-hero.outline:hover {
            background: rgba(255,255,255,0.2);
        }

        .btn-hero.excel {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #fff;
            box-shadow: 0 3px 12px rgba(34,197,94,0.4);
        }

        .btn-hero.excel:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 5px 18px rgba(34,197,94,0.5);
        }

        .btn-hero.excel:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── KPI Strip (inside hero, at bottom) ── */
        .kpi-strip {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0;
            position: relative;
            z-index: 2;
            margin-top: 1.5rem;
        }

        .kpi-tile {
            padding: 1.25rem 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            border-right: 1px solid rgba(255,255,255,0.1);
            position: relative;
            cursor: default;
            transition: background 0.2s;
        }

        .kpi-tile:last-child { border-right: none; }
        .kpi-tile:hover { background: rgba(255,255,255,0.06); }

        .kpi-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.6);
            font-weight: 700;
            margin-bottom: 0.4rem;
        }

        .kpi-value {
            font-size: 2.2rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.2rem;
        }

        .kpi-tile.k-users   .kpi-value { color: #7ee8a2; }
        .kpi-tile.k-total   .kpi-value { color: #93c5fd; }
        .kpi-tile.k-approve .kpi-value { color: #86efac; }
        .kpi-tile.k-pending .kpi-value { color: #fde68a; }
        .kpi-tile.k-reject  .kpi-value { color: #fca5a5; }

        .kpi-sub {
            font-size: 0.72rem;
            color: rgba(255,255,255,0.45);
        }

        /* ── Filter Bar ── */
        .filter-bar {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 1rem 3rem;
            display: flex;
            align-items: center;
            gap: 1.25rem;
            flex-wrap: wrap;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .filter-bar-label {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            white-space: nowrap;
        }

        .filter-divider {
            width: 1px;
            height: 28px;
            background: #e2e8f0;
        }

        .filter-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
            min-width: 180px;
            max-width: 260px;
        }

        .filter-item i {
            color: #94a3b8;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        ::ng-deep .filter-item .p-select {
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            background: #f8fafc !important;
            width: 100%;
        }

        ::ng-deep .filter-item .p-select:hover {
            border-color: #2e7d52 !important;
        }

        ::ng-deep .filter-item .p-select .p-select-label {
            font-size: 0.83rem !important;
            color: #334155 !important;
            padding: 0.55rem 0.85rem !important;
        }

        .search-wrap {
            flex: 1;
            min-width: 200px;
            max-width: 280px;
            position: relative;
        }

        .search-wrap i {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.85rem;
        }

        .search-input {
            width: 100%;
            padding: 0.55rem 0.85rem 0.55rem 2.2rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
            font-size: 0.83rem;
            color: #334155;
            font-family: 'Plus Jakarta Sans', sans-serif;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }

        .search-input:focus {
            outline: none;
            border-color: #2e7d52;
            background: #fff;
        }

        .search-input::placeholder { color: #94a3b8; }

        .btn-clear-filter {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.55rem 1rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #fff;
            color: #64748b;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            font-family: 'Plus Jakarta Sans', sans-serif;
            white-space: nowrap;
        }

        .btn-clear-filter:hover {
            border-color: #cbd5e1;
            background: #f1f5f9;
            color: #334155;
        }

        /* ── Content Area ── */
        .content {
            padding: 2rem 3rem;
        }

        /* ── Charts Section ── */
        .section-label {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 1.25rem;
        }

        .section-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e2e8f0;
        }

        /* 2-column charts grid */
        .charts-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .charts-row-2 {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .chart-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04);
            border: 1px solid #e8edf2;
            position: relative;
            overflow: hidden;
        }

        .chart-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
        }

        .chart-card.accent-green::before  { background: linear-gradient(90deg, #1c4535, #22c55e); }
        .chart-card.accent-blue::before   { background: linear-gradient(90deg, #1565a8, #38bdf8); }
        .chart-card.accent-purple::before { background: linear-gradient(90deg, #6d28d9, #a78bfa); }
        .chart-card.accent-orange::before { background: linear-gradient(90deg, #c2410c, #fb923c); }
        .chart-card.accent-teal::before   { background: linear-gradient(90deg, #0f766e, #2dd4bf); }

        .chart-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.25rem;
        }

        .chart-card-title {
            font-size: 0.9rem;
            font-weight: 700;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            line-height: 1.3;
        }

        .chart-icon {
            width: 30px; height: 30px;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem;
            flex-shrink: 0;
        }

        .chart-icon.green  { background: #dcfce7; color: #16a34a; }
        .chart-icon.blue   { background: #dbeafe; color: #1d4ed8; }
        .chart-icon.purple { background: #ede9fe; color: #7c3aed; }
        .chart-icon.orange { background: #ffedd5; color: #c2410c; }
        .chart-icon.teal   { background: #ccfbf1; color: #0f766e; }

        .chart-badge {
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.2rem 0.6rem;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-green  { background: #dcfce7; color: #15803d; }
        .badge-blue   { background: #dbeafe; color: #1d4ed8; }
        .badge-purple { background: #ede9fe; color: #7c3aed; }
        .badge-orange { background: #ffedd5; color: #c2410c; }
        .badge-teal   { background: #ccfbf1; color: #0f766e; }

        ::ng-deep .chart-card .p-chart {
            height: 320px !important;
        }

        ::ng-deep .chart-card.tall .p-chart {
            height: 320px !important;
        }

        /* ── Table Section ── */
        .table-card {
            background: #ffffff;
            border-radius: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04);
            border: 1px solid #e8edf2;
            overflow: hidden;
        }

        .table-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.4rem 1.75rem;
            border-bottom: 1px solid #f1f5f9;
        }

        .table-card-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            font-weight: 800;
            color: #1e293b;
        }

        .count-chip {
            background: #1c4535;
            color: white;
            padding: 0.18rem 0.65rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
        }

        /* Table styles */
        ::ng-deep .p-datatable .p-datatable-thead > tr > th,
        ::ng-deep .p-datatable-thead > tr > th,
        ::ng-deep th.p-sortable-column,
        ::ng-deep th[psortablecolumn] {
            background: #1e293b !important;
            background-color: #1e293b !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            padding: 0.9rem 1.25rem !important;
            border: none !important;
            border-bottom: 2px solid #0f172a !important;
            font-size: 0.75rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.6px !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            white-space: nowrap;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th .p-sortable-column-icon,
        ::ng-deep .p-datatable .p-datatable-thead > tr > th .p-icon,
        ::ng-deep .p-datatable .p-datatable-thead > tr > th svg {
            color: rgba(255,255,255,0.5) !important;
            fill: rgba(255,255,255,0.5) !important;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th:hover {
            background: #334155 !important;
            background-color: #334155 !important;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.95rem 1.25rem !important;
            border-bottom: 1px solid #f1f5f9 !important;
            vertical-align: middle;
            font-size: 0.875rem;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:last-child > td {
            border-bottom: none !important;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
            background: #f8fafc !important;
        }

        ::ng-deep .p-datatable .p-paginator {
            border: none !important;
            border-top: 1px solid #f1f5f9 !important;
            padding: 1rem 1.25rem !important;
        }

        /* User Cell */
        .user-cell {
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }

        .avatar {
            width: 36px; height: 36px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 0.75rem;
            flex-shrink: 0;
        }

        .avatar-0 { background: linear-gradient(135deg, #1c4535, #22c55e); }
        .avatar-1 { background: linear-gradient(135deg, #1565a8, #38bdf8); }
        .avatar-2 { background: linear-gradient(135deg, #6d28d9, #a78bfa); }
        .avatar-3 { background: linear-gradient(135deg, #c2410c, #fb923c); }
        .avatar-4 { background: linear-gradient(135deg, #0f766e, #2dd4bf); }

        .user-name { font-weight: 700; color: #1e293b; font-size: 0.875rem; }
        .user-id   { font-size: 0.72rem; color: #94a3b8; }

        /* Badges */
        .num-total { font-size: 1rem; font-weight: 800; color: #1c4535; }

        .num-badge {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 32px; height: 24px;
            border-radius: 6px;
            font-size: 0.78rem; font-weight: 700;
            padding: 0 0.5rem;
        }

        .num-badge.approved { background: #dcfce7; color: #15803d; }
        .num-badge.pending  { background: #fef9c3; color: #a16207; }
        .num-badge.rejected { background: #fee2e2; color: #b91c1c; }

        .login-badge {
            display: inline-flex; align-items: center; gap: 0.35rem;
            background: #dbeafe; color: #1d4ed8;
            padding: 0.28rem 0.65rem;
            border-radius: 20px;
            font-size: 0.78rem; font-weight: 700;
        }

        .irm-tag {
            display: inline-block;
            padding: 0.22rem 0.65rem;
            background: #f0fdf4; color: #15803d;
            border-radius: 6px;
            font-size: 0.78rem; font-weight: 600;
            border: 1px solid #bbf7d0;
        }

        .date-text { font-size: 0.8rem; color: #94a3b8; }

        .view-btn {
            display: inline-flex; align-items: center; gap: 0.35rem;
            padding: 0.38rem 0.85rem;
            border-radius: 7px;
            border: 1px solid #e2e8f0;
            background: #fff; color: #1c4535;
            font-size: 0.78rem; font-weight: 600;
            cursor: pointer; transition: all 0.15s;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .view-btn:hover { background: #f0fdf4; border-color: #22c55e; color: #15803d; }

        ::ng-deep .p-tag {
            font-weight: 700 !important;
            font-size: 0.74rem !important;
            padding: 0.28rem 0.7rem !important;
            border-radius: 20px !important;
        }

        /* Loading */
        .loading-overlay {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            min-height: 420px; gap: 1.25rem;
        }

        .leaf-spinner {
            width: 48px; height: 48px;
            border: 3px solid #dcfce7;
            border-top: 3px solid #22c55e;
            border-radius: 50%;
            animation: spin 0.85s linear infinite;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .loading-text { font-size: 1rem; font-weight: 600; color: #475569; }

        /* Empty */
        .empty-state { text-align: center; padding: 4rem 2rem; }
        .empty-state i { font-size: 3rem; display: block; margin-bottom: 1rem; color: #cbd5e1; }
        .empty-state p { font-size: 0.95rem; color: #94a3b8; }

        /* Dialog */
        ::ng-deep .solutions-dialog .p-dialog {
            max-width: 92vw !important;
            width: 1100px !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            box-shadow: 0 25px 60px rgba(0,0,0,0.25) !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header {
            background: linear-gradient(135deg, #1c4535 0%, #1565a8 100%) !important;
            color: white !important;
            padding: 1.5rem 2rem !important;
            border-radius: 0 !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header .p-dialog-title {
            font-size: 1.2rem !important;
            font-weight: 800 !important;
            color: #ffffff !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header-icons .p-dialog-header-icon {
            color: rgba(255,255,255,0.8) !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-header-icons .p-dialog-header-icon:hover {
            background: rgba(255,255,255,0.15) !important;
            border-radius: 50% !important;
        }

        ::ng-deep .solutions-dialog .p-dialog-content {
            padding: 0 !important;
            overflow: hidden !important;
            border-radius: 0 0 16px 16px !important;
        }

        ::ng-deep .solutions-dialog .p-datatable {
            border-radius: 0 0 16px 16px !important;
            overflow: hidden !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-wrapper {
            border-radius: 0 !important;
            overflow-x: auto !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-thead > tr > th:first-child,
        ::ng-deep .solutions-dialog .p-datatable .p-datatable-thead > tr > th:last-child {
            border-radius: 0 !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-paginator {
            border-radius: 0 0 16px 16px !important;
            border: none !important;
            border-top: 1px solid #f1f5f9 !important;
            padding: 1rem 1.5rem !important;
        }

        ::ng-deep .solutions-dialog .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.9rem 1.25rem !important;
            font-size: 0.875rem !important;
        }

        /* Responsive */
        @media (max-width: 1400px) {
            .charts-row { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1100px) {
            .charts-row-2 { grid-template-columns: 1fr; }
            .kpi-strip { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 900px) {
            .hero { padding: 1.75rem 1.5rem 0 1.5rem; }
            .filter-bar { padding: 0.85rem 1.5rem; }
            .content { padding: 1.5rem; }
            .charts-row { grid-template-columns: 1fr; }
            .kpi-strip { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
            .kpi-strip { grid-template-columns: 1fr 1fr; }
            .hero-actions { flex-wrap: wrap; }
            .filter-item { max-width: 100%; flex: 1 1 150px; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `,
    template: `
        <p-toast />
        <div class="page-wrap">

            <!-- ── Hero Header ── -->
            <div class="hero">
                <div class="hero-top">
                    <div class="hero-brand">
                        <div class="hero-icon"><i class="pi pi-users"></i></div>
                        <div class="hero-title-wrap">
                            <h1>User Activity &amp; Solutions Report</h1>
                        </div>
                    </div>
                    <div class="hero-actions">
                        <button class="btn-hero outline" (click)="loadReportData()">
                            <i class="pi pi-refresh"></i> Refresh
                        </button>
                        <button
                            class="btn-hero excel"
                            (click)="exportToExcel()"
                            [disabled]="loading || filteredStats.length === 0">
                            <i class="pi pi-file-excel"></i> Export Excel
                        </button>
                    </div>
                </div>

                <!-- KPI Strip -->
                <div class="kpi-strip" *ngIf="!loading">
                    <div class="kpi-tile k-users">
                        <div class="kpi-label">Active Users</div>
                        <div class="kpi-value">{{ filteredStats.length }}</div>
                        <div class="kpi-sub">in current filter</div>
                    </div>
                    <div class="kpi-tile k-total">
                        <div class="kpi-label">Total Solutions</div>
                        <div class="kpi-value">{{ getTotalSolutions() }}</div>
                        <div class="kpi-sub">all statuses</div>
                    </div>
                    <div class="kpi-tile k-approve">
                        <div class="kpi-label">Approved</div>
                        <div class="kpi-value">{{ getTotalApproved() }}</div>
                        <div class="kpi-sub">ready to use</div>
                    </div>
                    <div class="kpi-tile k-pending">
                        <div class="kpi-label">Pending</div>
                        <div class="kpi-value">{{ getTotalPending() }}</div>
                        <div class="kpi-sub">awaiting review</div>
                    </div>
                    <div class="kpi-tile k-reject">
                        <div class="kpi-label">Rejected</div>
                        <div class="kpi-value">{{ getTotalRejected() }}</div>
                        <div class="kpi-sub">need revision</div>
                    </div>
                </div>
            </div>

            <!-- ── Filter Bar ── -->
            <div class="filter-bar">
                <span class="filter-bar-label"><i class="pi pi-filter" style="margin-right:4px;"></i>Filters</span>
                <div class="filter-divider"></div>

                <div class="filter-item">
                    <i class="pi pi-calendar"></i>
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

                <div class="filter-item">
                    <i class="pi pi-briefcase"></i>
                    <p-select
                        [options]="irmOptions"
                        [(ngModel)]="selectedIRM"
                        placeholder="All IRMs"
                        [showClear]="true"
                        (onChange)="applyFilters()"
                        styleClass="w-full"
                    />
                </div>

                <div class="search-wrap">
                    <i class="pi pi-search"></i>
                    <input
                        class="search-input"
                        type="text"
                        [(ngModel)]="searchText"
                        (input)="applyFilters()"
                        placeholder="Search name or ID…"
                    />
                </div>

                <button class="btn-clear-filter" (click)="clearFilters()">
                    <i class="pi pi-times"></i> Clear
                </button>
            </div>

            <!-- ── Content ── -->
            <div class="content">

                <!-- Loading -->
                <div *ngIf="loading" class="loading-overlay">
                    <div class="leaf-spinner"></div>
                    <div class="loading-text">Loading report data…</div>
                </div>

                <ng-container *ngIf="!loading">

                    <!-- Section: Charts -->
                    <div class="section-label"><i class="pi pi-chart-bar"></i> Analytics Overview</div>

                    <!-- Charts: 2 per row -->
                    <div class="charts-row">
                        <div class="chart-card accent-green">
                            <div class="chart-card-header">
                                <div class="chart-card-title">
                                    <div class="chart-icon green"><i class="pi pi-trophy"></i></div>
                                    Top Contributors
                                </div>
                                <span class="chart-badge badge-green">Stacked</span>
                            </div>
                            <p-chart type="bar" [data]="topContributorsChartData" [options]="barChartOptions" />
                        </div>

                        <div class="chart-card accent-orange">
                            <div class="chart-card-header">
                                <div class="chart-card-title">
                                    <div class="chart-icon orange"><i class="pi pi-calendar"></i></div>
                                    Monthly Trend
                                </div>
                                <span class="chart-badge badge-orange">Trend</span>
                            </div>
                            <p-chart type="bar" [data]="monthlySolutionsChartData" [options]="monthlyBarChartOptions" />
                        </div>

                        <div class="chart-card accent-purple" *ngIf="!selectedIRM">
                            <div class="chart-card-header">
                                <div class="chart-card-title">
                                    <div class="chart-icon purple"><i class="pi pi-sitemap"></i></div>
                                    Solutions by IRM
                                </div>
                                <span class="chart-badge badge-purple">Donut</span>
                            </div>
                            <p-chart type="doughnut" [data]="irmChartData" [options]="pieChartOptions" />
                        </div>

                        
                        <div class="chart-card accent-blue">
                            <div class="chart-card-header">
                                <div class="chart-card-title">
                                    <div class="chart-icon blue"><i class="pi pi-sign-in"></i></div>
                                    Login Activity
                                </div>
                                <span class="chart-badge badge-blue">By Logins</span>
                            </div>
                            <p-chart type="bar" [data]="loginActivityChartData" [options]="loginChartOptions" />
                        </div>
                    </div>

                    <!-- Section: Table -->
                    <div class="section-label"><i class="pi pi-table"></i> User Details</div>

                    <div class="table-card">
                        <div class="table-card-header">
                            <div class="table-card-title">
                                <i class="pi pi-users" style="color:#1c4535;"></i>
                                All Users
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
                                    <th pSortableColumn="name" style="min-width:200px;">User <p-sortIcon field="name" /></th>
                                    <th pSortableColumn="irm">IRM <p-sortIcon field="irm" /></th>
                                    <th pSortableColumn="login_count" class="text-center">Logins <p-sortIcon field="login_count" /></th>
                                    <th class="text-center">Last Login</th>
                                    <th pSortableColumn="total_solutions" class="text-center">Total <p-sortIcon field="total_solutions" /></th>
                                    <th pSortableColumn="approved" class="text-center">Approved <p-sortIcon field="approved" /></th>
                                    <th pSortableColumn="pending" class="text-center">Pending <p-sortIcon field="pending" /></th>
                                    <th pSortableColumn="rejected" class="text-center">Rejected <p-sortIcon field="rejected" /></th>
                                    <th class="text-center">Actions</th>
                                </tr>
                            </ng-template>

                            <ng-template pTemplate="body" let-user let-rowIndex="rowIndex">
                                <tr>
                                    <td>
                                        <div class="user-cell">
                                            <div class="avatar" [ngClass]="'avatar-' + (rowIndex % 5)">{{ getInitials(user.name) }}</div>
                                            <div>
                                                <div class="user-name">{{ user.name }}</div>
                                                <div class="user-id">{{ user.yash_id }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="irm-tag">{{ user.irm || 'N/A' }}</span></td>
                                    <td class="text-center">
                                        <span class="login-badge"><i class="pi pi-sign-in"></i>{{ user.login_count }}</span>
                                    </td>
                                    <td class="text-center"><span class="date-text">{{ formatDateOnly(user.last_login) }}</span></td>
                                    <td class="text-center"><span class="num-total">{{ user.total_solutions }}</span></td>
                                    <td class="text-center"><span class="num-badge approved">{{ user.approved }}</span></td>
                                    <td class="text-center"><span class="num-badge pending">{{ user.pending }}</span></td>
                                    <td class="text-center"><span class="num-badge rejected">{{ user.rejected }}</span></td>
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
                    <div style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.3rem; color:#fff;">
                        Solutions — {{ selectedUser?.name }}
                    </div>
                    <div style="font-size: 0.82rem; opacity: 0.7; color:#fff;">
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
            labels: top.map(s => s.name.split(' ')[0]),
            datasets: [
                { label: 'Approved', data: top.map(s => s.approved),  backgroundColor: '#22c55e', borderRadius: 4 },
                { label: 'Pending',  data: top.map(s => s.pending),   backgroundColor: '#f59e0b', borderRadius: 4 },
                { label: 'Rejected', data: top.map(s => s.rejected),  backgroundColor: '#ef4444', borderRadius: 4 }
            ]
        };
    }

    updateLoginActivityChart() {
        const top = [...this.filteredStats].sort((a, b) => b.login_count - a.login_count).slice(0, 10);
        const blueGradientColors = ['#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#1d4ed8','#2563eb','#3b82f6','#60a5fa'];
        this.loginActivityChartData = {
            labels: top.map(s => s.name.split(' ')[0]),
            datasets: [{
                label: 'Logins',
                data: top.map(s => s.login_count),
                backgroundColor: blueGradientColors.slice(0, top.length),
                borderRadius: 5,
                borderSkipped: false
            }]
        };
    }

    updateIRMChart() {
        const groups = new Map<string, number>();
        this.filteredStats.forEach(s => { const k = s.irm || 'N/A'; groups.set(k, (groups.get(k) || 0) + s.total_solutions); });
        const sorted = Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);
        const palette = ['#6d28d9','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#4c1d95','#5b21b6'];
        const hoverPalette = ['#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe','#5b21b6','#6d28d9'];
        this.irmChartData = {
            labels: sorted.map(([k]) => k),
            datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: palette, hoverBackgroundColor: hoverPalette, borderWidth: 2, borderColor: '#ffffff' }]
        };
    }

    updateMonthlySolutionsChart() {
        const monthly = new Map<string, number>();
    // Use solutions directly from filteredStats so all active filters are respected
    this.filteredStats.forEach(stat => {
        stat.solutions.forEach(s => {
            if (s.created_at) {
                const d = new Date(s.created_at);
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthly.set(k, (monthly.get(k) || 0) + 1);
            }
        });
    });
        const sorted = Array.from(monthly.keys()).sort();
        const orangeShades = sorted.map((_, i) => {
            const opacity = 0.5 + (i / Math.max(sorted.length - 1, 1)) * 0.5;
            return `rgba(234, 88, 12, ${opacity})`;
        });
        this.monthlySolutionsChartData = {
            labels: sorted.map(mv => { const [y, m] = mv.split('-'); return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }),
            datasets: [{
                label: 'Solutions Added',
                data: sorted.map(k => monthly.get(k) || 0),
                backgroundColor: orangeShades,
                borderColor: '#c2410c',
                borderWidth: 1,
                borderRadius: 5,
                borderSkipped: false
            }]
        };
    }

    initializeChartOptions() {
        const tooltipBase = {
            backgroundColor: 'rgba(15,23,42,0.92)',
            padding: 12,
            titleFont: { size: 11, weight: '700' },
            bodyFont: { size: 10 },
            cornerRadius: 8,
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1'
        };
        const legendBase = {
            display: true,
            position: 'top' as const,
            labels: { usePointStyle: true, padding: 12, font: { size: 10, weight: '600' }, color: '#475569', pointStyleWidth: 8 }
        };
        const axisStyle = {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94a3b8', maxRotation: 35 } },
            y: { beginAtZero: true, ticks: { precision: 0, font: { size: 9 }, color: '#94a3b8' }, grid: { color: '#f1f5f9' } }
        };
        this.barChartOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: legendBase, tooltip: tooltipBase },
            scales: {
                x: { ...axisStyle.x, stacked: true },
                y: { ...axisStyle.y, stacked: true }
            }
        };
        this.loginChartOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { ...tooltipBase, callbacks: { title: (i: any[]) => i[0].label, label: (i: any) => ` ${i.raw} logins` } } },
            scales: axisStyle
        };
        this.pieChartOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { ...legendBase, position: 'bottom' as const, labels: { ...legendBase.labels, padding: 14 } },
                tooltip: tooltipBase
            },
            cutout: '62%'
        };
        this.monthlyBarChartOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: tooltipBase },
            scales: axisStyle
        };
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
            const wb = XLSX.utils.book_new();

            // ── Shared style helpers ──────────────────────────────────────────
            const headerStyle = (bgHex: string) => ({
                font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: bgHex } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                border: {
                    top:    { style: 'thin', color: { rgb: 'FFFFFF' } },
                    bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
                    left:   { style: 'thin', color: { rgb: 'FFFFFF' } },
                    right:  { style: 'thin', color: { rgb: 'FFFFFF' } }
                }
            });

            const cellStyle = (bgHex: string, fgHex = '1A3D2E', bold = false) => ({
                font: { bold, color: { rgb: fgHex }, sz: 10, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: bgHex } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top:    { style: 'hair', color: { rgb: 'C8DDD1' } },
                    bottom: { style: 'hair', color: { rgb: 'C8DDD1' } },
                    left:   { style: 'hair', color: { rgb: 'C8DDD1' } },
                    right:  { style: 'hair', color: { rgb: 'C8DDD1' } }
                }
            });

            const leftCellStyle = (bgHex: string, fgHex = '1A3D2E', bold = false) => ({
                ...cellStyle(bgHex, fgHex, bold),
                alignment: { horizontal: 'left', vertical: 'center' }
            });

            // ── SHEET 1: User Summary ────────────────────────────────────────
            const s1Headers = ['User ID', 'Name', 'Email', 'IRM', 'Logins', 'Last Login', 'Total', 'Approved', 'Pending', 'Rejected'];
            const s1HeaderBg = '1C4535'; // forest green

            const s1Rows = this.filteredStats.map((s, i) => {
                const rowBg = i % 2 === 0 ? 'F4F7F5' : 'E3F2EB'; // alternating cream / light mint
                return [
                    { v: s.yash_id,                        s: leftCellStyle(rowBg) },
                    { v: s.name,                           s: leftCellStyle(rowBg, '1A3D2E', true) },
                    { v: s.email || '',                    s: leftCellStyle(rowBg) },
                    { v: s.irm || 'N/A',                   s: cellStyle(rowBg) },
                    { v: s.login_count,                    s: cellStyle(rowBg, '1565C0', true) },
                    { v: this.formatDateOnly(s.last_login), s: cellStyle(rowBg) },
                    { v: s.total_solutions,                s: cellStyle(rowBg, '2E7D52', true) },
                    { v: s.approved,                       s: cellStyle(s.approved  > 0 ? 'E8F5E9' : rowBg, '1B5E20', true) },
                    { v: s.pending,                        s: cellStyle(s.pending   > 0 ? 'FFF8E1' : rowBg, 'E65100', true) },
                    { v: s.rejected,                       s: cellStyle(s.rejected  > 0 ? 'FFEBEE' : rowBg, 'B71C1C', true) },
                ];
            });

            const ws1 = this.buildStyledSheet(
                s1Headers.map(h => ({ v: h, s: headerStyle(s1HeaderBg) })),
                s1Rows,
                [12, 22, 28, 14, 9, 14, 9, 11, 11, 11]
            );

            // Title row above headers
            this.addTitleRow(ws1, 'User Activity Report — Summary', s1Headers.length, '1C4535');
            XLSX.utils.book_append_sheet(wb, ws1, 'User Summary');

            // ── SHEET 2: Detailed Solutions ──────────────────────────────────
            const s2Headers = ['User ID', 'Name', 'IRM', 'Customer', 'Module', 'Domain', 'Sector', 'Created', 'Status', 'Approver', 'Approval Date'];
            const s2HeaderBg = '245C41'; // pine green

            const statusColor = (status: string) => {
                const s = status?.toLowerCase();
                if (s === 'approved')          return { bg: 'E8F5E9', fg: '1B5E20' };
                if (s === 'rejected')          return { bg: 'FFEBEE', fg: 'B71C1C' };
                return                                { bg: 'FFF8E1', fg: 'E65100' }; // pending
            };

            const s2Rows = this.filteredStats.flatMap((s, ui) =>
                s.solutions.map((sol, si) => {
                    const rowBg = (ui + si) % 2 === 0 ? 'F4F7F5' : 'EBF5EF';
                    const sc = statusColor(sol.Approval_status);
                    return [
                        { v: s.yash_id,                          s: leftCellStyle(rowBg) },
                        { v: s.name,                             s: leftCellStyle(rowBg, '1A3D2E', true) },
                        { v: s.irm || 'N/A',                     s: cellStyle(rowBg, '2E7D52') },
                        { v: sol.customer_name || '',            s: leftCellStyle(rowBg) },
                        { v: sol.module_name || '',              s: leftCellStyle(rowBg) },
                        { v: sol.domain || '',                   s: cellStyle(rowBg) },
                        { v: sol.sector || '',                   s: cellStyle(rowBg) },
                        { v: this.formatDate(sol.created_at),    s: cellStyle(rowBg) },
                        { v: sol.Approval_status || 'Pending',   s: cellStyle(sc.bg, sc.fg, true) },
                        { v: sol.Approver || 'N/A',              s: leftCellStyle(rowBg) },
                        { v: sol.Approval_date || 'N/A',         s: cellStyle(rowBg) },
                    ];
                })
            );

            const ws2 = this.buildStyledSheet(
                s2Headers.map(h => ({ v: h, s: headerStyle(s2HeaderBg) })),
                s2Rows,
                [12, 20, 14, 22, 26, 14, 14, 18, 14, 22, 14]
            );

            this.addTitleRow(ws2, 'User Activity Report — Detailed Solutions', s2Headers.length, '245C41');
            XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Solutions');

            // ── Write & Download ─────────────────────────────────────────────
            const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([out], { type: 'application/octet-stream' }), `User_Activity_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'Report downloaded successfully' });
        } catch (err) {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Export failed' });
        }
    }

    /** Build a worksheet from a header row + data rows, with column widths */
    private buildStyledSheet(headers: any[], rows: any[][], colWidths: number[]): any {
        const ws: any = {};
        const R_OFFSET = 2; // row 0 = title, row 1 = headers, rows start at 2

        // Write headers at row index 1 (after title)
        headers.forEach((cell, c) => {
            const addr = XLSX.utils.encode_cell({ r: 1, c });
            ws[addr] = cell;
        });

        // Write data rows
        rows.forEach((row, r) => {
            row.forEach((cell, c) => {
                const addr = XLSX.utils.encode_cell({ r: r + R_OFFSET, c });
                ws[addr] = cell;
            });
        });

        ws['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: rows.length + R_OFFSET, c: headers.length - 1 });
        ws['!cols'] = colWidths.map(w => ({ wch: w }));
        ws['!rows'] = [{ hpt: 30 }, { hpt: 22 }, ...rows.map(() => ({ hpt: 18 }))];
        return ws;
    }

    /** Insert a merged title cell at row 0 with a dark green banner */
    private addTitleRow(ws: any, title: string, colCount: number, bgHex: string): void {
        const addr = XLSX.utils.encode_cell({ r: 0, c: 0 });
        ws[addr] = {
            v: title,
            s: {
                font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: bgHex } },
                alignment: { horizontal: 'left', vertical: 'center' }
            }
        };
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } });
    }
}