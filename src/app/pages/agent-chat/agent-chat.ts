import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AgentChatResponse, ManageReposService, Repository } from '../service/managerepos.service';
import { SecureFileViewerComponent } from '../securefileviewer/securefileviewer';


interface ChatMessage {
  role: 'user' | 'agent';
  text: string;
  sources?: AgentChatResponse['sources'];
}

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DialogModule, ToastModule, SecureFileViewerComponent],
  providers: [MessageService],
  templateUrl: './agent-chat.html',
  styleUrl: './agent-chat.scss'
})
export class AgentChatComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  currentQuery = '';
  isLoading = false;

  dialogVisible = false;
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
    private sanitizer: DomSanitizer
  ) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Converts "- Label: value" lines into bold-labeled HTML paragraphs.
   * Falls back to plain escaped text for any line that doesn't match the pattern.
   */
  formatMessage(text: string): SafeHtml {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = text.split('\n');
  const blocks: { label: string | null; content: string[] }[] = [];
  let current: { label: string | null; content: string[] } | null = null;

  // Matches "- Label: value", "Label: value" — but only short, title-like labels
  // (avoids false-matching a sentence that happens to contain a colon)
  const headerPattern = /^-*\s*([A-Za-z][A-Za-z\s]{1,40}):\s*(.*)$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headerMatch = line.match(headerPattern);

    if (headerMatch) {
      current = { label: headerMatch[1].trim(), content: [] };
      if (headerMatch[2].trim()) {
        current.content.push(headerMatch[2].trim());
      }
      blocks.push(current);
    } else if (current) {
      current.content.push(line);
    } else {
      current = { label: null, content: [line] };
      blocks.push(current);
    }
  }

  const html = blocks.map(b => {
    const contentText = escapeHtml(b.content.join(' '));
    if (b.label) {
      return `<div class="answer-line"><span class="answer-label">${escapeHtml(b.label)}:</span> <span class="answer-value">${contentText}</span></div>`;
    }
    return `<div class="answer-line">${contentText}</div>`;
  }).join('');

  return this.sanitizer.bypassSecurityTrustHtml(html);
}

  sendMessage(): void {
    const query = this.currentQuery.trim();
    if (!query || this.isLoading) return;

    this.messages.push({ role: 'user', text: query });
    this.currentQuery = '';
    this.isLoading = true;

    this.manageReposService.chatWithAgent(query).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'agent',
          text: response.answer,
          sources: response.sources
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.messages.push({
          role: 'agent',
          text: 'Something went wrong reaching the assistant. Please try again.'
        });
        this.isLoading = false;
        console.error('Agent chat error:', err);
      }
    });
  }

  openSolution(docId: number): void {
    this.dialogVisible = true;
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
          detail: err.message || 'Unknown error'
        });
      }
    });
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


  closeSolution(): void {
  this.dialogVisible = false;
  this.selectedDoc = null;
  this.summaryText = null;
  this.summaryError = null;
}

  openAttachment(repo: Repository): void {
    const base = 'http://127.0.0.1:5001';
    const fileUrl = `${base}/repos/refview/${repo.id}`;
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