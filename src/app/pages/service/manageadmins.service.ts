import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  yash_id?: number;
  name?: string;
  password?: string;
  irm?: string;
  srm?: string;
  buh?: string;
  bgh?: string;
  email?: string;
  b_unit?: string;
  active?: string;
  type?: string;
}

export interface UserWiseReportData {
  yash_id: string;
  name: string;
  email: string;
  b_unit: string;
  type: string;
  total_solutions: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface UserSolutionsData {
  user: {
    yash_id: string;
    name: string;
    email: string;
    b_unit: string;
  };
  solutions: any[];
}

@Injectable()
export class ManageAdminsService {
    
  private url: string;
  
  constructor(private http: HttpClient, private _url: UrlService) {
    this.url = `${this._url.getApiUrl()}`;
  }

  // ========== Existing Methods ==========

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}users/getallusers`);
  }

  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}users/getallmanagers`);
  }

  add_user(user: User): Observable<User> {
    const url = `${this.url}users/adduser`;
    return this.http.post<User>(url, user);
  }

  delete_user(yash_id: any): Observable<any> {
    const url = `${this.url}users/deleteuser/${yash_id}`;
    return this.http.delete(url);
  }

  getuser_by_id(yash_id: any): Observable<User> {
    const url = `${this.url}users/getuser_by_id/${yash_id}`;
    return this.http.get<User>(url);
  }

  edit_User(user: User): Observable<User> {
    const url = `${this.url}users/edituser/${user.yash_id}`;
    return this.http.put<User>(url, user);
  }

}