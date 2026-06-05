import { LoginService } from './../../pages/service/login.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '@/pages/service/authentication.service';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
// add TabView, TabPanel to the imports array
import { Menu } from 'primeng/menu';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-topbar',
  standalone: true,
  providers: [MessageService],
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    DialogModule,
    PasswordModule,
    TabsModule,
    ButtonModule,
    FormsModule,
    Menu,
    Toast,
  ],
  styles: `
    :host {
      --topbar-height: 64px;
      --brand-navy: #1a3a2e;
      --brand-navy-light: #245c45;
      --brand-accent: #4ade80;
      --brand-accent-soft: rgba(74,222,128,0.15);
      --surface-glass: rgba(18, 46, 36, 0.96);
      --shadow-topbar: 0 1px 0 rgba(18,46,36,0.18), 0 4px 24px rgba(18,46,36,0.22);
      --radius-avatar: 50%;
      --radius-btn: 10px;
      --transition-speed: 180ms;
    }

    .layout-topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem 0 1rem;
      background: var(--surface-glass);
      backdrop-filter: blur(14px) saturate(1.6);
      -webkit-backdrop-filter: blur(14px) saturate(1.6);
      box-shadow: var(--shadow-topbar);
      border-bottom: 1px solid rgba(74,222,128,0.12);
      gap: 1rem;
    }

    /* ── Logo section ── */
    .layout-topbar-logo-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .layout-menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: var(--radius-btn);
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      transition: background var(--transition-speed), color var(--transition-speed);
      font-size: 1.1rem;
    }
    .layout-menu-button:hover {
      background: var(--brand-accent-soft);
      color: var(--brand-accent);
    }

    .layout-topbar-logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-btn);
      transition: background var(--transition-speed);
    }
    .layout-topbar-logo:hover {
      background: var(--brand-accent-soft);
    }

    /* ── Yash Logo image ── */
    .yash-logo-img {
      height: 50px;
      width: auto;
      object-fit: contain;
      flex-shrink: 0;
    }

    /* ── Divider between logo and text ── */
    .logo-divider {
      width: 1px;
      height: 22px;
      background: rgba(255,255,255,0.2);
      flex-shrink: 0;
    }

    .logo-text {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: rgba(255,255,255,0.95);
      letter-spacing: -0.01em;
      white-space: nowrap;
    }
    .logo-text span {
      color: var(--brand-accent);
    }

    /* ── Divider ── */
    .topbar-divider {
      width: 1px;
      height: 28px;
      background: rgba(255,255,255,0.12);
      flex-shrink: 0;
    }

    /* ── Right actions ── */
    .layout-topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-left: auto;
    }

    /* ── User chip ── */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.3rem 0.75rem 0.3rem 0.3rem;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.07);
      cursor: default;
      transition: border-color var(--transition-speed), background var(--transition-speed);
    }
    .user-chip:hover {
      background: var(--brand-accent-soft);
      border-color: rgba(74,222,128,0.4);
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(74,222,128,0.25);
      color: var(--brand-accent);
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      flex-shrink: 0;
      border: 1.5px solid rgba(74,222,128,0.5);
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Settings button ── */
    .settings-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: var(--radius-btn);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: background var(--transition-speed), color var(--transition-speed), transform var(--transition-speed);
      font-size: 1rem;
    }
    .settings-btn:hover {
      background: var(--brand-accent-soft);
      color: var(--brand-accent);
      transform: rotate(20deg);
    }

    /* ── Mobile ellipsis button ── */
    .layout-topbar-menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: var(--radius-btn);
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      font-size: 1rem;
      transition: background var(--transition-speed);
    }
    .layout-topbar-menu-button:hover {
      background: var(--brand-accent-soft);
    }

    /* ── Profile avatar (large, dialog) ── */
    .profile-initials-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--brand-navy);
      color: var(--brand-accent);
      font-weight: 700;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      text-transform: uppercase;
      border: 3px solid rgba(74,222,128,0.35);
      box-shadow: 0 0 0 4px rgba(26,58,46,0.12);
      flex-shrink: 0;
    }

    /* ── Profile dialog layout ── */
    .profile-content {
      padding: 1.5rem 1rem 1rem;
    }
    .profile-header {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .profile-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.25rem;
      margin-top: 1.25rem;
    }
    .profile-field label {
      font-size: 0.75rem;
      color: #8892a4;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: block;
      margin-bottom: 0.2rem;
    }
    .profile-field .value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--brand-navy);
    }
    .profile-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--brand-navy);
      margin: 0 0 0.2rem;
      letter-spacing: -0.01em;
    }
    .profile-role-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background: rgba(74,222,128,0.12);
      color: #166534;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid rgba(74,222,128,0.35);
    }

    /* ── Responsive ── */
    @media (max-width: 992px) {
      .user-name { display: none; }
      .logo-text { font-size: 0.9rem; }
    }
    @media (max-width: 768px) {
      .logo-divider { display: none; }
      .logo-text { font-size: 0.85rem; }
    }
    @media (max-width: 576px) {
      .logo-text { display: none; }
    }
  `,

  template: `
    <p-toast />

    <div class="layout-topbar">

      <!-- Left: hamburger + logo -->
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button" (click)="layoutService.onMenuToggle()" title="Toggle menu">
          <i class="pi pi-bars"></i>
        </button>

        <a class="layout-topbar-logo" routerLink="/app">
          <!-- Yash Technologies logo -->
          <img
            src="/yash-logo.png"
            alt="Yash Technologies"
            class="yash-logo-img"
          />

          <div class="logo-divider"></div>

          <span class="logo-text">Knowledge <span>Repository</span></span>
        </a>
      </div>

      <!-- Right: user + settings -->
      <div class="layout-topbar-actions">

        <!-- User chip (desktop) -->
        <div class="user-chip" *ngIf="userName">
          <div class="avatar-circle">{{ getUserInitials() }}</div>
          <span class="user-name">{{ userName }}</span>
        </div>

        <!-- Settings cog -->
        <p-menu #menu [model]="items" [popup]="true" />
        <button class="settings-btn" (click)="menu.toggle($event)" title="Settings">
          <i class="pi pi-cog"></i>
        </button>

        <!-- Mobile overflow -->
        <button
          class="layout-topbar-menu-button lg:hidden"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
          title="More options"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>

      </div>
    </div>

    <!-- ── Change Password Dialog ── -->
    <p-dialog
      [(visible)]="changePasswordDialog"
      [style]="{ width: '440px' }"
      header="Change Password"
      [modal]="true"
      styleClass="p-fluid"
    >
      <ng-template pTemplate="content">
        <div class="flex flex-column gap-4 pt-2">

          <div class="flex flex-column gap-1">
            <label class="text-sm font-semibold text-700">Current Password</label>
            <p-password
              [(ngModel)]="old_password"
              [feedback]="false"
              placeholder="Enter current password"
              [toggleMask]="true"
              inputStyleClass="w-full"
            />
          </div>

          <div class="flex flex-column gap-1">
            <label class="text-sm font-semibold text-700">New Password</label>
            <p-password
              [(ngModel)]="new_password"
              [feedback]="false"
              placeholder="Enter new password"
              [toggleMask]="true"
              inputStyleClass="w-full"
            />
            <small *ngIf="new_password && !isPasswordValid()" class="p-error">
              Must be 8+ chars with uppercase, lowercase, number &amp; special character.
            </small>
          </div>

          <div class="flex flex-column gap-1">
            <label class="text-sm font-semibold text-700">Confirm New Password</label>
            <p-password
              [(ngModel)]="retype_password"
              [feedback]="false"
              placeholder="Confirm new password"
              [toggleMask]="true"
              inputStyleClass="w-full"
            />
            <small *ngIf="retype_password && !doPasswordsMatch()" class="p-error">
              Passwords do not match.
            </small>
          </div>

        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button icon="pi pi-times" label="Cancel" severity="secondary" (click)="hideDialog()" />
          <p-button icon="pi pi-check" label="Update Password"
            (click)="confirmChangePassword(old_password, new_password, retype_password)"
            [disabled]="!isFormValid()" />
        </div>
      </ng-template>
    </p-dialog>

    <!-- ── Logout Confirm Dialog ── -->
    <p-dialog
      [(visible)]="logoutdialog"
      header="Confirm Logout"
      [modal]="true"
      [style]="{ width: '400px' }"
    >
      <div class="flex align-items-center gap-3 py-2">
        <i class="pi pi-sign-out text-2xl text-orange-500"></i>
        <span>Are you sure you want to <strong>sign out</strong>?</span>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <p-button icon="pi pi-times" label="Cancel" severity="secondary" (click)="hidelogout()" />
          <p-button icon="pi pi-check" label="Sign Out" severity="danger" (click)="logout()" />
        </div>
      </ng-template>
    </p-dialog>

    <!-- ── Profile Dialog ── -->
    <p-dialog
      [(visible)]="profiledialog"
      header="My Profile"
      [modal]="true"
      [maximizable]="true"
      [resizable]="true"
      [style]="{ width: '800px' }"
    >
      <ng-template pTemplate="content">
        <div class="profile-content">

          <div class="profile-header">
            <div class="profile-initials-circle">{{ getUserInitials() }}</div>
            <div class="flex flex-column gap-1 justify-content-center">
              <h2 class="profile-name">{{ userName }}</h2>
              <span class="profile-role-badge">
                <i class="pi pi-shield mr-1" style="font-size:0.7rem"></i>
                {{ userRole }}
              </span>
            </div>
          </div>

          <div class="profile-info-grid">
            <div class="profile-field">
              <label>Employee ID</label>
              <span class="value">{{ userYashId }}</span>
            </div>
            <div class="profile-field">
              <label>Email</label>
              <span class="value">{{ userEmail }}</span>
            </div>
            <div class="profile-field">
              <label>Business Unit</label>
              <span class="value">{{ userBusinessUnit }}</span>
            </div>
            <div class="profile-field">
              <label>Role</label>
              <span class="value">{{ userRole }}</span>
            </div>
          </div>

        </div>
      </ng-template>
    </p-dialog>



    <!-- ── Portal Help Dialog ── -->
<!-- ── Portal Help Dialog ── -->
<p-dialog
  [(visible)]="helpDialog"
  header="Portal Help"
  [modal]="true"
  [maximizable]="true"
  [style]="{ width: '760px', maxHeight: '85vh' }"
>
  <ng-template pTemplate="header">
    <div class="flex align-items-center gap-3">
      <div style="width:38px;height:38px;border-radius:10px;background:rgba(74,222,128,0.13);
           border:1px solid rgba(74,222,128,0.3);display:flex;align-items:center;
           justify-content:center;color:#4ade80;font-size:1.1rem">
        <i class="pi pi-question-circle"></i>
      </div>
      <div>
        <div style="font-size:1rem;font-weight:700">Portal Help</div>
        <div style="font-size:.73rem;color:#8892a4">Knowledge Repository — Quick Reference</div>
      </div>
    </div>
  </ng-template>

  <ng-template pTemplate="content">
    <p-tabs [(value)]="activeHelpTab">

      <p-tablist>
        <p-tab value="about">About KR</p-tab>
        <p-tab value="templates">Templates</p-tab>
        <p-tab value="howto">How to Use</p-tab>
      </p-tablist>

      <p-tabpanels>

        <!-- ── About KR ── -->
        <p-tabpanel value="about">
          <div class="flex flex-column gap-4 pt-2">

            <div style="background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.18);
                 border-radius:12px;padding:1.25rem">
              <h3 style="font-size:1rem;font-weight:700;color:#1a3a2e;margin-bottom:.5rem">
                📚 What is Knowledge Repository?
              </h3>
              <p style="font-size:.84rem;color:#4a5568;line-height:1.65">
                Knowledge Repository (KR) is Yash Technologies' centralised internal platform for
                capturing, storing, and sharing project knowledge — including functional specs,
                technical specs, how-to guides, SOPs, and code snippets — across all business
                units and SAP practice areas.
              </p>
            </div>

            <div>
              <div class="text-xs font-bold uppercase mb-2" style="color:#4ade80;letter-spacing:.08em">
                Core Capabilities
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem">
                <div *ngFor="let f of helpFeatures"
                  style="background:#f8fdf9;border:1px solid rgba(74,222,128,0.2);
                         border-radius:10px;padding:1rem">
                  <div style="font-size:1.2rem;margin-bottom:.4rem">{{ f.icon }}</div>
                  <div style="font-size:.83rem;font-weight:700;color:#1a3a2e;margin-bottom:.25rem">{{ f.title }}</div>
                  <div style="font-size:.76rem;color:#64748b;line-height:1.55">{{ f.desc }}</div>
                </div>
              </div>
            </div>

            

          </div>
        </p-tabpanel>

        <!-- ── Templates ── -->
        <p-tabpanel value="templates">
          <div class="flex flex-column gap-3 pt-2">

            <div *ngFor="let t of helpTemplates"
              style="background:#f9fafb;border:1px solid rgba(74,222,128,0.2);border-radius:12px;
                     padding:1.25rem;display:flex;gap:1rem;align-items:flex-start">
              <div style="width:44px;height:44px;border-radius:10px;background:rgba(74,222,128,0.1);
                   border:1px solid rgba(74,222,128,0.25);display:flex;align-items:center;
                   justify-content:center;font-size:1.3rem;flex-shrink:0">
                {{ t.icon }}
              </div>
              <div style="flex:1">
                <span style="background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.25);
                      border-radius:4px;font-size:.64rem;font-weight:700;color:#166534;
                      padding:.1rem .45rem;text-transform:uppercase;letter-spacing:.05em">
                  {{ t.badge }}
                </span>
                <div style="font-size:.9rem;font-weight:700;color:#1a3a2e;margin:.3rem 0 .25rem">
                  {{ t.name }}
                </div>
                <p style="font-size:.78rem;color:#64748b;line-height:1.55;margin-bottom:.65rem">
                  {{ t.desc }}
                </p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span *ngFor="let field of t.fields"
                    style="background:rgba(0,0,0,0.04);border-radius:4px;padding:.15rem .5rem;
                           font-size:.7rem;color:#64748b">
                    {{ field }}
                  </span>
                </div>
                <p-button
                  [label]="'Download ' + t.filename"
                  icon="pi pi-download"
                  size="small"
                  [outlined]="true"
                  (click)="downloadTemplate(t.filename)"
                />
              </div>
            </div>

            <div style="background:rgba(74,222,128,0.07);border-left:3px solid #4ade80;
                 border-radius:0 8px 8px 0;padding:.9rem 1rem">
              <p style="font-size:.79rem;color:#374151;line-height:1.6">
                <strong style="color:#166534">Tip:</strong> Always fill in the
                <em>Module / Area</em> and <em>Prepared By</em> header fields before uploading
                so documents are correctly indexed.
              </p>
            </div>

          </div>
        </p-tabpanel>

        <!-- ── How to Use ── -->
        <p-tabpanel value="howto">
          <div class="flex flex-column gap-4 pt-2">

            <div>
              <div class="text-xs font-bold uppercase mb-3" style="color:#4ade80;letter-spacing:.08em">
                Uploading a Solution
              </div>
              <div *ngFor="let s of helpUploadSteps; let i = index"
                class="flex gap-3 pb-3 mb-2" style="border-bottom:1px solid rgba(74,222,128,0.08)">
                <div style="width:24px;height:24px;border-radius:50%;background:rgba(74,222,128,0.12);
                     border:1px solid rgba(74,222,128,0.3);color:#166534;font-size:.72rem;
                     font-weight:700;display:flex;align-items:center;justify-content:center;
                     flex-shrink:0;margin-top:2px">
                  {{ i + 1 }}
                </div>
                <div style="font-size:.81rem;color:#4a5568;line-height:1.6" [innerHTML]="s"></div>
              </div>
            </div>

            <div>
              <div class="text-xs font-bold uppercase mb-2" style="color:#4ade80;letter-spacing:.08em">
                Tips for Quality Submissions
              </div>
              <div *ngFor="let tip of helpTips"
                style="background:rgba(74,222,128,0.06);border-left:3px solid #4ade80;
                       border-radius:0 8px 8px 0;padding:.8rem 1rem;margin-bottom:.6rem">
                <p style="font-size:.79rem;color:#374151;line-height:1.6" [innerHTML]="tip"></p>
              </div>
            </div>

          </div>
        </p-tabpanel>

      </p-tabpanels>

    </p-tabs>
  </ng-template>
</p-dialog>
  `,
})
export class AppTopbar implements OnInit {
  old_password: string = '';
  new_password: string = '';
  retype_password: string = '';
  changePasswordDialog: boolean = false;
  profiledialog: boolean = false;
  logoutdialog: boolean = false;

  items: MenuItem[] | undefined;

  helpDialog: boolean = false;

  activeHelpTab: string = 'about';

  userName: string = '';
  userEmail: string = '';
  userYashId: string = '';
  userBusinessUnit: string = '';
  userRole: string = '';

  helpFeatures = [
  { icon: '📄', title: 'Document Management', desc: 'Upload, version, and organise PDF, Word, Excel and image files with category tagging.' },
  { icon: '🔍', title: 'Smart Search', desc: 'Find any document across all modules using keyword, tag, or author-based filters.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track document views, upload trends, and team contribution metrics in real time.' },
  { icon: '🔒', title: 'Role-based Access', desc: 'Admin, Manager, and Employee roles with fine-grained visibility and upload permissions.' },
  { icon: '📬', title: 'Email Notifications', desc: 'Automated alerts on new uploads, approvals, and knowledge-base updates.' },
  { icon: '📁', title: 'Secure File Viewer', desc: 'View PDFs, Excel, Word, and images inline — no download required for quick reference.' },
];

helpRoles = ['ABAP Consultants','BASIS Consultants','Fiori Developers','Project Managers','QA & Testing','Functional Consultants','SAP Architects','Business Analysts'];

helpTemplates = [
  {
    icon: '📋', badge: 'Functional', filename: 'KR_FS_Template.docx',
    name: 'Functional Specification (FS) Template',
    desc: 'Documents the business requirement, solution overview, process flow, SPRO config steps, impacted transactions/tables, and test scenarios.',
    fields: ['Business Requirement','Solution Overview','Process Flow','SPRO Config','Impacted T-codes','Impacted Tables','Test Scenarios'],
  },
  {
    icon: '🛠', badge: 'Technical', filename: 'KR_TS_Template.docx',
    name: 'Technical Specification (TS) Template',
    desc: 'Documents ABAP programs, function modules, BAdI/enhancement implementations, and object-level technical design with code snippets.',
    fields: ['Detailed Requirement','Solution Approach','Business Impact','FM / T-code / Program','Tables & BAdI','ABAP Code Snippet','Test Cases'],
  },
];

helpUploadSteps = [
  '<strong>Navigate to Add Solutions</strong> from the sidebar and click <em>Upload Solution</em> in the top-left.',
  '<strong>Fill in mandatory fields:</strong> Customer Name, Domain, Sector, Module/area, Object Type, Customer Benefit and describe the requirement.',
  '<strong>Select your file</strong> — PDF, Word (.docx). Max 16 MB per file.',
  '<strong>Submit for review.</strong> Managers receive an email notification and can approve or reject with comments.',
  '<strong>Once approved</strong>, the document appears in the searchable Knowledge Base for all permitted users.',
];

helpTips = [
  '<strong style="color:#166534">Use the official templates.</strong> Documents without the standard FS/TS structure may be sent back by reviewers.',
  '<strong style="color:#166534">Name your file clearly:</strong> use the format <em>ProjectName_FS_Topic.docx</em> or <em>ProjectName_TS_ObjectName.docx</em>.',
  '<strong style="color:#166534">Add test cases.</strong> Both templates include a test case table — filling it out makes the document immediately usable by QA.',
];

  constructor(
    public layoutService: LayoutService,
    public messageservice: MessageService,
    private authservice: AuthenticationService,
    private loginservice: LoginService
  ) {}

  ngOnInit(): void {
    const darkTheme = JSON.parse(localStorage.getItem('darkTheme') ?? 'false');
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme }));
    this.initializeMenuItems(darkTheme);
    this.loadUserDetails();
  }

  initializeMenuItems(isDarkMode: boolean) {
    this.items = [
      {
        label: 'Account',
        items: [
          {
            label: 'View Profile',
            icon: 'pi pi-user',
            command: () => this.openprofile(),
          },
          {
            label: 'Change Password',
            icon: 'pi pi-key',
            command: () => this.changeUser_Password(),
          },
          {
  label: 'Portal Help',
  icon: 'pi pi-question-circle',
  command: () => this.openHelp(),
},
          { separator: true },
          {
            label: 'Sign Out',
            icon: 'pi pi-sign-out',
            command: () => this.togglelogout(),
          },
        ],
      },
    ];
  }

  loadUserDetails() {
    this.loginservice.getUserDetails().subscribe({
      next: (user: any) => {
        this.userName = user.name || 'Unknown User';
        this.userEmail = user.email || 'No Email';
        this.userYashId = user.yash_id || 'No Id';
        this.userBusinessUnit = user.b_unit || 'N/A';
        this.userRole = user.type || 'N/A';
      },
      error: () => {
        this.userName = 'Unknown User';
        this.userEmail = 'No Email';
        this.userYashId = 'No Id';
        this.userBusinessUnit = 'N/A';
        this.userRole = 'N/A';
      },
    });
  }

  downloadTemplate(filename: string) {
  const link = document.createElement('a');
  link.href = `assets/templates/${filename}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

  getUserInitials(): string {
    if (!this.userName) return '';
    const words = this.userName.trim().split(' ');
    const first = words[0]?.charAt(0).toUpperCase() || '';
    const second = words.length > 1 ? words[1].charAt(0).toUpperCase() : '';
    return first + second;
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => {
      const newDark = !state.darkTheme;
      localStorage.setItem('darkTheme', JSON.stringify(newDark));
      this.initializeMenuItems(newDark);
      return { ...state, darkTheme: newDark };
    });
  }

  openprofile() { this.profiledialog = true; }

  isPasswordValid(): boolean {
    const p = this.new_password;
    return (
      p.length >= 8 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /[0-9]/.test(p) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(p)
    );
  }

  doPasswordsMatch(): boolean { return this.new_password === this.retype_password; }

  openHelp() { this.helpDialog = true; }

  isFormValid(): boolean {
    return this.isPasswordValid() && this.doPasswordsMatch() && this.old_password.length > 0;
  }

  hideDialog() {
    this.changePasswordDialog = false;
    this.old_password = '';
    this.new_password = '';
    this.retype_password = '';
  }

  changeUser_Password() { this.changePasswordDialog = true; }

  confirmChangePassword(old_password: string, new_password: string, retype_password: string) {
    if (this.isFormValid()) {
      this.loginservice.changePassword(this.old_password, this.new_password).subscribe(
        () => {
          this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully.' });
          this.changePasswordDialog = false;
        },
        () => {
          this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Failed to update password. Please try again.' });
        }
      );
    }
  }

  togglelogout() { this.logoutdialog = true; }
  hidelogout() { this.logoutdialog = false; }

  logout() {
    this.authservice.logout();
    ['CurrentPage', 'ApprovalCurrentPage', 'LHistoryCurrentPage',
     'PendingCurrentPage', 'RejectedCurrentPage', 'UnApprovedCurrentPage']
      .forEach(k => localStorage.removeItem(k));
  }
}