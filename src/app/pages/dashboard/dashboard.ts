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
    :host {
      display: block;
      padding: 2rem 3rem;
      color: #222;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
    }
    .header {
      font-size: 2rem;
      font-weight: 700;
      color: #11224E;
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .card {
      background: rgba(255,255,255, 0.96);
      border-radius: 22px;
      box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
      padding: 1.5rem 1.4rem 2rem 1.4rem;
      min-height: 100px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      position: relative;
      color: #11224E;
      transition: box-shadow 0.2s;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header span {
      font-weight: 700;
      font-size: 1.11rem;
      color: #30475f;
    }
    .icon-container {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.4rem;
      margin-left: 0.5rem;
    }
    .icon-total { background: #43bfe6; }
    .icon-approved { background: #ffbd4a; }
    .icon-unapproved { background: #62738c; }
    .icon-users { background: #a23ccc; }
    .count {
      font-size: 2.2rem;
      font-weight: 800;
      color: #1a2f4b;
      margin-top: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .chart-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: .6rem;
      color: #1a2f4b;
    }
    .charts-container {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .charts-container p-fieldset {
      flex: 1 1 45%;
      min-width: 250px;
    }
    .chart-section {
      margin-top: 1.2rem;
      flex: 1 1 auto;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .filter-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-label {
      font-weight: 600;
      color: #11224E;
    }
    .manager-stats-table {
      margin-top: 1rem;
    }
    @media (max-width: 1100px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 700px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  template: `
    <div class="header"></div>
    <div class="grid">
      <div class="card">
        <div class="card-header">
          <span>Total Solutions</span>
          <div class="icon-container icon-total">
            <i class="pi pi-book"></i>
          </div>
        </div>
        <div class="count">{{ allReposCount }}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>Approved Solutions</span>
          <div class="icon-container icon-approved">
            <i class="pi pi-file"></i>
          </div>
        </div>
        <div class="count">{{ approvedReposCount }}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>Pending for Approval</span>
          <div class="icon-container icon-users">
            <i class="pi pi-file"></i>
          </div>
        </div>
        <div class="count">{{ sentforapprovalcount }}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <span>Rejected Solutions</span>
          <div class="icon-container icon-unapproved">
            <i class="pi pi-file"></i>
          </div>
        </div>
        <div class="count">{{ unapprovedReposCount }}</div>
      </div>
    </div>

    <div class="card">
      <div class="charts-container">
        <p-fieldset legend="Solutions by Module" toggleable="true" collapsed="false">
          <p-chart type="bar" [data]="moduleData" *ngIf="moduleData"></p-chart>
        </p-fieldset>
        <p-fieldset legend="Solutions by Domain" toggleable="true" collapsed="false">
          <p-chart type="bar" [data]="domainData" *ngIf="domainData"></p-chart>
        </p-fieldset>
      </div>
      <div class="charts-container">
        <p-fieldset legend="Top Contributors by Solutions" toggleable="true">
          <p-chart type="bar" [data]="s_chartData" *ngIf="s_chartData"></p-chart>
        </p-fieldset>
        <p-fieldset legend="Top Contributors by Community" toggleable="true">
          <p-chart type="bar" [data]="chartData" *ngIf="chartData"></p-chart>
        </p-fieldset>
      </div>
    </div>

    <!-- Manager Statistics Section -->
    <div class="card" style="margin-top: 2rem;">
      <p-fieldset legend="Manager Repository Statistics" toggleable="true" collapsed="false">
        <div class="filter-container">
          <span class="filter-label">Filter by:</span>
          <p-autoComplete 
            [(ngModel)]="selectedYear" 
            [suggestions]="filteredYears"
            (completeMethod)="filterYears($event)"
            (onDropdownClick)="onYearDropdownClick()"
            placeholder="Select Year"
            field="label"
            [dropdown]="true"
            [showClear]="true"
            (onSelect)="onYearSelect($event)"
            (onClear)="onYearClear()"
            [forceSelection]="true"
            [style]="{'width': '200px'}"
          ></p-autoComplete>
          <p-autoComplete 
            [(ngModel)]="selectedMonth" 
            [suggestions]="filteredMonths"
            (completeMethod)="filterMonths($event)"
            (onDropdownClick)="onMonthDropdownClick()"
            placeholder="Select Month"
            field="label"
            [dropdown]="true"
            [showClear]="true"
            (onSelect)="onMonthSelect($event)"
            (onClear)="onMonthClear()"
            [forceSelection]="true"
            [style]="{'width': '200px'}"
          ></p-autoComplete>
          <p-autoComplete 
            [(ngModel)]="selectedGroupBy" 
            [suggestions]="filteredGroupByOptions"
            (completeMethod)="filterGroupBy($event)"
            (onDropdownClick)="onGroupByDropdownClick()"
            placeholder="Group By"
            field="label"
            [dropdown]="true"
            (onSelect)="onGroupBySelect($event)"
            [forceSelection]="true"
            [style]="{'width': '200px'}"
          ></p-autoComplete>
        </div>

        <!-- Chart View -->
        <div style="margin-bottom: 2rem;">
          <p-chart 
            type="bar" 
            [data]="managerStatsChartData" 
            [options]="managerChartOptions"
            *ngIf="managerStatsChartData"
          ></p-chart>
        </div>

        <!-- Table View -->
        <div class="manager-stats-table">
          <p-table 
            [value]="managerStatsTableData" 
            [tableStyle]="{'min-width': '50rem'}"
            styleClass="p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Manager</th>
                <th *ngIf="getSelectedGroupByValue() === 'month'">Last Updated</th>
                <th>Approved</th>
                <th>Pending</th>
                <th>Rejected</th>
                <th>Total</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-stat>
              <tr>
                <td>{{ stat.manager_name }}</td>
                <td *ngIf="getSelectedGroupByValue() === 'month'">{{ stat.period }}</td>
                <td>
                  <span class="badge" style="background-color: #66BB6A; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">
                    {{ stat.approved }}
                  </span>
                </td>
                <td>
                  <span class="badge" style="background-color: #FFA726; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">
                    {{ stat.pending }}
                  </span>
                </td>
                <td>
                  <span class="badge" style="background-color: #EF5350; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">
                    {{ stat.rejected }}
                  </span>
                </td>
                <td>
                  <strong>{{ stat.total }}</strong>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td [attr.colspan]="getSelectedGroupByValue() === 'month' ? 6 : 5" style="text-align: center;">
                  No data available for the selected filters.
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-fieldset>
    </div>
  `
})
export class Dashboard implements OnInit {
  allReposCount = 0;
  approvedReposCount = 0;
  unapprovedReposCount = 0;
  sentforapprovalcount = 0;

  moduleData: any;
  domainData: any;

  isvalid = true;
  greetingMessage: string = '';
  username: string = '';

  chartData: any;
  s_chartData: any;
  chartOptions: any;
  s_chartOptions: any;

  // Manager statistics properties
  managerStatsChartData: any;
  managerStatsTableData: any[] = [];
  managerChartOptions: any;
  
  // Filter options
  yearOptions: any[] = [];
  monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];
  groupByOptions = [
    { label: 'By Month', value: 'month' },
    { label: 'By Manager', value: 'manager' }
  ];

  // Selected values (storing full objects for AutoComplete)
  selectedYear: any = null;
  selectedMonth: any = null;
  selectedGroupBy: any = null;

  // Filtered suggestions for AutoComplete
  filteredYears: any[] = [];
  filteredMonths: any[] = [];
  filteredGroupByOptions: any[] = [];

  constructor(
    private managereposervice: ManageReposService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private confirmationService: ConfirmationService,
    public router: Router
  ) {
    // your existing chart options unchanged
    this.chartOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
    this.s_chartOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
    this.managerChartOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };
  }

  ngOnInit() {
    this.fetchCounts();
    this.setGreetingMessage();
    this.getUsername();
    this.loadChartData();
    this.fetchtopvotes();
    this.fetchtopusers();
    
    // Set default group by
    this.selectedGroupBy = this.groupByOptions[0];
    
    // Load years FIRST, then manager stats
    this.loadAvailableYears();
  }

  // ================= FIXED: AutoComplete Filter Methods =================
  filterYears(event: any) {
    const query = event.query.toLowerCase();
    if (!query) {
      this.filteredYears = [...this.yearOptions];
    } else {
      this.filteredYears = this.yearOptions.filter(year => 
        year.label.toLowerCase().includes(query)
      );
    }
  }

  filterMonths(event: any) {
    const query = event.query.toLowerCase();
    if (!query) {
      this.filteredMonths = [...this.monthOptions];
    } else {
      this.filteredMonths = this.monthOptions.filter(month => 
        month.label.toLowerCase().includes(query)
      );
    }
  }

  filterGroupBy(event: any) {
    const query = event.query.toLowerCase();
    if (!query) {
      this.filteredGroupByOptions = [...this.groupByOptions];
    } else {
      this.filteredGroupByOptions = this.groupByOptions.filter(option => 
        option.label.toLowerCase().includes(query)
      );
    }
  }

  // Dropdown click handlers to show all options
  onYearDropdownClick() {
    this.filteredYears = [...this.yearOptions];
  }

  onMonthDropdownClick() {
    this.filteredMonths = [...this.monthOptions];
  }

  onGroupByDropdownClick() {
    this.filteredGroupByOptions = [...this.groupByOptions];
  }

  // ================= FIXED: Selection handlers =================
  onYearSelect(event: any) {
    console.log('Year selected:', event); // debug
    this.onFilterChange();
  }

  onYearClear() {
    this.selectedYear = null;
    this.onFilterChange();
  }

  onMonthSelect(event: any) {
    console.log('Month selected:', event); // debug
    this.onFilterChange();
  }

  onMonthClear() {
    this.selectedMonth = null;
    this.onFilterChange();
  }

  onGroupBySelect(event: any) {
    console.log('GroupBy selected:', event); // debug
    this.onFilterChange();
  }

  // Helper method to get selected group by value
  getSelectedGroupByValue(): string {
    return this.selectedGroupBy?.value || 'month';
  }

  // ================= FIXED: Years loading =================
  loadAvailableYears() {
    this.managereposervice.getAvailableYears().subscribe({
      next: (response: any) => {
        console.log('Years API response:', response); // debug
        if (response.success && response.years && Array.isArray(response.years)) {
          this.yearOptions = response.years.map((year: number) => ({
            label: year.toString(),
            value: year
          }));
          // Ensure filteredYears also has data
          this.filteredYears = [...this.yearOptions];
          // Load manager stats AFTER years are loaded
          this.loadManagerStats();
        } else {
          console.warn('Invalid years response:', response);
          // Load stats anyway for default view
          this.loadManagerStats();
        }
      },
      error: (err) => {
        console.error('Error loading available years', err);
        // Load stats anyway for default view
        this.loadManagerStats();
      }
    });
  }

  // ================= FIXED: Manager stats with filters =================
  loadManagerStats() {
    const yearValue = this.selectedYear?.value;
    const monthValue = this.selectedMonth?.value;
    const groupByValue = this.getSelectedGroupByValue();

    console.log('Loading stats with filters:', { year: yearValue, month: monthValue, groupBy: groupByValue });

    // Load table data with year/month filters
    this.managereposervice.getManagerStatsMonthly(yearValue, monthValue).subscribe({
      next: (response: any) => {
        console.log('Manager stats response:', response);
        if (response.success && response.data && Array.isArray(response.data)) {
          this.managerStatsTableData = response.data.map((item: any) => {
            const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' });
            return {
              manager_name: item.manager_name,
              period: `${monthName} ${item.year}`,
              approved: item.approved || 0,
              pending: item.pending || 0,
              rejected: item.rejected || 0,
              total: item.total || 0
            };
          });
        } else {
          this.managerStatsTableData = [];
        }
      },
      error: (err) => {
        console.error('Error loading manager stats table', err);
        this.managerStatsTableData = [];
      }
    });
  }

  onFilterChange() {
    console.log('Filter changed - reloading stats'); // debug
    this.loadManagerStats();
  }

  // ================= Your existing methods unchanged =================
  fetchtopvotes() {
    this.managereposervice.getTopUsersVotes().subscribe({
      next: (data: any) => {
        this.chartData = {
          labels: data.labels,
          datasets: data.datasets
        };
      },
      error: (err) => {
        console.error('Error loading top votes chart', err);
      }
    });
  }

  fetchtopusers() {
    this.managereposervice.getTopUsersSolutions().subscribe({
      next: (data: any) => {
        this.s_chartData = {
          labels: data.labels,
          datasets: data.datasets
        };
      },
      error: (err) => {
        console.error('Error loading top users chart', err);
      }
    });
  }

  setGreetingMessage() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (hour < 18) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }
  }

  getUsername() {
    this.authservice.user.subscribe(user => {
      this.username = user?.name || 'User';
    });
  }

  fetchCounts() {
    this.managereposervice.fetchCounts().subscribe({
      next: (data: any) => {
        this.allReposCount = data.all_repos_count;
        this.approvedReposCount = data.approved_repos_count;
        this.unapprovedReposCount = data.unapproved_repos_count;
        this.sentforapprovalcount = data.sentforapproval_count;
      },
      error: (err) => {
        console.error('Error loading counts', err);
      }
    });
  }

  loadChartData() {
  const truncateName = (name: string): string => {
    return name.split(/[:,\s]/)[0].trim();
  };

  this.managereposervice.getdatabymodule().subscribe(data => {
    const truncatedData: { [key: string]: number } = {};
    
    // Object.entries handles any safely
    Object.entries(data).forEach(([key, value]) => {
      const shortName = truncateName(key);
      truncatedData[shortName] = (truncatedData[shortName] || 0) + (value as number);
    });
    
    this.moduleData = {
      labels: Object.keys(truncatedData),
      datasets: [
        {
          label: 'Modules',
          data: Object.values(truncatedData),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26A69A', '#AB47BC']
        }
      ]
    };
  });

  this.managereposervice.getdatabydomain().subscribe(data => {
    this.domainData = {
      labels: Object.keys(data),
      datasets: [
        {
          label: 'Domains',
          data: Object.values(data),
          backgroundColor: ['#FFA726', '#26A69A', '#AB47BC', '#42A5F5', '#66BB6A']
        }
      ]
    };
  });
}


}