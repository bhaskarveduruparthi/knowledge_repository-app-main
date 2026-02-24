import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    signal,
    ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export type ViewerState = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

@Component({
    selector: 'app-secure-file-viewer',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ButtonModule, ProgressSpinnerModule],
    template: `
        <p-button 
            label="View" 
            icon="pi pi-eye" 
            (click)="openViewer()" 
            [disabled]="disabled" />
    `,
    styles: []
})
export class SecureFileViewerComponent implements OnInit, OnDestroy {

    @Input({ required: true }) repoId!: number;
    @Input() filename: string = '';
    @Input() disabled: boolean = false;
    @Input() apiBase = 'http://127.0.0.1:5001';

    private newWindow: Window | null = null;
    private objectUrls: string[] = [];

    constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

    ngOnInit() {}

    ngOnDestroy() {
        this.cleanup();
    }

    openViewer() {
        this.newWindow = window.open('', '_blank');

        if (!this.newWindow) {
            alert('Please allow popups for this site to view files in a new tab.');
            return;
        }

        this.newWindow.document.title = this.filename || 'File Preview';
        this.initializeWindow();
        this.loadFile();
    }

    private getFileExtension(): string {
        if (!this.filename) return '';
        const parts = this.filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
    }

    private getFileIcon(ext: string): string {
        const icons: Record<string, string> = {
            'PDF':  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            'DOCX': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            'DOC':  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            'XLSX': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`,
            'XLS':  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`,
        };
        return icons[ext] || `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
    }

    private getFileAccentColor(ext: string): string {
        const colors: Record<string, string> = {
            'PDF':  '#dc2626',
            'DOCX': '#2563eb',
            'DOC':  '#2563eb',
            'XLSX': '#16a34a',
            'XLS':  '#16a34a',
            'CSV':  '#16a34a',
            'PNG':  '#7c3aed',
            'JPG':  '#7c3aed',
            'JPEG': '#7c3aed',
            'GIF':  '#7c3aed',
            'WEBP': '#7c3aed',
            'TXT':  '#4b7c59',
            'MD':   '#4b7c59',
        };
        return colors[ext] || '#2d7a4f';
    }

    private initializeWindow() {
        if (!this.newWindow || this.newWindow.closed) return;

        const ext = this.getFileExtension();
        const icon = this.getFileIcon(ext);
        const accent = this.getFileAccentColor(ext);
        const shortName = this.filename.length > 52
            ? this.filename.substring(0, 49) + '…'
            : this.filename;

        const doc = this.newWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.filename || 'File Preview'}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
                <style>
                    *, *::before, *::after {
                        margin: 0; padding: 0;
                        box-sizing: border-box;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                    }

                    :root {
                        --accent:        ${accent};
                        --accent-light:  color-mix(in srgb, ${accent} 12%, transparent);
                        --accent-border: color-mix(in srgb, ${accent} 28%, transparent);

                        --green-50:  #f0faf3;
                        --green-100: #dcf5e4;
                        --green-200: #bbeecb;
                        --green-300: #86d9a0;
                        --green-500: #2d7a4f;
                        --green-600: #1d5c3a;

                        --bg-base:      #e8f5ed;
                        --bg-surface:   rgba(255,255,255,0.75);
                        --bg-card:      #ffffff;
                        --bg-row-alt:   #f6fbf8;
                        --bg-row-hover: #edf7f1;

                        --border:        rgba(45,122,79,0.12);
                        --border-strong: rgba(45,122,79,0.22);

                        --text-primary:   #0f2d1c;
                        --text-secondary: #3d6b4f;
                        --text-muted:     #7aaa8a;

                        --header-height:    54px;
                        --statusbar-height: 30px;

                        --shadow-float: 0 8px 40px rgba(20,60,35,0.14), 0 2px 8px rgba(20,60,35,0.07);
                    }

                    html, body {
                        width: 100%; height: 100%;
                        overflow: hidden;
                        background: var(--bg-base);
                        font-family: 'IBM Plex Sans', system-ui, sans-serif;
                        color: var(--text-primary);
                    }

                    /* subtle dot-grid texture matching the app */
                    body::before {
                        content: '';
                        position: fixed; inset: 0;
                        background-image: radial-gradient(circle, rgba(45,122,79,0.18) 1px, transparent 1px);
                        background-size: 22px 22px;
                        pointer-events: none;
                        z-index: 0;
                    }

                    /* ── HEADER ───────────────────────────────────────── */
                    #viewer-header {
                        position: fixed;
                        top: 0; left: 0; right: 0;
                        height: var(--header-height);
                        background: var(--bg-surface);
                        border-bottom: 1px solid var(--border-strong);
                        backdrop-filter: blur(18px) saturate(1.6);
                        -webkit-backdrop-filter: blur(18px) saturate(1.6);
                        display: flex;
                        align-items: center;
                        padding: 0 1.375rem;
                        gap: 0.875rem;
                        z-index: 200;
                    }

                    .header-brand {
                        display: flex;
                        align-items: center;
                        gap: 0.45rem;
                        color: var(--green-500);
                        font-weight: 600;
                        font-size: 13px;
                        letter-spacing: 0.01em;
                        flex-shrink: 0;
                    }

                    .brand-dot {
                        width: 8px; height: 8px;
                        border-radius: 50%;
                        background: var(--green-500);
                    }

                    .header-sep {
                        width: 1px; height: 22px;
                        background: var(--border-strong);
                        flex-shrink: 0;
                    }

                    .file-badge {
                        display: flex;
                        align-items: center;
                        gap: 0.45rem;
                        padding: 0.28rem 0.65rem 0.28rem 0.5rem;
                        background: var(--accent-light);
                        border: 1px solid var(--accent-border);
                        border-radius: 6px;
                        color: var(--accent);
                        font-size: 11px;
                        font-weight: 600;
                        font-family: 'IBM Plex Mono', monospace;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        flex-shrink: 0;
                    }

                    .filename-label {
                        font-size: 13px;
                        font-weight: 400;
                        color: var(--text-secondary);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        flex: 1;
                    }

                    .filename-label strong {
                        color: var(--text-primary);
                        font-weight: 500;
                    }

                    .secure-pill {
                        display: flex;
                        align-items: center;
                        gap: 0.38rem;
                        padding: 0.26rem 0.7rem;
                        background: rgba(22,163,74,0.1);
                        border: 1px solid rgba(22,163,74,0.25);
                        border-radius: 20px;
                        color: var(--green-500);
                        font-size: 11.5px;
                        font-weight: 500;
                        flex-shrink: 0;
                        letter-spacing: 0.02em;
                    }

                    .secure-dot {
                        width: 6px; height: 6px;
                        border-radius: 50%;
                        background: #16a34a;
                        animation: pulse-dot 2.4s ease-in-out infinite;
                    }

                    @keyframes pulse-dot {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50%       { opacity: 0.4; transform: scale(0.7); }
                    }

                    /* ── BODY ─────────────────────────────────────────── */
                    #viewer-body {
                        position: fixed;
                        top: var(--header-height);
                        left: 0; right: 0;
                        bottom: var(--statusbar-height);
                        overflow: hidden;
                        z-index: 1;
                    }

                    #content {
                        width: 100%; height: 100%;
                        overflow: auto;
                    }

                    /* ── STATUS BAR ───────────────────────────────────── */
                    #viewer-statusbar {
                        position: fixed;
                        bottom: 0; left: 0; right: 0;
                        height: var(--statusbar-height);
                        background: var(--bg-surface);
                        border-top: 1px solid var(--border-strong);
                        backdrop-filter: blur(18px);
                        -webkit-backdrop-filter: blur(18px);
                        display: flex;
                        align-items: center;
                        padding: 0 1.25rem;
                        gap: 1.25rem;
                        z-index: 200;
                    }

                    .statusbar-item {
                        display: flex;
                        align-items: center;
                        gap: 0.38rem;
                        font-size: 11px;
                        color: var(--text-muted);
                        font-family: 'IBM Plex Mono', monospace;
                        letter-spacing: 0.02em;
                    }

                    .statusbar-sep {
                        width: 1px; height: 13px;
                        background: var(--border-strong);
                    }

                    .statusbar-spacer { flex: 1; }

                    /* ── LOADING ──────────────────────────────────────── */
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        gap: 1.1rem;
                    }

                    .loader-ring {
                        position: relative;
                        width: 44px; height: 44px;
                    }
                    .loader-ring::before {
                        content: '';
                        position: absolute; inset: 0;
                        border-radius: 50%;
                        border: 2.5px solid var(--green-200);
                    }
                    .loader-ring::after {
                        content: '';
                        position: absolute; inset: 0;
                        border-radius: 50%;
                        border: 2.5px solid transparent;
                        border-top-color: var(--green-500);
                        animation: spin 0.75s linear infinite;
                    }

                    @keyframes spin { to { transform: rotate(360deg); } }

                    .loading-text {
                        color: var(--text-muted);
                        font-size: 12px;
                        letter-spacing: 0.07em;
                        text-transform: uppercase;
                        font-family: 'IBM Plex Mono', monospace;
                    }

                    /* ── ERROR ────────────────────────────────────────── */
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        gap: 0.7rem;
                        padding: 2rem;
                        text-align: center;
                    }

                    .error-icon {
                        width: 48px; height: 48px;
                        border-radius: 50%;
                        background: rgba(220,38,38,0.08);
                        border: 1px solid rgba(220,38,38,0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #dc2626;
                        margin-bottom: 0.2rem;
                    }

                    .error-title {
                        font-size: 15px;
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .error-message {
                        font-size: 13px;
                        color: var(--text-secondary);
                        max-width: 360px;
                        line-height: 1.65;
                    }

                    /* ── IFRAME (PDF / TEXT) ──────────────────────────── */
                    .iframe-shell {
                        width: 100%; height: 100%;
                        background: #fff;
                    }
                    .iframe-shell iframe {
                        width: 100%; height: 100%;
                        border: none; display: block;
                    }

                    /* ── IMAGE VIEWER ─────────────────────────────────── */
                    .image-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%; height: 100%;
                        background: var(--bg-base);
                        padding: 2.5rem;
                    }

                    .image-frame {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                        border: 1px solid var(--border-strong);
                        border-radius: 12px;
                        padding: 1.5rem;
                        box-shadow: var(--shadow-float);
                        max-width: calc(100% - 2rem);
                        max-height: calc(100% - 2rem);
                        animation: rise 0.35s ease-out;
                    }

                    @keyframes rise {
                        from { opacity: 0; transform: translateY(10px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }

                    .image-frame img {
                        max-width: 100%;
                        max-height: calc(100vh - var(--header-height) - var(--statusbar-height) - 7rem);
                        object-fit: contain;
                        border-radius: 6px;
                        display: block;
                        pointer-events: none;
                        -webkit-user-drag: none;
                        user-drag: none;
                    }

                    /* ── WORD DOC ─────────────────────────────────────── */
                    .doc-scroll {
                        width: 100%; height: 100%;
                        overflow: auto;
                        background: var(--bg-base);
                        padding: 2.25rem 1.5rem 3rem;
                    }

                    .doc-paper {
                        max-width: 800px;
                        margin: 0 auto;
                        background: #fff;
                        border-radius: 10px;
                        border: 1px solid var(--border);
                        box-shadow: var(--shadow-float);
                        padding: 4rem 4.5rem;
                        animation: rise 0.35s ease-out;
                    }

                    .word-viewer {
                        font-family: 'Georgia', 'Times New Roman', serif;
                        font-size: 14.5px;
                        line-height: 1.8;
                        color: #1a2e22;
                    }

                    .word-viewer p { margin: 0 0 1em; }

                    .word-viewer h1,
                    .word-viewer h2,
                    .word-viewer h3,
                    .word-viewer h4 {
                        font-family: 'IBM Plex Sans', sans-serif;
                        color: #0f2d1c;
                        font-weight: 600;
                        line-height: 1.3;
                        margin: 1.75em 0 0.55em;
                    }

                    .word-viewer h1 {
                        font-size: 1.85em;
                        border-bottom: 2px solid var(--green-100);
                        padding-bottom: 0.4em;
                    }
                    .word-viewer h2 { font-size: 1.4em; }
                    .word-viewer h3 { font-size: 1.15em; }

                    .word-viewer ul,
                    .word-viewer ol { margin: 0 0 1em; padding-left: 1.75em; }
                    .word-viewer li { margin-bottom: 0.35em; }

                    .word-viewer table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1.5em 0;
                        font-size: 13px;
                        font-family: 'IBM Plex Sans', sans-serif;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 1px 4px rgba(20,60,35,0.08);
                    }

                    .word-viewer th {
                        background: var(--green-100);
                        color: var(--green-600);
                        font-weight: 600;
                        font-size: 11.5px;
                        text-transform: uppercase;
                        letter-spacing: 0.04em;
                        padding: 10px 14px;
                        border-bottom: 2px solid var(--green-200);
                        text-align: left;
                    }

                    .word-viewer td {
                        padding: 9px 14px;
                        border-bottom: 1px solid #edf7f1;
                        color: #1a2e22;
                    }

                    .word-viewer tr:nth-child(even) td { background: var(--bg-row-alt); }

                    .word-viewer blockquote {
                        border-left: 3px solid var(--green-300);
                        padding: 0.5em 1em;
                        margin: 1em 0;
                        color: var(--text-secondary);
                        font-style: italic;
                        background: var(--green-50);
                        border-radius: 0 6px 6px 0;
                    }

                    .word-viewer code {
                        font-family: 'IBM Plex Mono', monospace;
                        background: var(--green-50);
                        border: 1px solid var(--green-100);
                        padding: 0.1em 0.4em;
                        border-radius: 4px;
                        font-size: 0.88em;
                        color: var(--green-600);
                    }

                    /* ── EXCEL ────────────────────────────────────────── */
                    .excel-scroll {
                        width: 100%; height: 100%;
                        overflow: auto;
                        background: var(--bg-base);
                        padding: 1.75rem;
                    }

                    .excel-wrapper {
                        display: inline-block;
                        min-width: 100%;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 1px solid var(--border-strong);
                        box-shadow: var(--shadow-float);
                        animation: rise 0.35s ease-out;
                        background: #fff;
                    }

                    .excel-viewer table {
                        border-collapse: collapse;
                        width: 100%;
                        font-size: 12.5px;
                        font-family: 'IBM Plex Mono', monospace;
                    }

                    .excel-viewer thead th {
                        background: var(--green-100);
                        color: var(--green-600);
                        font-weight: 600;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        padding: 11px 16px;
                        border-right: 1px solid var(--green-200);
                        border-bottom: 2px solid var(--green-200);
                        position: sticky;
                        top: 0; z-index: 2;
                        white-space: nowrap;
                        text-align: left;
                    }

                    .excel-viewer thead th:first-child {
                        background: var(--green-200);
                        color: var(--green-600);
                        width: 48px;
                        text-align: center;
                    }

                    .excel-viewer tbody td {
                        padding: 8px 16px;
                        border-right: 1px solid #edf7f1;
                        border-bottom: 1px solid #edf7f1;
                        color: var(--text-primary);
                        white-space: nowrap;
                        background: #fff;
                    }

                    .excel-viewer tbody td:first-child {
                        background: var(--green-50);
                        color: var(--text-muted);
                        text-align: center;
                        font-size: 11px;
                        border-right: 2px solid var(--green-200);
                    }

                    .excel-viewer tbody tr:nth-child(even) td { background: var(--bg-row-alt); }
                    .excel-viewer tbody tr:nth-child(even) td:first-child { background: var(--green-50); }
                    .excel-viewer tbody tr:hover td { background: var(--bg-row-hover) !important; }
                </style>
            </head>
            <body>

                <header id="viewer-header">
                    <div class="header-brand">
                        <div class="brand-dot"></div>
                        Knowledge Repository
                    </div>
                    <div class="header-sep"></div>
                    <div class="file-badge">
                        ${icon}
                        ${ext || 'FILE'}
                    </div>
                    <div class="header-sep"></div>
                    <div class="filename-label"><strong>${shortName}</strong></div>
                    <div class="secure-pill">
                        <div class="secure-dot"></div>
                        Secured View
                    </div>
                </header>

                <div id="viewer-body">
                    <div id="content">
                        <div class="loading-container">
                            <div class="loader-ring"></div>
                            <div class="loading-text">Loading document…</div>
                        </div>
                    </div>
                </div>

                <div id="viewer-statusbar">
                    <div class="statusbar-item">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Read-only
                    </div>
                    <div class="statusbar-sep"></div>
                    <div class="statusbar-item">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div class="statusbar-spacer"></div>
                    <div class="statusbar-item">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Protected · No download
                    </div>
                </div>

            </body>
            </html>
        `);
        doc.close();
        this.applySecurityProtections();
    }

    private applySecurityProtections() {
        if (!this.newWindow || this.newWindow.closed) return;
        const win = this.newWindow;

        win.document.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault(); e.stopPropagation(); return false;
        }, true);

        win.document.addEventListener('keydown', (e: KeyboardEvent) => {
            const blocked = ['c', 'a', 'x', 'v', 'u', 's', 'p'];
            if ((e.ctrlKey || e.metaKey) && blocked.includes(e.key.toLowerCase())) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            return true;
        }, true);

        win.document.addEventListener('copy', (e: ClipboardEvent) => {
            e.preventDefault(); e.stopPropagation();
            if (e.clipboardData) e.clipboardData.setData('text/plain', '');
            return false;
        }, true);

        win.document.addEventListener('cut', (e: ClipboardEvent) => {
            e.preventDefault(); e.stopPropagation();
            if (e.clipboardData) e.clipboardData.setData('text/plain', '');
            return false;
        }, true);

        win.document.addEventListener('paste', (e: ClipboardEvent) => {
            e.preventDefault(); e.stopPropagation(); return false;
        }, true);

        win.document.addEventListener('selectstart', (e: Event) => {
            e.preventDefault(); e.stopPropagation(); return false;
        }, true);

        win.document.addEventListener('dragstart', (e: DragEvent) => {
            e.preventDefault(); e.stopPropagation(); return false;
        }, true);

        win.document.addEventListener('mousedown', (e: MouseEvent) => {
            if (e.detail > 1) { e.preventDefault(); e.stopPropagation(); return false; }
            return true;
        }, true);

        setInterval(() => {
            if (win && !win.closed) {
                try { win.navigator.clipboard?.writeText('').catch(() => {}); } catch {}
            }
        }, 1000);
    }

    private updateContent(html: string) {
        if (!this.newWindow || this.newWindow.closed) return;
        const contentDiv = this.newWindow.document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = html;
            setTimeout(() => this.applySecurityProtections(), 100);
        }
    }

    private loadFile() {
        const token = this.getToken();
        if (!token) { this.showError('Authentication token missing.'); return; }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        this.http.get(
            `${this.apiBase}/repos/refview/${this.repoId}`,
            { headers, responseType: 'blob', observe: 'response' }
        ).subscribe({
            next: res => this.classifyFile(res.body!, res.body!.type),
            error: ()  => this.showError('Failed to load file.')
        });
    }

    private showError(message: string) {
        this.updateContent(`
            <div class="error-container">
                <div class="error-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <div class="error-title">Unable to Load File</div>
                <div class="error-message">${message}</div>
            </div>
        `);
    }

    private classifyFile(blob: Blob, contentType: string) {
        const type = contentType.toLowerCase();
        if (type.includes('pdf'))                                         { this.renderPdf(blob);   return; }
        if (type.startsWith('image/'))                                    { this.renderImage(blob); return; }
        if (type.startsWith('text/'))                                     { this.renderText(blob);  return; }
        if (type.includes('word') || type.includes('wordprocessingml'))   { this.renderWord(blob);  return; }
        if (type.includes('sheet') || type.includes('excel'))             { this.renderExcel(blob); return; }
        this.showError('Preview is not available for this file type.');
    }

    private renderPdf(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <div class="iframe-shell">
                <iframe src="${url}#toolbar=0&navpanes=0&scrollbar=1"></iframe>
            </div>
        `);
    }

    private renderImage(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <div class="image-container">
                <div class="image-frame">
                    <img src="${url}" alt="Preview" draggable="false" />
                </div>
            </div>
        `);
    }

    private renderText(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <div class="iframe-shell">
                <iframe src="${url}"></iframe>
            </div>
        `);
    }

    private async renderWord(blob: Blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            this.updateContent(`
                <div class="doc-scroll">
                    <div class="doc-paper">
                        <div class="word-viewer">${result.value}</div>
                    </div>
                </div>
            `);
        } catch {
            this.showError('Failed to render Word document.');
        }
    }

    private async renderExcel(blob: Blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const html = XLSX.utils.sheet_to_html(worksheet);
            const htmlWithRowNums = this.injectExcelRowNumbers(html);
            this.updateContent(`
                <div class="excel-scroll">
                    <div class="excel-wrapper">
                        <div class="excel-viewer">${htmlWithRowNums}</div>
                    </div>
                </div>
            `);
        } catch {
            this.showError('Failed to render Excel document.');
        }
    }

    private injectExcelRowNumbers(html: string): string {
        let rowIndex = 0;
        return html
            .replace(/<tr>/gi, () => {
                rowIndex++;
                const label = rowIndex === 1 ? '#' : String(rowIndex - 1);
                return `<tr><th style="width:44px;text-align:center;font-weight:500">${label}</th>`;
            })
            .replace(/<\/tr>/gi, '</tr>');
    }

    cleanup() {
        this.objectUrls.forEach(url => URL.revokeObjectURL(url));
        this.objectUrls = [];
    }

    private getToken(): string | null {
        try {
            const raw = localStorage.getItem('token');
            return raw ? JSON.parse(raw).access_token : null;
        } catch {
            return null;
        }
    }
}