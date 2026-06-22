import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgentChatComponent } from "@/pages/agent-chat/agent-chat";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, AgentChatComponent],
    template: `<router-outlet></router-outlet>
    <app-agent-chat></app-agent-chat>`
})
export class AppComponent {}
