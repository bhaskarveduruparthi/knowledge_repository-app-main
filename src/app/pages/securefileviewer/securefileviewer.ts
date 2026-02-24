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
        // Open new window immediately (to avoid popup blockers)
        this.newWindow = window.open('', '_blank');
        
        if (!this.newWindow) {
            alert('Please allow popups for this site to view files in a new tab.');
            return;
        }

        // Set title
        this.newWindow.document.title = this.filename || 'File Preview';

        // Initialize the document structure
        this.initializeWindow();

        // Load the file
        this.loadFile();
    }

    private initializeWindow() {
        if (!this.newWindow || this.newWindow.closed) return;

        const doc = this.newWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${this.filename || 'File Preview'}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        user-select: none;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: #f5f5f5;
                        overflow: hidden;
                    }
                    #content {
                        width: 100%;
                        height: 100vh;
                    }
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #f5f5f5;
                    }
                    .spinner {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .loading-text {
                        color: #666;
                        font-size: 16px;
                    }
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #f5f5f5;
                        color: #d32f2f;
                        padding: 20px;
                        text-align: center;
                    }
                    .error-container h2 {
                        margin-bottom: 10px;
                    }
                    iframe {
                        width: 100%;
                        height: 100vh;
                        border: none;
                        display: block;
                        pointer-events: auto;
                    }
                    .image-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #000;
                    }
                    .image-container img {
                        max-width: 100%;
                        max-height: 100vh;
                        object-fit: contain;
                        pointer-events: none;
                    }
                    .doc-viewer {
                        width: 100%;
                        height: 100vh;
                        overflow: auto;
                        background: white;
                        padding: 3rem;
                    }
                    .excel-viewer {
                        padding: 1rem;
                    }
                    .word-viewer {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333;
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    .word-viewer p {
                        margin: 0 0 1em 0;
                    }
                    .word-viewer h1,
                    .word-viewer h2,
                    .word-viewer h3,
                    .word-viewer h4,
                    .word-viewer h5,
                    .word-viewer h6 {
                        margin: 1.5em 0 0.5em 0;
                        font-weight: 600;
                    }
                    .word-viewer h1 { font-size: 2em; }
                    .word-viewer h2 { font-size: 1.5em; }
                    .word-viewer h3 { font-size: 1.25em; }
                    .word-viewer ul,
                    .word-viewer ol {
                        margin: 0 0 1em 0;
                        padding-left: 2em;
                    }
                    .word-viewer table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }
                    .word-viewer td,
                    .word-viewer th {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .word-viewer th {
                        background-color: #f2f2f2;
                        font-weight: 600;
                    }
                    .excel-viewer table {
                        border-collapse: collapse;
                        width: 100%;
                        font-size: 13px;
                        font-family: Arial, sans-serif;
                    }
                    .excel-viewer td,
                    .excel-viewer th {
                        border: 1px solid #d0d0d0;
                        padding: 6px 10px;
                        white-space: nowrap;
                        text-align: left;
                    }
                    .excel-viewer th {
                        background-color: #4472C4;
                        color: white;
                        font-weight: 600;
                        position: sticky;
                        top: 0;
                        z-index: 1;
                    }
                    .excel-viewer tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .excel-viewer tr:hover {
                        background-color: #e8f0fe;
                    }
                </style>
            </head>
            <body>
                <div id="content">
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <div class="loading-text">Loading file...</div>
                    </div>
                </div>
                <script>
                    // Disable right-click
                    document.addEventListener('contextmenu', function(e) {
                        e.preventDefault();
                        return false;
                    });

                    // Disable copy (Ctrl+C, Cmd+C)
                    document.addEventListener('keydown', function(e) {
                        // Ctrl+C or Cmd+C
                        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+A or Cmd+A (select all)
                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+X or Cmd+X (cut)
                        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+U or Cmd+U (view source)
                        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+S or Cmd+S (save)
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                            e.preventDefault();
                            return false;
                        }
                        // F12 (DevTools)
                        if (e.key === 'F12') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+Shift+I or Cmd+Shift+I (DevTools)
                        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+Shift+J or Cmd+Shift+J (DevTools Console)
                        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
                            e.preventDefault();
                            return false;
                        }
                        // Ctrl+Shift+C or Cmd+Shift+C (DevTools Inspect)
                        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                            e.preventDefault();
                            return false;
                        }
                    });

                    // Disable copy event
                    document.addEventListener('copy', function(e) {
                        e.preventDefault();
                        return false;
                    });

                    // Disable cut event
                    document.addEventListener('cut', function(e) {
                        e.preventDefault();
                        return false;
                    });

                    // Disable text selection via mouse
                    document.addEventListener('selectstart', function(e) {
                        e.preventDefault();
                        return false;
                    });

                    // Disable drag
                    document.addEventListener('dragstart', function(e) {
                        e.preventDefault();
                        return false;
                    });
                </script>
            </body>
            </html>
        `);
        doc.close();
    }

    private updateContent(html: string) {
        if (!this.newWindow || this.newWindow.closed) return;

        const contentDiv = this.newWindow.document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = html;
        }
    }

    private loadFile() {
        const token = this.getToken();
        if (!token) {
            this.showError('Authentication token missing.');
            return;
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        this.http.get(
            `${this.apiBase}/repos/refview/${this.repoId}`,
            { headers, responseType: 'blob', observe: 'response' }
        ).subscribe({
            next: res => {
                const blob = res.body!;
                const contentType = blob.type;
                this.classifyFile(blob, contentType);
            },
            error: () => {
                this.showError('Failed to load file.');
            }
        });
    }

    private showError(message: string) {
        this.updateContent(`
            <div class="error-container">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `);
    }

    private classifyFile(blob: Blob, contentType: string) {
        const type = contentType.toLowerCase();

        // PDF
        if (type.includes('pdf')) {
            this.renderPdf(blob);
            return;
        }

        // Image
        if (type.startsWith('image/')) {
            this.renderImage(blob);
            return;
        }

        // Text
        if (type.startsWith('text/')) {
            this.renderText(blob);
            return;
        }

        // Word
        if (type.includes('word') || type.includes('officedocument.wordprocessingml')) {
            this.renderWord(blob);
            return;
        }

        // Excel
        if (type.includes('sheet') || type.includes('excel')) {
            this.renderExcel(blob);
            return;
        }

        this.showError('Preview not available for this file type.');
    }

    private renderPdf(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <iframe src="${url}#toolbar=0"></iframe>
        `);
    }

    private renderImage(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <div class="image-container">
                <img src="${url}" alt="Preview" />
            </div>
        `);
    }

    private renderText(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.updateContent(`
            <iframe src="${url}"></iframe>
        `);
    }

    private async renderWord(blob: Blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            
            this.updateContent(`
                <div class="doc-viewer word-viewer">
                    ${result.value}
                </div>
            `);
        } catch (error) {
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
            
            this.updateContent(`
                <div class="doc-viewer excel-viewer">
                    ${html}
                </div>
            `);
        } catch (error) {
            this.showError('Failed to render Excel document.');
        }
    }

    cleanup() {
        // Revoke object URLs
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