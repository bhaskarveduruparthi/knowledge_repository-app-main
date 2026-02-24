import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthenticationService } from '../service/authentication.service';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { FluidModule } from 'primeng/fluid';
import { ManageReposService } from '../service/managerepos.service';
import { Subject, takeUntil } from 'rxjs';

interface Question {
  id: number;
  question: string;
  description: string;
  business_justification?: string;
  question_status: 'Open' | 'In Progress' | 'Closed' | 'Pending';
  user_created_id: number;
  username: string;
  created_at: string;
  updated_at: string;
  answers_count: number;
  view_count: number;
  answers: Answer[];
}

interface Answer {
  id: number;
  description: string;
  user_created_id: number;
  username: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  is_upvoted?: boolean;
  is_downvoted?: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    RouterModule,
    ToolbarModule,
    FluidModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    PasswordModule,
    MessageModule,
    PaginatorModule,
    SelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f0f4f0;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* ── Page Shell ── */
    .page-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    /* ── Page Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .page-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #1a3a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .page-icon-wrap i {
      color: #4ade80;
      font-size: 1.25rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a3a1a;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: #6b8f6b;
      margin: 0;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      gap: 0.625rem;
    }

    /* ── Buttons ── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.25rem;
      background: #16a34a;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.1rem;
      background: #fff;
      color: #374151;
      border: 1.5px solid #d1fae5;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-secondary:hover { background: #f0fdf4; border-color: #86efac; }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      background: transparent;
      color: #16a34a;
      border: 1.5px solid #bbf7d0;
      border-radius: 7px;
      font-size: 0.825rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-ghost:hover { background: #f0fdf4; }
    .btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Search / Filter Bar ── */
    .filter-bar {
      background: #fff;
      border: 1.5px solid #e7f5e7;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 0.875rem;
      align-items: center;
      flex-wrap: wrap;
      box-shadow: 0 1px 4px rgba(22,163,74,0.06);
    }

    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
    }

    .search-wrap i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      font-size: 0.9rem;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.875rem 0.5rem 2.25rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #111827;
      background: #fafafa;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }
    .search-input:focus { border-color: #4ade80; background: #fff; }

    .filter-select {
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #374151;
      background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 0.6rem center;
      appearance: none;
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .filter-select:focus { border-color: #4ade80; }

    .filter-count {
      font-size: 0.8rem;
      color: #6b7280;
      white-space: nowrap;
    }

    /* ── Loading ── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      gap: 1rem;
      color: #6b7280;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #d1fae5;
      border-top-color: #16a34a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty State ── */
    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: #fff;
      border: 1.5px solid #e7f5e7;
      border-radius: 16px;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      background: #f0fdf4;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    .empty-icon i { font-size: 2rem; color: #86efac; }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a3a1a;
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0 0 1.5rem;
      font-size: 0.9rem;
    }

    /* ── Question Card ── */
    .question-card {
      background: #fff;
      border: 1.5px solid #e7f5e7;
      border-radius: 14px;
      margin-bottom: 1.25rem;
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
      box-shadow: 0 1px 4px rgba(22,163,74,0.06);
    }

    .question-card:hover {
      border-color: #86efac;
      box-shadow: 0 4px 20px rgba(22,163,74,0.1);
      transform: translateY(-2px);
    }

    /* ── Card Header ── */
    .card-header {
      padding: 1.25rem 1.5rem 1rem;
      border-bottom: 1px solid #f0fdf4;
      background: linear-gradient(180deg, #f9fff9 0%, #fff 100%);
    }

    .card-header-top {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .status-badge {
      flex-shrink: 0;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      margin-top: 2px;
    }

    .badge-open    { background: #dcfce7; color: #15803d; }
    .badge-progress { background: #fef9c3; color: #a16207; }
    .badge-closed  { background: #fee2e2; color: #b91c1c; }
    .badge-pending { background: #dbeafe; color: #1d4ed8; }

    .card-question-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
      line-height: 1.45;
      flex: 1;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: #6b7280;
      flex-wrap: wrap;
    }

    .meta-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1a3a1a;
      color: #4ade80;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .meta-dot { color: #d1d5db; }

    /* ── Card Body ── */
    .card-body {
      padding: 1rem 1.5rem;
    }

    .card-description {
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.65;
      margin: 0 0 0.875rem;
    }

    .biz-justification {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }

    .biz-justification i {
      color: #16a34a;
      font-size: 0.9rem;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .biz-justification-text {
      font-size: 0.825rem;
      color: #15803d;
      line-height: 1.55;
    }

    .biz-label {
      font-weight: 600;
      margin-right: 0.25rem;
    }

    /* ── Stats Row ── */
    .card-stats {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.625rem 1.5rem;
      border-top: 1px solid #f3f4f6;
      border-bottom: 1px solid #f3f4f6;
      background: #fafafa;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 500;
    }

    .stat-pill i { font-size: 0.75rem; color: #9ca3af; }
    .stat-pill .count { color: #374151; font-weight: 600; }

    /* ── Top Answer Preview ── */
    .answer-preview-wrap {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .answer-preview-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.625rem;
    }

    .answer-preview {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: #f9fff9;
      border: 1px solid #d1fae5;
      border-radius: 10px;
      border-left: 3px solid #16a34a;
    }

    .answer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #16a34a, #059669);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .answer-preview-content { flex: 1; min-width: 0; }

    .answer-preview-text {
      font-size: 0.85rem;
      color: #374151;
      line-height: 1.6;
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .answer-preview-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .vote-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .vote-btn {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.6rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 6px;
      background: #fff;
      font-size: 0.78rem;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.15s;
    }

    .vote-btn.upvote:hover { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
    .vote-btn.downvote:hover { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
    .vote-btn.voted-up { border-color: #4ade80; color: #16a34a; background: #f0fdf4; }
    .vote-btn.voted-down { border-color: #f87171; color: #dc2626; background: #fff5f5; }

    .no-answer-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 10px;
      font-size: 0.85rem;
      color: #9ca3af;
    }

    /* ── Card Footer ── */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.625rem;
      padding: 0.875rem 1.5rem;
    }

    /* ── Dialog Overrides ── */
    .form-field { margin-bottom: 1.25rem; }

    .form-label {
      display: block;
      font-size: 0.825rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.45rem;
    }

    .form-label .req { color: #dc2626; margin-left: 2px; }

    .form-input {
      width: 100%;
      padding: 0.6rem 0.875rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #111827;
      background: #fafafa;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-input:focus { border-color: #4ade80; background: #fff; }
    .form-input.invalid { border-color: #f87171; }

    .form-error {
      font-size: 0.78rem;
      color: #dc2626;
      margin-top: 0.3rem;
    }

    .reply-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      font-size: 0.825rem;
      color: #1d4ed8;
      margin-top: 0.75rem;
    }

    /* ── Answers Dialog ── */
    .dialog-question-summary {
      padding: 1rem 1.25rem;
      background: #f9fff9;
      border: 1px solid #d1fae5;
      border-radius: 10px;
      margin-bottom: 1.25rem;
    }

    .dialog-question-summary h4 {
      margin: 0 0 0.35rem;
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
    }

    .dialog-question-summary p {
      margin: 0;
      font-size: 0.8rem;
      color: #6b7280;
    }

    .answers-scroll {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .answers-scroll::-webkit-scrollbar { width: 5px; }
    .answers-scroll::-webkit-scrollbar-track { background: #f9fafb; border-radius: 4px; }
    .answers-scroll::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 4px; }

    .answer-full-item {
      padding: 1rem 1.125rem;
      background: #fafafa;
      border: 1px solid #f0f0f0;
      border-left: 3px solid #16a34a;
      border-radius: 10px;
      margin-bottom: 0.875rem;
    }

    .answer-full-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.625rem;
    }

    .answer-full-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .answer-full-text {
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.65;
      margin: 0;
    }

    .dialog-footer-actions {
      display: flex;
      gap: 0.625rem;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      margin-top: 1rem;
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .page-wrapper { padding: 1rem; }
      .page-header { flex-direction: column; align-items: flex-start; }
      .filter-bar { flex-direction: column; align-items: stretch; }
      .card-footer { flex-wrap: wrap; }
      .card-stats { flex-wrap: wrap; gap: 0.75rem; }
    }
  `],
  template: `
    <div class="page-wrapper">

      <!-- ── Page Header ── -->
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-icon-wrap">
            <i class="pi pi-comments"></i>
          </div>
          <div>
            <h1 class="page-title">Support Community</h1>
            <p class="page-subtitle">Ask questions, share knowledge, help others</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="loadQuestions()" [disabled]="loading">
            <i class="pi" [class.pi-refresh]="!loading" [class.pi-spin]="loading" [class.pi-spinner]="loading"></i>
            Refresh
          </button>
          <button class="btn-primary" (click)="showNewQuestionDialog()">
            <i class="pi pi-plus"></i>
            Post Question
          </button>
        </div>
      </div>

      <!-- ── Filter Bar ── -->
      <div class="filter-bar">
        <div class="search-wrap">
          <i class="pi pi-search"></i>
          <input
            class="search-input"
            type="text"
            placeholder="Search questions, descriptions, authors…"
            [(ngModel)]="filters.search"
            (input)="applyFilters()"
          />
        </div>
        <select class="filter-select" [(ngModel)]="filters.status" (change)="applyFilters()">
          <option *ngFor="let opt of statusOptions" [value]="opt.value">{{ opt.label }}</option>
        </select>
        <select class="filter-select" [(ngModel)]="filters.sort" (change)="applyFilters()">
          <option *ngFor="let opt of sortOptions" [value]="opt.value">{{ opt.label }}</option>
        </select>
        <span class="filter-count">{{ filteredQuestions.length }} result{{ filteredQuestions.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span style="font-size:0.875rem;color:#6b7280;">Loading questions…</span>
      </div>

      <!-- ── Content ── -->
      <div *ngIf="!loading">

        <!-- Empty -->
        <div *ngIf="filteredQuestions.length === 0; else questionsList" class="empty-state">
          <div class="empty-icon"><i class="pi pi-inbox"></i></div>
          <h3>No questions found</h3>
          <p>Try adjusting your filters or be the first to ask a question!</p>
          <button class="btn-primary" (click)="showNewQuestionDialog()">
            <i class="pi pi-plus"></i> Start Asking
          </button>
        </div>

        <!-- Questions -->
        <ng-template #questionsList>
          <div *ngFor="let question of filteredQuestions; trackBy: trackByQuestionId" class="question-card">

            <!-- Header -->
            <div class="card-header">
              <div class="card-header-top">
                <span class="status-badge" [ngClass]="getStatusClass(question.question_status)">
                  {{ question.question_status }}
                </span>
                <h3 class="card-question-title">{{ question.question }}</h3>
              </div>
              <div class="card-meta">
                <div class="meta-avatar">{{ getUserInitials(question.username) }}</div>
                <span>{{ question.username }}</span>
                <span class="meta-dot">·</span>
                <span>{{ question.created_at | date:'MMM d, y' }}</span>
                <span class="meta-dot">·</span>
                <span>{{ question.created_at | date:'h:mm a' }}</span>
              </div>
            </div>

            <!-- Body -->
            <div class="card-body">
              <p class="card-description">
                {{ question.description.length > 260
                    ? (question.description | slice:0:260) + '…'
                    : question.description }}
              </p>
              <div *ngIf="question.business_justification" class="biz-justification">
                <i class="pi pi-briefcase"></i>
                <span class="biz-justification-text">
                  <span class="biz-label">Business Justification:</span>
                  {{ question.business_justification }}
                </span>
              </div>
            </div>

            <!-- Stats -->
            <div class="card-stats">
              <div class="stat-pill">
                <i class="pi pi-comments"></i>
                <span class="count">{{ question.answers_count }}</span>
                <span>{{ question.answers_count === 1 ? 'Answer' : 'Answers' }}</span>
              </div>
              <div class="stat-pill">
                <i class="pi pi-eye"></i>
                <span class="count">{{ question.view_count }}</span>
                <span>Views</span>
              </div>
              <div class="stat-pill" style="margin-left:auto;">
                <i class="pi pi-clock"></i>
                <span>Updated {{ question.updated_at | date:'MMM d' }}</span>
              </div>
            </div>

            <!-- Top Answer Preview -->
            <div *ngIf="question.answers && question.answers.length > 0" class="answer-preview-wrap">
              <div class="answer-preview-label">Top Answer</div>
              <div class="answer-preview">
                <div class="answer-avatar">{{ getUserInitials(question.answers[0].username) }}</div>
                <div class="answer-preview-content">
                  <p class="answer-preview-text">{{ question.answers[0].description }}</p>
                  <div class="answer-preview-meta">
                    <span style="font-weight:600;color:#374151;">{{ question.answers[0].username }}</span>
                    <span style="color:#d1d5db;">·</span>
                    <span>{{ question.answers[0].created_at | date:'MMM d' }}</span>
                  </div>
                </div>
                <div class="vote-row">
                  <button
                    class="vote-btn upvote"
                    [class.voted-up]="question.answers[0].is_upvoted"
                    (click)="voteAnswer(question.answers[0], 'up')"
                    title="Helpful"
                  >
                    <i class="pi pi-thumbs-up" style="font-size:0.75rem;"></i>
                    {{ question.answers[0].upvotes }}
                  </button>
                  <button
                    class="vote-btn downvote"
                    [class.voted-down]="question.answers[0].is_downvoted"
                    (click)="voteAnswer(question.answers[0], 'down')"
                    title="Not helpful"
                  >
                    <i class="pi pi-thumbs-down" style="font-size:0.75rem;"></i>
                    {{ question.answers[0].downvotes }}
                  </button>
                </div>
              </div>
            </div>

            <!-- No answer notice -->
            <div *ngIf="!question.answers || question.answers.length === 0" class="answer-preview-wrap">
              <div class="no-answer-notice">
                <i class="pi pi-info-circle" style="color:#d1d5db;"></i>
                No answers yet — be the first to help!
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="card-footer">
              <button class="btn-ghost" (click)="openAnswersDialog(question)">
                <i class="pi pi-comments" style="font-size:0.8rem;"></i>
                View All Replies
              </button>
              <button class="btn-ghost" (click)="openAnswerDialog(question.id)" [disabled]="!currentUserId">
                <i class="pi pi-reply" style="font-size:0.8rem;"></i>
                Reply
              </button>
            </div>

          </div>
        </ng-template>
      </div>
    </div>

    <!-- ── New Question Dialog ── -->
    <p-dialog
      header="Post a New Question"
      [(visible)]="showQuestionDialog"
      [modal]="true"
      [style]="{width: '600px'}"
      [baseZIndex]="10000"
    >
      <form [formGroup]="questionForm">
        <div class="form-field">
          <label class="form-label">Question Title <span class="req">*</span></label>
          <input
            class="form-input"
            [class.invalid]="questionForm.get('question')?.invalid && questionForm.get('question')?.touched"
            formControlName="question"
            placeholder="What would you like to know?"
          />
          <div *ngIf="questionForm.get('question')?.invalid && questionForm.get('question')?.touched" class="form-error">
            Title is required (min 10 characters)
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Detailed Description <span class="req">*</span></label>
          <textarea
            class="form-input"
            [class.invalid]="questionForm.get('description')?.invalid && questionForm.get('description')?.touched"
            formControlName="description"
            rows="5"
            placeholder="Provide as much context as possible…"
          ></textarea>
          <div *ngIf="questionForm.get('description')?.invalid && questionForm.get('description')?.touched" class="form-error">
            Description required (min 20 characters)
          </div>
        </div>

        <div class="form-field" style="margin-bottom:0;">
          <label class="form-label">Business Justification <span style="color:#9ca3af;font-weight:400;">(optional)</span></label>
          <textarea
            class="form-input"
            formControlName="business_justification"
            rows="3"
            placeholder="Why is this question important for the business?"
          ></textarea>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="hideQuestionDialog()">
          <i class="pi pi-times" style="font-size:0.8rem;"></i> Cancel
        </button>
        <button
          class="btn-primary"
          [disabled]="questionForm.invalid || postingQuestion"
          (click)="submitQuestion()"
        >
          <i class="pi" [class.pi-check-circle]="!postingQuestion" [class.pi-spin]="postingQuestion" [class.pi-spinner]="postingQuestion" style="font-size:0.85rem;"></i>
          {{ postingQuestion ? 'Posting…' : 'Post Question' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- ── Answer Dialog ── -->
    <p-dialog
      header="Add Your Reply"
      [(visible)]="isAnswerDialogVisible"
      [modal]="true"
      [style]="{width: '560px'}"
      [baseZIndex]="10000"
    >
      <form [formGroup]="answerForm">
        <div *ngIf="selectedQuestionId" class="reply-info" style="margin-bottom:1rem;">
          <i class="pi pi-info-circle"></i>
          Replying to Question #{{ selectedQuestionId }}
        </div>
        <div class="form-field" style="margin-bottom:0;">
          <label class="form-label">Your Answer <span class="req">*</span></label>
          <textarea
            class="form-input"
            [class.invalid]="answerForm.get('description')?.invalid && answerForm.get('description')?.touched"
            formControlName="description"
            rows="8"
            placeholder="Provide a clear, helpful answer to assist the community…"
          ></textarea>
          <div *ngIf="answerForm.get('description')?.invalid && answerForm.get('description')?.touched" class="form-error">
            Answer must be at least 10 characters
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button class="btn-secondary" (click)="hideAnswerDialog()">
          <i class="pi pi-times" style="font-size:0.8rem;"></i> Cancel
        </button>
        <button
          class="btn-primary"
          [disabled]="answerForm.invalid || !selectedQuestionId || postingAnswer"
          (click)="submitAnswer()"
        >
          <i class="pi" [class.pi-send]="!postingAnswer" [class.pi-spin]="postingAnswer" [class.pi-spinner]="postingAnswer" style="font-size:0.85rem;"></i>
          {{ postingAnswer ? 'Posting…' : 'Post Reply' }}
        </button>
      </ng-template>
    </p-dialog>

    <!-- ── All Answers Dialog ── -->
    <p-dialog
      header="All Replies"
      [(visible)]="showAnswersDialog"
      [modal]="true"
      [style]="{width: '680px'}"
      [baseZIndex]="10001"
    >
      <div *ngIf="selectedQuestionForAnswersDialog">

        <div class="dialog-question-summary">
          <h4>{{ selectedQuestionForAnswersDialog.question }}</h4>
          <p>
            {{ selectedQuestionForAnswersDialog.answers_count }} replies &nbsp;·&nbsp;
            Posted by {{ selectedQuestionForAnswersDialog.username }}
          </p>
        </div>

        <div class="answers-scroll">
          <div
            *ngFor="let answer of selectedQuestionForAnswersDialog.answers; trackBy: trackByAnswerId"
            class="answer-full-item"
          >
            <div class="answer-full-header">
              <div class="answer-full-user">
                <div class="answer-avatar" style="width:30px;height:30px;font-size:0.7rem;">
                  {{ getUserInitials(answer.username) }}
                </div>
                <div>
                  <div style="font-size:0.825rem;font-weight:600;color:#111827;">{{ answer.username }}</div>
                  <div style="font-size:0.75rem;color:#9ca3af;">{{ answer.created_at | date:'MMM d, y · h:mm a' }}</div>
                </div>
              </div>
              <div class="vote-row">
                <button
                  class="vote-btn upvote"
                  [class.voted-up]="answer.is_upvoted"
                  (click)="voteAnswer(answer, 'up')"
                >
                  <i class="pi pi-thumbs-up" style="font-size:0.7rem;"></i>
                  {{ answer.upvotes }}
                </button>
                <button
                  class="vote-btn downvote"
                  [class.voted-down]="answer.is_downvoted"
                  (click)="voteAnswer(answer, 'down')"
                >
                  <i class="pi pi-thumbs-down" style="font-size:0.7rem;"></i>
                  {{ answer.downvotes }}
                </button>
              </div>
            </div>
            <p class="answer-full-text">{{ answer.description }}</p>
          </div>

          <div *ngIf="selectedQuestionForAnswersDialog.answers?.length === 0" class="empty-state" style="padding:3rem 1rem;">
            <div class="empty-icon"><i class="pi pi-comments"></i></div>
            <h3 style="font-size:1rem;">No replies yet</h3>
            <p>Be the first to help answer this question!</p>
          </div>
        </div>

        <div class="dialog-footer-actions">
          <button
            class="btn-primary"
            [disabled]="!currentUserId"
            (click)="openAnswerDialog(selectedQuestionForAnswersDialog.id); hideAnswersDialog()"
            style="flex:1;"
          >
            <i class="pi pi-plus" style="font-size:0.8rem;"></i> Add Reply
          </button>
          <button class="btn-secondary" (click)="hideAnswersDialog()">
            Close
          </button>
        </div>

      </div>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class Support implements OnInit, OnDestroy {
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  loading = false;
  postingQuestion = false;
  postingAnswer = false;

  showQuestionDialog = false;
  isAnswerDialogVisible = false;
  showAnswersDialog = false;
  selectedQuestionId: number | null = null;
  selectedQuestionForAnswersDialog: Question | null = null;

  currentUserId: number | null = null;
  currentUsername: string | null = null;

  questionForm!: FormGroup;
  answerForm!: FormGroup;

  filters = { status: '', sort: 'newest', search: '' };

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Pending', value: 'Pending' }
  ];

  sortOptions = [
    { label: 'Most Recent', value: 'newest' },
    { label: 'Most Answers', value: 'answers' },
    { label: 'Most Viewed', value: 'views' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private manageReposService: ManageReposService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForms();
    this.setupAuthListener();
    this.loadQuestions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms() {
    this.questionForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      business_justification: ['']
    });
    this.answerForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private setupAuthListener() {
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUserId = user?.id ?? null;
      this.currentUsername = user?.name ?? null;
    });
  }

  loadQuestions() {
    this.loading = true;
    this.manageReposService.getQuestions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Question[]) => {
        this.questions = data.map(q => ({ ...q, answers: q.answers || [] }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load questions.' });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.questions];
    if (this.filters.status) filtered = filtered.filter(q => q.question_status === this.filters.status);
    if (this.filters.search.trim()) {
      const s = this.filters.search.toLowerCase();
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(s) ||
        q.description.toLowerCase().includes(s) ||
        q.username.toLowerCase().includes(s)
      );
    }
    filtered.sort((a, b) => {
      if (this.filters.sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (this.filters.sort === 'answers') return b.answers_count - a.answers_count;
      if (this.filters.sort === 'views') return b.view_count - a.view_count;
      return 0;
    });
    this.filteredQuestions = filtered;
  }

  showNewQuestionDialog() {
    if (!this.currentUserId) {
      this.messageService.add({ severity: 'warn', summary: 'Login Required', detail: 'Please log in to ask a question' });
      return;
    }
    this.questionForm.reset();
    this.showQuestionDialog = true;
  }

  hideQuestionDialog() { this.showQuestionDialog = false; this.questionForm.reset(); }

  submitQuestion() {
    if (this.questionForm.invalid) {
      Object.values(this.questionForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.postingQuestion = true;
    this.manageReposService.createQuestion({ ...this.questionForm.value, user_created_id: this.currentUserId! })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Posted!', detail: 'Your question was posted.' });
          this.hideQuestionDialog();
          this.loadQuestions();
          this.postingQuestion = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to post question.' });
          this.postingQuestion = false;
        }
      });
  }

  openAnswersDialog(question: Question) {
    this.selectedQuestionForAnswersDialog = { ...question };
    this.showAnswersDialog = true;
  }

  hideAnswersDialog() { this.showAnswersDialog = false; this.selectedQuestionForAnswersDialog = null; }

  openAnswerDialog(questionId: number) {
    if (!this.currentUserId) {
      this.messageService.add({ severity: 'warn', summary: 'Login Required', detail: 'Please log in to answer' });
      return;
    }
    this.selectedQuestionId = questionId;
    this.answerForm.reset();
    this.isAnswerDialogVisible = true;
  }

  hideAnswerDialog() { this.isAnswerDialogVisible = false; this.selectedQuestionId = null; this.answerForm.reset(); }

  submitAnswer() {
    if (this.answerForm.invalid || !this.selectedQuestionId) return;
    this.postingAnswer = true;
    this.manageReposService.createAnswer({
      description: this.answerForm.value.description,
      user_created_id: this.currentUserId!,
      question_id: this.selectedQuestionId,
      upvotes: 0,
      downvotes: 0
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Posted!', detail: 'Your reply was posted.' });
        this.hideAnswerDialog();
        this.loadQuestions();
        this.postingAnswer = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to post reply.' });
        this.postingAnswer = false;
      }
    });
  }

  voteAnswer(answer: Answer, type: 'up' | 'down') {
    const req$ = type === 'up'
      ? this.manageReposService.upvoteAnswer(answer.id)
      : this.manageReposService.downvoteAnswer(answer.id);
    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        answer.upvotes = res.upvotes || 0;
        answer.downvotes = res.downvotes || 0;
        answer.is_upvoted = type === 'up';
        answer.is_downvoted = type === 'down';
        this.messageService.add({ severity: 'success', summary: 'Voted!', detail: `${type === 'up' ? 'Upvoted' : 'Downvoted'}`, life: 1500 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Vote failed' })
    });
  }

  getStatusClass(status: string): string {
    return { 'Open': 'badge-open', 'In Progress': 'badge-progress', 'Closed': 'badge-closed', 'Pending': 'badge-pending' }[status] || 'badge-pending';
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    return ({ 'Open': 'success', 'In Progress': 'warning', 'Closed': 'danger', 'Pending': 'info' } as any)[status] || 'info';
  }

  getUserInitials(username: string): string {
    if (!username) return '?';
    const parts = username.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  trackByQuestionId(_: number, q: Question) { return q.id; }
  trackByAnswerId(_: number, a: Answer) { return a.id; }
}