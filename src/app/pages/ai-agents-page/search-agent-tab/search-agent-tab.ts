import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ManageReposService } from '../../service/managerepos.service';
import { SolutionDetailDialog } from '../../solution-detail-dialog/solution-detail-dialog';

interface SearchResult {
  text: string;
  metadata: {
    doc_id: number;
    customer_name: string;
    module_name: string;
    domain: string;
    sector: string;
    approval_status: string;
  };
  distance: number;
}

interface DisplayResult extends SearchResult {
  requirementPreview: string;
  technicalTags: string[];
  benefit: string | null;
}

// Order matters: longer/more specific labels must come before their prefixes
// (e.g. "Customer Benefit" before "Customer") or the regex will split wrong.
const FIELD_LABELS = [
  'Customer Benefit',
  'Business Justification',
  'Technical Details',
  'Requirement',
  'Module',
  'Customer'
];

@Component({
  selector: 'app-search-agent-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, SolutionDetailDialog],
  templateUrl: './search-agent-tab.html',
  styleUrl: './search-agent-tab.scss'
})
export class SearchAgentTab {
  problemStatement = '';
  isSearching = false;
  results: DisplayResult[] = [];
  searched = false;
  hasError = false;

  dialogVisible = false;
  selectedDocId: number | null = null;

  constructor(private manageReposService: ManageReposService) {}

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.findSimilar();
    }
  }

  findSimilar(): void {
    const text = this.problemStatement.trim();
    if (!text || this.isSearching) return;

    this.isSearching = true;
    this.searched = true;
    this.hasError = false;

    this.manageReposService.searchSimilarRequirements(text).subscribe({
      next: (res) => {
        this.results = (res.results as SearchResult[]).map(r => this.toDisplayResult(r));
        this.isSearching = false;
      },
      error: () => {
        this.results = [];
        this.isSearching = false;
        this.hasError = true;
      }
    });
  }

  retry(): void {
    this.findSimilar();
  }

  viewSolution(docId: number): void {
    this.selectedDocId = docId;
    this.dialogVisible = true;
  }

  similarityLabel(distance: number): string {
    if (distance <= 0.4) return 'Strong match';
    if (distance <= 0.6) return 'Good match';
    return 'Possible match';
  }

  /** Splits the flattened "Key: value Key2: value2 ..." blob into a field map,
   *  regardless of which fields are present or what order they appear in. */
  private parseFields(text: string): Record<string, string> {
    const pattern = new RegExp(`(${FIELD_LABELS.join('|')}):\\s*`, 'g');
    const hits: { label: string; start: number; end: number }[] = [];
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(text)) !== null) {
      hits.push({ label: m[1], start: m.index, end: m.index + m[0].length });
    }

    const fields: Record<string, string> = {};
    hits.forEach((hit, i) => {
      const sliceEnd = i + 1 < hits.length ? hits[i + 1].start : text.length;
      fields[hit.label] = text.slice(hit.end, sliceEnd).trim();
    });
    return fields;
  }

  private isMeaningful(value: string | undefined): value is string {
    if (!value) return false;
    return value.trim().toLowerCase() !== 'n/a';
  }

  private toDisplayResult(r: SearchResult): DisplayResult {
    const fields = this.parseFields(r.text);

    const requirementPreview = this.isMeaningful(fields['Requirement'])
      ? fields['Requirement']
      : r.text.trim();

    const technicalTags = this.isMeaningful(fields['Technical Details'])
      ? fields['Technical Details'].split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const benefit = this.isMeaningful(fields['Customer Benefit'])
      ? fields['Customer Benefit']
      : null;

    return { ...r, requirementPreview, technicalTags, benefit };
  }
}