import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ManageReposService } from '../../service/managerepos.service';

@Component({
  selector: 'app-report-agent-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './report-agent-tab.html',
  styleUrl: './report-agent-tab.scss'
})
export class ReportAgentTab {
  query = '';
  isLoading = false;
  asked = false;
  answer = '';
  reportData: any[] = [];
  downloadable = false;

  constructor(private manageReposService: ManageReposService) {}

  runReport(): void {
    const text = this.query.trim();
    if (!text || this.isLoading) return;

    this.isLoading = true;
    this.asked = true;

    this.manageReposService.runAgentReport(text).subscribe({
      next: (res) => {
        this.answer = res.answer;
        this.reportData = res.report_data;
        this.downloadable = res.downloadable;
        this.isLoading = false;
      },
      error: () => {
        this.answer = 'Something went wrong generating that report. Please try again.';
        this.reportData = [];
        this.downloadable = false;
        this.isLoading = false;
      }
    });
  }

  get columns(): string[] {
    return this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
  }

  columnLabel(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  downloadExcel(): void {
    this.manageReposService.exportAgentReport(this.reportData).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knr_report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    });
  }
}