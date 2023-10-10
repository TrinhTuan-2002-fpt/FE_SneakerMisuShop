import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig, AppConfiguration } from 'src/configuration';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ColorService {  
  constructor(@Inject(AppConfig) private readonly appConfig: AppConfiguration,private router: Router,private http : HttpClient) {}

  getList(): Observable<any> {
    return this.http
      .get<any>(this.appConfig.API + 'api/v1/color')
      .pipe(
        map((z) => {
          return z;
        })
      );
  }

  save(color: any): Observable<any> {
    return this.http
      .post<any>(this.appConfig.API + 'api/v1/color', color)
      .pipe(
        map((z) => {
          return z;
        })
      );
  }
}
