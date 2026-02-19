import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';

export interface Repository {
  id: number;
  customer_name?: string;
  domain?: string;
  sector?: string;
  module_name?: string;
  detailed_requirement?: string;
  standard_custom?: string;
  technical_details?: string;
  customer_benefit?: string;
  attach_code_or_document?: string;
  Approver?: string;
  Approval_status?: string;
  Approval_date?: string;
  created_at?: string;
  username?: string;
  irm?: string;
  srm?: string;
  buh?: string;
  bgh?: string;
  business_justification?: string;
  download_approved?: boolean;
}

export interface DownloadRequest {
  id: number;
  knr_id: number;
  repo_customer_name: string;
  repo_module_name: string;
  requested_by_name: string;
  requested_by_email: string;
  justification: string;
  status: string;
  requested_at: string;
}

export interface LoginLog {
  id?: number;
  yash_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  success?: boolean;
  message?: string | null;
  timestamp?: string;
}

export interface DownloadLog {
  id?: number;
  yash_id?: string | null;
  username?: string;
  file_id?: number;
  filename?: string;
  timestamp?: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ManageReposService {

  private url: string;

  constructor(private http: HttpClient, private _url: UrlService) {
    this.url = `${this._url.getApiUrl()}`;
  }

  // ─── HOME PAGE (public — no JWT needed) ─────────────────────────────────────

  /**
   * Loads all approved repositories for the Home page on initial render.
   * Calls the public GET /repos/all-approved endpoint (no JWT required).
   */
  getAllRepositories(): Observable<Repository[]> {
    return this.http.get<Repository[]>(`${this.url}repos/all-approved`);
  }

  /**
   * Searches approved repositories by filter + free-text query.
   * Calls the public GET /repos/search endpoint (no JWT required).
   *
   * @param filter  'Any' | 'Domain' | 'Module' | 'Customer Name' | 'Sector'
   * @param query   Non-empty search string
   */
  searchRepositories(filter: string, query: string): Observable<Repository[]> {
    const params = new HttpParams()
      .set('filter', filter)
      .set('query', query);
    return this.http.get<Repository[]>(`${this.url}repos/search`, { params });
  }

  // ─── EXISTING METHODS (all unchanged) ───────────────────────────────────────

  getallrepos(page: number) {
    return this.http.get(`${this.url}repos/getallrepos?page=${page}`);
  }

  getalllogs(page: number) {
    return this.http.get(`${this.url}repos/getlogs?page=${page}`);
  }

  getalldownloadlogs(page: number) {
    return this.http.get(`${this.url}repos/getdownloadlogs?page=${page}`);
  }

  getallapprovedrepos(page: number) {
    return this.http.get(`${this.url}repos/getallapprovedrepos?page=${page}`);
  }

  getallpendingrepos(page: number) {
    return this.http.get(`${this.url}repos/getallpendingrepos?page=${page}`);
  }

  getallunapprovedrepos(page: number) {
    return this.http.get(`${this.url}repos/getallunapprovedrepos?page=${page}`);
  }

  getallrejectedrepos(page: number) {
    return this.http.get(`${this.url}repos/getallrejectedrepos?page=${page}`);
  }

  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}repos/upload-excel`, formData);
  }

  createRepository(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/repos/createrepo`, formData);
  }

  RepoApproval(repository: Repository) {
    return this.http.put(`${this.url}/repos/repoapproval/${repository.id}`, repository);
  }

  RepoRejection(repository: Repository) {
    return this.http.put(`${this.url}/repos/reporejection/${repository.id}`, repository);
  }

  SendforApproval(id: number, business_justification: string) {
    const body = { business_justification };
    return this.http.put(`${this.url}/repos/sendforapproval/${id}`, body);
  }

  downloadWorkbook(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/download-file/${id}`, { responseType: 'blob' });
  }

  delete_repo(repository: Repository) {
    return this.http.delete(`${this.url}repos/deleterepo/${repository.id}`);
  }

  SaveRepo() {
    return this.http.get(`${this.url}repos/getallrepos`);
  }

  fetchCounts() {
    return this.http.get(`${this.url}/repos/counts`);
  }

  get_repo_records() {
    return this.http.get(`${this.url}/repos/getallreporecords`);
  }

  get_log_records() {
    return this.http.get(`${this.url}/repos/getlogrecords`);
  }

  get_downloadlog_records() {
    return this.http.get(`${this.url}/repos/getdownloadlogrecords`);
  }

  getapproved_repo_records() {
    return this.http.get(`${this.url}/repos/getallapprovedreporecords`);
  }

  getpending_repo_records() {
    return this.http.get(`${this.url}/repos/getallpendingreporecords`);
  }

  getunapproved_repo_records() {
    return this.http.get(`${this.url}/repos/getallunapprovedreporecords`);
  }

  getrejected_repo_records() {
    return this.http.get(`${this.url}/repos/getallrejectedreporecords`);
  }

  get_approval_repos() {
    return this.http.get(`${this.url}repos/getapprovalrepos`);
  }

  get_approval_records() {
    return this.http.get(`${this.url}/repos/getapprovalreposrecords`);
  }

  uploadreference(repository: Repository, formData: any) {
    return this.http.post(`${this.url}/repos/upload_ref/${repository.id}`, formData);
  }

  download_reference(id: any) {
    return this.http.get(`${this.url}/repos/refdownload/${id}`);
  }

  getdatabydomain() {
    return this.http.get(`${this.url}/repos/repodatabydomain`);
  }

  upvoteAnswer(answerId: number) {
    return this.http.post(`${this.url}support/upvote/${answerId}`, {});
  }

  downvoteAnswer(answerId: number) {
    return this.http.post(`${this.url}support/downvote/${answerId}`, {});
  }

  getdatabymodule() {
    return this.http.get(`${this.url}/repos/repodatabymodule`);
  }

  getQuestions(): Observable<any> {
    return this.http.get<any>(`${this.url}support/getquestions`);
  }

  createQuestion(payload: any): Observable<any> {
    return this.http.post<any>(`${this.url}support/createquestion`, payload);
  }

  createAnswer(payload: any): Observable<any> {
    return this.http.post<any>(`${this.url}support/createanswer`, payload);
  }

  getTopUsersVotes(): Observable<any> {
    return this.http.get<any>(`${this.url}support/top-users-votes`);
  }

  getTopUsersSolutions(): Observable<any> {
    return this.http.get<any>(`${this.url}repos/top-users-solutions`);
  }

  getUsers() {
    return this.http.get(`${this.url}users/getallusers`);
  }

  requestDownload(id: number, justification: string) {
    return this.http.post(`${this.url}repos/download-request/${id}`, { justification });
  }

  getDownloadRequests() {
    return this.http.get<DownloadRequest[]>(`${this.url}repos/download-requests`);
  }

  approveDownloadRequest(id: number) {
    return this.http.post(`${this.url}repos/download-requests/${id}/approve`, {});
  }

  rejectDownloadRequest(id: number) {
    return this.http.post(`${this.url}repos/download-requests/${id}/reject`, {});
  }

  downloadAllLogs(): Observable<LoginLog[]> {
    return this.http.get<LoginLog[]>(`${this.url}repos/download-all-logs`);
  }

  delegateRepository(payload: {
    id: number;
    delegateUserId: number;
    delegateUserName?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.url}repos/delegate`, payload);
  }

  getManagerStatsMonthly(year?: number, month?: number): Observable<any> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get(`${this.url}repos/manager-stats/monthly`, { params });
  }

  getManagerStatsSummary(): Observable<any> {
    return this.http.get(`${this.url}/manager-stats/summary`);
  }

  getManagerStatsChartData(year?: number, month?: number, groupBy: string = 'month'): Observable<any> {
    let params = new HttpParams().set('group_by', groupBy);
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get(`${this.url}/manager-stats/chart-data`, { params });
  }

  getAvailableYears(): Observable<any> {
    return this.http.get(`${this.url}repos/manager-stats/years`);
  }
}