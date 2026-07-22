import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiUrl } from '../../../core/config/api.config';
export interface Product { id: string; name: string; description: string; price: number; active: boolean; }
export interface PaymentOrder { id: string; status: string; amount: number; checkoutUrl: string; product: Product; }
@Injectable({ providedIn: 'root' })
export class PaymentService {
 private readonly http=inject(HttpClient); private readonly base=apiUrl('/api/pagamentos');
 products(){return this.http.get<Product[]>(`${this.base}/produtos`);}
 orders(){return this.http.get<PaymentOrder[]>(`${this.base}/pedidos`);}
 checkout(productId:string){return this.http.post<PaymentOrder>(`${this.base}/checkout`,{productId},{headers:new HttpHeaders({'Idempotency-Key':crypto.randomUUID()})});}
 confirmFake(orderId:string){return this.http.post<void>(`${this.base}/fake/${orderId}`,{});}
}
