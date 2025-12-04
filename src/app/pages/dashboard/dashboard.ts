import { HeaderData } from './../../../../node_modules/tar/dist/esm/header.d';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { FieldsetModule } from 'primeng/fieldset';


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
  gap: 2rem; /* space between the two charts */
  flex-wrap: wrap; /* allow wrapping on smaller screens */
}

.charts-container p-fieldset {
  flex: 1 1 45%; /* Take about 45% width each, adjust as needed */
  min-width: 250px; /* minimum width to keep charts readable */
}

    .chart-section {
      margin-top: 1.2rem;
      flex: 1 1 auto;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
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
    <div class="header">{{ greetingMessage }}, {{ username }}!</div>
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
      <div  class="card">
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
    <p-fieldset legend="Solutions by Module" toggleable="true" collapsed="false" >
      <p-chart type="bar" [data]="moduleData" *ngIf="moduleData"></p-chart>
    </p-fieldset>
    <p-fieldset legend="Solutions by Domain" toggleable="true" collapsed="false" >
      <p-chart type="bar" [data]="domainData" *ngIf="domainData"></p-chart>
    </p-fieldset>
  </div>
  <div class="charts-container">
    <p-fieldset legend="Top Contributors by Solutions" toggleable="true">
          <p-chart type="bar" [data]="chartData" *ngIf="chartData"></p-chart>
        </p-fieldset>
    <p-fieldset legend="Top Contributors by Community" toggleable="true">
          <p-chart type="bar" [data]="chartData" *ngIf="chartData"></p-chart>
        </p-fieldset>
  </div>
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

  chartData: any; // Top users votes chart data
  chartOptions: any;


  constructor(
    private managereposervice: ManageReposService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private confirmationService: ConfirmationService,
    public router: Router
  ) {
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
  }

  ngOnInit() {
    this.fetchCounts();
    this.setGreetingMessage();
    this.getUsername();
    this.loadChartData();
    this.fetchtopvotes();
  }

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
    this.managereposervice.getdatabymodule().subscribe(data => {
      this.moduleData = {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Modules',
            data: Object.values(data),
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
