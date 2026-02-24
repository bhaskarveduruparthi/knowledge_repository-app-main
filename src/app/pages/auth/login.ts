import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { AuthenticationService } from '../service/authentication.service';
import { LoginService } from '../service/login.service';
import { LayoutService } from '@/layout/service/layout.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, InputTextModule, CommonModule, ToastModule, IconFieldModule, InputIconModule, FormsModule, RouterModule, RippleModule],
  providers: [MessageService],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    :host {
      display: block;
      font-family: 'DM Sans', sans-serif;
    }

    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      overflow: hidden;
    }

    /* ── Background ── */
    .bg-layer {
      position: fixed;
      inset: 0;
      background: linear-gradient(145deg, #b8e8c8 0%, #7ecb9b 30%, #4eaa72 60%, #2e7d52 100%);
      z-index: 0;
    }

    .bg-dots {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px);
      background-size: 28px 28px;
      z-index: 0;
      pointer-events: none;
    }

    .blob {
      position: fixed;
      border-radius: 50%;
      filter: blur(64px);
      opacity: 0.35;
      pointer-events: none;
      z-index: 0;
      animation: drift 14s ease-in-out infinite alternate;
    }
    .blob-1 { width: 500px; height: 500px; background: #a8ffcb; top: -130px; left: -100px; animation-delay: 0s; }
    .blob-2 { width: 380px; height: 380px; background: #56e89d; bottom: -90px; right: -90px; animation-delay: -6s; }
    .blob-3 { width: 240px; height: 240px; background: #ffffff; top: 42%; right: 14%; animation-delay: -3s; }

    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(28px, 18px) scale(1.07); }
    }

    /* ── Left: Brand Panel ── */
    .brand-panel {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 56px;
      gap: 36px;
    }

    .logo-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-box {
      width: 44px; height: 44px;
      background: #fff;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .logo-box svg {
      width: 24px; height: 24px;
    }

    .logo-name {
      font-family: 'DM Serif Display', serif;
      font-size: 3.05rem;
      color: green;
    }

    .headline {
      font-family: 'DM Serif Display', serif;
      font-size: clamp(2.2rem, 3.2vw, 3.2rem);
      color: #fff;
      line-height: 1.15;
    }

    .headline em {
      font-style: italic;
      color: rgba(255,255,255,0.68);
    }

    .brand-desc {
      font-size: 1rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.78;
      max-width: 370px;
      font-weight: 300;
    }

    .stats-row {
      display: flex;
      gap: 32px;
    }

    .stat { display: flex; flex-direction: column; gap: 3px; }

    .stat-val {
      font-size: 1.65rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 500;
    }

    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 100px;
      padding: 7px 16px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.88);
      backdrop-filter: blur(8px);
      font-weight: 500;
    }

    .pill-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #a8ffcb;
    }

    /* ── Right: Form Panel ── */
    .form-panel {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 56px;
    }

    .card {
      background: rgba(255,255,255,0.72);
      backdrop-filter: blur(24px) saturate(1.6);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);
      border: 1px solid rgba(255,255,255,0.55);
      border-radius: 28px;
      padding: 48px 44px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 8px 48px rgba(30,80,50,0.14), 0 1.5px 6px rgba(30,80,50,0.08);
      animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .eyebrow {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #3d8b5a;
      margin-bottom: 10px;
    }

    .card-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.95rem;
      color: #1a2e22;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .card-sub {
      font-size: 0.88rem;
      color: #4a6356;
      line-height: 1.65;
      margin-bottom: 32px;
    }

    /* ── Fields ── */
    .field {
      margin-bottom: 20px;
    }

    .field-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: #1a2e22;
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }

    .field-wrap {
      position: relative;
    }

    .field-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      width: 17px; height: 17px;
      stroke: #6e9e84;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
      transition: stroke 0.2s;
      z-index: 1;
    }

    .custom-input {
      width: 100%;
      padding: 13px 16px 13px 44px;
      background: rgba(255,255,255,0.85);
      border: 1.5px solid rgba(61,139,90,0.18);
      border-radius: 14px;
      font-size: 0.92rem;
      font-family: 'DM Sans', sans-serif;
      color: #1a2e22;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      -webkit-appearance: none;
      appearance: none;
      box-sizing: border-box;
    }

    .custom-input::placeholder { color: #9ab8a8; }

    .custom-input:focus {
      border-color: #5aac78;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(90,172,120,0.15);
    }

    .field-wrap:focus-within .field-icon { stroke: #3d8b5a; }

    .pw-toggle {
      position: absolute;
      right: 13px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      color: #6e9e84;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
      transition: color 0.2s, background 0.15s;
    }

    .pw-toggle:hover {
      color: #3d8b5a;
      background: rgba(90,172,120,0.1);
    }

    .pw-toggle svg {
      width: 17px; height: 17px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* ── Extras row ── */
    .extras-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 4px 0 28px;
    }

    .remember-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .remember-wrap input[type="checkbox"] {
      width: 15px; height: 15px;
      accent-color: #3d8b5a;
      cursor: pointer;
    }

    .remember-label {
      font-size: 0.82rem;
      color: #4a6356;
      user-select: none;
    }

    .forgot-link {
      font-size: 0.82rem;
      color: #3d8b5a;
      font-weight: 500;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
    }

    .forgot-link:hover { text-decoration: underline; }

    /* ── Sign In Button ── */
    .btn-signin {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #2e7d52 0%, #3d9e6a 100%);
      color: #fff;
      border: none;
      border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.02em;
      transition: transform 0.15s, box-shadow 0.15s, filter 0.15s, opacity 0.15s;
      box-shadow: 0 4px 18px rgba(46,125,82,0.38);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-signin::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
      pointer-events: none;
    }

    .btn-signin:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(46,125,82,0.45);
      filter: brightness(1.06);
    }

    .btn-signin:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(46,125,82,0.3);
    }

    .btn-signin:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    /* spinner */
    .spin-icon {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Divider ── */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 22px 0;
    }

    .divider-line { flex: 1; height: 1px; background: rgba(61,139,90,0.15); }

    .divider-text {
      font-size: 0.76rem;
      color: #9ab8a8;
      font-weight: 500;
      white-space: nowrap;
    }

    /* ── SSO Button ── */
    .btn-sso {
      width: 100%;
      padding: 13px;
      background: rgba(255,255,255,0.7);
      border: 1.5px solid rgba(61,139,90,0.18);
      border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 500;
      color: #1a2e22;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      gap: 10px;
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
      backdrop-filter: blur(8px);
    }

    .btn-sso:hover {
      background: rgba(255,255,255,0.92);
      border-color: #a8d8b4;
      box-shadow: 0 2px 12px rgba(61,139,90,0.1);
    }

    .btn-sso svg { width: 18px; height: 18px; flex-shrink: 0; }

    /* ── Footer ── */
    .card-footer {
      margin-top: 26px;
      text-align: center;
      font-size: 0.78rem;
      color: #9ab8a8;
    }

    .card-footer a {
      color: #3d8b5a;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
    }

    .card-footer a:hover { text-decoration: underline; }

    /* ── Responsive ── */
    @media (max-width: 860px) {
      .page { grid-template-columns: 1fr; }
      .brand-panel { display: none; }
      .form-panel { padding: 24px 20px; }
      .card { padding: 36px 26px; }
    }
  `],
  template: `
    <p-toast position="top-right" />

    <!-- Background layers -->
    <div class="bg-layer"></div>
    <div class="bg-dots"></div>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="page">

      <!-- ══ Left: Brand Panel ══ -->
      <div class="brand-panel">

        <div class="logo-row">
          
          <span class="logo-name">Knowledge Repository</span>
        </div>

        <div class="headline">
          Solutions,<br/>
          <em>shared &amp; found</em><br/>
          instantly.
        </div>

        <p class="brand-desc">
          A centralised hub where your team uploads, discovers, and validates
          solutions across every project — turning collective expertise into a
          searchable asset.
        </p>

        

        <div class="pills">
          <span class="pill"><span class="pill-dot"></span>Upload Solutions</span>
          <span class="pill"><span class="pill-dot"></span>Smart Search</span>
          <span class="pill"><span class="pill-dot"></span>Peer Review</span>
          <span class="pill"><span class="pill-dot"></span>Role-based Access</span>
        </div>

      </div>

      <!-- ══ Right: Form Panel ══ -->
      <div class="form-panel">
        <div class="card">

          <div class="eyebrow">Employee Portal</div>
          <div class="card-title">Welcome back</div>
          <p class="card-sub">Sign in with your Yash ID to access the Knowledge Repository.</p>

          <!-- Yash ID -->
          <div class="field">
            <label class="field-label" for="yash-id">Yash ID</label>
            <div class="field-wrap">
              <input
                class="custom-input"
                id="yash-id"
                type="text"
                placeholder="e.g. 1100031"
                [(ngModel)]="yash_id"
                (keydown.enter)="login()"
                autocomplete="username"
              />
              <svg class="field-icon" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <!-- Password -->
          <div class="field">
            <label class="field-label" for="password">Password</label>
            <div class="field-wrap">
              <input
                class="custom-input"
                id="password"
                [type]="passwordVisible ? 'text' : 'password'"
                placeholder="Enter your password"
                [(ngModel)]="password"
                (keydown.enter)="login()"
                autocomplete="current-password"
              />
              <svg class="field-icon" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <button
                type="button"
                class="pw-toggle"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'"
              >
                <svg viewBox="0 0 24 24" *ngIf="!passwordVisible">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg viewBox="0 0 24 24" *ngIf="passwordVisible">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me + Forgot -->
          

          <!-- Sign In Button -->
          <button
            type="button"
            class="btn-signin"
            (click)="login()"
            [disabled]="isLoading"
          >
            <div class="spin-icon" *ngIf="isLoading"></div>
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading">Signing in...</span>
          </button>

          
          
          

          <div class="card-footer">
            Need access? <a>Contact your administrator</a>
          </div>

        </div>
      </div>

    </div>
  `
})
export class Login {
  yash_id: string = '';
  password: string = '';
  checked: boolean = false;
  rememberMe: boolean = false;
  passwordVisible: boolean = false;
  isLoading: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    public loginservice: LoginService,
    public auth: AuthenticationService,
    public messageservice: MessageService
  ) {}

  login() {
    if (!this.yash_id || !this.password) {
      this.messageservice.add({
        severity: 'warn',
        summary: 'Missing Fields',
        detail: 'Please enter your Yash ID and password.'
      });
      return;
    }

    this.isLoading = true;

    console.log(this.yash_id);
    console.log(this.password);

    this.loginservice.getToken(this.yash_id, this.password).subscribe(
      (data: any) => {
        console.log(data);
        this.auth.tokenValue = data;
        this.getuser();
        localStorage.setItem('token', JSON.stringify(data));
        this.messageservice.add({
          severity: 'success',
          summary: 'Signed In Successfully',
          detail: `Welcome back, ${this.yash_id}!`
        });
      },
      (err: any) => {
        this.isLoading = false;
        this.messageservice.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Invalid credentials. Please contact your administrator.'
        });
        console.log(err.error.message);
      }
    );
  }

  getuser() {
    this.loginservice.getUserDetails().subscribe((data: any) => {
      this.isLoading = false;
      console.log(data);
      this.auth.userValue = data;
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.type == 'Superadmin') {
        this.router.navigate(['/app']);
      } else {
        this.router.navigate(['/app/pages/home']);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}