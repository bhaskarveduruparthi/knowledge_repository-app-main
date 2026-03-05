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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ChartModule,
    FieldsetModule,
    TableModule,
    AutoCompleteModule
  ],
  providers: [
    MessageService,
    ManageAdminsService,
    ConfirmationService
  ],
  styles: `
    /* ─── Skeleton shimmer keyframe ─── */
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .skeleton {
      border-radius: 10px;
      background: linear-gradient(90deg, #e8f0eb 25%, #d4e6da 50%, #e8f0eb 75%);
      background-size: 600px 100%;
      animation: shimmer 1.5s infinite linear;
    }

    /* ─── Skeleton layout blocks ─── */
    .sk-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.4rem;
      margin-bottom: 1.8rem;
    }
    .sk-stat-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 1.5rem 1.6rem 1.4rem;
      border: 1px solid #e8f0eb;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }
    .sk-stat-top { display: flex; justify-content: space-between; }
    .sk-label  { height: 11px; width: 55%;  }
    .sk-icon   { height: 36px; width: 36px; border-radius: 10px; }
    .sk-count  { height: 38px; width: 45%; margin-top: 0.3rem; }
    .sk-footer { height: 10px; width: 60%; }

    .sk-charts-outer {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.8rem 2rem;
      border: 1px solid rgba(34,139,78,0.10);
      box-shadow: 0 2px 14px rgba(13,61,36,0.06);
      margin-bottom: 1.8rem;
    }
    .sk-section-title { height: 16px; width: 200px; margin-bottom: 1.4rem; }
    .sk-charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.6rem;
      margin-bottom: 1.6rem;
    }
    .sk-charts-row:last-child { margin-bottom: 0; }
    .sk-chart-panel {
      background: #f9fdf9;
      border-radius: 14px;
      border: 1px solid rgba(34,139,78,0.09);
      padding: 1.2rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sk-chart-title  { height: 11px; width: 55%; }
    .sk-chart-canvas { height: 160px; width: 100%; border-radius: 8px; }
    .sk-legend-divider { height: 1px; background: rgba(34,139,78,0.10); margin: 0.3rem 0; }
    .sk-legend-row {
      display: flex; align-items: center; gap: 0.55rem;
    }
    .sk-legend-swatch { height: 11px; width: 11px; border-radius: 3px; flex-shrink: 0; }
    .sk-legend-label  { height: 10px; flex: 1; border-radius: 6px; }
    .sk-legend-count  { height: 18px; width: 32px; border-radius: 10px; }

    .sk-manager-section {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.8rem 2rem;
      border: 1px solid rgba(34,139,78,0.10);
      box-shadow: 0 2px 14px rgba(13,61,36,0.06);
      margin-top: 1.8rem;
    }
    .sk-filters-row {
      display: flex; gap: 1rem; margin-bottom: 1.4rem;
      padding: 1rem 1.2rem; background: #f4f8f5;
      border-radius: 12px; border: 1px solid rgba(34,139,78,0.09);
    }
    .sk-filter-input { height: 36px; width: 170px; border-radius: 10px; }
    .sk-table-header {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1fr 1fr 1fr 1fr;
      gap: 0; border-bottom: 2px solid rgba(34,139,78,0.12);
      padding: 0.85rem 1rem; background: #f4f8f5;
      border-radius: 8px 8px 0 0;
    }
    .sk-th { height: 11px; border-radius: 6px; }
    .sk-table-row {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1fr 1fr 1fr 1fr;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(34,139,78,0.07);
      gap: 1rem;
    }
    .sk-td { height: 18px; border-radius: 6px; }

    :host {
      display: block;
      padding: 2.5rem 2.8rem;
      font-family: 'Arial', sans-serif;
      min-height: 100vh;
      background: #f4f8f5;
      background-image:
        radial-gradient(circle at 10% 10%, rgba(17, 96, 60, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(34, 139, 78, 0.05) 0%, transparent 50%);
    }

    /* ── Stat cards ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.4rem;
      margin-bottom: 1.8rem;
    }
    .stat-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 1.5rem 1.6rem 1.4rem;
      border: 1px solid #e8f0eb;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      position: relative;
      overflow: hidden;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .stat-card.total    { border-left: 4px solid #43bfe6; }
    .stat-card.approved { border-left: 4px solid #228b4e; }
    .stat-card.pending  { border-left: 4px solid #f59e0b; }
    .stat-card.rejected { border-left: 4px solid #94a3b8; }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.09);
    }
    .stat-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .stat-label {
      font-size: 0.78rem; font-weight: 600; color: #7a9484;
      text-transform: uppercase; letter-spacing: 0.07em;
    }
    .stat-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .stat-card.total    .stat-icon { background: rgba(67,191,230,0.12);  color: #1aabd3; }
    .stat-card.approved .stat-icon { background: rgba(34,139,78,0.12);   color: #228b4e; }
    .stat-card.pending  .stat-icon { background: rgba(245,158,11,0.12);  color: #d97706; }
    .stat-card.rejected .stat-icon { background: rgba(148,163,184,0.15); color: #64748b; }
    .stat-count {
      font-size: 2.4rem; font-weight: 700; color: #0d3d24;
      line-height: 1; margin-top: 1rem; letter-spacing: -0.03em;
    }
    .stat-footer { font-size: 0.75rem; color: #a0b8a8; margin-top: 0.5rem; }

    .section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.15rem; color: #0d3d24;
      margin-bottom: 1.4rem; letter-spacing: -0.01em;
      display: flex; align-items: center; gap: 0.6rem;
    }
    .section-title::before {
      content: ''; display: inline-block;
      width: 4px; height: 18px;
      background: linear-gradient(180deg, #228b4e, #34c97a);
      border-radius: 3px;
    }

    .charts-outer {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.8rem 2rem;
      border: 1px solid rgba(34,139,78,0.10);
      box-shadow: 0 2px 14px rgba(13,61,36,0.06);
      margin-bottom: 1.8rem;
    }
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.6rem;
      margin-bottom: 1.6rem;
    }
    .charts-row:last-child { margin-bottom: 0; }

    .chart-panel {
      background: #f9fdf9;
      border-radius: 14px;
      border: 1px solid rgba(34,139,78,0.09);
      padding: 1.2rem 1.4rem 1.2rem;
      transition: box-shadow 0.2s;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .chart-panel:hover { box-shadow: 0 4px 18px rgba(13,61,36,0.08); }

    .chart-panel-title {
      font-size: 0.82rem; font-weight: 600; color: #4a7060;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 0.9rem;
      display: flex; align-items: center; gap: 0.45rem;
    }
    .chart-panel-title .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #228b4e; flex-shrink: 0;
    }

    :host ::ng-deep .chart-panel p-chart,
    :host ::ng-deep .chart-panel p-chart > div,
    :host ::ng-deep .chart-panel canvas {
      width: 100% !important;
      display: block;
    }

    .chart-legend {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      max-height: 200px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .chart-legend::-webkit-scrollbar { width: 4px; }
    .chart-legend::-webkit-scrollbar-track { background: transparent; }
    .chart-legend::-webkit-scrollbar-thumb {
      background: rgba(34,139,78,0.2); border-radius: 4px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.3rem 0.55rem;
      border-radius: 7px;
      transition: background 0.15s;
    }
    .legend-item:hover { background: rgba(34,139,78,0.07); }

    .legend-swatch {
      width: 11px; height: 11px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .legend-label {
      font-size: 0.8rem;
      color: #1a3828;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .legend-count {
      font-size: 0.76rem;
      font-weight: 700;
      color: #228b4e;
      background: rgba(34,139,78,0.10);
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
      white-space: nowrap;
    }

    .legend-divider {
      height: 1px;
      background: rgba(34,139,78,0.10);
      margin: 0.8rem 0 0.5rem;
    }

    .manager-section {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.8rem 2rem;
      border: 1px solid rgba(34,139,78,0.10);
      box-shadow: 0 2px 14px rgba(13,61,36,0.06);
      margin-top: 1.8rem;
    }
    .filters-row {
      display: flex; align-items: center; gap: 1rem;
      margin-bottom: 1.4rem; padding: 1rem 1.2rem;
      background: #f4f8f5; border-radius: 12px;
      border: 1px solid rgba(34,139,78,0.09); flex-wrap: wrap;
    }
    .filter-label {
      font-size: 0.8rem; font-weight: 600; color: #4a7060;
      text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap;
    }

    .badge {
      display: inline-block; padding: 0.22rem 0.65rem;
      border-radius: 20px; font-size: 0.8rem; font-weight: 600;
    }
    .badge-approved { background: #d1fae5; color: #065f46; }
    .badge-pending  { background: #fef3c7; color: #92400e; }
    .badge-rejected { background: #f1f5f9; color: #475569; }

    :host ::ng-deep .clean-table .p-datatable-thead > tr > th {
      background: #f4f8f5; color: #4a7060; font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      border-bottom: 2px solid rgba(34,139,78,0.12); padding: 0.85rem 1rem;
    }
    :host ::ng-deep .clean-table .p-datatable-tbody > tr > td {
      font-size: 0.88rem; color: #1a3828;
      border-bottom: 1px solid rgba(34,139,78,0.07); padding: 0.85rem 1rem;
    }
    :host ::ng-deep .clean-table .p-datatable-tbody > tr:hover > td { background: #f4f8f5; }
    :host ::ng-deep .clean-table .p-datatable-emptymessage td {
      color: #8aaa96; text-align: center; font-size: 0.88rem; padding: 2rem;
    }

    :host ::ng-deep .p-fieldset { border: none !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; }
    :host ::ng-deep .p-fieldset .p-fieldset-legend { display: none; }
    :host ::ng-deep .p-fieldset .p-fieldset-content { padding: 0 !important; }

    :host ::ng-deep .p-autocomplete .p-inputtext {
      border-radius: 10px; border: 1px solid rgba(34,139,78,0.2);
      font-size: 0.86rem; color: #0d3d24; background: #ffffff; padding: 0.5rem 0.85rem;
    }
    :host ::ng-deep .p-autocomplete .p-inputtext:focus {
      border-color: #228b4e; box-shadow: 0 0 0 3px rgba(34,139,78,0.12);
    }
    :host ::ng-deep .p-autocomplete-dropdown {
      background: #228b4e !important; border-color: #228b4e !important;
      border-radius: 0 10px 10px 0 !important;
    }

    @media (max-width: 1100px) {
      .stats-grid, .sk-stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row, .sk-charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 700px) {
      .stats-grid, .sk-stats-grid { grid-template-columns: 1fr; }
      :host { padding: 1.4rem 1rem; }
      .charts-outer, .sk-charts-outer { padding: 1.2rem 1rem; }
    }
  `,
  template: `
    <!-- ═══════════════════════════════════════
         SKELETON LOADER  (shown while loading)
    ════════════════════════════════════════════ -->
    <ng-container *ngIf="isLoading">

      <!-- Skeleton stat cards -->
      <div class="sk-stats-grid">
        <div class="sk-stat-card" *ngFor="let _ of [0,1,2,3]">
          <div class="sk-stat-top">
            <div class="skeleton sk-label"></div>
            <div class="skeleton sk-icon"></div>
          </div>
          <div class="skeleton sk-count"></div>
          <div class="skeleton sk-footer"></div>
        </div>
      </div>

      <!-- Skeleton charts block -->
      <div class="sk-charts-outer">
        <div class="skeleton sk-section-title"></div>

        <div class="sk-charts-row" *ngFor="let _ of [0,1]">
          <div class="sk-chart-panel" *ngFor="let __ of [0,1]">
            <div class="skeleton sk-chart-title"></div>
            <div class="skeleton sk-chart-canvas"></div>
            <div class="sk-legend-divider"></div>
            <div class="sk-legend-row" *ngFor="let ___ of [0,1,2,3]">
              <div class="skeleton sk-legend-swatch"></div>
              <div class="skeleton sk-legend-label"></div>
              <div class="skeleton sk-legend-count"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton manager table (only for Superadmin) -->
      <div class="sk-manager-section" *ngIf="userType === 'Superadmin'">
        <div class="skeleton sk-section-title" style="width:260px; margin-bottom:1.4rem;"></div>
        <div class="sk-filters-row">
          <div class="skeleton sk-filter-input"></div>
          <div class="skeleton sk-filter-input"></div>
        </div>
        <div class="sk-table-header">
          <div class="skeleton sk-th" *ngFor="let _ of [0,1,2,3,4,5]"></div>
        </div>
        <div class="sk-table-row" *ngFor="let _ of [0,1,2,3,4]">
          <div class="skeleton sk-td" *ngFor="let __ of [0,1,2,3,4,5]"></div>
        </div>
      </div>

    </ng-container>

    <!-- ═══════════════════════════════════════
         ACTUAL DASHBOARD  (shown after loading)
    ════════════════════════════════════════════ -->
    <ng-container *ngIf="!isLoading">

      <!-- ── Stat Cards ── -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-top">
            <div class="stat-label">Total Solutions</div>
            <div class="stat-icon"><i class="pi pi-book"></i></div>
          </div>
          <div class="stat-count">{{ allReposCount }}</div>
          <div class="stat-footer">All submissions</div>
        </div>
        <div class="stat-card approved">
          <div class="stat-top">
            <div class="stat-label">Approved</div>
            <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          </div>
          <div class="stat-count">{{ approvedReposCount }}</div>
          <div class="stat-footer">Published &amp; live</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-top">
            <div class="stat-label">Pending Approval</div>
            <div class="stat-icon"><i class="pi pi-clock"></i></div>
          </div>
          <div class="stat-count">{{ sentforapprovalcount }}</div>
          <div class="stat-footer">Awaiting review</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-top">
            <div class="stat-label">Rejected</div>
            <div class="stat-icon"><i class="pi pi-times-circle"></i></div>
          </div>
          <div class="stat-count">{{ unapprovedReposCount }}</div>
          <div class="stat-footer">Needs revision</div>
        </div>
      </div>

      <!-- ── Charts Block ── -->
      <div class="charts-outer">
        <div class="section-title">Analytics Overview</div>

        <div class="charts-row">
          <div class="chart-panel">
            <div class="chart-panel-title"><span class="dot"></span> Solutions by Module</div>
            <p-chart type="bar" [data]="moduleData" [options]="barChartOptions" *ngIf="moduleData"></p-chart>
            <ng-container *ngIf="moduleLegend.length">
              <div class="legend-divider"></div>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let item of moduleLegend">
                  <span class="legend-swatch" [style.background]="item.color"></span>
                  <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                </div>
              </div>
            </ng-container>
          </div>

          <div class="chart-panel">
            <div class="chart-panel-title"><span class="dot" style="background:#f59e0b"></span> Solutions by Domain</div>
            <p-chart type="bar" [data]="domainData" [options]="barChartOptions" *ngIf="domainData"></p-chart>
            <ng-container *ngIf="domainLegend.length">
              <div class="legend-divider"></div>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let item of domainLegend">
                  <span class="legend-swatch" [style.background]="item.color"></span>
                  <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-panel">
            <div class="chart-panel-title"><span class="dot" style="background:#43bfe6"></span> Top Contributors — Overall</div>
            <p-chart type="bar" [data]="s_chartData" [options]="barChartOptions" *ngIf="s_chartData"></p-chart>
            <ng-container *ngIf="overallLegend.length">
              <div class="legend-divider"></div>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let item of overallLegend">
                  <span class="legend-swatch" [style.background]="item.color"></span>
                  <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                </div>
              </div>
            </ng-container>
          </div>

          <div class="chart-panel">
            <div class="chart-panel-title"><span class="dot" style="background:#a855f7"></span> Top Contributors — Community</div>
            <p-chart type="bar" [data]="chartData" [options]="barChartOptions" *ngIf="chartData"></p-chart>
            <ng-container *ngIf="communityLegend.length">
              <div class="legend-divider"></div>
              <div class="chart-legend">
                <div class="legend-item" *ngFor="let item of communityLegend">
                  <span class="legend-swatch" [style.background]="item.color"></span>
                  <span class="legend-label" [title]="item.label">{{ item.label }}</span>
                  <span class="legend-count">{{ item.count }}</span>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- ── Manager Stats (Superadmin only) ── -->
      <div class="manager-section" *ngIf="userType === 'Superadmin'">
        <div class="section-title">Manager Repository Statistics</div>

        <div class="filters-row">
          <span class="filter-label">Filter by</span>
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
            [style]="{'width': '170px'}"
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
            [style]="{'width': '170px'}"
          ></p-autoComplete>
        </div>

        <p-table
          [value]="managerStatsTableData"
          [tableStyle]="{'min-width': '50rem'}"
          styleClass="p-datatable-striped clean-table"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Manager</th>
              <th>Period</th>
              <th>Approved</th>
              <th>Pending</th>
              <th>Rejected</th>
              <th>Total</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-stat>
            <tr>
              <td><strong>{{ stat.manager_name }}</strong></td>
              <td>{{ stat.period }}</td>
              <td><span class="badge badge-approved">{{ stat.approved }}</span></td>
              <td><span class="badge badge-pending">{{ stat.pending }}</span></td>
              <td><span class="badge badge-rejected">{{ stat.rejected }}</span></td>
              <td><strong style="color:#228b4e;">{{ stat.total }}</strong></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6">No data available for the selected filters.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

    </ng-container>
  `
})
export class Dashboard implements OnInit {
  // ── Loading flag ──────────────────────────────────────────────
  isLoading = true;

  // Tracks how many of the 4 core fetches have completed
  private loadedCount = 0;
  private readonly TOTAL_LOADS = 4; // counts, module, domain, topVotes+topUsers (forkJoin counts as 1)

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

  moduleLegend:    LegendItem[] = [];
  domainLegend:    LegendItem[] = [];
  overallLegend:   LegendItem[] = [];
  communityLegend: LegendItem[] = [];

  barChartOptions: any;
  chartOptions: any;
  s_chartOptions: any;
  managerChartOptions: any;

  managerStatsTableData: any[] = [];

  yearOptions: any[] = [];
  monthOptions = [
    { label: 'January',   value: 1  }, { label: 'February',  value: 2  },
    { label: 'March',     value: 3  }, { label: 'April',     value: 4  },
    { label: 'May',       value: 5  }, { label: 'June',      value: 6  },
    { label: 'July',      value: 7  }, { label: 'August',    value: 8  },
    { label: 'September', value: 9  }, { label: 'October',   value: 10 },
    { label: 'November',  value: 11 }, { label: 'December',  value: 12 }
  ];
  groupByOptions = [
    { label: 'By Month',   value: 'month'   },
    { label: 'By Manager', value: 'manager' }
  ];

  selectedYear: any = null; selectedMonth: any = null; selectedGroupBy: any = null;
  filteredYears: any[] = []; filteredMonths: any[] = []; filteredGroupByOptions: any[] = [];

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
          backgroundColor: 'rgba(13,61,36,0.85)',
          titleFont: { family: 'DM Sans', size: 12 },
          bodyFont:  { family: 'DM Sans', size: 11 },
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            title: (items: any[]) => items[0]?.label ?? ''
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid:   { color: 'rgba(34,139,78,0.07)' },
          border: { display: false },
          ticks:  { color: '#7a9484', font: { family: 'DM Sans', size: 11 }, precision: 0 }
        },
        x: { display: false }
      }
    };

    this.chartOptions     = this.barChartOptions;
    this.s_chartOptions   = this.barChartOptions;
    this.managerChartOptions = this.barChartOptions;
  }

  // ── Called each time one async fetch completes ────────────────
  private markLoaded(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.TOTAL_LOADS) {
      this.isLoading = false;
    }
  }

  private sortDescending(
    labels: string[],
    counts: number[],
    colors: string[]
  ): { labels: string[]; counts: number[]; colors: string[] } {
    const paired = labels.map((label, i) => ({ label, count: counts[i] }));
    paired.sort((a, b) => b.count - a.count);
    return {
      labels: paired.map(p => p.label),
      counts: paired.map(p => p.count),
      colors: paired.map((_, i) => colors[i % colors.length])
    };
  }

  private buildLegend(chartObj: any): LegendItem[] {
    if (!chartObj?.labels?.length) return [];
    const dataset = chartObj.datasets?.[0];
    const rawColors: string[] = Array.isArray(dataset?.backgroundColor)
      ? dataset.backgroundColor
      : (chartObj.labels as string[]).map(() => dataset?.backgroundColor ?? '#228b4e');

    const paired = (chartObj.labels as string[]).map((label: string, i: number) => ({
      label,
      count: (dataset?.data?.[i] ?? 0) as number,
      color: rawColors[i % rawColors.length]
    }));
    paired.sort((a, b) => b.count - a.count);
    return paired;
  }

  ngOnInit() {
    this.fetchCounts();
    this.setGreetingMessage();
    this.getUsername();
    this.loadChartData();
    this.fetchtopvotes();
    this.fetchtopusers();

    this.authservice.user.subscribe(user => {
      this.userType = user?.type || '';
      this.username = user?.name || 'User';
      if (this.userType === 'Superadmin') {
        this.selectedGroupBy = this.groupByOptions[0];
        this.loadAvailableYears();
      }
    });
  }

  filterYears(e: any)        { const q = e.query.toLowerCase(); this.filteredYears          = !q ? [...this.yearOptions]       : this.yearOptions.filter(y => y.label.toLowerCase().includes(q)); }
  filterMonths(e: any)       { const q = e.query.toLowerCase(); this.filteredMonths         = !q ? [...this.monthOptions]      : this.monthOptions.filter(m => m.label.toLowerCase().includes(q)); }
  filterGroupBy(e: any)      { const q = e.query.toLowerCase(); this.filteredGroupByOptions = !q ? [...this.groupByOptions]    : this.groupByOptions.filter(o => o.label.toLowerCase().includes(q)); }
  filterManagerTypes(e: any) { const q = e.query.toLowerCase(); this.filteredManagerTypes   = !q ? [...this.managerTypeOptions]: this.managerTypeOptions.filter(o => o.label.toLowerCase().includes(q)); }

  onYearDropdownClick()        { this.filteredYears          = [...this.yearOptions]; }
  onMonthDropdownClick()       { this.filteredMonths         = [...this.monthOptions]; }
  onGroupByDropdownClick()     { this.filteredGroupByOptions = [...this.groupByOptions]; }
  onManagerTypeDropdownClick() { this.filteredManagerTypes   = [...this.managerTypeOptions]; }

  onYearSelect(e: any)  { this.selectedYear  = e.value ?? e; this.loadManagerStats(); }
  onYearClear()          { this.selectedYear  = null; this.loadManagerStats(); }
  onMonthSelect(e: any) { this.selectedMonth = e.value ?? e; this.loadManagerStats(); }
  onMonthClear()         { this.selectedMonth = null; this.loadManagerStats(); }
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

    this.managereposervice.getManagerStatsMonthly(yearValue, monthValue).subscribe({
      next: (response: any) => {
        this.managerStatsTableData = response.success && Array.isArray(response.data)
          ? response.data.map((item: any) => {
              const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' });
              return { manager_name: item.manager_name, period: `${monthName} ${item.year}`,
                approved: item.approved||0, pending: item.pending||0, rejected: item.rejected||0, total: item.total||0 };
            })
          : [];
      },
      error: () => { this.managerStatsTableData = []; }
    });
  }

  fetchtopvotes() {
    this.managereposervice.getTopUsersVotes().subscribe({
      next: (data: any) => {
        const srcDataset = data.datasets?.[0] ?? {};
        const rawLabels: string[] = data.labels ?? [];
        const rawCounts: number[] = srcDataset.data ?? [];
        const paletteColors = ['#a855f7','#228b4e','#43bfe6','#f59e0b','#34c97a','#64748b','#0ea5e9'];
        const rawColors: string[] = rawLabels.map((_, i) => paletteColors[i % paletteColors.length]);
        const sorted = this.sortDescending(rawLabels, rawCounts, rawColors);
        this.chartData = {
          labels: sorted.labels,
          datasets: [{
            ...srcDataset,
            data: sorted.counts,
            backgroundColor: sorted.colors,
            borderRadius: 6,
            borderSkipped: false
          }]
        };
        this.communityLegend = this.buildLegend(this.chartData);
      },
      error: (err) => console.error('Error loading top votes chart', err),
      complete: () => this.markLoaded()   // ← mark complete
    });
  }

  fetchtopusers() {
    this.managereposervice.getTopUsersSolutions().subscribe({
      next: (data: any) => {
        const srcDataset = data.datasets?.[0] ?? {};
        const rawLabels: string[] = data.labels ?? [];
        const rawCounts: number[] = srcDataset.data ?? [];
        const paletteColors = ['#43bfe6','#228b4e','#a855f7','#f59e0b','#34c97a','#64748b','#0ea5e9'];
        const rawColors: string[] = rawLabels.map((_, i) => paletteColors[i % paletteColors.length]);
        const sorted = this.sortDescending(rawLabels, rawCounts, rawColors);
        this.s_chartData = {
          labels: sorted.labels,
          datasets: [{
            ...srcDataset,
            data: sorted.counts,
            backgroundColor: sorted.colors,
            borderRadius: 6,
            borderSkipped: false
          }]
        };
        this.overallLegend = this.buildLegend(this.s_chartData);
      },
      error: (err) => console.error('Error loading top users chart', err),
      complete: () => this.markLoaded()   // ← mark complete
    });
  }

  setGreetingMessage() {
    const h = new Date().getHours();
    this.username = h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
  }

  getUsername() {
    this.authservice.user.subscribe(user => {
      this.username = user?.name || 'User';
      this.userType = user?.type || '';
    });
  }

  fetchCounts() {
    this.managereposervice.fetchCounts().subscribe({
      next: (data: any) => {
        this.allReposCount        = data.all_repos_count;
        this.approvedReposCount   = data.approved_repos_count;
        this.unapprovedReposCount = data.unapproved_repos_count;
        this.sentforapprovalcount = data.sentforapproval_count;
      },
      error: (err) => console.error('Error loading counts', err),
      complete: () => this.markLoaded()   // ← mark complete
    });
  }

  loadChartData() {
    const truncateName = (name: string): string => name.split(/[:,\s]/)[0].trim();
    const moduleColors = ['#228b4e','#34c97a','#43bfe6','#f59e0b','#a855f7','#64748b','#0ea5e9'];
    const domainColors = ['#f59e0b','#228b4e','#a855f7','#43bfe6','#34c97a','#64748b','#0ea5e9'];

    // Use forkJoin so module + domain together count as one load tick
    forkJoin({
      module: this.managereposervice.getdatabymodule(),
      domain: this.managereposervice.getdatabydomain()
    }).subscribe({
      next: ({ module: moduleRaw, domain: domainRaw }: any) => {
        // Module chart
        const truncatedData: { [key: string]: number } = {};
        Object.entries(moduleRaw).forEach(([key, value]) => {
          const s = truncateName(key);
          truncatedData[s] = (truncatedData[s] || 0) + (value as number);
        });
        const moduleSorted = this.sortDescending(
          Object.keys(truncatedData),
          Object.values(truncatedData) as number[],
          moduleColors
        );
        this.moduleData = {
          labels: moduleSorted.labels,
          datasets: [{ label: 'Modules', data: moduleSorted.counts,
            backgroundColor: moduleSorted.colors, borderRadius: 6, borderSkipped: false }]
        };
        this.moduleLegend = moduleSorted.labels.map((label, i) => ({
          label, count: moduleSorted.counts[i], color: moduleSorted.colors[i]
        }));

        // Domain chart
        const domainSorted = this.sortDescending(
          Object.keys(domainRaw),
          Object.values(domainRaw) as number[],
          domainColors
        );
        this.domainData = {
          labels: domainSorted.labels,
          datasets: [{ label: 'Domains', data: domainSorted.counts,
            backgroundColor: domainSorted.colors, borderRadius: 6, borderSkipped: false }]
        };
        this.domainLegend = domainSorted.labels.map((label, i) => ({
          label, count: domainSorted.counts[i], color: domainSorted.colors[i]
        }));
      },
      error: (err) => console.error('Error loading chart data', err),
      complete: () => this.markLoaded()   // ← counts as 1 combined load
    });
  }
}