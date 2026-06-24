import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchAgentTab } from './search-agent-tab/search-agent-tab';
import { ReportAgentTab } from './report-agent-tab/report-agent-tab';
import { ManageAgentTab } from './manage-agent-tab/manage-agent-tab';

interface Agent {
  id: string;
  index: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-ai-agents-page',
  standalone: true,
  imports: [CommonModule, SearchAgentTab, ReportAgentTab, ManageAgentTab],
  templateUrl: './ai-agents-page.html',
  styleUrl: './ai-agents-page.scss'
})
export class AiAgentsPage {
  activeTab = '0';
  sidebarOpen = false;

  agents: Agent[] = [
    { id: '0', index: '01', label: 'Find Similar', description: 'Search the repository for requirements like the one you\'re solving.', icon: 'pi pi-search' },
    { id: '1', index: '02', label: 'Generate Reports', description: 'Generate summaries and insights across stored solutions.', icon: 'pi pi-chart-bar' },
    { id: '2', index: '03', label: 'Master-Data Manager', description: 'Review, approve, and curate repository entries.', icon: 'pi pi-database' }
  ];

  get activeAgent(): Agent {
    return this.agents.find(a => a.id === this.activeTab) ?? this.agents[0];
  }

  selectAgent(id: string): void {
    this.activeTab = id;
    this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}