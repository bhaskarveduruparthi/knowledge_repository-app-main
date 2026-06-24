import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ManageReposService, Repository } from '../service/managerepos.service';
import { UrlService } from '../service/url.service';
import { SecureFileViewerComponent } from '../securefileviewer/securefileviewer';

@Component({
  selector: 'app-solution-detail-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, ToastModule, SecureFileViewerComponent],
  providers: [MessageService],
  templateUrl: './solution-detail-dialog.html',
  styleUrl: './solution-detail-dialog.scss'
})
export class SolutionDetailDialog implements OnChanges {
  @Input() docId: number | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  selectedDoc: Repository | null = null;
  isDocLoading = false;
  isAttachmentLoading = false;

  isSummarizing = false;
  summaryText: string | null = null;
  summaryError: string | null = null;

  constructor(
    private manageReposService: ManageReposService,
    private http: HttpClient,
    private messageService: MessageService,
    public urlService: UrlService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.docId) {
      this.loadDocument(this.docId);
    }
    if (changes['visible'] && !this.visible) {
      this.resetState();
    }
  }

  private loadDocument(docId: number): void {
    this.isDocLoading = true;
    this.selectedDoc = null;

    this.manageReposService.getAgentDocument(docId).subscribe({
      next: (doc) => {
        this.selectedDoc = doc;
        this.isDocLoading = false;
      },
      error: (err) => {
        this.isDocLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to load solution',
          detail: err.status === 401 ? 'Your session may have expired — please log in again.' : (err.message || 'Unknown error')
        });
      }
    });
  }

  private resetState(): void {
    this.selectedDoc = null;
    this.summaryText = null;
    this.summaryError = null;
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetState();
  }

  summarizeDocument(): void {
    if (!this.selectedDoc) return;
    this.isSummarizing = true;
    this.summaryText = null;
    this.summaryError = null;

    this.manageReposService.summarizeDocument(this.selectedDoc.id).subscribe({
      next: (res) => {
        this.summaryText = res.summary;
        this.isSummarizing = false;
      },
      error: (err) => {
        this.summaryError = err.error?.error || 'Could not summarize this document.';
        this.isSummarizing = false;
      }
    });
  }

  openAttachment(repo: Repository): void {
    const base = this.urlService.getApiUrl();
    const fileUrl = `${base}repos/refview/${repo.id}`;
    const raw = localStorage.getItem('token') || '';
    const token = raw ? (JSON.parse(raw)?.access_token ?? raw) : '';

    if (!token) {
      this.messageService.add({ severity: 'warn', summary: 'Not logged in',
        detail: 'You must be logged in to view attachments.' });
      return;
    }

    this.isAttachmentLoading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(fileUrl, { headers, responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.isAttachmentLoading = false;
        const objectUrl = URL.createObjectURL(blob);
        const newTab = window.open(objectUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

        if (!newTab) {
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = repo.attachment_filename || `repository_${repo.id}`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      },
      error: (err: any) => {
        this.isAttachmentLoading = false;
        const detail =
          err.status === 403 ? 'You need Superadmin approval before viewing this attachment.' :
          err.status === 401 ? 'Please log in again.' :
          err.message || 'Could not load the file. Please try again.';
        this.messageService.add({
          severity: err.status === 403 ? 'warn' : 'error',
          summary: err.status === 403 ? 'Access Denied' : 'Failed to open attachment',
          detail
        });
      }
    });
  }

  requestDownload(repo: Repository): void {
    this.manageReposService.requestDownload(repo.id, '').subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Request Sent',
          detail: 'Your download request has been sent to the Superadmin for approval.' });
      },
      error: (err) => {
        if (err.status === 400) {
          this.messageService.add({ severity: 'info', summary: 'Already Requested',
            detail: 'Your request is already pending approval.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Request Failed',
            detail: err.message || 'Could not send request. Please try again.' });
        }
      }
    });
  }
}