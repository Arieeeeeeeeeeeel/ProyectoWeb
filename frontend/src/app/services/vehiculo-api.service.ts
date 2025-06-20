import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehiculoApiService {
  private marcasCache: any[] | null = null;

  constructor(private http: HttpClient) {}

  getMarcas(): Observable<any[]> {
    if (this.marcasCache) {
      return of(this.marcasCache);
    }
    return new Observable(observer => {
      this.http.get<any>('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json')
        .subscribe(res => {
          const marcasConocidas = [
            'TOYOTA', 'HONDA', 'NISSAN', 'CHEVROLET', 'FORD', 'MAZDA', 'KIA', 'HYUNDAI', 'SUZUKI',
            'VOLKSWAGEN', 'PEUGEOT', 'RENAULT', 'MITSUBISHI', 'JEEP', 'BMW', 'MERCEDES-BENZ',
            'AUDI', 'FIAT', 'CHERY', 'CITROEN', 'JAC', 'SSANGYONG', 'SUBARU', 'OPEL', 'BYD',
            'GEELY', 'GREAT WALL', 'HAVAL', 'MG', 'SEAT', 'VOLVO', 'LEXUS', 'MINI', 'RAM',
            'DODGE', 'LAND ROVER', 'PORSCHE', 'CHANGAN', 'DFSK', 'FOTON', 'ZOTYE', 'BAIC',
            'LIFAN', 'MAHINDRA', 'MAXUS', 'FAW', 'JMC', 'JETOUR',
            'ALFA ROMEO', 'ACURA', 'ISUZU', 'INFINITI', 'LINCOLN', 'BUICK', 'CADILLAC', 'CHRYSLER',
            'SCION', 'SMART', 'TESLA', 'GENESIS', 'DAEWOO', 'DATSUN', 'SAAB', 'SKODA', 'TATA',
            'PROTON', 'ROVER', 'SATURN', 'SAMSUNG', 'SING', 'TALBOT', 'DAIHATSU', 'PERODUA',
            'PEUGEOT'
          ];
          const marcas = res.Results.filter((m: any) => marcasConocidas.includes(m.Make_Name.toUpperCase()));
          marcas.sort((a: any, b: any) => a.Make_Name.localeCompare(b.Make_Name));
          this.marcasCache = marcas;
          observer.next(marcas);
          observer.complete();
        }, err => observer.error(err));
    });
  }

  getModelos(marca: string): Observable<any[]> {
    return new Observable(observer => {
      this.http.get<any>(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${marca}?format=json`)
        .subscribe(res => {
          observer.next(res.Results);
          observer.complete();
        }, err => observer.error(err));
    });
  }
}
