import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BinanceApiService {
  apiUrl: string = 'https://fapi.binance.com'
  constructor(private http: HttpClient) { }

  getBasisData(symbol: string): Observable<any> {
    const apiUrl = `${this.apiUrl}/fapi/v1/ticker/price?symbol=${symbol}`;
    return this.http.get(apiUrl);
  }

}
