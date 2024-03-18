import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DbRequestsService {
  apiUrl: string = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`)
  }

  post(endpoint: string, postData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, postData);
  }

  put(endpoint: string, postId: number | string, postData: any): Observable<any> {
    const url = `${this.apiUrl}/${endpoint}/${postId}`;
    return this.http.put<any>(url, postData);
  }

}
