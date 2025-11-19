import { PaginatorModule } from 'primeng/paginator';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';


export interface Repository {
  id?: number; // Serial Number
  customer_name?: string; // Customer Name
  domain?: string; // Domain
  sector?: string; // Sector
  module_name?: string; // Module Name
  detailed_requirement?: string; // Detailed Requirement
  standard_custom?: string; // Standard/Custom
  technical_details?: string; // Technical Details / Z Object Name
  customer_benefit?: string; // Customer Benefit
  remarks?: string; // Remarks
  attach_code_or_document?: string; // Code or Process Document
  Approver?:string;
  Approval_status?:string;
  Approval_date?:string;
  created_at?:string;
  business_justification?:string;
}


@Injectable({
  providedIn: 'root'  // This registers the service app-wide automatically
})
export class ManageReposService {
    
  private url :string;
  constructor(private http: HttpClient , private _url : UrlService) {
    this.url = `${this._url.getApiUrl()}`
  }

  getallrepos(page: number){
    return this.http.get(`${this.url}repos/getallrepos?page=${page}`);
  }

  uploadExcel(formData: FormData): Observable<any> {
    
    return this.http.post(`${this.url}repos/upload-excel`, formData);
  }

  createRepository(formData: FormData): Observable<any> {
  return this.http.post(`${this.url}/repos/createrepo`, formData);
  }

  RepoApproval(repository: Repository){
    return this.http.put(`${this.url}/repos/repoapproval/${repository.id}`, repository);
  }

  SendforApproval(id: number, business_justification: string) {
  const body = { business_justification: business_justification };
  return this.http.put(`${this.url}/repos/sendforapproval/${id}`, body);
}

downloadWorkbook(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/download-file/${id}`, { responseType: 'blob' });
  }

  delete_repo(repository: Repository) {
    
    return this.http.delete(`${this.url}repos/deleterepo/${repository.id}`);
  }


  SaveRepo(){
     return this.http.get(`${this.url}repos/getallrepos`);
  }

  fetchCounts() {
  return this.http.get(`${this.url}/repos/counts`);
}

  get_repo_records(){
    return this.http.get(`${this.url}/repos/getallreporecords`);
  }

  get_approval_repos(page: number){
    return this.http.get(`${this.url}repos/getapprovalrepos?page=${page}`);
  }

  get_approval_records(){
    return this.http.get(`${this.url}/repos/getapprovalreposrecords`);
  }

  uploadreference(repository: Repository, formData: any) {
    return this.http.post(`${this.url}/repos/upload_ref/${repository.id}`, formData);
  }

  download_reference(id: any) {
    return this.http.get(`${this.url}/repos/refdownload/${id}`);
  }

  getdatabydomain(){
    return this.http.get(`${this.url}/repos/repodatabydomain`);
  }

  getdatabymodule(){
    return this.http.get(`${this.url}/repos/repodatabymodule`);
  }

  


   

    

   

    

    
}
