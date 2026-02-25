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
            background: #f0f4f3;
        }

        .report-container {
            max-width: 1800px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Knowledge Repository Color Scheme */
        .primary-color { color: #2d5f4f; }
        .secondary-color { color: #3a7a63; }
        .accent-color { color: #4caf50; }
        .success-color { color: #4caf50; }
        .warning-color { color: #ff9800; }
        .danger-color { color: #f44336; }

        /* Header Section */
        .report-header {
            background: linear-gradient(135deg, #2d5f4f 0%, #3a7a63 100%);
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(45, 95, 79, 0.15);
            margin-bottom: 2rem;
            color: white;
        }

        .report-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .report-title i {
            font-size: 2.25rem;
        }

        .report-subtitle {
            font-size: 1rem;
            opacity: 0.95;
            margin: 0;
        }

        /* Filters Section */
        .filters-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
            border-left: 4px solid #3a7a63;
        }

        .filters-header {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d5f4f;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-label {
            font-weight: 600;
            color: #2d5f4f;
            font-size: 0.9rem;
        }

        .filter-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            flex-wrap: wrap;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-left: 4px solid transparent;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-card.users { border-left-color: #2d5f4f; }
        .stat-card.total { border-left-color: #3a7a63; }
        .stat-card.approved { border-left-color: #4caf50; }
        .stat-card.pending { border-left-color: #ff9800; }
        .stat-card.rejected { border-left-color: #f44336; }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .stat-card.users .stat-icon { background: rgba(45, 95, 79, 0.1); color: #2d5f4f; }
        .stat-card.total .stat-icon { background: rgba(58, 122, 99, 0.1); color: #3a7a63; }
        .stat-card.approved .stat-icon { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
        .stat-card.pending .stat-icon { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
        .stat-card.rejected .stat-icon { background: rgba(244, 67, 54, 0.1); color: #f44336; }

        .stat-label {
            font-size: 0.85rem;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1;
        }

        .stat-card.users .stat-value { color: #2d5f4f; }
        .stat-card.total .stat-value { color: #3a7a63; }
        .stat-card.approved .stat-value { color: #4caf50; }
        .stat-card.pending .stat-value { color: #ff9800; }
        .stat-card.rejected .stat-value { color: #f44336; }

        /* Charts Section */
        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .chart-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            border-left: 4px solid #3a7a63;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f4f3;
        }

        .chart-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d5f4f;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .chart-title i {
            color: #3a7a63;
        }

        /* Table Section */
        .table-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            border-left: 4px solid #3a7a63;
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f4f3;
        }

        .table-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d5f4f;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .table-count {
            background: #3a7a63;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            background: linear-gradient(135deg, #2d5f4f 0%, #3a7a63 100%);
            color: white;
            font-weight: 600;
            padding: 1rem;
            border: none;
            font-size: 0.9rem;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #f0f4f3;
            vertical-align: middle;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr {
            transition: background-color 0.2s ease;
        }

        ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
            background: #f0f4f3;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2d5f4f, #3a7a63);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.95rem;
        }

        .user-details {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            color: #2d5f4f;
            font-size: 0.95rem;
        }

        .user-id {
            font-size: 0.8rem;
            color: #666;
        }

        /* Progress Bar */
        .progress-bar-container {
            width: 100%;
            height: 28px;
            background: #f0f4f3;
            border-radius: 14px;
            overflow: visible;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .progress-bar {
            height: 100%;
            display: flex;
            border-radius: 14px;
            overflow: hidden;
        }

        .progress-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            color: white;
            transition: all 0.3s ease;
            position: relative;
            min-width: 2px;
        }

        .progress-segment::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            margin-bottom: 0.5rem;
            z-index: 10;
        }

        .progress-segment:hover::after {
            opacity: 1;
        }

        .progress-segment.approved { background: linear-gradient(135deg, #4caf50, #45a049); }
        .progress-segment.pending { background: linear-gradient(135deg, #ff9800, #fb8c00); }
        .progress-segment.rejected { background: linear-gradient(135deg, #f44336, #e53935); }

        /* Small count badge for progress segments */
        .progress-count-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 18px;
            text-align: center;
            z-index: 5;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Badge Styles */
        ::ng-deep .p-tag {
            font-weight: 600;
            padding: 0.4rem 0.9rem;
            font-size: 0.8rem;
            border-radius: 20px;
        }

        /* Loading State */
        .loading-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #666;
        }

        .loading-spinner {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 4px solid #f0f4f3;
            border-top: 4px solid #3a7a63;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d5f4f;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #999;
        }

        .empty-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            display: block;
            color: #ddd;
        }

        .empty-state p {
            font-size: 1.1rem;
            margin: 0;
        }

        /* Dialog Styles */
        .solutions-dialog ::ng-deep .p-dialog {
            max-width: 95vw;
            width: 1400px;
        }

        .solutions-dialog ::ng-deep .p-dialog-header {
            background: linear-gradient(135deg, #2d5f4f 0%, #3a7a63 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px 12px 0 0;
        }

        .solutions-dialog ::ng-deep .p-dialog-header .p-dialog-title {
            font-size: 1.4rem;
            font-weight: 700;
        }

        .solutions-dialog ::ng-deep .p-dialog-content {
            padding: 0;
        }

        /* Login Badge */
        .login-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #e3f2fd;
            color: #1976d2;
            padding: 0.3rem 0.8rem;
            border-radius: 16px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .login-badge i {
            font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .report-container {
                padding: 1rem;
            }

            .report-title {
                font-size: 1.5rem;
            }

            .filters-grid {
                grid-template-columns: 1fr;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .filter-actions {
                flex-direction: column;
            }

            .filter-actions button {
                width: 100%;
            }
        }

        /* Chart Container */
        ::ng-deep .p-chart {
            height: 350px;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f0f4f3;
        }

        ::-webkit-scrollbar-thumb {
            background: #3a7a63;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #2d5f4f;
        }

        /* Custom Button Styles */
        ::ng-deep .p-button.p-button-success {
            background: #4caf50;
            border-color: #4caf50;
        }

        ::ng-deep .p-button.p-button-success:hover {
            background: #45a049;
            border-color: #45a049;
        }
    `,
    template: `
        <p-toast />
        <div class="report-container">
            
            <!-- Header -->
            <div class="report-header">
                <h1 class="report-title">
                    <i class="pi pi-users"></i>
                    User Activity & Solutions Report
                </h1>
                <p class="report-subtitle">
                    Track user contributions, login activity, and solution performance metrics
                </p>
            </div>

            <!-- Filters -->
            <div class="filters-section">
                <div class="filters-header">
                    <i class="pi pi-filter"></i>
                    Filter Options
                </div>
                <div class="filters-grid">
                    <div class="filter-group">
                        <label class="filter-label">
                            <i class="pi pi-calendar"></i> Filter by Month
                        </label>
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

                    <div class="filter-group">
                        <label class="filter-label">
                            <i class="pi pi-user-plus"></i> Filter by IRM
                        </label>
                        <p-select
                            [options]="irmOptions"
                            [(ngModel)]="selectedIRM"
                            placeholder="All IRMs"
                            [showClear]="true"
                            (onChange)="applyFilters()"
                            styleClass="w-full"
                        />
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">
                            <i class="pi pi-search"></i> Search User
                        </label>
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="searchText"
                            (input)="applyFilters()"
                            placeholder="Search by name or ID..."
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="filter-actions">
                    <p-button
                        label="Clear Filters"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        [outlined]="true"
                        (onClick)="clearFilters()"
                    />
                    <p-button
                        label="Export to Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        (onClick)="exportToExcel()"
                        [disabled]="loading || filteredStats.length === 0"
                    />
                </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading user data...</p>
            </div>

            <!-- Report Content -->
            <ng-container *ngIf="!loading">
                
                <!-- Summary Stats -->
                <div class="stats-grid">
                    <div class="stat-card users">
                        <div class="stat-header">
                            <div>
                                <div class="stat-label">Active Users</div>
                                <div class="stat-value">{{ filteredStats.length }}</div>
                            </div>
                            <div class="stat-icon">
                                <i class="pi pi-users"></i>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card total">
                        <div class="stat-header">
                            <div>
                                <div class="stat-label">Total Solutions</div>
                                <div class="stat-value">{{ getTotalSolutions() }}</div>
                            </div>
                            <div class="stat-icon">
                                <i class="pi pi-box"></i>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card approved">
                        <div class="stat-header">
                            <div>
                                <div class="stat-label">Approved</div>
                                <div class="stat-value">{{ getTotalApproved() }}</div>
                            </div>
                            <div class="stat-icon">
                                <i class="pi pi-check-circle"></i>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card pending">
                        <div class="stat-header">
                            <div>
                                <div class="stat-label">Pending</div>
                                <div class="stat-value">{{ getTotalPending() }}</div>
                            </div>
                            <div class="stat-icon">
                                <i class="pi pi-clock"></i>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card rejected">
                        <div class="stat-header">
                            <div>
                                <div class="stat-label">Rejected</div>
                                <div class="stat-value">{{ getTotalRejected() }}</div>
                            </div>
                            <div class="stat-icon">
                                <i class="pi pi-times-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="charts-section">
                    <!-- Top Contributors -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="pi pi-trophy"></i>
                                Top 10 Contributors
                            </div>
                        </div>
                        <p-chart type="bar" [data]="topContributorsChartData" [options]="barChartOptions" />
                    </div>

                    <!-- Top Active Users (by login) -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="pi pi-chart-line"></i>
                                Most Active Users (Logins)
                            </div>
                        </div>
                        <p-chart type="bar" [data]="loginActivityChartData" [options]="loginChartOptions" />
                    </div>

                    <!-- IRM-wise Distribution -->
                    <div class="chart-card" *ngIf="!selectedIRM">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="pi pi-sitemap"></i>
                                Solutions by IRM
                            </div>
                        </div>
                        <p-chart type="pie" [data]="irmChartData" [options]="pieChartOptions" />
                    </div>

                    <!-- Monthly Solutions Added -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div class="chart-title">
                                <i class="pi pi-calendar"></i>
                                Monthly Solutions Added
                            </div>
                        </div>
                        <p-chart type="bar" [data]="monthlySolutionsChartData" [options]="monthlyBarChartOptions" />
                    </div>
                </div>

                <!-- User Statistics Table -->
                <div class="table-section">
                    <div class="table-header">
                        <div class="table-title">
                            <i class="pi pi-table"></i>
                            User Details
                            <span class="table-count">{{ filteredStats.length }}</span>
                        </div>
                        <div class="action-buttons">
                            <p-button
                                label="Refresh"
                                icon="pi pi-refresh"
                                [outlined]="true"
                                size="small"
                                (onClick)="loadReportData()"
                            />
                        </div>
                    </div>

                    <p-table
                        [value]="filteredStats"
                        [paginator]="true"
                        [rows]="10"
                        [rowsPerPageOptions]="[10, 25, 50, 100]"
                        [showCurrentPageReport]="true"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                        responsiveLayout="scroll"
                        [globalFilterFields]="['name', 'yash_id', 'email', 'irm']"
                    >
                        <ng-template pTemplate="header">
                            <tr>
                                <th pSortableColumn="name" style="min-width: 200px;">
                                    User <p-sortIcon field="name" />
                                </th>
                                <th pSortableColumn="irm">
                                    IRM <p-sortIcon field="irm" />
                                </th>
                                <th pSortableColumn="login_count" class="text-center">
                                    Login Count <p-sortIcon field="login_count" />
                                </th>
                                <th class="text-center">Last Login</th>
                                <th pSortableColumn="total_solutions" class="text-center">
                                    Total <p-sortIcon field="total_solutions" />
                                </th>
                                <th style="min-width: 250px;">Status Breakdown</th>
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
                                    <div class="user-info">
                                        <div class="user-avatar">
                                            {{ getInitials(user.name) }}
                                        </div>
                                        <div class="user-details">
                                            <div class="user-name">{{ user.name }}</div>
                                            <div class="user-id">{{ user.yash_id }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <p-tag [value]="user.irm || 'N/A'" severity="info" />
                                </td>
                                <td class="text-center">
                                    <div class="login-badge">
                                        <i class="pi pi-sign-in"></i>
                                        {{ user.login_count }}
                                    </div>
                                </td>
                                <td class="text-center">
                                    <span style="font-size: 0.85rem; color: #666;">
                                        {{ formatDateOnly(user.last_login) }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <strong style="font-size: 1.1rem; color: #3a7a63;">{{ user.total_solutions }}</strong>
                                </td>
                                <td>
                                    <div class="progress-bar-container" *ngIf="user.total_solutions > 0">
                                        <div class="progress-bar">
                                            <div
                                                class="progress-segment approved"
                                                [style.width.%]="(user.approved / user.total_solutions) * 100"
                                                [attr.data-tooltip]="'Approved: ' + user.approved"
                                            >
                                                <span *ngIf="(user.approved / user.total_solutions) * 100 > 8">
                                                    {{ user.approved }}
                                                </span>
                                                <div class="progress-count-badge" *ngIf="user.approved > 0 && (user.approved / user.total_solutions) * 100 <= 8">
                                                    {{ user.approved }}
                                                </div>
                                            </div>
                                            <div
                                                class="progress-segment pending"
                                                [style.width.%]="(user.pending / user.total_solutions) * 100"
                                                [attr.data-tooltip]="'Pending: ' + user.pending"
                                            >
                                                <span *ngIf="(user.pending / user.total_solutions) * 100 > 8">
                                                    {{ user.pending }}
                                                </span>
                                                <div class="progress-count-badge" *ngIf="user.pending > 0 && (user.pending / user.total_solutions) * 100 <= 8">
                                                    {{ user.pending }}
                                                </div>
                                            </div>
                                            <div
                                                class="progress-segment rejected"
                                                [style.width.%]="(user.rejected / user.total_solutions) * 100"
                                                [attr.data-tooltip]="'Rejected: ' + user.rejected"
                                            >
                                                <span *ngIf="(user.rejected / user.total_solutions) * 100 > 8">
                                                    {{ user.rejected }}
                                                </span>
                                                <div class="progress-count-badge" *ngIf="user.rejected > 0 && (user.rejected / user.total_solutions) * 100 <= 8">
                                                    {{ user.rejected }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <p-tag [value]="user.approved.toString()" severity="success" />
                                </td>
                                <td class="text-center">
                                    <p-tag [value]="user.pending.toString()" severity="warning" />
                                </td>
                                <td class="text-center">
                                    <p-tag [value]="user.rejected.toString()" severity="danger" />
                                </td>
                                <td class="text-center">
                                    <p-button
                                        icon="pi pi-eye"
                                        label="View"
                                        size="small"
                                        [outlined]="true"
                                        (onClick)="viewUserSolutions(user)"
                                    />
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="10">
                                    <div class="empty-state">
                                        <i class="pi pi-inbox"></i>
                                        <p>No user data found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>

            </ng-container>

            <!-- Solutions Dialog -->
            <p-dialog
                [(visible)]="showSolutionsDialog"
                [modal]="true"
                [style]="{ width: '90vw' }"
                [draggable]="false"
                [resizable]="false"
                styleClass="solutions-dialog"
            >
                <ng-template pTemplate="header">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0;">
                            Solutions by {{ selectedUser?.name }}
                        </h3>
                        <div style="font-size: 0.95rem; opacity: 0.9;">
                            {{ selectedUser?.yash_id }} • {{ selectedUser?.total_solutions }} Solutions • {{ selectedUser?.login_count }} Logins
                        </div>
                    </div>
                </ng-template>

                <p-table
                    [value]="selectedUser?.solutions || []"
                    [paginator]="true"
                    [rows]="5"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} solutions"
                    responsiveLayout="scroll"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Customer Name</th>
                            <th>Module</th>
                            <th>Domain</th>
                            <th>Sector</th>
                            <th>Created Date</th>
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

        </div>
    `
})
export class UserWiseReportComponent implements OnInit {
    loading = true;
    userStats: UserStats[] = [];
    filteredStats: UserStats[] = [];
    allSolutions: any[] = [];
    loginHistory: any[] = [];
    
    // Filters
    selectedMonth: string = '';
    selectedIRM: string = '';
    searchText: string = '';
    
    monthOptions: MonthOption[] = [];
    irmOptions: string[] = [];

    // Dialog
    showSolutionsDialog = false;
    selectedUser: UserStats | null = null;

    // Chart data
    topContributorsChartData: any;
    loginActivityChartData: any;
    irmChartData: any;
    monthlySolutionsChartData: any;

    // Chart options
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
        console.log('UserWiseReportComponent initialized');
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
        console.log('Starting to load report data...');
        
        forkJoin({
            users: this.adminService.getUsers(),
            repos: this.repoService.get_allrepos(),
            loginHistory: this.repoService.get_log_records()
        }).subscribe({
            next: (data: any) => {
                console.log('Data loaded successfully');
                
                this.allSolutions = Array.isArray(data.repos) ? data.repos : [];
                const usersData = Array.isArray(data.users) ? data.users : [];
                this.loginHistory = Array.isArray(data.loginHistory) ? data.loginHistory : [];
                
                console.log(`Loaded: ${usersData.length} users, ${this.allSolutions.length} solutions, ${this.loginHistory.length} login records`);

                // Filter to only include users with type: 'user'
                const regularUsers = usersData.filter((user: any) => 
                    user.type && user.type.toLowerCase() === 'user'
                );
                console.log(`Filtered to ${regularUsers.length} regular users`);

                this.userStats = this.processUserStats(regularUsers, this.allSolutions);
                console.log('Processed user stats:', this.userStats);

                this.generateMonthOptions();
                this.generateIRMOptions();

                this.applyFilters();

                this.loading = false;
                
                if (this.userStats.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'No Data',
                        detail: 'No user data available for reporting'
                    });
                }
            },
            error: (error) => {
                console.error('Error loading report data:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load report data'
                });
                this.loading = false;
            }
        });
    }

    processUserStats(users: any[], solutions: any[]): UserStats[] {
        return users.map((user) => {
            const userSolutions = solutions.filter(s => 
                s.yash_id === user.yash_id || s.username === user.name
            );
            
            const approved = userSolutions.filter(s => 
                s.Approval_status && s.Approval_status.toLowerCase() === 'approved'
            ).length;
            
            const pending = userSolutions.filter(s => 
                !s.Approval_status || s.Approval_status.toLowerCase() === 'sent for approval'
            ).length;
            
            const rejected = userSolutions.filter(s => 
                s.Approval_status && s.Approval_status.toLowerCase() === 'rejected'
            ).length;
            
            const total = userSolutions.length;
            
            // Calculate login count and last login from log records
            const userLogins = this.loginHistory.filter(login => {
                const loginYashId = String(login.yash_id || '');
                const userYashId = String(user.yash_id || '');
                const matchesByYashId = loginYashId === userYashId;
                const matchesByUsername = login.username === user.name;
                const matchesUser = matchesByYashId || matchesByUsername;
                const isSuccessful = login.success === true || 
                                   login.message === 'Login successful' ||
                                   login.status === 'success';
                
                return matchesUser && isSuccessful;
            });
            
            const loginCount = userLogins.length;
            
            let lastLogin = 'Never';
            if (userLogins.length > 0) {
                const sortedLogins = [...userLogins].sort((a, b) => {
                    const dateA = new Date(a.timestamp || a.login_time || a.created_at || 0);
                    const dateB = new Date(b.timestamp || b.login_time || b.created_at || 0);
                    return dateB.getTime() - dateA.getTime();
                });
                lastLogin = sortedLogins[0].timestamp || 
                          sortedLogins[0].login_time || 
                          sortedLogins[0].created_at || 
                          'Never';
            }
            
            return {
                yash_id: user.yash_id,
                name: user.name,
                email: user.email || '',
                b_unit: user.b_unit || 'N/A',
                irm: user.irm || 'N/A',
                type: user.type || 'user',
                total_solutions: total,
                approved: approved,
                pending: pending,
                rejected: rejected,
                login_count: loginCount,
                last_login: lastLogin,
                solutions: userSolutions
            };
        }).filter(stat => stat.total_solutions > 0 || stat.login_count > 0);
    }

    generateMonthOptions() {
        const months = new Set<string>();
        this.allSolutions.forEach(solution => {
            if (solution.created_at) {
                const date = new Date(solution.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                months.add(monthYear);
            }
        });

        this.monthOptions = Array.from(months)
            .sort()
            .reverse()
            .map(monthYear => {
                const [year, month] = monthYear.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1)
                    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return { label: monthName, value: monthYear };
            });
    }

    generateIRMOptions() {
        const irms = new Set<string>();
        this.userStats.forEach(stat => {
            if (stat.irm && stat.irm !== 'N/A') {
                irms.add(stat.irm);
            }
        });
        this.irmOptions = Array.from(irms).sort();
    }

    applyFilters() {
        let filtered = [...this.userStats];

        // Filter by IRM
        if (this.selectedIRM) {
            filtered = filtered.filter(stat => stat.irm === this.selectedIRM);
        }

        // Filter by search text
        if (this.searchText && this.searchText.trim()) {
            const search = this.searchText.trim().toLowerCase();
            filtered = filtered.filter(stat =>
                (stat.name && stat.name.toLowerCase().includes(search)) ||
                (stat.yash_id && stat.yash_id.toString().toLowerCase().includes(search)) ||
                (stat.email && stat.email.toLowerCase().includes(search)) ||
                (stat.irm && stat.irm.toLowerCase().includes(search))
            );
        }

        // Filter by month
        if (this.selectedMonth) {
            filtered = filtered.map(stat => {
                const filteredSolutions = stat.solutions.filter(solution => {
                    if (!solution.created_at) return false;
                    const date = new Date(solution.created_at);
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    return monthYear === this.selectedMonth;
                });

                const approved = filteredSolutions.filter(s => 
                    s.Approval_status && s.Approval_status.toLowerCase() === 'approved'
                ).length;
                
                const pending = filteredSolutions.filter(s => 
                    !s.Approval_status || s.Approval_status.toLowerCase() === 'sent for approval'
                ).length;
                
                const rejected = filteredSolutions.filter(s => 
                    s.Approval_status && s.Approval_status.toLowerCase() === 'rejected'
                ).length;
                
                const total = filteredSolutions.length;

                // Filter login count by month
                const filteredLoginCount = this.loginHistory.filter(login => {
                    const loginYashId = String(login.yash_id || '');
                    const userYashId = String(stat.yash_id || '');
                    const matchesByYashId = loginYashId === userYashId;
                    const matchesByUsername = login.username === stat.name;
                    const matchesUser = matchesByYashId || matchesByUsername;
                    const isSuccessful = login.success === true || 
                                       login.message === 'Login successful' ||
                                       login.status === 'success';
                    
                    if (!matchesUser || !isSuccessful) return false;
                    
                    // Check if login is in selected month
                    const loginTimestamp = login.timestamp || login.login_time || login.created_at;
                    if (!loginTimestamp) return false;
                    
                    const loginDate = new Date(loginTimestamp);
                    const loginMonthYear = `${loginDate.getFullYear()}-${String(loginDate.getMonth() + 1).padStart(2, '0')}`;
                    return loginMonthYear === this.selectedMonth;
                }).length;

                // Update last login based on filtered month
                let filteredLastLogin = 'Never';
                const monthLogins = this.loginHistory.filter(login => {
                    const loginYashId = String(login.yash_id || '');
                    const userYashId = String(stat.yash_id || '');
                    const matchesByYashId = loginYashId === userYashId;
                    const matchesByUsername = login.username === stat.name;
                    const matchesUser = matchesByYashId || matchesByUsername;
                    const isSuccessful = login.success === true || 
                                       login.message === 'Login successful' ||
                                       login.status === 'success';
                    
                    if (!matchesUser || !isSuccessful) return false;
                    
                    const loginTimestamp = login.timestamp || login.login_time || login.created_at;
                    if (!loginTimestamp) return false;
                    
                    const loginDate = new Date(loginTimestamp);
                    const loginMonthYear = `${loginDate.getFullYear()}-${String(loginDate.getMonth() + 1).padStart(2, '0')}`;
                    return loginMonthYear === this.selectedMonth;
                });

                if (monthLogins.length > 0) {
                    const sortedMonthLogins = [...monthLogins].sort((a, b) => {
                        const dateA = new Date(a.timestamp || a.login_time || a.created_at || 0);
                        const dateB = new Date(b.timestamp || b.login_time || b.created_at || 0);
                        return dateB.getTime() - dateA.getTime();
                    });
                    filteredLastLogin = sortedMonthLogins[0].timestamp || 
                                      sortedMonthLogins[0].login_time || 
                                      sortedMonthLogins[0].created_at || 
                                      'Never';
                }

                return {
                    ...stat,
                    total_solutions: total,
                    approved: approved,
                    pending: pending,
                    rejected: rejected,
                    login_count: filteredLoginCount,
                    last_login: filteredLastLogin,
                    solutions: filteredSolutions
                };
            }).filter(stat => stat.total_solutions > 0 || stat.login_count > 0);
        }

        this.filteredStats = filtered.sort((a, b) => b.total_solutions - a.total_solutions);
        this.updateCharts();
    }

    getTotalSolutions(): number {
        return this.filteredStats.reduce((sum, stat) => sum + stat.total_solutions, 0);
    }

    getTotalApproved(): number {
        return this.filteredStats.reduce((sum, stat) => sum + stat.approved, 0);
    }

    getTotalPending(): number {
        return this.filteredStats.reduce((sum, stat) => sum + stat.pending, 0);
    }

    getTotalRejected(): number {
        return this.filteredStats.reduce((sum, stat) => sum + stat.rejected, 0);
    }

    updateCharts() {
        this.updateTopContributorsChart();
        this.updateLoginActivityChart();
        this.updateIRMChart();
        this.updateMonthlySolutionsChart();
    }

    updateTopContributorsChart() {
        const top10 = [...this.filteredStats].slice(0, 10);
        
        this.topContributorsChartData = {
            labels: top10.map(stat => stat.name),
            datasets: [
                {
                    label: 'Approved',
                    data: top10.map(stat => stat.approved),
                    backgroundColor: '#4caf50'
                },
                {
                    label: 'Pending',
                    data: top10.map(stat => stat.pending),
                    backgroundColor: '#ff9800'
                },
                {
                    label: 'Rejected',
                    data: top10.map(stat => stat.rejected),
                    backgroundColor: '#f44336'
                }
            ]
        };
    }

    updateLoginActivityChart() {
        const top10 = [...this.filteredStats]
            .sort((a, b) => b.login_count - a.login_count)
            .slice(0, 10);
        
        this.loginActivityChartData = {
            labels: top10.map(stat => stat.name),
            datasets: [{
                label: 'Login Count',
                data: top10.map(stat => stat.login_count),
                backgroundColor: '#2196f3',
                borderColor: '#1976d2',
                borderWidth: 2
            }]
        };
    }

    updateIRMChart() {
        const irmGroups = new Map<string, number>();
        
        this.filteredStats.forEach(stat => {
            const irm = stat.irm || 'N/A';
            irmGroups.set(irm, (irmGroups.get(irm) || 0) + stat.total_solutions);
        });

        const sortedIRMs = Array.from(irmGroups.entries())
            .sort((a, b) => b[1] - a[1]);

        const colors = [
            '#2d5f4f', '#3a7a63', '#4caf50', '#66bb6a',
            '#81c784', '#a5d6a7', '#c8e6c9', '#e8f5e9'
        ];

        this.irmChartData = {
            labels: sortedIRMs.map(([irm]) => irm),
            datasets: [{
                data: sortedIRMs.map(([, count]) => count),
                backgroundColor: colors,
                hoverBackgroundColor: colors.map(c => c + 'dd')
            }]
        };
    }

    updateMonthlySolutionsChart() {
        const monthlyData = new Map<string, number>();
        
        // Get all solutions from filtered users only
        const userIds = new Set(this.filteredStats.map(stat => stat.yash_id));
        const userNames = new Set(this.filteredStats.map(stat => stat.name));
        
        this.allSolutions.forEach(solution => {
            // Only count solutions from users with type: 'user'
            const isFromRegularUser = userIds.has(solution.yash_id) || userNames.has(solution.username);
            
            if (isFromRegularUser && solution.created_at) {
                const date = new Date(solution.created_at);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
            }
        });

        const sortedMonths = Array.from(monthlyData.keys()).sort();
        
        this.monthlySolutionsChartData = {
            labels: sortedMonths.map(monthYear => {
                const [year, month] = monthYear.split('-');
                return new Date(parseInt(year), parseInt(month) - 1)
                    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
                label: 'Solutions Added',
                data: sortedMonths.map(month => monthlyData.get(month) || 0),
                backgroundColor: '#3a7a63',
                borderColor: '#2d5f4f',
                borderWidth: 2
            }]
        };
    }

    initializeChartOptions() {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, weight: 600 },
                        color: '#2d5f4f'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 95, 79, 0.9)',
                    padding: 12,
                    titleFont: { size: 12, weight: 600 },
                    bodyFont: { size: 11 }
                }
            }
        };

        this.barChartOptions = {
            ...commonOptions,
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#666' }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: { 
                        precision: 0,
                        font: { size: 10 },
                        color: '#666'
                    },
                    grid: { color: '#f0f4f3' }
                }
            }
        };

        this.loginChartOptions = {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#666' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { 
                        precision: 0,
                        font: { size: 10 },
                        color: '#666'
                    },
                    grid: { color: '#f0f4f3' }
                }
            }
        };

        this.pieChartOptions = {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, weight: 600 },
                        color: '#2d5f4f'
                    }
                }
            }
        };

        this.monthlyBarChartOptions = {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: '#666' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { 
                        precision: 0,
                        font: { size: 10 },
                        color: '#666'
                    },
                    grid: { color: '#f0f4f3' }
                }
            }
        };
    }

    viewUserSolutions(user: UserStats) {
        this.selectedUser = user;
        this.showSolutionsDialog = true;
    }

    clearFilters() {
        this.selectedMonth = '';
        this.selectedIRM = '';
        this.searchText = '';
        this.applyFilters();
    }

    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    formatDate(dateString?: string): string {
        if (!dateString || dateString === 'Never') return dateString || 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${day}-${month}-${year} ${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    }

    formatDateOnly(dateString?: string): string {
        if (!dateString || dateString === 'Never') return dateString || 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    }

    getStatusSeverity(status?: string): 'success' | 'warning' | 'danger' {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'approved') return 'success';
        if (statusLower === 'rejected') return 'danger';
        return 'warning';
    }

    exportToExcel() {
        try {
            const exportData = this.filteredStats.map(stat => ({
                'User ID': stat.yash_id,
                'User Name': stat.name,
                'Email': stat.email,
                'IRM': stat.irm,
                'Login Count': stat.login_count,
                'Last Login': this.formatDateOnly(stat.last_login),
                'Total Solutions': stat.total_solutions,
                'Approved': stat.approved,
                'Pending': stat.pending,
                'Rejected': stat.rejected
            }));

            const detailedData = this.filteredStats.flatMap(stat =>
                stat.solutions.map(solution => ({
                    'User ID': stat.yash_id,
                    'User Name': stat.name,
                    'IRM': stat.irm,
                    'Customer Name': solution.customer_name,
                    'Module': solution.module_name,
                    'Domain': solution.domain,
                    'Sector': solution.sector,
                    'Standard/Custom': solution.standard_custom,
                    'Created Date': this.formatDate(solution.created_at),
                    'Status': solution.Approval_status || 'Pending',
                    'Approver': solution.Approver || 'N/A',
                    'Approval Date': solution.Approval_date || 'N/A'
                }))
            );

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws1, 'User Summary');

            const ws2 = XLSX.utils.json_to_sheet(detailedData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Solutions');

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `User_Activity_Report_${timestamp}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);

            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Report exported successfully'
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to export report'
            });
        }
    }
}