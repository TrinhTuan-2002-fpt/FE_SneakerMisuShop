import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig, AppConfiguration } from 'src/configuration';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VoucherService {  
  constructor(@Inject(AppConfig) private readonly appConfig: AppConfiguration,private router: Router,private http : HttpClient) {}

  getList(req: any): Observable<any> {
    return this.http
      .post<any>(this.appConfig.API + 'api/v1/voucher/get-list', req)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  save(discount: any): Observable<any> {
    return this.http
      .post<any>(this.appConfig.API + 'api/v1/voucher', discount)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  delete(id: any): Observable<any> {
    return this.http
      .delete<any>(this.appConfig.API + 'api/v1/voucher/' + id)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  changeStatus(req: any[]): Observable<any> {
    return this.http
      .post<any>(this.appConfig.API + 'api/v1/voucher/change-status', req)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  minusQuantity(req: any): Observable<any> {
    return this.http
      .post<any>(this.appConfig.API + 'api/v1/voucher/minus-quantity', req)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  
}
