import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ManageReposService } from '../service/managerepos.service';
import { AuthenticationService } from '../service/authentication.service';
import { ManageAdminsService } from '../service/manageadmins.service';
import { forkJoin } from 'rxjs';

export interface LegendItem {
    label: string;
    count: number;
    color: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ChartModule, FieldsetModule, TableModule, AutoCompleteModule],
    providers: [MessageService, ManageAdminsService, ConfirmationService],
    styles: `
        /* ─────────────────────────────────────────────────────
           DESIGN TOKENS
        ───────────────────────────────────────────────────── */
        :host {
            --ink:       #0A0F1E;
            --ink-2:     #3D4A6B;
            --ink-3:     #8492A8;
            --surface:   #ECF4E8;
            --panel:     #FFFFFF;
            --accent:    darkgreen;
            --accent-dim:rgba(27,110,243,0.10);
            --green:     #12B76A;
            --green-dim: rgba(18,183,106,0.12);
            --amber:     #F79009;
            --amber-dim: rgba(247,144,9,0.12);
            --red:       #E8401C;
            --red-dim:   rgba(232,64,28,0.10);
            --border:    rgba(10,15,30,0.08);
            --radius-sm: 8px;
            --radius:    14px;
            --radius-lg: 20px;
            --shadow-sm: 0 1px 3px rgba(10,15,30,0.06), 0 1px 2px rgba(10,15,30,0.04);
            --shadow:    0 4px 16px rgba(10,15,30,0.08), 0 1px 4px rgba(10,15,30,0.04);
            --shadow-lg: 0 12px 40px rgba(10,15,30,0.10), 0 2px 8px rgba(10,15,30,0.06);
            display: block;
            padding: 0;
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background: var(--surface);
            color: var(--ink);
        }

        /* ─────────────────────────────────────────────────────
           SHIMMER SKELETON
        ───────────────────────────────────────────────────── */
        @keyframes shimmer {
            0%   { background-position: -800px 0; }
            100% { background-position: 800px 0; }
        }
        .skeleton {
            border-radius: var(--radius-sm);
            background: linear-gradient(90deg,
                rgba(10,15,30,0.05) 25%,
                rgba(10,15,30,0.10) 50%,
                rgba(10,15,30,0.05) 75%);
            background-size: 800px 100%;
            animation: shimmer 1.6s infinite linear;
        }

        /* skeleton layout */
        .sk-wrap        { padding: 2rem 2.4rem; width: 100%; margin: 0 auto; }
        .sk-ticker      { display:grid; grid-template-columns:repeat(4,1fr); gap:0; background:var(--panel);
                          border-radius:var(--radius-lg); border:1px solid var(--border);
                          box-shadow:var(--shadow); margin-bottom:1.6rem; overflow:hidden; }
        .sk-ticker-cell { padding:1.8rem 2rem; border-right:1px solid var(--border); display:flex; flex-direction:column; gap:0.9rem; }
        .sk-ticker-cell:last-child { border-right:none; }
        .sk-h10         { height:10px; border-radius:6px; }
        .sk-h36         { height:36px; width:55%; border-radius:6px; }
        .sk-h12         { height:12px; width:40%; border-radius:6px; }
        .sk-filter-bar  { height:52px; border-radius:var(--radius-lg); margin-bottom:1.6rem; }
        .sk-2col        { display:grid; grid-template-columns:1fr 1fr; gap:1.4rem; margin-bottom:1.4rem; }
        .sk-chart-card  { background:var(--panel); border-radius:var(--radius-lg);
                          border:1px solid var(--border); padding:1.6rem; }
        .sk-chart-title { height:11px; width:50%; margin-bottom:1.2rem; }
        .sk-chart-body  { height:180px; border-radius:var(--radius-sm); }
        .sk-lg-card     { background:var(--panel); border-radius:var(--radius-lg);
                          border:1px solid var(--border); padding:1.6rem; }
        .sk-table-header{ display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;
                          gap:1rem; padding:0.85rem 1rem;
                          background:var(--surface); border-radius:var(--radius-sm) var(--radius-sm) 0 0; margin-top:1rem; }
        .sk-th          { height:10px; border-radius:6px; }
        .sk-table-row   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr;
                          gap:1rem; padding:0.85rem 1rem;
                          border-bottom:1px solid var(--border); }
        .sk-td          { height:18px; border-radius:6px; }

        /* ─────────────────────────────────────────────────────
           PAGE CHROME
        ───────────────────────────────────────────────────── */
        .page-wrap {
            padding: 2rem 2.4rem 3rem;
            width: 100%;
            margin: 0 auto;
        }

        /* ─────────────────────────────────────────────────────
           TICKER STRIP  (the "signature" element)
        ───────────────────────────────────────────────────── */
        .ticker-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            background: var(--panel);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            overflow: hidden;
            margin-bottom: 1.6rem;
        }
        .ticker-cell {
            padding: 1.8rem 2rem 1.6rem;
            border-right: 1px solid var(--border);
            position: relative;
            transition: background 0.18s;
        }
        .ticker-cell:last-child { border-right: none; }
        .ticker-cell:hover { background: #fff; }

        .ticker-accent-bar {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
        }
        .ticker-cell.total   .ticker-accent-bar { background: var(--accent); }
        .ticker-cell.approved .ticker-accent-bar { background: var(--green); }
        .ticker-cell.pending  .ticker-accent-bar { background: var(--amber); }
        .ticker-cell.rejected .ticker-accent-bar { background: var(--red); }

        .ticker-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.10em;
            text-transform: uppercase;
            color: var(--ink-3);
            margin-bottom: 0.65rem;
            display: flex;
            align-items: center;
            gap: 0.45rem;
        }
        .ticker-label-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .total   .ticker-label-dot { background: var(--accent); }
        .approved .ticker-label-dot { background: var(--green); }
        .pending  .ticker-label-dot { background: var(--amber); }
        .rejected .ticker-label-dot { background: var(--red); }

        .ticker-number {
            font-family: inherit;
            font-size: 2.8rem;
            font-weight: 700;
            letter-spacing: -0.04em;
            line-height: 1;
            color: var(--ink);
            margin-bottom: 0.5rem;
        }
        .total    .ticker-number { color: var(--accent); }
        .approved .ticker-number { color: var(--green); }
        .pending  .ticker-number { color: var(--amber); }
        .rejected .ticker-number { color: var(--red); }

        .ticker-sub {
            font-size: 0.76rem;
            color: var(--ink-3);
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .ticker-sub i { font-size: 0.72rem; }

        /* ─────────────────────────────────────────────────────
           GLOBAL FILTER BAR
        ───────────────────────────────────────────────────── */
        .filter-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 0.75rem 1.2rem;
            margin-bottom: 1.6rem;
            box-shadow: var(--shadow-sm);
        }
        .filter-bar-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            color: var(--ink-3);
            margin-right: 0.4rem;
            white-space: nowrap;
        }
        .period-pill {
            font-size: 0.79rem;
            font-weight: 600;
            padding: 0.32rem 1rem;
            border-radius: 20px;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--ink-2);
            cursor: pointer;
            transition: all 0.15s;
        }
        .period-pill:hover { border-color: var(--accent); color: var(--accent); }
        .period-pill.active {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
            box-shadow: 0 2px 8px rgba(27,110,243,0.25);
        }
        .date-input {
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 0.3rem 0.65rem;
            font-size: 0.8rem;
            color: var(--ink);
            background: var(--surface);
            outline: none;
            cursor: pointer;
            font-family: inherit;
            transition: border-color 0.15s;
        }
        .date-input:focus { border-color: var(--accent); }
        .date-sep {
            font-size: 0.76rem;
            color: var(--ink-3);
            font-weight: 600;
        }
        .apply-btn {
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: var(--radius-sm);
            padding: 0.32rem 0.9rem;
            font-size: 0.79rem;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.15s, box-shadow 0.15s;
            font-family: inherit;
        }
        .apply-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .apply-btn:not(:disabled):hover { box-shadow: 0 2px 8px rgba(27,110,243,0.3); }
        .clear-btn {
            background: var(--surface);
            color: var(--ink-2);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 0.3rem 0.75rem;
            font-size: 0.79rem;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: border-color 0.15s;
        }
        .clear-btn:hover { border-color: var(--ink-3); }
        .active-badge {
            margin-left: auto;
            font-size: 0.73rem;
            font-weight: 700;
            color: var(--accent);
            background: var(--accent-dim);
            border-radius: 20px;
            padding: 0.22rem 0.75rem;
            white-space: nowrap;
        }

        /* ─────────────────────────────────────────────────────
           SECTION HEADER
        ───────────────────────────────────────────────────── */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.2rem;
        }
        .section-title {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.10em;
            text-transform: uppercase;
            color: var(--ink-3);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .section-title-rule {
            width: 24px;
            height: 2px;
            background: var(--accent);
            border-radius: 2px;
        }

        /* ─────────────────────────────────────────────────────
           CHART GRID
        ───────────────────────────────────────────────────── */
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.4rem;
            margin-bottom: 1.4rem;
        }

        .chart-card {
            background: var(--panel);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-sm);
            padding: 1.5rem 1.6rem 1.3rem;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.2s, transform 0.2s;
        }
        .chart-card:hover {
            box-shadow: var(--shadow);
            transform: translateY(-1px);
        }

        .chart-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }
        .chart-card-title {
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: var(--ink-2);
            display: flex;
            align-items: center;
            gap: 0.45rem;
        }
        .chart-card-dot {
            width: 8px; height: 8px;
            border-radius: 2px;
            flex-shrink: 0;
        }
        .chart-card-total {
            font-family: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--ink-3);
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 0.2rem 0.6rem;
        }

        :host ::ng-deep .chart-card p-chart,
        :host ::ng-deep .chart-card p-chart > div,
        :host ::ng-deep .chart-card canvas {
            width: 100% !important;
            display: block;
        }

        .legend-divider {
            height: 1px;
            background: var(--border);
            margin: 1rem 0 0.75rem;
        }
        .chart-legend {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            max-height: 180px;
            overflow-y: auto;
            padding-right: 4px;
        }
        .chart-legend::-webkit-scrollbar { width: 3px; }
        .chart-legend::-webkit-scrollbar-track { background: transparent; }
        .chart-legend::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .legend-row {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            padding: 0.28rem 0.5rem;
            border-radius: var(--radius-sm);
            transition: background 0.13s;
            cursor: default;
        }
        .legend-row:hover { background: var(--surface); }
        .legend-swatch {
            width: 10px; height: 10px;
            border-radius: 2px;
            flex-shrink: 0;
        }
        .legend-label {
            font-size: 0.79rem;
            color: var(--ink-2);
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .legend-count {
            font-family: inherit;
            font-size: 0.73rem;
            font-weight: 700;
            color: var(--ink-3);
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 0.1rem 0.45rem;
            border-radius: 6px;
            white-space: nowrap;
        }

        /* ─────────────────────────────────────────────────────
           MANAGER SECTION
        ───────────────────────────────────────────────────── */
        .manager-card {
            background: var(--panel);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-sm);
            padding: 1.6rem 1.8rem 1.4rem;
            margin-top: 1.4rem;
        }

        .mgr-filter-bar {
            display: flex;
            align-items: center;
            gap: 0.9rem;
            padding: 0.85rem 1.1rem;
            background: var(--surface);
            border-radius: var(--radius);
            border: 1px solid var(--border);
            margin-bottom: 1.2rem;
            flex-wrap: wrap;
        }
        .mgr-filter-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            color: var(--ink-3);
            white-space: nowrap;
        }

        /* badge system */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.22rem 0.65rem;
            border-radius: 6px;
            font-size: 0.78rem;
            font-weight: 700;
            font-family: inherit;
        }
        .badge-approved { background: var(--green-dim);  color: #0A6043; }
        .badge-pending  { background: var(--amber-dim);  color: #7A4500; }
        .badge-rejected { background: var(--red-dim);    color: #8C2010; }

        /* PrimeNG table overrides */
        :host ::ng-deep .clean-table .p-datatable-thead > tr > th {
            background: var(--surface);
            color: var(--ink-3);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.09em;
            border: none;
            border-bottom: 1px solid var(--border);
            padding: 0.85rem 1rem;
        }
        :host ::ng-deep .clean-table .p-datatable-tbody > tr > td {
            font-size: 0.86rem;
            color: var(--ink);
            border: none;
            border-bottom: 1px solid var(--border);
            padding: 0.85rem 1rem;
            vertical-align: middle;
        }
        :host ::ng-deep .clean-table .p-datatable-tbody > tr:last-child > td {
            border-bottom: none;
        }
        :host ::ng-deep .clean-table .p-datatable-tbody > tr:hover > td {
            background: var(--surface);
        }
        :host ::ng-deep .clean-table .p-datatable-emptymessage td {
            color: var(--ink-3);
            text-align: center;
            font-size: 0.86rem;
            padding: 2.5rem;
        }

        /* AutoComplete overrides */
        :host ::ng-deep .p-autocomplete .p-inputtext {
            border-radius: var(--radius-sm);
            border: 1px solid var(--border);
            font-size: 0.84rem;
            color: var(--ink);
            background: var(--panel);
            padding: 0.48rem 0.85rem;
            font-family: inherit;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        :host ::ng-deep .p-autocomplete .p-inputtext:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-dim);
            outline: none;
        }
        :host ::ng-deep .p-autocomplete-dropdown {
            background: var(--accent) !important;
            border-color: var(--accent) !important;
            border-radius: 0 var(--radius-sm) var(--radius-sm) 0 !important;
        }

        /* Fieldset reset */
        :host ::ng-deep .p-fieldset {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
        }
        :host ::ng-deep .p-fieldset .p-fieldset-legend { display: none; }
        :host ::ng-deep .p-fieldset .p-fieldset-content { padding: 0 !important; }

        /* ─────────────────────────────────────────────────────
           PERIOD PERIOD LABEL TAG (inside manager section)
        ───────────────────────────────────────────────────── */
        .period-tag {
            font-size: 0.73rem;
            font-weight: 700;
            color: var(--accent);
            background: var(--accent-dim);
            border-radius: 20px;
            padding: 0.22rem 0.75rem;
        }

        /* ─────────────────────────────────────────────────────
           RESPONSIVE
        ───────────────────────────────────────────────────── */
        @media (max-width: 1100px) {
            .ticker-strip { grid-template-columns: repeat(2, 1fr); }
            .ticker-cell:nth-child(2) { border-right: none; }
            .ticker-cell:nth-child(3) { border-top: 1px solid var(--border); }
            .charts-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
            .ticker-strip { grid-template-columns: 1fr; }
            .ticker-cell { border-right: none; border-bottom: 1px solid var(--border); }
            .ticker-cell:last-child { border-bottom: none; }
            .page-wrap { padding: 1.2rem 1rem 2rem; }
        }
    `,
    template: `

<!-- ══════════════════════════════════════════
     SKELETON  (while loading)
══════════════════════════════════════════ -->
<ng-container *ngIf="isLoading">
    <div class="sk-wrap">

        <!-- ticker skeleton -->
        <div class="sk-ticker">
            <div class="sk-ticker-cell" *ngFor="let _ of [0,1,2,3]">
                <div class="skeleton sk-h10" style="width:50%"></div>
                <div class="skeleton sk-h36"></div>
                <div class="skeleton sk-h12"></div>
            </div>
        </div>

        <!-- filter bar skeleton -->
        <div class="skeleton sk-filter-bar"></div>

        <!-- charts row 1 -->
        <div class="sk-2col">
            <div class="sk-chart-card" *ngFor="let _ of [0,1]">
                <div class="skeleton sk-chart-title"></div>
                <div class="skeleton sk-chart-body"></div>
                <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.4rem;">
                    <div class="skeleton sk-h10" *ngFor="let __ of [0,1,2,3]" [style.width]="['80%','60%','70%','50%'][__]"></div>
                </div>
            </div>
        </div>

        <!-- charts row 2 -->
        <div class="sk-2col">
            <div class="sk-chart-card" *ngFor="let _ of [0,1]">
                <div class="skeleton sk-chart-title"></div>
                <div class="skeleton sk-chart-body"></div>
                <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.4rem;">
                    <div class="skeleton sk-h10" *ngFor="let __ of [0,1,2,3]" [style.width]="['75%','55%','65%','45%'][__]"></div>
                </div>
            </div>
        </div>

        <!-- manager table skeleton -->
        <div class="sk-lg-card" *ngIf="userType === 'Superadmin'" style="margin-top:1.4rem;">
            <div class="skeleton sk-h10" style="width:230px;margin-bottom:1.4rem;"></div>
            <div style="height:44px;" class="skeleton" style="border-radius:var(--radius);margin-bottom:1rem;"></div>
            <div class="sk-table-header">
                <div class="skeleton sk-th" *ngFor="let _ of [0,1,2,3,4]"></div>
            </div>
            <div class="sk-table-row" *ngFor="let _ of [0,1,2,3,4]">
                <div class="skeleton sk-td" *ngFor="let __ of [0,1,2,3,4]"></div>
            </div>
        </div>

    </div>
</ng-container>


<!-- ══════════════════════════════════════════
     ACTUAL DASHBOARD  (after loading)
══════════════════════════════════════════ -->
<ng-container *ngIf="!isLoading">
<div class="page-wrap">

    <!-- ── TICKER STRIP ── -->
    <div class="ticker-strip">

        <div class="ticker-cell total">
            <div class="ticker-accent-bar"></div>
            <div class="ticker-label">
                <span class="ticker-label-dot"></span>
                Total Solutions
            </div>
            <div class="ticker-number">{{ allReposCount }}</div>
            <div class="ticker-sub"><i class="pi pi-database"></i> All submissions</div>
        </div>

        <div class="ticker-cell approved">
            <div class="ticker-accent-bar"></div>
            <div class="ticker-label">
                <span class="ticker-label-dot"></span>
                Approved
            </div>
            <div class="ticker-number">{{ approvedReposCount }}</div>
            <div class="ticker-sub"><i class="pi pi-check-circle"></i> Published &amp; live</div>
        </div>

        <div class="ticker-cell pending">
            <div class="ticker-accent-bar"></div>
            <div class="ticker-label">
                <span class="ticker-label-dot"></span>
                Pending Approval
            </div>
            <div class="ticker-number">{{ sentforapprovalcount }}</div>
            <div class="ticker-sub"><i class="pi pi-clock"></i> Awaiting review</div>
        </div>

        <div class="ticker-cell rejected">
            <div class="ticker-accent-bar"></div>
            <div class="ticker-label">
                <span class="ticker-label-dot"></span>
                Rejected
            </div>
            <div class="ticker-number">{{ unapprovedReposCount }}</div>
            <div class="ticker-sub"><i class="pi pi-times-circle"></i> Needs revision</div>
        </div>

    </div><!-- /ticker-strip -->


    <!-- ── GLOBAL FILTER BAR ── -->
    <div class="filter-bar">

        <span class="filter-bar-label">
            <i class="pi pi-sliders-h" style="margin-right:0.3rem;"></i>Period
        </span>

        <button *ngFor="let opt of chartPeriodOptions"
            class="period-pill"
            [class.active]="globalPeriod === opt.value"
            (click)="onGlobalPeriodChange(opt.value)">
            {{ opt.label }}
        </button>

        <ng-container *ngIf="showCustomPicker">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-left:0.3rem;">
                <span class="date-sep">From</span>
                <input type="date" [(ngModel)]="customFrom" class="date-input" />
                <span class="date-sep">To</span>
                <input type="date" [(ngModel)]="customTo"   class="date-input" />
                <button class="apply-btn"
                    (click)="onCustomDateApply()"
                    [disabled]="!customFrom || !customTo">Apply</button>
                <button class="clear-btn" (click)="onCustomDateClear()">Clear</button>
            </div>
        </ng-container>

        <span *ngIf="globalPeriod !== 'all'" class="active-badge">
            {{ filterPeriodLabel }}
        </span>

    </div><!-- /filter-bar -->


    <!-- ── ANALYTICS SECTION HEADER ── -->
    <div class="section-header">
        <div class="section-title">
            <span class="section-title-rule"></span>
            Analytics Overview
        </div>
    </div>


    <!-- ── CHARTS ROW 1 : Module + Domain ── -->
    <div class="charts-grid">

        <div class="chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <span class="chart-card-dot" style="background:#1B6EF3;"></span>
                    Solutions by Module
                </div>
               
            </div>
            <p-chart type="bar" [data]="moduleData" [options]="barChartOptions" *ngIf="moduleData"></p-chart>
            <ng-container *ngIf="moduleLegend.length">
                <div class="legend-divider"></div>
                <div class="chart-legend">
                    <div class="legend-row" *ngFor="let item of moduleLegend">
                        <span class="legend-swatch" [style.background]="item.color"></span>
                        <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                        <span class="legend-count">{{ item.count }}</span>
                    </div>
                </div>
            </ng-container>
        </div>

        <div class="chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <span class="chart-card-dot" style="background:#F79009;"></span>
                    Solutions by Domain
                </div>
            </div>
            <p-chart type="bar" [data]="domainData" [options]="barChartOptions" *ngIf="domainData"></p-chart>
            <ng-container *ngIf="domainLegend.length">
                <div class="legend-divider"></div>
                <div class="chart-legend">
                    <div class="legend-row" *ngFor="let item of domainLegend">
                        <span class="legend-swatch" [style.background]="item.color"></span>
                        <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                        <span class="legend-count">{{ item.count }}</span>
                    </div>
                </div>
            </ng-container>
        </div>

    </div><!-- /charts-grid row 1 -->


    <!-- ── CHARTS ROW 2 : Contributors ── -->
    <div class="charts-grid">

        <div class="chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <span class="chart-card-dot" style="background:#12B76A;"></span>
                    Top Contributors — Overall
                </div>
            </div>
            <p-chart type="bar" [data]="s_chartData" [options]="barChartOptions" *ngIf="s_chartData"></p-chart>
            <ng-container *ngIf="overallLegend.length">
                <div class="legend-divider"></div>
                <div class="chart-legend">
                    <div class="legend-row" *ngFor="let item of overallLegend">
                        <span class="legend-swatch" [style.background]="item.color"></span>
                        <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                        <span class="legend-count">{{ item.count }}</span>
                    </div>
                </div>
            </ng-container>
        </div>

        <div class="chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <span class="chart-card-dot" style="background:#A855F7;"></span>
                    Top Contributors — Community
                </div>
            </div>
            <p-chart type="bar" [data]="chartData" [options]="barChartOptions" *ngIf="chartData"></p-chart>
            <ng-container *ngIf="communityLegend.length">
                <div class="legend-divider"></div>
                <div class="chart-legend">
                    <div class="legend-row" *ngFor="let item of communityLegend">
                        <span class="legend-swatch" [style.background]="item.color"></span>
                        <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                        <span class="legend-count">{{ item.count }}</span>
                    </div>
                </div>
            </ng-container>
        </div>

    </div><!-- /charts-grid row 2 -->


    <!-- ── MANAGER STATS (Superadmin only) ── -->
    <div class="manager-card" *ngIf="userType === 'Superadmin'">

        <div class="section-header">
            <div class="section-title">
                <span class="section-title-rule"></span>
                Manager Repository Statistics
            </div>
            <span class="period-tag">{{ filterPeriodLabel }}</span>
        </div>

        <div class="mgr-filter-bar">
            <span class="mgr-filter-label">Filter by</span>
            <p-autoComplete
                [(ngModel)]="selectedYear"
                [suggestions]="filteredYears"
                (completeMethod)="filterYears($event)"
                (onDropdownClick)="onYearDropdownClick()"
                placeholder="All Years"
                field="label"
                [dropdown]="true"
                [showClear]="true"
                (onSelect)="onYearSelect($event)"
                (onClear)="onYearClear()"
                [forceSelection]="true"
                [style]="{ width: '160px' }"
            ></p-autoComplete>
            <p-autoComplete
                [(ngModel)]="selectedMonth"
                [suggestions]="filteredMonths"
                (completeMethod)="filterMonths($event)"
                (onDropdownClick)="onMonthDropdownClick()"
                placeholder="All Months"
                field="label"
                [dropdown]="true"
                [showClear]="true"
                (onSelect)="onMonthSelect($event)"
                (onClear)="onMonthClear()"
                [forceSelection]="true"
                [style]="{ width: '160px' }"
            ></p-autoComplete>
        </div>

        <p-table [value]="managerStatsTableData"
                 [tableStyle]="{ 'min-width': '36rem' }"
                 styleClass="p-datatable-striped clean-table">
            <ng-template pTemplate="header">
                <tr>
                    <th>Manager</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Rejected</th>
                    <th>Total</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-stat>
                <tr>
                    <td>
                        <div style="display:flex;align-items:center;gap:0.6rem;">
                            <div style="width:28px;height:28px;border-radius:50%;
                                        background:var(--accent-dim);color:var(--accent);
                                        display:flex;align-items:center;justify-content:center;
                                        font-size:0.72rem;font-weight:800;flex-shrink:0;">
                                {{ stat.manager_name?.charAt(0)?.toUpperCase() }}
                            </div>
                            <strong style="font-size:0.86rem;color:var(--ink);">{{ stat.manager_name }}</strong>
                        </div>
                    </td>
                    <td><span class="badge badge-approved">{{ stat.approved }}</span></td>
                    <td><span class="badge badge-pending">{{ stat.pending }}</span></td>
                    <td><span class="badge badge-rejected">{{ stat.rejected }}</span></td>
                    <td>
                        <span style="font-size:0.88rem;font-weight:800;color:var(--ink);">
                            {{ stat.total }}
                        </span>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr><td colspan="5">No data available for the selected filters.</td></tr>
            </ng-template>
        </p-table>

    </div><!-- /manager-card -->

</div><!-- /page-wrap -->
</ng-container>

    `
})
export class Dashboard implements OnInit {
    // ── Loading flag ──────────────────────────────────────────────
    isLoading = true;

    private loadedCount = 0;
    private readonly TOTAL_LOADS = 4;

    allReposCount = 0;
    approvedReposCount = 0;
    unapprovedReposCount = 0;
    sentforapprovalcount = 0;

    moduleData: any;
    domainData: any;

    userType: string = '';
    username: string = '';
    today: string = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    chartData: any;
    s_chartData: any;

    moduleLegend: LegendItem[] = [];
    domainLegend: LegendItem[] = [];
    overallLegend: LegendItem[] = [];
    communityLegend: LegendItem[] = [];

    contributorPeriod: 'all' | 'monthly' | 'quarterly' | 'yearly' = 'all';

    globalPeriod: 'all' | 'monthly' | 'quarterly' | 'yearly' | 'custom' = 'all';
    customFrom: string = '';
    customTo:   string = '';
    showCustomPicker = false;

    chartPeriodOptions: { label: string; value: 'all' | 'monthly' | 'quarterly' | 'yearly' | 'custom' }[] = [
        { label: 'All Time',     value: 'all'       },
        { label: 'This Month',   value: 'monthly'   },
        { label: 'This Quarter', value: 'quarterly' },
        { label: 'This Year',    value: 'yearly'    },
        { label: 'Custom',       value: 'custom'    }
    ];

    barChartOptions: any;
    chartOptions: any;
    s_chartOptions: any;
    managerChartOptions: any;

    managerStatsTableData: any[] = [];

    yearOptions: any[] = [];
    monthOptions = [
        { label: 'January', value: 1 }, { label: 'February', value: 2 },
        { label: 'March', value: 3 },   { label: 'April', value: 4 },
        { label: 'May', value: 5 },     { label: 'June', value: 6 },
        { label: 'July', value: 7 },    { label: 'August', value: 8 },
        { label: 'September', value: 9 },{ label: 'October', value: 10 },
        { label: 'November', value: 11 },{ label: 'December', value: 12 }
    ];
    groupByOptions = [
        { label: 'By Month', value: 'month' },
        { label: 'By Manager', value: 'manager' }
    ];

    selectedYear: any = null;
    selectedMonth: any = null;
    selectedGroupBy: any = null;
    filteredYears: any[] = [];
    filteredMonths: any[] = [];
    filteredGroupByOptions: any[] = [];

    selectedManagerType: any = { label: 'IRM', value: 'irm' };
    managerTypeOptions = [
        { label: 'IRM', value: 'irm' }, { label: 'SRM', value: 'srm' },
        { label: 'BUH', value: 'buh' }, { label: 'BGH', value: 'bgh' }
    ];
    filteredManagerTypes: any[] = [];

    constructor(
        private managereposervice: ManageReposService,
        public messageservice: MessageService,
        private authservice: AuthenticationService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) {
        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.2,
            layout: { padding: { top: 4, bottom: 0 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0A0F1E',
                    titleFont: { family: 'Inter', size: 12 },
                    bodyFont: { family: 'Inter', size: 11 },
                    cornerRadius: 8,
                    padding: 10,
                    callbacks: { title: (items: any[]) => items[0]?.label ?? '' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(10,15,30,0.05)' },
                    border: { display: false },
                    ticks: { color: '#8492A8', font: { family: 'Inter', size: 11 }, precision: 0 }
                },
                x: { display: false }
            }
        };

        this.chartOptions = this.barChartOptions;
        this.s_chartOptions = this.barChartOptions;
        this.managerChartOptions = this.barChartOptions;
    }

    private markLoaded(): void {
        this.loadedCount++;
        if (this.loadedCount >= this.TOTAL_LOADS) {
            this.isLoading = false;
        }
    }

    private sortDescending(labels: string[], counts: number[], colors: string[]): { labels: string[]; counts: number[]; colors: string[] } {
        const paired = labels.map((label, i) => ({ label, count: counts[i] }));
        paired.sort((a, b) => b.count - a.count);
        return {
            labels: paired.map((p) => p.label),
            counts: paired.map((p) => p.count),
            colors: paired.map((_, i) => colors[i % colors.length])
        };
    }

    totalCount(items: LegendItem[]): number {
        return items.reduce((sum, item) => sum + item.count, 0);
    }

    private buildLegend(chartObj: any): LegendItem[] {
        if (!chartObj?.labels?.length) return [];
        const dataset = chartObj.datasets?.[0];
        const rawColors: string[] = Array.isArray(dataset?.backgroundColor)
            ? dataset.backgroundColor
            : (chartObj.labels as string[]).map(() => dataset?.backgroundColor ?? '#1B6EF3');
        const paired = (chartObj.labels as string[]).map((label: string, i: number) => ({
            label,
            count: (dataset?.data?.[i] ?? 0) as number,
            color: rawColors[i % rawColors.length]
        }));
        paired.sort((a, b) => b.count - a.count);
        return paired;
    }

    onGlobalPeriodChange(period: 'all' | 'monthly' | 'quarterly' | 'yearly' | 'custom') {
        this.globalPeriod = period;
        this.showCustomPicker = period === 'custom';
        if (period !== 'custom') {
            this.customFrom = '';
            this.customTo   = '';
            this.refreshAll();
        }
    }

    onCustomDateApply() {
        if (this.customFrom && this.customTo) { this.refreshAll(); }
    }

    onCustomDateClear() {
        this.customFrom     = '';
        this.customTo       = '';
        this.globalPeriod   = 'all';
        this.showCustomPicker = false;
        this.refreshAll();
    }

    private refreshAll() {
        this.isLoading   = true;
        this.loadedCount = 0;
        this.fetchCounts();
        this.loadChartData();
        this.fetchtopvotes();
        this.fetchtopusers();
        if (this.userType === 'Superadmin') { this.loadManagerStats(); }
    }

    private getPeriodParams(): { period?: string; from?: string; to?: string } {
        if (this.globalPeriod === 'custom') { return { from: this.customFrom, to: this.customTo }; }
        if (this.globalPeriod === 'all') return {};
        return { period: this.globalPeriod };
    }

    ngOnInit() {
        this.fetchCounts();
        this.setGreetingMessage();
        this.getUsername();
        this.loadChartData();
        this.fetchtopvotes();
        this.fetchtopusers();

        this.authservice.user.subscribe((user) => {
            this.userType = user?.type || '';
            this.username = user?.name || 'User';
            if (this.userType === 'Superadmin') {
                this.selectedGroupBy = this.groupByOptions[0];
                this.loadAvailableYears();
            }
        });
    }

    filterYears(e: any)      { const q = e.query.toLowerCase(); this.filteredYears  = !q ? [...this.yearOptions]  : this.yearOptions.filter(y => y.label.toLowerCase().includes(q)); }
    filterMonths(e: any)     { const q = e.query.toLowerCase(); this.filteredMonths = !q ? [...this.monthOptions] : this.monthOptions.filter(m => m.label.toLowerCase().includes(q)); }
    filterGroupBy(e: any)    { const q = e.query.toLowerCase(); this.filteredGroupByOptions = !q ? [...this.groupByOptions] : this.groupByOptions.filter(o => o.label.toLowerCase().includes(q)); }
    filterManagerTypes(e: any){ const q = e.query.toLowerCase(); this.filteredManagerTypes = !q ? [...this.managerTypeOptions] : this.managerTypeOptions.filter(o => o.label.toLowerCase().includes(q)); }

    onYearDropdownClick()    { this.filteredYears  = [...this.yearOptions]; }
    onMonthDropdownClick()   { this.filteredMonths = [...this.monthOptions]; }
    onGroupByDropdownClick() { this.filteredGroupByOptions = [...this.groupByOptions]; }
    onManagerTypeDropdownClick() { this.filteredManagerTypes = [...this.managerTypeOptions]; }

    onYearSelect(e: any)  { this.selectedYear  = e.value ?? e; this.loadManagerStats(); }
    onYearClear()         { this.selectedYear  = null;          this.loadManagerStats(); }
    onMonthSelect(e: any) { this.selectedMonth = e.value ?? e; this.loadManagerStats(); }
    onMonthClear()        { this.selectedMonth = null;          this.loadManagerStats(); }
    onGroupBySelect(_: any)    { this.onFilterChange(); }
    onManagerTypeSelect(_: any){ this.onFilterChange(); }

    getSelectedGroupByValue(): string { return this.selectedGroupBy?.value || 'month'; }
    onFilterChange() { setTimeout(() => this.loadManagerStats(), 0); }

    loadAvailableYears() {
        this.managereposervice.getAvailableYears().subscribe({
            next: (response: any) => {
                if (response.success && Array.isArray(response.years)) {
                    this.yearOptions   = response.years.map((y: number) => ({ label: y.toString(), value: y }));
                    this.filteredYears = [...this.yearOptions];
                }
                this.loadManagerStats();
            },
            error: (err) => console.error('Error loading years', err)
        });
    }

    loadManagerStats() {
        if (this.userType !== 'Superadmin') return;
        const yearValue  = typeof this.selectedYear  === 'object' ? this.selectedYear?.value  : this.selectedYear;
        const monthValue = typeof this.selectedMonth === 'object' ? this.selectedMonth?.value : this.selectedMonth;
        const p = this.getPeriodParams();

        this.managereposervice.getManagerStatsMonthly(yearValue, monthValue, p.period, p.from, p.to).subscribe({
            next: (response: any) => {
                if (response.success && Array.isArray(response.data)) {
                    const agg: Record<string, { approved: number; pending: number; rejected: number; total: number }> = {};
                    for (const item of response.data) {
                        if (!agg[item.manager_name]) { agg[item.manager_name] = { approved: 0, pending: 0, rejected: 0, total: 0 }; }
                        agg[item.manager_name].approved  += item.approved  || 0;
                        agg[item.manager_name].pending   += item.pending   || 0;
                        agg[item.manager_name].rejected  += item.rejected  || 0;
                        agg[item.manager_name].total     += item.total     || 0;
                    }
                    this.managerStatsTableData = Object.entries(agg).map(([name, stats]) => ({ manager_name: name, ...stats }));
                } else {
                    this.managerStatsTableData = [];
                }
            },
            error: () => { this.managerStatsTableData = []; }
        });
    }

    get filterPeriodLabel(): string {
        if (this.globalPeriod === 'custom' && this.customFrom && this.customTo) {
            return `${this.customFrom} → ${this.customTo}`;
        }
        return this.chartPeriodOptions.find(o => o.value === this.globalPeriod)?.label ?? 'All Time';
    }

    onContributorPeriodChange(period: string) {
        this.contributorPeriod = period as 'all' | 'monthly' | 'quarterly' | 'yearly';
        this.loadedCount = Math.max(0, this.loadedCount - 2);
        this.isLoading = true;
        this.fetchtopvotes();
        this.fetchtopusers();
    }

    fetchtopvotes() {
        const p = this.getPeriodParams();
        this.managereposervice.getTopUsersVotes('user', p.period, p.from, p.to).subscribe({
            next: (data: any) => {
                const srcDataset = data.datasets?.[0] ?? {};
                const rawLabels: string[]  = data.labels ?? [];
                const rawCounts: number[]  = srcDataset.data ?? [];
                const paletteColors = ['#E8401C','#F79009','#12B76A','#1B6EF3','#A855F7','#0D9488','#DB2777','#84CC16','#F43F5E','#06B6D4','#8B5CF6','#EAB308','#10B981','#6366F1'];
                const rawColors = rawLabels.map((_, i) => paletteColors[i % paletteColors.length]);
                const sorted = this.sortDescending(rawLabels, rawCounts, rawColors);
                this.chartData = { labels: sorted.labels, datasets: [{ ...srcDataset, data: sorted.counts, backgroundColor: sorted.colors, borderRadius: 6, borderSkipped: false }] };
                this.communityLegend = this.buildLegend(this.chartData);
            },
            error: (err) => console.error('Error loading top votes chart', err),
            complete: () => this.markLoaded()
        });
    }

    fetchtopusers() {
        const p = this.getPeriodParams();
        this.managereposervice.getTopUsersSolutions('user', p.period, p.from, p.to).subscribe({
            next: (data: any) => {
                const srcDataset = data.datasets?.[0] ?? {};
                const rawLabels: string[]  = data.labels ?? [];
                const rawCounts: number[]  = srcDataset.data ?? [];
                const paletteColors = ['#1B6EF3','#12B76A','#F79009','#E8401C','#A855F7','#0D9488','#DB2777','#84CC16','#06B6D4','#F43F5E','#8B5CF6','#EAB308','#6366F1','#10B981'];
                const rawColors = rawLabels.map((_, i) => paletteColors[i % paletteColors.length]);
                const sorted = this.sortDescending(rawLabels, rawCounts, rawColors);
                this.s_chartData = { labels: sorted.labels, datasets: [{ ...srcDataset, data: sorted.counts, backgroundColor: sorted.colors, borderRadius: 6, borderSkipped: false }] };
                this.overallLegend = this.buildLegend(this.s_chartData);
            },
            error: (err) => console.error('Error loading top users chart', err),
            complete: () => this.markLoaded()
        });
    }

    setGreetingMessage() {
        const h = new Date().getHours();
        this.username = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
    }

    getUsername() {
        this.authservice.user.subscribe((user) => {
            this.username = user?.name || 'User';
            this.userType = user?.type || '';
        });
    }

    fetchCounts() {
        const p = this.getPeriodParams();
        this.managereposervice.fetchCounts(p.period, p.from, p.to).subscribe({
            next: (data: any) => {
                this.allReposCount        = data.all_repos_count;
                this.approvedReposCount   = data.approved_repos_count;
                this.unapprovedReposCount = data.unapproved_repos_count;
                this.sentforapprovalcount = data.sentforapproval_count;
            },
            error: (err) => console.error('Error loading counts', err),
            complete: () => this.markLoaded()
        });
    }

    loadChartData() {
        const truncateName = (name: string): string => name.split(/[:,\s]/)[0].trim();
        const moduleColors = ['#1B6EF3','#E8401C','#12B76A','#A855F7','#F79009','#0D9488','#DB2777','#84CC16','#06B6D4','#F43F5E','#8B5CF6','#EAB308','#6366F1','#10B981'];
        const domainColors = ['#F79009','#1B6EF3','#E8401C','#12B76A','#A855F7','#DB2777','#0D9488','#F43F5E','#84CC16','#8B5CF6','#06B6D4','#EAB308','#10B981','#6366F1'];
        const p = this.getPeriodParams();

        forkJoin({
            module: this.managereposervice.getdatabymodule(p.period, p.from, p.to),
            domain: this.managereposervice.getdatabydomain(p.period, p.from, p.to)
        }).subscribe({
            next: ({ module: moduleRaw, domain: domainRaw }: any) => {
                const truncatedData: { [key: string]: number } = {};
                Object.entries(moduleRaw).forEach(([key, value]) => {
                    const s = truncateName(key);
                    truncatedData[s] = (truncatedData[s] || 0) + (value as number);
                });
                const moduleSorted = this.sortDescending(Object.keys(truncatedData), Object.values(truncatedData) as number[], moduleColors);
                this.moduleData = {
                    labels: moduleSorted.labels,
                    datasets: [{ label: 'Modules', data: moduleSorted.counts, backgroundColor: moduleSorted.colors, borderRadius: 6, borderSkipped: false }]
                };
                this.moduleLegend = moduleSorted.labels.map((label, i) => ({ label, count: moduleSorted.counts[i], color: moduleSorted.colors[i] }));

                const domainSorted = this.sortDescending(Object.keys(domainRaw), Object.values(domainRaw) as number[], domainColors);
                this.domainData = {
                    labels: domainSorted.labels,
                    datasets: [{ label: 'Domains', data: domainSorted.counts, backgroundColor: domainSorted.colors, borderRadius: 6, borderSkipped: false }]
                };
                this.domainLegend = domainSorted.labels.map((label, i) => ({ label, count: domainSorted.counts[i], color: domainSorted.colors[i] }));
            },
            error: (err) => console.error('Error loading chart data', err),
            complete: () => this.markLoaded()
        });
    }
}