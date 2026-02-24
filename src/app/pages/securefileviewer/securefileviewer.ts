import {
    Component,
    Input,
    OnDestroy,
    OnChanges,
    OnInit,
    signal,
    ChangeDetectionStrategy,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export type ViewerState = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

@Component({
    selector: 'app-secure-file-viewer',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ButtonModule, DialogModule, ProgressSpinnerModule],
    template: `
        <p-button 
            label="View" 
            icon="pi pi-eye" 
            (click)="openViewer()" 
            [disabled]="disabled" />

        <p-dialog
            [(visible)]="visible"
            [modal]="true"
            [header]="dialogHeader()"
            [style]="{ width: '90vw', height: '90vh' }"
            [contentStyle]="{ height: 'calc(90vh - 120px)', padding: '0', overflow: 'hidden' }"
            (onHide)="cleanup()">

            <div class="viewer-container">

                <!-- Loading -->
                <div *ngIf="state() === 'loading'" class="center">
                    <p-progressSpinner></p-progressSpinner>
                </div>

                <!-- Error -->
                <div *ngIf="state() === 'error'" class="center error">
                    {{ errorMessage() }}
                </div>

                <!-- PDF -->
                <iframe
                    *ngIf="state() === 'ready' && fileCategory() === 'pdf'"
                    class="iframe-viewer"
                    [src]="safeUrl()">
                </iframe>

                <!-- Image -->
                <div *ngIf="state() === 'ready' && fileCategory() === 'image'" class="center">
                    <img [src]="safeUrl()" class="image-viewer"/>
                </div>

                <!-- Text -->
                <iframe
                    *ngIf="state() === 'ready' && fileCategory() === 'text'"
                    class="iframe-viewer"
                    [src]="safeUrl()">
                </iframe>

                <!-- Word -->
                <div
                    *ngIf="state() === 'ready' && fileCategory() === 'word'"
                    class="doc-viewer word-viewer"
                    [innerHTML]="safeHtml()">
                </div>

                <!-- Excel -->
                <div
                    *ngIf="state() === 'ready' && fileCategory() === 'excel'"
                    class="doc-viewer excel-viewer"
                    [innerHTML]="safeHtml()">
                </div>

                <!-- Unsupported -->
                <div *ngIf="state() === 'unsupported'" class="center">
                    Preview not available.
                </div>

            </div>
        </p-dialog>
    `,
    styles: [`
        .viewer-container {
            height: 100%;
            width: 100%;
            position: relative;
            overflow: hidden;
        }

        .iframe-viewer {
            width: 100%;
            height: 100%;
            border: none;
        }

        .image-viewer {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .doc-viewer {
            height: 100%;
            width: 100%;
            overflow: auto;
            background: #f5f5f5;
        }

        .word-viewer {
            padding: 3rem;
            background: white;
        }

        .word-viewer::ng-deep {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
        }

        .word-viewer::ng-deep p {
            margin: 0 0 1em 0;
        }

        .word-viewer::ng-deep h1,
        .word-viewer::ng-deep h2,
        .word-viewer::ng-deep h3,
        .word-viewer::ng-deep h4,
        .word-viewer::ng-deep h5,
        .word-viewer::ng-deep h6 {
            margin: 1.5em 0 0.5em 0;
            font-weight: 600;
        }

        .word-viewer::ng-deep h1 { font-size: 2em; }
        .word-viewer::ng-deep h2 { font-size: 1.5em; }
        .word-viewer::ng-deep h3 { font-size: 1.25em; }

        .word-viewer::ng-deep ul,
        .word-viewer::ng-deep ol {
            margin: 0 0 1em 0;
            padding-left: 2em;
        }

        .word-viewer::ng-deep table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }

        .word-viewer::ng-deep td,
        .word-viewer::ng-deep th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .word-viewer::ng-deep th {
            background-color: #f2f2f2;
            font-weight: 600;
        }

        .excel-viewer {
            padding: 1rem;
            background: white;
        }

        .excel-viewer::ng-deep table {
            border-collapse: collapse;
            min-width: 100%;
            font-size: 13px;
            font-family: Arial, sans-serif;
        }

        .excel-viewer::ng-deep td,
        .excel-viewer::ng-deep th {
            border: 1px solid #d0d0d0;
            padding: 6px 10px;
            white-space: nowrap;
            text-align: left;
        }

        .excel-viewer::ng-deep th {
            background-color: #4472C4;
            color: white;
            font-weight: 600;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .excel-viewer::ng-deep tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .excel-viewer::ng-deep tr:hover {
            background-color: #e8f0fe;
        }

        .center {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .error {
            color: #d32f2f;
            font-weight: 500;
        }
    `]
})
export class SecureFileViewerComponent implements OnInit, OnDestroy, OnChanges {

    @Input({ required: true }) repoId!: number;
    @Input() filename: string = '';
    @Input() disabled: boolean = false;
    @Input() apiBase = 'http://10.6.102.245:5002';

    visible = false;

    state = signal<ViewerState>('idle');
    fileCategory = signal<'pdf' | 'image' | 'text' | 'word' | 'excel' | 'unknown'>('unknown');
    errorMessage = signal('');
    safeUrl = signal<SafeResourceUrl | null>(null);
    safeHtml = signal<SafeHtml | null>(null);
    dialogHeader = signal('File Preview');

    private objectUrl: string | null = null;

    constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.updateDialogHeader();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['filename']) {
            this.updateDialogHeader();
        }
    }

    ngOnDestroy() { 
        this.cleanup(); 
    }

    openViewer() {
        this.visible = true;
        this.updateDialogHeader();
        this.loadFile();
    }

    private updateDialogHeader() {
        if (this.filename && this.filename.trim() !== '') {
            this.dialogHeader.set(this.filename);
        } else {
            this.dialogHeader.set('File Preview');
        }
    }

    private loadFile() {
        const token = this.getToken();
        if (!token) {
            this.state.set('error');
            this.errorMessage.set('Authentication token missing.');
            return;
        }

        this.state.set('loading');

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        this.http.get(
            `${this.apiBase}/repos/refview/${this.repoId}`,
            { headers, responseType: 'blob', observe: 'response' }
        ).subscribe({
            next: res => {
                const blob = res.body!;
                const contentType = blob.type;
                
                // Try to get filename from Content-Disposition header if not provided via input
                if (!this.filename || this.filename.trim() === '') {
                    const contentDisposition = res.headers.get('Content-Disposition');
                    const filename = this.extractFilename(contentDisposition);
                    if (filename) {
                        this.dialogHeader.set(filename);
                    }
                }
                
                this.classifyFile(blob, contentType);
            },
            error: () => {
                this.state.set('error');
                this.errorMessage.set('Failed to load file.');
            }
        });
    }

    private extractFilename(contentDisposition: string | null): string | null {
        if (!contentDisposition) return null;
        
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
            return filenameMatch[1].replace(/['"]/g, '');
        }
        
        return null;
    }

    private classifyFile(blob: Blob, contentType: string) {

        const type = contentType.toLowerCase();

        // PDF
        if (type.includes('pdf')) {
            this.fileCategory.set('pdf');
            this.objectUrl = URL.createObjectURL(blob);
            this.safeUrl.set(
                this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl + '#toolbar=0')
            );
            this.state.set('ready');
            return;
        }

        // Image
        if (type.startsWith('image/')) {
            this.fileCategory.set('image');
            this.objectUrl = URL.createObjectURL(blob);
            this.safeUrl.set(
                this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl)
            );
            this.state.set('ready');
            return;
        }

        // Text
        if (type.startsWith('text/')) {
            this.fileCategory.set('text');
            this.objectUrl = URL.createObjectURL(blob);
            this.safeUrl.set(
                this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl)
            );
            this.state.set('ready');
            return;
        }

        // Word
        if (type.includes('word') || type.includes('officedocument.wordprocessingml')) {
            this.fileCategory.set('word');
            this.renderWord(blob);
            return;
        }

        // Excel
        if (type.includes('sheet') || type.includes('excel')) {
            this.fileCategory.set('excel');
            this.renderExcel(blob);
            return;
        }

        this.state.set('unsupported');
    }

    private async renderWord(blob: Blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        this.safeHtml.set(
            this.sanitizer.bypassSecurityTrustHtml(result.value)
        );
        this.state.set('ready');
    }

    private async renderExcel(blob: Blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const html = XLSX.utils.sheet_to_html(worksheet);
        this.safeHtml.set(
            this.sanitizer.bypassSecurityTrustHtml(html)
        );
        this.state.set('ready');
    }

    cleanup() {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
        // Reset to filename or default
        this.updateDialogHeader();
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