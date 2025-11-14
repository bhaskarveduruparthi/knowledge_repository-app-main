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


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, InputTextModule, ToastModule, IconFieldModule, InputIconModule, FormsModule, RouterModule, RippleModule],
  providers: [MessageService],
  template: `
    <p-toast/> 
    <div class="px-6 py-20 md:px-20 lg:px-80 flex items-center justify-center backdrop-blur-3xl bg-cover! bg-center! bg-no-repeat!" style="background: #ABE7B2; background: linear-gradient(180deg, rgba(171, 231, 178, 1) 70%, rgba(236, 244, 232, 1) 100%);">
      <div class="px-8 md:px-12 lg:px-20 py-12 flex flex-col items-center gap-12 w-full backdrop-blur-3xl rounded-2xl bg-white/10 border border-white/10 max-w-sm">
        <div class="flex flex-col items-center gap-4 w-full">
          <div class="flex flex-col gap-2 w-full">
            <div class="text-center text-3xl font-medium text-blue leading-tight"><strong>Knowledge Repository</strong></div>
            <div class="text-center text-base font-normal text-blue/100 leading-tight mt-1">Welcome !</div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-8 w-full">
          <div class="flex flex-col gap-6 w-full">
            <p-iconfield icon-position="left">
              <p-inputicon class="pi pi-user text-black/70!"></p-inputicon>
              <input pInputText type="text" class="appearance-none! border! border-white/10! w-full! outline-0! bg-white/15! text-black! placeholder:text-black/70! rounded-3xl! shadow-sm!" placeholder="Yash Id" [(ngModel)]="yash_id" (keydown.enter)="login()" />
            </p-iconfield>

            <p-iconfield icon-position="left" class="relative">
              <p-inputicon class="pi pi-lock text-black/70!"></p-inputicon>
              <input pInputText [type]="passwordVisible ? 'text' : 'password'" class="appearance-none! border! border-white/15! w-full! outline-0! bg-white/10! text-black! placeholder:text-black/70! rounded-3xl! shadow-sm!" placeholder="Password" [(ngModel)]="password" (keydown.enter)="login()" />
              <button type="button" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-black/70" (click)="togglePasswordVisibility()" [attr.aria-label]="passwordVisible ? 'Hide password' : 'Show password'">
                <i [class]="passwordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </p-iconfield>
          </div>

          <button pButton class="w-full! rounded-3xl! bg-surface-950! border! border-surface-950! text-white! hover:bg-surface-950/80!" (click)="login()">
            <span pButtonLabel>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class Login {
  yash_id: string = '';
  password: string = '';
  checked: boolean = false;
  passwordVisible: boolean = false;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    public loginservice: LoginService,
    public auth: AuthenticationService,
    public messageservice: MessageService
  ) {}

  login() {
    console.log(this.yash_id);
    console.log(this.password);
    this.loginservice.getToken(this.yash_id, this.password).subscribe(
      (data: any) => {
        console.log(data);
        this.auth.tokenValue = data;
        this.getuser();
        localStorage.setItem('token', JSON.stringify(data));
        this.messageservice.add({ severity: 'success', summary: 'Successfully Logged In', detail: 'Via LoginService' });
      },
      (err: any) => {
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Login Unsuccessful, Please Contact Administrator' });
        console.log(err.error.message);
        alert(err.error.message);
      }
    );
  }

  getuser() {
    this.loginservice.getUserDetails().subscribe((data: any) => {
      console.log(data);
      this.auth.userValue = data;
      localStorage.setItem('user', JSON.stringify(data));
      if (data?.type == 'Superadmin') {
        this.router.navigate(['/app/pages/manageusers']);
      } else {
        this.router.navigate(['/app']);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}

