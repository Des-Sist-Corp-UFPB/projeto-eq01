import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { apiUrl } from '../../../../core/config/api.config';
import { Shop, Product } from '../loja/loja.page';

@Component({
  selector: 'app-novo-produto-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-produto.page.html',
  styleUrl: './novo-produto.page.css'
})
export class NovoProdutoPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  protected readonly currentUser = computed(() => this.authService.currentUser());

  protected myShop = signal<Shop | null>(null);
  protected creatingAsShop = signal(true);
  
  protected editingProductId = signal<string | null>(null);
  protected productFormTitle = '';
  protected productFormDescription = '';
  protected productFormCategory = 'Alimentos';
  protected productFormPrice: number | null = null;
  protected productFormStock = 1;
  protected productFormPhotos = '';
  protected productFormPaymentMethods = 'Pix; Dinheiro';
  protected productFormPixKey = '';
  protected productFormMeetLocations = '';
  protected productFormCampus = 'Rio Tinto';
  protected productFormActive = true;
  
  protected savingProduct = signal(false);
  protected loading = signal(true);

  ngOnInit() {
    this.http.get<Shop>(`${apiUrl}/marketplace/loja`).subscribe({
      next: (shop) => {
        this.myShop.set(shop);
        this.checkRouteParams();
      },
      error: () => {
        this.myShop.set(null);
        this.checkRouteParams();
      }
    });
  }

  private checkRouteParams() {
    const id = this.route.snapshot.paramMap.get('id');
    const isAvulso = this.route.snapshot.queryParamMap.get('avulso') === 'true';

    if (id) {
      this.editingProductId.set(id);
      this.loadProduct(id);
    } else {
      this.setupNewProduct(!isAvulso);
      this.loading.set(false);
    }
  }

  private setupNewProduct(asShop: boolean) {
    if (asShop && !this.myShop()) {
      asShop = false; // fallback se não tiver loja
    }

    this.creatingAsShop.set(asShop);

    if (asShop && this.myShop()) {
      const shop = this.myShop() as any;
      this.productFormPaymentMethods = shop.paymentMethods || 'Pix; Dinheiro';
      this.productFormPixKey = shop.pixKey || '';
      this.productFormMeetLocations = shop.meetLocations || '';
      this.productFormCampus = shop.campus || 'Rio Tinto';
    } else {
      this.productFormPaymentMethods = 'Pix';
      this.productFormPixKey = '';
      this.productFormMeetLocations = '';
      this.productFormCampus = 'Rio Tinto';
    }
  }

  private loadProduct(id: string) {
    this.http.get<Product>(`${apiUrl}/marketplace/produtos/${id}`).subscribe({
      next: (product) => {
        this.creatingAsShop.set(!!(product as any).shopId);
        this.productFormTitle = product.title;
        this.productFormDescription = product.description || '';
        this.productFormCategory = product.category || 'Outros';
        this.productFormPrice = product.price;
        this.productFormStock = product.stock;
        this.productFormPhotos = product.photos || '';
        this.productFormPaymentMethods = product.paymentMethods;
        this.productFormPixKey = product.pixKey || '';
        this.productFormMeetLocations = product.meetLocations || '';
        this.productFormCampus = product.campus;
        this.productFormActive = product.active;
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Produto não encontrado.');
        this.goBack();
      }
    });
  }

  onProductPhotosUpload(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const promises = Array.from(files).map((file: any) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.compressImage(e.target.result).then(resolve);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then((compressedImages) => {
        // Usar delimitador |#| em vez de ;
        this.productFormPhotos = compressedImages.join('|#|');
      });
    }
  }

  private compressImage(base64Str: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  }

  saveProduct() {
    if (!this.productFormTitle.trim()) {
      this.toastService.showWarning('Título do anúncio é obrigatório.');
      return;
    }
    if (this.productFormPrice === null || this.productFormPrice <= 0) {
      this.toastService.showWarning('Preço deve ser maior que zero.');
      return;
    }
    if (this.productFormPaymentMethods.includes('Pix') && !this.productFormPixKey.trim()) {
      this.toastService.showWarning('A chave Pix é obrigatória se Pix for método de pagamento.');
      return;
    }

    this.savingProduct.set(true);
    const shop = this.myShop();
    const payload = {
      shopId: this.creatingAsShop() && shop ? shop.id : null,
      title: this.productFormTitle.trim(),
      description: this.productFormDescription.trim(),
      category: this.productFormCategory,
      price: this.productFormPrice,
      stock: this.productFormStock,
      photos: this.productFormPhotos,
      paymentMethods: this.productFormPaymentMethods,
      pixKey: this.productFormPixKey.trim(),
      meetLocations: this.productFormMeetLocations.trim(),
      campus: this.productFormCampus,
      active: this.productFormActive
    };

    const isEdit = this.editingProductId();
    const request$ = isEdit 
      ? this.http.put(`${apiUrl}/marketplace/produtos/${isEdit}`, payload)
      : this.http.post(`${apiUrl}/marketplace/produtos`, payload);

    request$.subscribe({
      next: () => {
        this.savingProduct.set(false);
        this.toastService.showSuccess(isEdit ? 'Anúncio atualizado!' : 'Anúncio cadastrado!');
        this.goBack();
      },
      error: (err) => {
        this.savingProduct.set(false);
        this.toastService.showError(err.error?.message || 'Erro ao salvar anúncio.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/loja']);
  }
}
