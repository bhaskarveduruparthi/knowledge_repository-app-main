import { Component, OnInit, signal, ViewChild, computed } from '@angular/core';
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
import { User } from '../service/manageadmins.service';
import { SecureFileViewerComponent } from "../securefileviewer/securefileviewer";
import { CardModule } from "primeng/card";

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
        
        * {
            font-family: 'Arial', sans-serif;
        }

        :host {
            display: block;
        }

        .page-wrapper {
            min-height: 100vh;
            padding: 2rem;
        }

        :host ::ng-deep .p-card .p-card-body {
    box-shadow: none;
}

:host ::ng-deep .p-card {
    box-shadow: 0 8px 32px 0 rgba(144,238,144,0.5) !important;
}

        /* ── Toolbar ── */
        .toolbar-shell {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            border-radius: 18px;
            padding: 0.9rem 1.4rem;
            margin-bottom: 1.75rem;
            box-shadow: 0 2px 16px rgba(67, 160, 71, 0.10), 0 1px 4px rgba(0,0,0,0.05);
            border: 1px solid rgba(165, 214, 167, 0.35);
            gap: 1rem;
        }

        .toolbar-title {
            font-family: 'Arial', serif;
            font-size: 1.45rem;
            font-weight: 700;
            color: #1b5e20;
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        .toolbar-title span {
            color: #43a047;
        }

        .toolbar-right {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        /* ── Search ── */
        .search-pill {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-pill .pi-search {
            position: absolute;
            left: 0.85rem;
            color: #81c784;
            font-size: 0.85rem;
            pointer-events: none;
        }

        .search-pill input {
            padding: 0.5rem 2.2rem 0.5rem 2.3rem;
            border-radius: 50px;
            border: 1.5px solid #c8e6c9;
            background: #f9fafb;
            width: 290px;
            font-size: 1rem;
            color: #2e3a2f;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            font-family: 'Arial', sans-serif;
        }

        .search-pill input::placeholder { color: #aab5ab; }

        .search-pill input:focus {
            border-color: #43a047;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(67, 160, 71, 0.12);
        }

        .search-clear {
            position: absolute;
            right: 0.6rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #aab5ab;
            padding: 0;
            line-height: 1;
            font-size: 0.78rem;
            transition: color 0.15s;
        }

        .search-clear:hover { color: #43a047; }

        .result-badge {
            font-size: 0.8rem;
            color: #fff;
            background: linear-gradient(135deg, #43a047, #66bb6a);
            border-radius: 50px;
            padding: 0.2rem 0.7rem;
            font-weight: 600;
            white-space: nowrap;
        }

        /* ── IRM Filter ── */
        .irm-filter-wrap {
            position: relative;
            display: flex;
            align-items: center;
        }

        .irm-filter-wrap ::ng-deep .p-select {
            border-radius: 50px !important;
            border: 1.5px solid #c8e6c9 !important;
            background: #f9fafb !important;
            font-size: 0.88rem !important;
            min-width: 180px !important;
            font-family: 'Arial', sans-serif !important;
            transition: border-color 0.2s, box-shadow 0.2s !important;
        }

        .irm-filter-wrap ::ng-deep .p-select:hover {
            border-color: #43a047 !important;
        }

        .irm-filter-wrap ::ng-deep .p-select.p-focus {
            border-color: #43a047 !important;
            box-shadow: 0 0 0 3px rgba(67, 160, 71, 0.12) !important;
        }

        .irm-filter-wrap ::ng-deep .p-select .p-select-label {
            color: #2e3a2f !important;
            padding: 0.5rem 0.85rem !important;
        }

        .irm-filter-wrap ::ng-deep .p-select .p-placeholder {
            color: #aab5ab !important;
        }

        .irm-filter-wrap ::ng-deep .p-select-clear-icon {
            color: #aab5ab !important;
            transition: color 0.15s !important;
        }

        .irm-filter-wrap ::ng-deep .p-select-clear-icon:hover {
            color: #43a047 !important;
        }

        /* ── Grid ── */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
            gap: 1.25rem;
        }

        /* ── Card ── */
        .repo-card {
            background: #fff;
            border-radius: 20px;
            border: 1px solid rgba(165, 214, 167, 0.6);
            box-shadow: 0 2px 14px 0 rgba(76,175,80,0.10);
            padding: 1.5rem 1.5rem 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
            position: relative;
            overflow: hidden;
        }

        @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .repo-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 28px 0 rgba(76,175,80,0.22);
        }

        /* Card header */
        .card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .card-title-group {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            flex: 1;
            min-width: 0;
        }

        .card-module {
            font-family: 'DM Serif Display', serif;
            font-size: 1.1rem;
            font-weight: 400;
            color: #1b5e20;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-domain {
            font-size: 0.78rem;
            font-weight: 700;
            color: #2e7d32;
            text-transform: uppercase;
            letter-spacing: 0.07em;
        }

        /* Status chip */
        .status-chip {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.25rem 0.7rem;
            border-radius: 50px;
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.03em;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .status-chip.pending {
            background: #fff8e1;
            color: #f57f17;
            border: 1px solid #ffe082;
        }

        .status-chip.approved {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #a5d6a7;
        }

        .status-chip.rejected {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ef9a9a;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            display: inline-block;
        }

        .pending .status-dot   { background: #ffa000; }
        .approved .status-dot  { background: #2e7d32; }
        .rejected .status-dot  { background: #c62828; }

        /* Meta rows */
        .card-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem 0.75rem;
            margin-bottom: 1rem;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
            min-width: 0;
        }

        .meta-label {
            font-size: 0.68rem;
            font-weight: 700;
            color: #5d8a5e;
            text-transform: uppercase;
            letter-spacing: 0.07em;
        }

        .meta-value {
            font-size: 0.855rem;
            color: #2e3a2f;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Divider */
        .card-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e8f5e9, #c8e6c9, #e8f5e9, transparent);
            margin: 0 -0.25rem 1rem;
        }

        /* Creator row */
        .card-creator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.1rem;
        }

        .creator-avatar {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: linear-gradient(135deg, #66bb6a, #2e7d32);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0;
            flex-shrink: 0;
        }

        .creator-label {
            font-size: 0.8rem;
            color: #6b8c6b;
        }

        .creator-name {
            font-weight: 600;
            color: #2e3a2f;
        }

        /* Action row */
        .card-actions {
            display: flex;
            gap: 0.45rem;
            flex-wrap: wrap;
            justify-content: flex-end;
            margin-top: auto;
        }

        /* Base override for all action buttons */
        .card-actions ::ng-deep .p-button {
            font-family: 'DM Sans', sans-serif !important;
            font-size: 0.8rem !important;
            font-weight: 600 !important;
            padding: 0.4rem 0.85rem !important;
            border-radius: 10px !important;
            border-width: 1.5px !important;
            border-style: solid !important;
            transition: all 0.15s ease !important;
            letter-spacing: 0.01em !important;
        }

        .card-actions ::ng-deep .p-button:not(:disabled):hover {
            transform: translateY(-1px) !important;
        }

        .card-actions ::ng-deep .p-button:disabled {
            opacity: 0.4 !important;
        }

        /* Approve */
        .card-actions ::ng-deep .btn-approve.p-button,
        .card-actions ::ng-deep .btn-approve .p-button {
            background: #e8f5e9 !important;
            color: #1b5e20 !important;
            border-color: #66bb6a !important;
        }
        .card-actions ::ng-deep .btn-approve.p-button:not(:disabled):hover,
        .card-actions ::ng-deep .btn-approve .p-button:not(:disabled):hover {
            background: #2e7d32 !important;
            color: #fff !important;
            border-color: #2e7d32 !important;
            box-shadow: 0 4px 14px rgba(46,125,50,0.32) !important;
        }

        /* Delegate */
        .card-actions ::ng-deep .btn-delegate.p-button,
        .card-actions ::ng-deep .btn-delegate .p-button {
            background: #e3f2fd !important;
            color: #0d47a1 !important;
            border-color: #64b5f6 !important;
        }
        .card-actions ::ng-deep .btn-delegate.p-button:not(:disabled):hover,
        .card-actions ::ng-deep .btn-delegate .p-button:not(:disabled):hover {
            background: #1565c0 !important;
            color: #fff !important;
            border-color: #1565c0 !important;
            box-shadow: 0 4px 14px rgba(21,101,192,0.3) !important;
        }

        /* Reject */
        .card-actions ::ng-deep .btn-reject.p-button,
        .card-actions ::ng-deep .btn-reject .p-button {
            background: #ffebee !important;
            color: #b71c1c !important;
            border-color: #e57373 !important;
        }
        .card-actions ::ng-deep .btn-reject.p-button:not(:disabled):hover,
        .card-actions ::ng-deep .btn-reject .p-button:not(:disabled):hover {
            background: #c62828 !important;
            color: #fff !important;
            border-color: #c62828 !important;
            box-shadow: 0 4px 14px rgba(198,40,40,0.3) !important;
        }

        /* Details */
        .card-actions ::ng-deep .btn-info.p-button,
        .card-actions ::ng-deep .btn-info .p-button {
            background: #f0f4f8 !important;
            color: #37474f !important;
            border-color: #b0bec5 !important;
        }
        .card-actions ::ng-deep .btn-info.p-button:hover,
        .card-actions ::ng-deep .btn-info .p-button:hover {
            background: #455a64 !important;
            color: #fff !important;
            border-color: #455a64 !important;
            box-shadow: 0 4px 14px rgba(69,90,100,0.28) !important;
        }

        /* ── Empty / No-results states ── */
        .state-card {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            background: #fff;
            border-radius: 20px;
            border: 1.5px dashed #c8e6c9;
            color: #81c784;
            text-align: center;
            gap: 0.75rem;
        }

        .state-card .state-icon {
            font-size: 2.75rem;
            color: #a5d6a7;
        }

        .state-card p {
            margin: 0;
            color: #6b8c6b;
            font-size: 0.95rem;
        }

        .state-card p.sub {
            font-size: 0.82rem;
            color: #a5c8a6;
        }

        .state-clear-btn {
            margin-top: 0.5rem;
            padding: 0.45rem 1.1rem;
            border-radius: 50px;
            border: 1.5px solid #a5d6a7;
            background: transparent;
            color: #43a047;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            transition: all 0.15s;
        }
        .state-clear-btn:hover {
            background: #43a047;
            color: #fff;
        }

        /* ── Dialog overrides ── */
        .detail-grid {
            display: grid;
            grid-template-columns: 160px 1fr;
            gap: 0.6rem 1rem;
            font-size: 0.9rem;
        }

        .detail-label {
            font-weight: 600;
            color: #6b8c6b;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding-top: 0.1rem;
        }

        .detail-value {
            color: #2e3a2f;
            line-height: 1.5;
        }

        .detail-divider {
            grid-column: 1 / -1;
            height: 1px;
            background: #e8f5e9;
            margin: 0.1rem 0;
        }

        /* ── Paginator ── */
        .paginator-wrapper {
            margin-top: 1.75rem;
            background: #fff;
            border-radius: 14px;
            border: 1px solid rgba(165, 214, 167, 0.35);
            box-shadow: 0 2px 16px rgba(67, 160, 71, 0.08);
            overflow: hidden;
        }

        .paginator-wrapper ::ng-deep .p-paginator {
            background: transparent !important;
            border: none !important;
            padding: 0.5rem 0.75rem !important;
            justify-content: center;
            gap: 0.25rem;
        }

        .paginator-wrapper ::ng-deep .p-paginator-page,
        .paginator-wrapper ::ng-deep .p-paginator-next,
        .paginator-wrapper ::ng-deep .p-paginator-prev,
        .paginator-wrapper ::ng-deep .p-paginator-first,
        .paginator-wrapper ::ng-deep .p-paginator-last {
            border-radius: 10px !important;
            font-family: 'DM Sans', sans-serif !important;
            font-size: 0.85rem !important;
            font-weight: 500 !important;
            color: #2e7d32 !important;
            min-width: 2.2rem !important;
            height: 2.2rem !important;
            transition: all 0.15s ease !important;
            border: 1.5px solid transparent !important;
        }

        .paginator-wrapper ::ng-deep .p-paginator-page:not(.p-highlight):hover,
        .paginator-wrapper ::ng-deep .p-paginator-next:not(.p-disabled):hover,
        .paginator-wrapper ::ng-deep .p-paginator-prev:not(.p-disabled):hover,
        .paginator-wrapper ::ng-deep .p-paginator-first:not(.p-disabled):hover,
        .paginator-wrapper ::ng-deep .p-paginator-last:not(.p-disabled):hover {
            background: #e8f5e9 !important;
            border-color: #c8e6c9 !important;
        }

        .paginator-wrapper ::ng-deep .p-paginator-page.p-highlight {
            background: linear-gradient(135deg, #43a047, #2e7d32) !important;
            color: #fff !important;
            font-weight: 700 !important;
            border-color: transparent !important;
            box-shadow: 0 3px 10px rgba(46, 125, 50, 0.35) !important;
        }

        .paginator-wrapper ::ng-deep .p-paginator-current {
            font-family: 'DM Sans', sans-serif !important;
            font-size: 0.82rem !important;
            color: #6b8c6b !important;
        }

        .paginator-wrapper ::ng-deep .p-paginator-icon {
            color: #43a047 !important;
        }

        .paginator-wrapper ::ng-deep .p-disabled .p-paginator-icon {
            color: #c8e6c9 !important;
        }

        /* ── Responsive ── */
        @media (max-width: 700px) {
            .page-wrapper { padding: 1rem; }
            .toolbar-shell { flex-direction: column; align-items: flex-start; }
            .search-pill input { width: 200px; }
            .irm-filter-wrap ::ng-deep .p-select { min-width: 150px !important; }
            .cards-grid { grid-template-columns: 1fr; }
        }
    `],
    imports: [
        CommonModule, TableModule, FormsModule, ReactiveFormsModule, ButtonModule,
        RippleModule, ToastModule, RouterModule, ToolbarModule, RatingModule, FluidModule,
        PanelModule, AutoCompleteModule, PaginatorModule, InputTextModule, TextareaModule,
        SelectModule, RadioButtonModule, InputNumberModule, DialogModule, TagModule,
        InputIconModule, IconFieldModule, ConfirmDialogModule, PasswordModule, MessageModule,
        SecureFileViewerComponent,
        CardModule
    ],
    template: `
        <p-card>
        <div class="page-wrapper">
            <p-toast />

            <!-- ── Toolbar ── -->
            <div class="toolbar-shell">
                <div class="toolbar-title">
                    Manage <span>Approvals</span>
                </div>

                <div class="toolbar-right">

                    <!-- IRM Filter -->
                    <div class="irm-filter-wrap">
                        <p-select
                            [options]="irmOptions()"
                            [ngModel]="irmFilter()"
                            (ngModelChange)="onIrmChange($event)"
                            placeholder="All IRMs"
                            [showClear]="true"
                            (onClear)="clearIrmFilter()">
                        </p-select>
                    </div>

                    <!-- Search -->
                    <div class="search-pill">
                        <i class="pi pi-search"></i>
                        <input
                            type="text"
                            [value]="searchQuery()"
                            placeholder="Search…"
                            (input)="onSearchChange($event)"
                        />
                        <button
                            *ngIf="searchQuery()"
                            class="search-clear"
                            (click)="clearSearch()"
                            title="Clear search">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>

                    <!-- Result count badge — shown when any filter is active -->
                    <span *ngIf="searchQuery() || irmFilter()" class="result-badge">
                        {{ filteredRepositories().length }} / {{ repositories().length }}
                    </span>
                </div>
            </div>

            <!-- ── Cards Grid ── -->
            <div class="cards-grid">

                <!-- No search / filter results -->
                <div *ngIf="filteredRepositories().length === 0 && (searchQuery() || irmFilter())" class="state-card">
                    <i class="pi pi-search state-icon"></i>
                    <p>
                        No results
                        <ng-container *ngIf="searchQuery()"> for <b>"{{ searchQuery() }}"</b></ng-container>
                        <ng-container *ngIf="irmFilter()"> · IRM: <b>{{ irmFilter() }}</b></ng-container>
                    </p>
                    <p class="sub">Try adjusting your search or IRM filter.</p>
                    <button class="state-clear-btn" (click)="clearSearch(); clearIrmFilter()">
                        <i class="pi pi-times" style="font-size:0.75rem; margin-right:0.3rem"></i>Clear All Filters
                    </button>
                </div>

                <!-- Loading -->
                <div *ngIf="loading" class="state-card">
                    <i class="pi pi-spin pi-spinner state-icon"></i>
                    <p>Loading approvals…</p>
                </div>

                <!-- Empty state — no data at all -->
                <div *ngIf="repositories().length === 0 && !searchQuery() && !irmFilter() && !loading" class="state-card">
                    <i class="pi pi-inbox state-icon"></i>
                    <p>No repositories pending approval.</p>
                    <p class="sub">Check back later or refresh the page.</p>
                </div>

                <!-- Repo Cards — uses pagedRepositories() for per-page slicing -->
                <div *ngFor="let repo of pagedRepositories()" class="repo-card">

                    <!-- Header -->
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-module" [title]="repo.module_name"><strong>{{ repo.module_name }}</strong></div>
                            <div class="card-domain">{{ repo.domain }}</div>
                        </div>
                        <span class="status-chip"
                            [ngClass]="{
                                'approved': repo.Approval_status === 'Approved',
                                'rejected': repo.Approval_status === 'Rejected',
                                'pending':  repo.Approval_status !== 'Approved' && repo.Approval_status !== 'Rejected'
                            }">
                            <span class="status-dot"></span>
                            {{ repo.Approval_status === 'Approved' ? 'Approved' : repo.Approval_status === 'Rejected' ? 'Rejected' : 'Pending' }}
                        </span>
                    </div>

                    <!-- Meta grid -->
                    <div class="card-meta">
                        <div class="meta-item">
                            <span class="meta-label">Customer</span>
                            <span class="meta-value" [title]="repo.customer_name">{{ repo.customer_name }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Sector</span>
                            <span class="meta-value" [title]="repo.sector">{{ repo.sector }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">IRM</span>
                            <span class="meta-value">{{ repo.irm }}</span>
                        </div>
                    </div>

                    <div class="card-divider"></div>

                    <!-- Creator -->
                    <div class="card-creator">
                        <div class="creator-avatar">
                            {{ (repo.username || 'U').charAt(0).toUpperCase() }}
                        </div>
                        <span class="creator-label">
                            Created by <span class="creator-name">{{ repo.username }}</span>
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="card-actions">
                        <p-button
                            label="Approve" icon="pi pi-check"
                            styleClass="btn-approve"
                            (onClick)="approve_dialog(repo)"
                            [disabled]="repo.Approval_status === 'Approved'">
                        </p-button>
                        <p-button
                            label="Delegate" icon="pi pi-share-alt"
                            styleClass="btn-delegate"
                            (onClick)="delegate_dialog(repo)"
                            [disabled]="repo.Approval_status === 'Approved'">
                        </p-button>
                        <p-button
                            label="Reject" icon="pi pi-times"
                            styleClass="btn-reject"
                            (onClick)="reject_dialog(repo)"
                            [disabled]="repo.Approval_status === 'Approved'">
                        </p-button>
                        <p-button
                            label="Details" icon="pi pi-info-circle"
                            styleClass="btn-info"
                            (onClick)="showDetails(repo)">
                        </p-button>
                    </div>
                </div>
            </div>

            <!-- ── Paginator ── -->
            <div class="paginator-wrapper" *ngIf="filteredRepositories().length > pageSize">
                <p-paginator
                    [rows]="pageSize"
                    [totalRecords]="filteredRepositories().length"
                    [first]="currentPage() * pageSize"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    (onPageChange)="onPageChange($event)">
                </p-paginator>
            </div>

        </div>
        </p-card>

        <!-- ── Details Dialog ── -->
        <p-dialog header="Solution Details"
            [(visible)]="dialogVisible"
            [modal]="true"
            [style]="{width: '680px', borderRadius: '20px'}"
            (onHide)="closeDetails()">
            <div *ngIf="selectedRepo" class="detail-grid" style="padding: 0.5rem 0">
                <span class="detail-label">Customer</span>
                <span class="detail-value">{{ selectedRepo.customer_name }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Domain</span>
                <span class="detail-value">{{ selectedRepo.domain }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Sector</span>
                <span class="detail-value">{{ selectedRepo.sector }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Module</span>
                <span class="detail-value">{{ selectedRepo.module_name }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Requirement</span>
                <span class="detail-value">{{ selectedRepo.detailed_requirement }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Std / Custom</span>
                <span class="detail-value">{{ selectedRepo.standard_custom }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Technical</span>
                <span class="detail-value">{{ selectedRepo.technical_details }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Benefit</span>
                <span class="detail-value">{{ selectedRepo.customer_benefit }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Created by</span>
                <span class="detail-value">{{ selectedRepo.username }}</span>
                <div class="detail-divider"></div>

                <span class="detail-label">Attachment</span>
                <span class="detail-value">
                    <app-secure-file-viewer
                        [repoId]="selectedRepo.id"
                        [filename]="selectedRepo.attachment_filename || ''"
                        [disabled]="selectedRepo.attach_code_or_document === 'UPLOADED'"
                        apiBase="http://10.6.102.245:5002">
                    </app-secure-file-viewer>
                </span>
            </div>
        </p-dialog>

        <!-- ── Approve Dialog ── -->
        <p-dialog [(visible)]="approvedialog" header="Approve Solution" [modal]="true" [style]="{ width: '440px' }">
            <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.25rem 0">
                <span *ngIf="repository" style="font-size:0.95rem; color:#2e3a2f; line-height:1.55">
                    Confirm approval of <b>{{ repository.module_name }}</b> for <b>{{ repository.customer_name }}</b>?
                    <br><span style="font-size:0.82rem; color:#81c784">This action will mark the solution as approved.</span>
                </span>
            </div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="approvedialog = false"></button>
                <button pButton pRipple icon="pi pi-check" class="p-button-success" label="Approve" (click)="Repoapproval(repository)"></button>
            </ng-template>
        </p-dialog>

        <!-- ── Delegate Dialog ── -->
        <p-dialog
            [(visible)]="delegatedialog"
            header="Delegate Solution"
            [modal]="true"
            [style]="{ width: '560px' }">
            <div style="display:flex; flex-direction:column; gap:1.1rem; padding:0.25rem 0">
                <div style="display:flex; align-items:flex-start; gap:0.85rem">
                    <span style="font-size:0.95rem; color:#2e3a2f; line-height:1.55">
                        Delegate <b>{{ repository?.module_name }}</b> for <b>{{ repository?.customer_name }}</b> to another user.
                    </span>
                </div>

                <div style="background:#f5f7fb; border-radius:12px; padding:0.85rem 1rem; display:grid; grid-template-columns:120px 1fr; gap:0.4rem 0.75rem; font-size:0.875rem">
                    <span style="font-weight:600; color:#6b8c6b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em">Domain</span>
                    <span style="color:#2e3a2f">{{ repository?.domain }}</span>
                    <span style="font-weight:600; color:#6b8c6b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em">Sector</span>
                    <span style="color:#2e3a2f">{{ repository?.sector }}</span>
                    <span style="font-weight:600; color:#6b8c6b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em">Technical</span>
                    <span style="color:#2e3a2f">{{ repository?.technical_details }}</span>
                    <span style="font-weight:600; color:#6b8c6b; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em">Created by</span>
                    <span style="color:#2e3a2f">{{ repository?.username }}</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.35rem">
                    <label style="font-size:0.82rem; font-weight:600; color:#2e3a2f">Select User to Delegate</label>
                    <p-select
                        id="delegateUser"
                        [(ngModel)]="selectedDelegateUserId"
                        [options]="delegateUsers"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Choose a user…"
                        class="w-full"
                        showClear="true"
                        filter="false">
                    </p-select>
                    <small *ngIf="!selectedDelegateUserId" style="color:#e57373; font-size:0.78rem">
                        Please select a user to continue.
                    </small>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton pRipple type="button" icon="pi pi-times" class="p-button-text"
                    label="Cancel" (click)="delegatedialog = false"></button>
                <button pButton pRipple type="button" icon="pi pi-share-alt" class="p-button-info"
                    label="Delegate" [disabled]="!selectedDelegateUserId"
                    (click)="delegateRepository()"></button>
            </ng-template>
        </p-dialog>

        <!-- ── Reject Dialog ── -->
        <p-dialog [(visible)]="rejectdialog" header="Reject Solution" [modal]="true" [style]="{ width: '440px' }">
            <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.25rem 0">
                <span *ngIf="repository" style="font-size:0.95rem; color:#2e3a2f; line-height:1.55">
                    Confirm rejection of <b>{{ repository.module_name }}</b> for <b>{{ repository.customer_name }}</b>?
                    <br><span style="font-size:0.82rem; color:#ef9a9a">This action will mark the solution as rejected.</span>
                </span>
            </div>
            <ng-template pTemplate="footer">
                <button pButton pRipple icon="pi pi-times" class="p-button-text" label="Cancel" (click)="rejectdialog = false"></button>
                <button pButton pRipple icon="pi pi-ban" class="p-button-danger" label="Reject" (click)="Reporeject(repository)"></button>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, ManageReposService, ConfirmationService, FormBuilder]
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
    issent: boolean = false;
    cols!: Column[];
    downloadvalid: boolean = false;
    uploaddialog: boolean = false;
    approvedialog: boolean = false;
    createdialog: boolean = false;
    messages: any[] = [];
    selectedDelegateUserId: number | null = null;
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
    sendforapproval: boolean = false;
    sendforapprovaldialog: boolean = false;
    deleteRepoDialog: boolean = false;
    rejectdialog: boolean = false;
    file: any;
    editrepodialog: boolean = false;
    business_justification: any;
    uploadcodeprocessdocdialog: boolean = false;
    delegatedialog: boolean = false;
    users = signal<User[]>([]);
    delegateUsers: User[] = [];

    // ── Pagination ──
    pageSize: number = 10;
    currentPage = signal<number>(0);

    // ── Filters ──
    searchQuery = signal<string>('');
    irmFilter   = signal<string>('');

    // Unique IRM (username) list derived from loaded data, sorted alphabetically
    irmOptions = computed(() => {
        const names = this.repositories()
            .map(r => r.irm)
            .filter((v): v is string => !!v);
        return Array.from(new Set(names)).sort();
    });

    filteredRepositories = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        const irm   = this.irmFilter().trim().toLowerCase();

        return this.repositories().filter(repo => {
            const matchesSearch = !query || (
                repo.customer_name?.toLowerCase().includes(query)    ||
                repo.module_name?.toLowerCase().includes(query)      ||
                repo.domain?.toLowerCase().includes(query)           ||
                repo.sector?.toLowerCase().includes(query)           ||
                repo.standard_custom?.toLowerCase().includes(query)  ||
                repo.technical_details?.toLowerCase().includes(query)
            );
            const matchesIrm = !irm || repo.username?.toLowerCase() === irm;
            return matchesSearch && matchesIrm;
        });
    });

    // Returns only the current page slice of filtered results
    pagedRepositories = computed(() => {
        const all   = this.filteredRepositories();
        const start = this.currentPage() * this.pageSize;
        return all.slice(start, start + this.pageSize);
    });

    /**
     * Clamps currentPage so it stays on the highest valid page after
     * the filtered set shrinks. If you're on page 3 and results drop to
     * 15 items (1 full page + 5), you land on page 1 (index 0), not a blank page.
     * If the result count stays large enough to cover your current page, you stay put.
     */
    private clampPage(): void {
        const maxPage = Math.max(0, Math.ceil(this.filteredRepositories().length / this.pageSize) - 1);
        if (this.currentPage() > maxPage) {
            this.currentPage.set(maxPage);
        }
    }

    onPageChange(event: any): void {
        this.currentPage.set(event.page);
    }

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
        this.clampPage();
    }

    onIrmChange(value: string): void {
        this.irmFilter.set(value ?? '');
        this.clampPage();
    }

    clearSearch(): void {
        this.searchQuery.set('');
        this.clampPage();
        const input = document.querySelector('.search-pill input') as HTMLInputElement;
        if (input) input.value = '';
    }

    clearIrmFilter(): void {
        this.irmFilter.set('');
        this.clampPage();
    }

    get isAdmin(): boolean { return this.downloadvalid === true; }

    get isExportEnabled(): boolean {
        if (this.isAdmin) return this.selectedrepositories.length > 0;
        return this.selectedrepositories.length > 0 && this.selectedrepositories.every((repo) => repo.Approval_status === 'Approved');
    }

    ngOnInit() {
        this.loadDemoData();
        this.loadUsers();
    }

    constructor(
        private managereposervice: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) {
        this.authservice.user.subscribe((x) => {
            if (x?.type == 'Superadmin' || x?.type == 'manager') {
                this.isvalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
            } else {
                this.isvalid = true;
                this.downloadvalid = true;
                this.sendforapproval = false;
                this.attachvalid = false;
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
        this.loading = true;
        this.managereposervice.get_approval_repos().subscribe({
            next: (data: any) => {
                this.repositories.set(data);
                this.clampPage(); // Stay on current page if still valid, otherwise clamp
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load approval repositories'
                });
            }
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

    delegate_dialog(repository: Repository) {
        this.repository = { ...repository };
        this.selectedDelegateUserId = null;
        this.delegatedialog = true;
    }

    reject_dialog(repository: Repository) {
        this.rejectdialog = true;
        this.repository = { ...repository };
    }

    loadUsers() {
        this.managereposervice.getUsers().subscribe({
            next: (data: any) => {
                let usersArray: User[] = [];
                if (Array.isArray(data)) usersArray = data as User[];
                else if (Array.isArray(data?.data)) usersArray = data.data as User[];
                else if (Array.isArray(data?.users)) usersArray = data.users as User[];
                else if (Array.isArray(data?.results)) usersArray = data.results as User[];
                else usersArray = data ? [data as User] : [];

                this.users.set(usersArray);
                this.delegateUsers = [...usersArray];
            },
            error: (error: any) => {
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to load users: ${error.message || 'Unknown error'}`
                });
            }
        });
    }

    delegateRepository() {
        if (!this.selectedDelegateUserId || !this.repository?.id) {
            this.messageservice.add({ severity: 'warn', summary: 'Missing data', detail: 'Please select a user to delegate.' });
            return;
        }

        const selectedUser = this.delegateUsers.find(u => u.id === this.selectedDelegateUserId);
        const payload = {
            id: this.repository.id,
            delegateUserId: this.selectedDelegateUserId,
            delegateUserName: selectedUser?.name
        };

        this.managereposervice.delegateRepository(payload).subscribe({
            next: () => {
                this.delegatedialog = false;
                this.selectedDelegateUserId = null;
                this.messageservice.add({ severity: 'success', summary: 'Delegated', detail: `Delegated to ${selectedUser?.name}` });
                this.loadDemoData(); // Reload data in-place — preserves current page
            },
            error: (error: any) => {
                this.messageservice.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.error?.message || 'Failed to delegate repository'
                });
            }
        });
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
            this.messageservice.add({ severity: 'success', summary: 'Approved', detail: 'Repository has been approved successfully.' });
            this.loadDemoData(); // Reload data in-place — preserves current page
        });
    }

    Reporeject(repository: Repository) {
        this.managereposervice.RepoRejection(this.repository).subscribe((data: any) => {
            this.rejectdialog = false;
            this.messageservice.add({ severity: 'warn', summary: 'Rejected', detail: 'Repository has been rejected.' });
            this.loadDemoData(); // Reload data in-place — preserves current page
        });
    }

    opendialog() { this.createdialog = true; }

    form_records() {
        this.managereposervice.get_approval_records().subscribe((data: any) => {
            this.totalitems = data.length;
            this.totalrecords = data.totalrecords;
        });
    }

    reloadPage() { window.location.reload(); }
}