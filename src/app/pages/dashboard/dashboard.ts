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
          <span>{{ userType === 'Superadmin' ? 'Total Solutions' : 'Added Solutions' }}</span>
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
        <p-fieldset legend="Solutions Added by Module" toggleable="true" collapsed="false">
          <p-chart type="bar" [data]="moduleData" *ngIf="moduleData"></p-chart>
        </p-fieldset>
        <p-fieldset legend="Solutions Added by Domain" toggleable="true" collapsed="false">
          <p-chart type="bar" [data]="domainData" *ngIf="domainData"></p-chart>
        </p-fieldset>
      </div>
      <div class="charts-container">
        <p-fieldset legend="Top Contributors by Overall Solutions" toggleable="true">
          <p-chart type="bar" [data]="s_chartData" *ngIf="s_chartData"></p-chart>
        </p-fieldset>
        <p-fieldset legend="Top Contributors by Community" toggleable="true">
          <p-chart type="bar" [data]="chartData" *ngIf="chartData"></p-chart>
        </p-fieldset>
      </div>
    </div>

    <!-- Manager Statistics Section -->
    <!-- Manager Statistics Section - Superadmin only -->
<div class="card" style="margin-top: 2rem;" *ngIf="userType === 'Superadmin'">
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
    [style]="{'width': '180px'}"
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
    [style]="{'width': '180px'}"
  ></p-autoComplete>
</div>

    <div class="manager-stats-table">
      <p-table
        [value]="managerStatsTableData"
        [tableStyle]="{'min-width': '50rem'}"
        styleClass="p-datatable-striped"
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
            <td>{{ stat.manager_name }}</td>
            <td>{{ stat.period }}</td>
            <td><span class="badge" style="background-color:#66BB6A;color:white;padding:0.25rem 0.5rem;border-radius:4px;">{{ stat.approved }}</span></td>
            <td><span class="badge" style="background-color:#FFA726;color:white;padding:0.25rem 0.5rem;border-radius:4px;">{{ stat.pending }}</span></td>
            <td><span class="badge" style="background-color:#EF5350;color:white;padding:0.25rem 0.5rem;border-radius:4px;">{{ stat.rejected }}</span></td>
            <td><strong>{{ stat.total }}</strong></td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" style="text-align:center;">No data available for the selected filters.</td>
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

  userType: string = '';

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

selectedManagerType: any = { label: 'IRM', value: 'irm' };

managerTypeOptions = [
  { label: 'IRM', value: 'irm' },
  { label: 'SRM', value: 'srm' },
  { label: 'BUH', value: 'buh' },
  { label: 'BGH', value: 'bgh' }
];

filteredManagerTypes: any[] = [];
  
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

  // Load manager stats only after we know the user type
  this.authservice.user.subscribe(user => {
    this.userType = user?.type || '';
    this.username = user?.name || 'User';

    if (this.userType === 'Superadmin') {
      this.selectedGroupBy = this.groupByOptions[0];
      this.loadAvailableYears();
    }
  });
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
  // PrimeNG passes the selected object in event.value
  this.selectedYear = event.value ?? event;
  console.log('Year selected:', this.selectedYear);
  this.loadManagerStats();
}

onYearClear() {
  this.selectedYear = null;
  this.loadManagerStats();
}

onMonthSelect(event: any) {
  // PrimeNG passes the selected object in event.value
  this.selectedMonth = event.value ?? event;
  console.log('Month selected:', this.selectedMonth);
  this.loadManagerStats();
}

onMonthClear() {
  this.selectedMonth = null;
  this.loadManagerStats();
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
      if (response.success && response.years && Array.isArray(response.years)) {
        this.yearOptions = response.years.map((year: number) => ({
          label: year.toString(),
          value: year
        }));
        this.filteredYears = [...this.yearOptions];
      }
      this.loadManagerStats();
    },
    error: (err) => {
      console.error('Error loading years - user may not have access', err);
      // Do NOT call loadManagerStats if years failed — user isn't Superadmin
    }
  });
}

  // ================= FIXED: Manager stats with filters =================
  loadManagerStats() {
  if (this.userType !== 'Superadmin') {
    return; // Safety guard — do nothing for non-Superadmin
  }

  const yearValue = typeof this.selectedYear === 'object'
    ? this.selectedYear?.value
    : this.selectedYear;

  const monthValue = typeof this.selectedMonth === 'object'
    ? this.selectedMonth?.value
    : this.selectedMonth;

  console.log('loadManagerStats called with:', { year: yearValue, month: monthValue });

  this.managereposervice.getManagerStatsMonthly(yearValue, monthValue).subscribe({
    next: (response: any) => {
      if (response.success && response.data && Array.isArray(response.data)) {
        this.managerStatsTableData = response.data.map((item: any) => {
          const monthName = new Date(item.year, item.month - 1)
            .toLocaleString('default', { month: 'short' });
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
      console.error('Error loading manager stats', err);
      this.managerStatsTableData = [];
    }
  });
}

filterManagerTypes(event: any) {
  const query = event.query.toLowerCase();
  this.filteredManagerTypes = !query
    ? [...this.managerTypeOptions]
    : this.managerTypeOptions.filter(o => o.label.toLowerCase().includes(query));
}

onManagerTypeDropdownClick() {
  this.filteredManagerTypes = [...this.managerTypeOptions];
}

onManagerTypeSelect(event: any) {
  this.onFilterChange();
}

  onFilterChange() {
  setTimeout(() => {
    const yearValue = this.selectedYear?.value;
    const monthValue = this.selectedMonth?.value;
    console.log('Sending filters → year:', yearValue, 'month:', monthValue);
    this.loadManagerStats();
  }, 0);
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
    this.userType = user?.type || '';
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