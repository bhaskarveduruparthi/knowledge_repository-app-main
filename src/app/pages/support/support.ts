import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Toolbar } from "primeng/toolbar";

import { ManageReposService } from '../service/managerepos.service';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ChartModule,
    FieldsetModule,
    DialogModule,
    TextareaModule,
    ButtonModule,
    Toolbar
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      padding: 2rem 3rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #eef2f7;
    }

    .card {
      
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(31, 38, 135, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 1.6rem 2rem;
      margin-bottom: 2rem;
      color: #eef2f7;
      max-width: auto;
      margin-left: auto;
      margin-right: auto;
    }

    .question-title {
      font-weight: 700;
      font-size: 1.3rem;
      margin-bottom: 0.25rem;
      color: black;
      border-bottom: 2px solid rgba(255 255 255 / 0.2);
      padding-bottom: 0.3rem;
    }

    .business-justification {
      font-style: italic;
      font-size: 0.9rem;
      color: #bcc8d9;
      margin-bottom: 1.5rem;
    }

    .description{
      color: green;
      margin-bottom: 1.5rem;
    }

    .answers {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-top: 1px solid rgba(255 255 255 / 0.15);
      padding-top: 1rem;
    }

    .answer {
      background: rgba(255, 255, 255, 0.10);
      padding: 1rem 1.3rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px 0 rgba(144, 238, 144, 0.5);
      color: black;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .answer-description {
      flex-grow: 1;
      padding-right: 1rem;
      font-size: 1rem;
      line-height: 1.3;
    }

    .vote-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .vote-button {
      background: transparent;
      border: none;
      color: #9abaff;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 1.1rem;
      user-select: none;
      transition: color 0.2s;
    }
    .vote-button:hover {
      color: green;
    }
    .vote-count {
      margin-left: 0.3rem;
      font-weight: 700;
      color: #cde1f9;
      min-width: 22px;
      text-align: center;
    }

    .card > button {
      margin-top: 1.5rem;
      background-color: rgba(255 255 255 / 0.15);
      color: #eef2f7;
      border: none;
      border-radius: 12px;
      padding: 0.7rem 1.25rem;
      font-weight: 600;
      transition: background-color 0.3s;
      cursor: pointer;
      align-self: flex-start;
    }
    .card > button:hover {
      background-color: rgba(255 255 255 / 0.35);
    }

    .form-grid {
  display: grid;
  grid-template-columns: 1fr; /* One column: one field per row */
  gap: 1.5rem;
  width: 100%;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-title {
  font-weight: 700;
  font-size: 1.3rem;
  color: green;
}

.question-username {
  font-size: 0.9rem;
  color: #a3b4c0;
  font-style: italic;
}


.form-field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.answer-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.avatar {
  width: 36px;
  height: 36px;
  background: rgba(144, 238, 144, 0.6);
  border-radius: 50%;
  color: #1f2630;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  user-select: none;
}
.answer-main {
  flex: 1;
}

.answer-button{
  margin-top: 15px;
}
.answer-meta {
  color: #a3b4c0;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

  `],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <span><strong><h4>Support Community</h4></strong></span>
      </ng-template>
      <ng-template #end>
        <button pButton type="button" label="Ask a Question" icon="pi pi-plus" (click)="showQuestionDialog()"></button>
      </ng-template>
    </p-toolbar>

    <p-dialog header="Ask a new question" [(visible)]="displayQuestionDialog" [modal]="true" [closable]="false" [style]="{width: '1000px'}" [baseZIndex]="10000">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <div class="form-field">
            <label for="question">Question</label>
            <textarea pInputTextarea id="question" type="text" [(ngModel)]="newQuestion.question" required ></textarea>
          </div>
          <div class="form-field">
            <label for="description">Question Description</label>
            <textarea pInputTextarea id="description" rows="4" [(ngModel)]="newQuestion.description" required></textarea>
          </div>
          <div class="form-field">
            <label for="business_justification">Business Justification</label>
            <textarea pInputTextarea id="business_justification" rows="3" [(ngModel)]="newQuestion.business_justification"></textarea>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" (click)="hideQuestionDialog()" class="p-button-text"></button>
        <button pButton label="Post Question" icon="pi pi-check" (click)="postQuestion()" [disabled]="!newQuestion.description || !newQuestion.question"></button>
      </ng-template>
    </p-dialog>

  
  <div class="card" *ngFor="let question of questions">
  <div class="question-header">
    
    <div class="question-title">{{ question.question }}</div>
    <div class="question-username">{{ question.username }} • {{question.created_at | date:'short'}}</div>
  </div>
  <div class="business-justification" *ngIf="question.business_justification">
    {{ question.business_justification }}
  </div>
  <div class="description">
    <label style="color:black"><strong>Description:</strong></label><br>
    {{question.description}}
  </div>

  


      <div class="answer" *ngFor="let answer of question.answers" >
  <div class="answer-info">
    <div class="avatar">{{ getUserInitials(answer.username) }}</div>
    <div class="answer-main">
      <div class="answer-description">{{ answer.description }}</div>
      <small class="answer-meta">{{ answer.username }} • {{ answer.created_at | date:'short' }}</small>
    </div>
  </div>
  <div class="vote-buttons">
    <button class="vote-button" (click)="upvoteAnswer(answer)" type="button" aria-label="Like answer">
      <i class="pi pi-thumbs-up"></i>
      <span class="vote-count">{{ answer.upvotes || 0 }}</span>
    </button>
    <button class="vote-button" (click)="downvoteAnswer(answer)" type="button" aria-label="Dislike answer">
      <i class="pi pi-thumbs-down"></i>
      <span class="vote-count">{{ answer.downvotes || 0 }}</span>
    </button>
  </div>
  
</div>
<div class="answer-button">
  <button pButton type="button" label="Add Answer" icon="pi pi-plus" (click)="showAnswerDialog(question.id)"></button>
</div>


      
    </div>

    <p-dialog header="Add your answer" [(visible)]="displayAnswerDialog" [modal]="true" [closable]="false" [style]="{width: '800px'}" [baseZIndex]="10000">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <div class="form-field" style="grid-column: 1 / -1;">
            <label for="answerDescription">Answer Description</label>
            <textarea pInputTextarea id="answerDescription" rows="5" [(ngModel)]="newAnswer.description" required></textarea>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" (click)="hideAnswerDialog()" class="p-button-text"></button>
        <button pButton label="Post Answer" icon="pi pi-check" (click)="postAnswer()" [disabled]="!newAnswer.description"></button>
      </ng-template>
    </p-dialog>
  `
})
export class Support implements OnInit {
  questions: any[] = [];

  displayQuestionDialog = false;
  displayAnswerDialog = false;

  newQuestion = {
    question: '',
    description: '',
    business_justification: ''
  };

  newAnswer: { description: string; question_id: number | null } = {
    description: '',
    question_id: null
  };

  currentUserId: number | null | undefined = undefined;

  currentUsername: string | null = null;

  constructor(
    private managereposervice: ManageReposService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    public router: Router
  ) {
    
  }

  ngOnInit() {

    this.authservice.user.subscribe(user => {
  if (user) {
    this.currentUserId = user.id ?? null;  // fallback to null if undefined
    this.currentUsername = user.name ?? null;
  } else {
    this.currentUserId = null;
    this.currentUsername = null;
  }
});


    this.loadQuestions();
  }

  loadQuestions() {
    this.managereposervice.getQuestions().subscribe({
      next: (data: any) => {
        this.questions = data;
      },
      error: () => {
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to load questions' });
      }
    });
  }

  getUserInitials(username: string): string {
  if (!username) return '';
  const names = username.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  } else {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  }
}


  showQuestionDialog() {
    this.displayQuestionDialog = true;
  }

  hideQuestionDialog() {
    this.displayQuestionDialog = false;
    this.newQuestion = { question: '', description: '', business_justification: '' };
  }

  postQuestion() {
    if (!this.newQuestion.question || !this.newQuestion.description) {
      this.messageservice.add({ severity: 'warn', summary: 'Validation', detail: 'Question and description are required' });
      return;
    }
    const payload = {
      question: this.newQuestion.question,
      description: this.newQuestion.description,
      business_justification: this.newQuestion.business_justification,
      user_created_id: this.currentUserId
    };
    this.managereposervice.createQuestion(payload).subscribe(() => {
      this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Question posted' });
      this.hideQuestionDialog();
      this.loadQuestions();
    }, () => {
      this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to post question' });
    });
  }

  showAnswerDialog(questionId: number) {
    this.displayAnswerDialog = true;
    this.newAnswer = { description: '', question_id: questionId };
  }

  hideAnswerDialog() {
    this.displayAnswerDialog = false;
    this.newAnswer = { description: '', question_id: null };
  }

  postAnswer() {
    if (!this.newAnswer.description || this.newAnswer.question_id === null) {
      this.messageservice.add({ severity: 'warn', summary: 'Validation', detail: 'Answer and question ID are required' });
      return;
    }
    const payload = {
      description: this.newAnswer.description,
      user_created_id: this.currentUserId,
      question_id: this.newAnswer.question_id,
      upvotes: 0,
      downvotes: 0
    };
    this.managereposervice.createAnswer(payload).subscribe(() => {
      this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Answer posted' });
      this.hideAnswerDialog();
      this.loadQuestions();
    }, () => {
      this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to post answer' });
    });
  }

  upvoteAnswer(answer: any) {
  this.managereposervice.upvoteAnswer(answer.id).subscribe({
    next: (res: any) => {
      answer.upvotes = res.upvotes;
    },
    error: () => {
      this.messageservice.add({severity:'error', summary:'Error', detail:'Failed to upvote'});
    }
  });
}

downvoteAnswer(answer: any) {
  this.managereposervice.downvoteAnswer(answer.id).subscribe({
    next: (res: any) => {
      answer.downvotes = res.downvotes;
    },
    error: () => {
      this.messageservice.add({severity:'error', summary:'Error', detail:'Failed to downvote'});
    }
  });
}


  
}
