import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User, ManageAdminsService } from '../service/manageadmins.service';
import { AuthenticationService } from '../service/authentication.service';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FluidModule } from 'primeng/fluid';
import { ManageReposService } from '../service/managerepos.service';
import { Subject, takeUntil } from 'rxjs';
import { Badge } from "primeng/badge";

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
    RatingModule,
    FluidModule,
    PanelModule,
    AutoCompleteModule,
    PaginatorModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    PasswordModule,
    MessageModule,
    Badge
  ],
  providers: [MessageService, ConfirmationService],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      padding: 1rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .main-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .p-toolbar {
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px);
      border-radius: 20px;
      margin-bottom: 2rem;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      padding: 1rem 2rem;
    }

    .filters-section {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      padding: 2rem;
      border-radius: 20px;
      margin-bottom: 2rem;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .question-card {
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(25px);
      border-radius: 24px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      margin-bottom: 2.5rem;
      overflow: hidden;
      transition: all 0.4s ease;
      min-height: 450px;
      max-width: 100%;
    }

    .question-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 35px 80px rgba(0,0,0,0.2);
    }

    .question-header {
      padding: 2.5rem 2.5rem 2rem;
      border-bottom: 2px solid rgba(79, 70, 229, 0.1);
      background: linear-gradient(135deg, rgba(248, 249, 255, 0.8), rgba(232, 236, 255, 0.8));
      min-height: 120px;
    }

    .question-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 1rem 0;
      line-height: 1.4;
      max-width: 80%;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .question-stats {
      display: flex;
      gap: 2rem;
      font-size: 1rem;
      color: #475569;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .question-actions {
      display: flex;
      gap: 0.75rem;
    }

    .answer-section {
      padding: 2rem 2.5rem 2rem;
      min-height: 200px;
    }

    .answer-item {
      display: flex;
      gap: 1.5rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 20px;
      border-left: 5px solid #10b981;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
      transition: all 0.3s ease;
    }

    .answer-item:hover {
      transform: translateX(8px);
      box-shadow: 0 15px 40px rgba(16, 185, 129, 0.15);
    }

    .answer-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .answer-content {
      flex: 1;
    }

    .answer-text {
      color: #1e293b;
      line-height: 1.7;
      margin-bottom: 1rem;
      font-size: 1.05rem;
    }

    .answer-meta {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 500;
    }

    .vote-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.8);
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      border: 2px solid #e2e8f0;
      backdrop-filter: blur(10px);
    }

    .vote-btn {
      background: none;
      border: none;
      padding: 0.75rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .vote-btn.upvote:hover:not(.voted) { 
      color: #10b981; 
      background: rgba(16,185,129,0.15);
      transform: scale(1.1);
    }
    .vote-btn.downvote:hover:not(.voted) { 
      color: #ef4444; 
      background: rgba(239,68,68,0.15);
      transform: scale(1.1);
    }
    .vote-btn.voted { 
      background: rgba(16,185,129,0.25); 
      color: #10b981; 
      transform: scale(1.05);
    }

    .empty-state {
      text-align: center;
      padding: 6rem 3rem;
      color: #64748b;
    }

    .loading-skeleton {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
      display: block;
    }

    .p-button {
      border-radius: 12px;
      font-weight: 600;
    }

    .answers-dialog {
      max-height: 70vh;
      overflow-y: auto;
    }

    .answers-list {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 1rem;
    }

    .answer-full {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid #10b981;
    }

    @media (max-width: 768px) {
      :host { padding: 0.5rem; }
      .question-card { margin-bottom: 1.5rem; border-radius: 16px; }
      .question-header { padding: 1.5rem; min-height: 100px; }
      .question-title { font-size: 1.3rem; max-width: 100%; }
      .answer-section { padding: 1.5rem; }
      .filters-grid { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="main-container">
      <!-- Header Toolbar -->
      <p-toolbar class="mb-6">
        <ng-template pTemplate="start">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-comments text-3xl text-primary"></i>
            <div>
              <h2 class="m-0 font-bold text-3xl">Support Community</h2>
              <p class="m-0 text-lg text-600">{{ filteredQuestions?.length || 0 }} Questions Found</p>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <p-button 
              label="Ask Question" 
              icon="pi pi-plus-circle" 
              size="large"
              (onClick)="showNewQuestionDialog()"
              styleClass="mr-3 p-button-success p-button-raised"
            ></p-button>
            <p-button 
              label="Refresh" 
              icon="pi pi-refresh" 
              severity="secondary"
              size="large"
              (onClick)="loadQuestions()"
              [loading]="loading"
            ></p-button>
          </div>
        </ng-template>
      </p-toolbar>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-content-center align-items-center py-8">
        <i class="pi pi-spin pi-spinner text-6xl text-primary"></i>
        <span class="ml-3 text-xl">Loading questions...</span>
      </div>

      <!-- Questions List -->
      <div *ngIf="!loading">
        <div *ngIf="filteredQuestions.length === 0; else questionsList" class="empty-state">
          <i class="pi pi-inbox text-8xl text-400 mb-6 block"></i>
          <h2 class="text-3xl font-bold mb-4 text-700">No questions found</h2>
          <p class="text-xl mb-6">Try adjusting your filters or be the first to ask a question!</p>
          <p-button 
            label="Start Asking" 
            icon="pi pi-plus-circle" 
            size="large"
            (onClick)="showNewQuestionDialog()"
            class="p-button-success p-button-raised p-button-lg"
          ></p-button>
        </div>

        <ng-template #questionsList>
          <div *ngFor="let question of filteredQuestions; trackBy: trackByQuestionId" class="question-card">
            <!-- Question Header -->
            <div class="question-header">
              <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-4 flex-1">
                <div class="flex align-items-start gap-4 flex-1">
                  <p-tag 
                    [value]="question.question_status" 
                    [severity]="getStatusSeverity(question.question_status)"
                    class="text-lg px-4 py-2 font-bold"
                  ></p-tag>
                  <div class="flex-1">
                    <h3 class="question-title m-0">{{ question.question }}</h3>
                  </div>
                </div>
              </div>
              <div class="question-meta mt-4">
                <div class="flex align-items-center gap-3 flex-wrap">
                  <span class="text-lg font-semibold text-700">Posted by {{ question.username }}</span>
                  <span class="text-500 mx-3">•</span>
                  <span class="text-lg text-600">{{ question.created_at | date:'MMM d, y • h:mm a' }}</span>
                </div>
              </div>
            </div>

            <!-- Question Content Preview -->
            <div class="p-5 border-top-1 surface-border" style="min-height: 150px;">
              <div class="text-xl font-semibold mb-4 text-800">Description:</div>
              <div class="line-height-3 text-lg text-900 mb-4" style="max-height: 120px; overflow: hidden;">
                {{question.description.length > 250 ? (question.description | slice:0:250) + '...' : question.description}}
              </div>
              <div *ngIf="question.business_justification" class="p-4 bg-green-50 border-round-xl surface-border">
                <i class="pi pi-briefcase text-2xl text-green-600 mr-3"></i>
                <strong class="text-lg text-green-800">Business Justification:</strong>
                <div class="mt-2 text-green-700">{{ question.business_justification }}</div>
              </div>
            </div>

            <!-- Top Answer Preview + Answer Button -->
            <div class="answer-section border-top-1 surface-border">
              <div *ngIf="question.answers && question.answers.length > 0; else noAnswers" class="flex flex-column gap-4">
                <div class="flex align-items-center gap-3 mb-4 text-xl font-bold text-800">
                  <i class="pi pi-check-circle text-2xl text-green-500"></i>
                  <span>{{ question.answers.length }} {{ question.answers.length === 1 ? 'Answer' : 'Answers' }}</span>
                </div>
                <div class="answer-item">
                  <div class="answer-avatar">{{ getUserInitials(question.answers[0].username) }}</div>
                  <div class="answer-content">
                    <div class="answer-text">{{ question.answers[0].description | slice:0:200 }}{{ question.answers[0].description.length > 200 ? '...' : '' }}</div>
                    <div class="answer-meta">
                      <span class="font-semibold">{{ question.answers[0].username }}</span>
                      <span class="mx-3 text-500">•</span>
                      <span>{{ question.answers[0].created_at | date:'MMM d • h:mm a' }}</span>
                    </div>
                  </div>
                  <div class="vote-controls">
                    <button 
                      class="vote-btn upvote" 
                      [class.voted]="question.answers[0].is_upvoted"
                      (click)="voteAnswer(question.answers[0], 'up')"
                      pTooltip="Helpful"
                    >
                      <i class="pi pi-thumbs-up"></i>
                      <span class="font-bold">{{ question.answers[0].upvotes }}</span>
                    </button>
                    <button 
                      class="vote-btn downvote" 
                      [class.voted]="question.answers[0].is_downvoted"
                      (click)="voteAnswer(question.answers[0], 'down')"
                      pTooltip="Not helpful"
                    >
                      <i class="pi pi-thumbs-down"></i>
                      <span class="font-bold">{{ question.answers[0].downvotes }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <ng-template #noAnswers>
                <div class="text-center py-8 text-600">
                  <i class="pi pi-comments text-5xl text-400 mb-3 block"></i>
                  <p class="text-xl mb-4">Be the first to answer this question!</p>
                </div>
              </ng-template>
              
              <!-- Answer Button -->
              <div class="flex justify-content-center pt-4 border-top-1 surface-border">
                <p-button 
                  label="Add Solution" 
                  icon="pi pi-plus-circle" 
                  (onClick)="openAnswerDialog(question.id)"
                  class="p-button-text"
                  [disabled]="!currentUserId"
                ></p-button>
              </div>
              
              <!-- View All Answers Button -->
              <div class="text-center pt-4">
                <p-button 
                  label="View All Answers" 
                  severity="secondary"
                  icon="pi pi-comments"
                  (onClick)="openAnswersDialog(question)"
                  class="w-full"
                  pTooltip="See complete discussion"
                ></p-button>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- New Question Dialog -->
    <p-dialog 
      header="Ask a New Question" 
      [(visible)]="showQuestionDialog" 
      [modal]="true" 
      [style]="{width: '70vw', height: '80vh'}" 
      [baseZIndex]="10000"
      [resizable]="true"
    >
      <form [formGroup]="questionForm" (ngSubmit)="submitQuestion()">
        <div class="grid">
          <div class="col-12">
            <label class="form-label">Question Title <span class="text-red-500">*</span></label>
            <input pInputText formControlName="question" class="w-full p-inputtext-lg" [class.p-invalid]="questionForm.get('question')?.invalid && questionForm.get('question')?.touched" />
            <small *ngIf="questionForm.get('question')?.invalid && questionForm.get('question')?.touched" class="p-error">
              Title is required (min 10 characters)
            </small>
          </div>
          <div class="col-12">
            <label class="form-label">Detailed Description <span class="text-red-500">*</span></label>
            <textarea pInputTextarea formControlName="description" rows="6" class="w-full" [class.p-invalid]="questionForm.get('description')?.invalid && questionForm.get('description')?.touched"></textarea>
            <small *ngIf="questionForm.get('description')?.invalid && questionForm.get('description')?.touched" class="p-error">
              Description is required (min 20 characters)
            </small>
          </div>
          <div class="col-12">
            <label class="form-label">Business Justification (Optional)</label>
            <textarea pInputTextarea formControlName="business_justification" rows="4" class="w-full" placeholder="Explain why this question is important for business..."></textarea>
          </div>
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" class="p-button-text" (onClick)="hideQuestionDialog()"></p-button>
        <p-button 
          label="Post Question" 
          icon="pi pi-check-circle" 
          [disabled]="questionForm.invalid || postingQuestion"
          (onClick)="submitQuestion()"
          [loading]="postingQuestion"
        ></p-button>
      </ng-template>
    </p-dialog>

    <!-- Answer Dialog -->
    <p-dialog 
      header="Add Your Answer" 
      [(visible)]="isAnswerDialogVisible"
      [modal]="true" 
      [style]="{width: '65vw', height: '70vh'}" 
      [baseZIndex]="10000"
      [resizable]="true"
    >
      <form [formGroup]="answerForm" (ngSubmit)="submitAnswer()">
        <div class="grid">
          <div class="col-12">
            <label class="form-label">Your Answer <span class="text-red-500">*</span></label>
            <textarea 
              pInputTextarea 
              formControlName="description" 
              rows="10" 
              class="w-full" 
              placeholder="Provide a detailed answer to help the community..."
              [class.p-invalid]="answerForm.get('description')?.invalid && answerForm.get('description')?.touched"
            ></textarea>
            <small *ngIf="answerForm.get('description')?.invalid && answerForm.get('description')?.touched" class="p-error">
              Answer must be at least 10 characters
            </small>
          </div>
        </div>
        <div class="mt-4 p-3 surface-50 border-round" *ngIf="selectedQuestionId">
          <i class="pi pi-info-circle text-blue-500 mr-2"></i>
          <strong>Replying to:</strong> Question #{{ selectedQuestionId }}
        </div>
      </form>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" class="p-button-text" (onClick)="hideAnswerDialog()"></p-button>
        <p-button 
          label="Post Answer" 
          icon="pi pi-check-circle" 
          [disabled]="answerForm.invalid || !selectedQuestionId || postingAnswer"
          (onClick)="submitAnswer()"
          [loading]="postingAnswer"
        ></p-button>
      </ng-template>
    </p-dialog>

    <!-- ✅ NEW: Answers Dialog - Full View of All Answers -->
    <p-dialog 
      header="All Answers" 
      [(visible)]="showAnswersDialog"
      [modal]="true" 
      [style]="{width: '80vw', height: '85vh'}" 
      [baseZIndex]="10001"
      [resizable]="true"
      class="answers-dialog"
    >
      <div *ngIf="selectedQuestionForAnswersDialog" class="flex flex-column h-full">
        <!-- Question Summary -->
        <div class="p-4 surface-50 border-round mb-4">
          <h3 class="m-0 mb-2 text-xl font-bold">{{ selectedQuestionForAnswersDialog.question }}</h3>
          <p class="m-0 text-600">{{ selectedQuestionForAnswersDialog.answers_count }} answers • Posted by {{ selectedQuestionForAnswersDialog.username }}</p>
        </div>

        <!-- Answers List -->
        <div class="answers-list">
          <div *ngFor="let answer of selectedQuestionForAnswersDialog.answers; trackBy: trackByAnswerId" class="answer-full">
            <div class="flex justify-content-between align-items-start mb-3">
              <div class="answer-avatar text-xl">{{ getUserInitials(answer.username) }}</div>
              <div class="flex align-items-center gap-3 ml-auto">
                <div class="vote-controls">
                  <button 
                    class="vote-btn upvote" 
                    [class.voted]="answer.is_upvoted"
                    (click)="voteAnswer(answer, 'up')"
                    pTooltip="Helpful"
                  >
                    <i class="pi pi-thumbs-up"></i>
                    <span>{{ answer.upvotes }}</span>
                  </button>
                  <button 
                    class="vote-btn downvote" 
                    [class.voted]="answer.is_downvoted"
                    (click)="voteAnswer(answer, 'down')"
                    pTooltip="Not helpful"
                  >
                    <i class="pi pi-thumbs-down"></i>
                    <span>{{ answer.downvotes }}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="answer-text mb-4">{{ answer.description }}</div>
            
            <div class="answer-meta">
              <span class="font-semibold text-900">{{ answer.username }}</span>
              <span class="mx-2 text-500">•</span>
              <span class="text-600">{{ answer.created_at | date:'MMM d, y • h:mm a' }}</span>
            </div>
          </div>
          
          <div *ngIf="selectedQuestionForAnswersDialog.answers?.length === 0" class="text-center py-8 text-600">
            <i class="pi pi-comments text-5xl text-400 mb-3 block"></i>
            <p class="text-xl mb-4">No answers yet. Be the first to help!</p>
            <p-button 
              label="Add Answer" 
              icon="pi pi-plus-circle" 
              severity="secondary"
              (onClick)="openAnswerDialog(selectedQuestionForAnswersDialog.id); hideAnswersDialog()"
            ></p-button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-4 pt-4 border-top-1 surface-border">
          <p-button 
            label="Add Answer" 
            icon="pi pi-plus-circle" 
            severity="success"
            (onClick)="openAnswerDialog(selectedQuestionForAnswersDialog.id); hideAnswersDialog()"
            [disabled]="!currentUserId"
            class="flex-1"
          ></p-button>
          <p-button 
            label="Close" 
            icon="pi pi-times" 
            severity="secondary"
            (onClick)="hideAnswersDialog()"
            class="flex-1"
          ></p-button>
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

  filters = {
    status: '',
    sort: 'newest',
    search: ''
  };

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
    this.manageReposService.getQuestions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Question[]) => {
        this.questions = data.map(q => ({
          ...q,
          answers: q.answers || []
        }));
        this.filteredQuestions = [...this.questions];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: 'Failed to load questions. Please try again.'
        });
      }
    });
  }

  applyFilters(event?: any) {
    let filtered = [...this.questions];

    if (this.filters.status) {
      filtered = filtered.filter(q => q.question_status === this.filters.status);
    }

    if (this.filters.search.trim()) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(search) ||
        q.description.toLowerCase().includes(search) ||
        q.username.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (this.filters.sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'answers':
          return b.answers_count - a.answers_count;
        case 'views':
          return b.view_count - a.view_count;
        default:
          return 0;
      }
    });

    this.filteredQuestions = filtered;
  }

  clearFilters() {
    this.filters = { status: '', sort: 'newest', search: '' };
    this.filteredQuestions = [...this.questions];
  }

  showNewQuestionDialog() {
    if (!this.currentUserId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to ask a question'
      });
      return;
    }
    this.questionForm.reset();
    this.showQuestionDialog = true;
  }

  hideQuestionDialog() {
    this.showQuestionDialog = false;
    this.questionForm.reset();
  }

  submitQuestion() {
    if (this.questionForm.invalid) {
      Object.keys(this.questionForm.controls).forEach(key => {
        const control = this.questionForm.get(key);
        control?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

    this.postingQuestion = true;
    const payload = {
      ...this.questionForm.value,
      user_created_id: this.currentUserId!
    };

    this.manageReposService.createQuestion(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Your question has been posted successfully!'
        });
        this.hideQuestionDialog();
        this.loadQuestions();
        this.postingQuestion = false;
      },
      error: (err) => {
        console.error('Post question error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: 'Failed to post question. Please try again.'
        });
        this.postingQuestion = false;
      }
    });
  }

  // ✅ NEW: Open full answers dialog
  openAnswersDialog(question: Question) {
    this.selectedQuestionForAnswersDialog = { ...question };
    this.showAnswersDialog = true;
  }

  hideAnswersDialog() {
    this.showAnswersDialog = false;
    this.selectedQuestionForAnswersDialog = null;
  }

  openAnswerDialog(questionId: number) {
    if (!this.currentUserId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to answer questions'
      });
      return;
    }
    this.selectedQuestionId = questionId;
    this.answerForm.reset();
    this.isAnswerDialogVisible = true;
  }

  hideAnswerDialog() {
    this.isAnswerDialogVisible = false;
    this.selectedQuestionId = null;
    this.answerForm.reset();
  }

  submitAnswer() {
    if (this.answerForm.invalid || !this.selectedQuestionId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please provide a valid answer'
      });
      return;
    }

    this.postingAnswer = true;
    const payload = {
      description: this.answerForm.value.description,
      user_created_id: this.currentUserId!,
      question_id: this.selectedQuestionId,
      upvotes: 0,
      downvotes: 0
    };

    this.manageReposService.createAnswer(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Your answer has been posted successfully!'
        });
        this.hideAnswerDialog();
        this.loadQuestions();
        this.postingAnswer = false;
      },
      error: (err) => {
        console.error('Post answer error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: 'Failed to post answer. Please try again.'
        });
        this.postingAnswer = false;
      }
    });
  }

  voteAnswer(answer: Answer, type: 'up' | 'down') {
    const endpoint = type === 'up' ? 
      this.manageReposService.upvoteAnswer(answer.id) : 
      this.manageReposService.downvoteAnswer(answer.id);

    endpoint.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        answer.upvotes = res.upvotes || 0;
        answer.downvotes = res.downvotes || 0;
        if (type === 'up') {
          answer.is_upvoted = true;
          answer.is_downvoted = false;
        } else {
          answer.is_downvoted = true;
          answer.is_upvoted = false;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Voted!',
          detail: `Answer ${type}voted successfully`,
          life: 1500
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: `Failed to ${type}vote answer`
        });
      }
    });
  }

  viewQuestion(question: Question) {
    this.router.navigate(['/support', question.id]);
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    const severityMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      'Open': 'success',
      'In Progress': 'warning',
      'Closed': 'danger',
      'Pending': 'info'
    };
    return severityMap[status] || 'info';
  }

  getUserInitials(username: string): string {
    if (!username) return '?';
    const names = username.split(' ');
    return names.length === 1 ? 
      names[0].charAt(0).toUpperCase() : 
      (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  }

  trackByQuestionId(index: number, question: Question): number {
    return question.id;
  }

  // ✅ NEW: Track by answer ID
  trackByAnswerId(index: number, answer: Answer): number {
    return answer.id;
  }
}
