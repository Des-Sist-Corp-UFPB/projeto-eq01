import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { apiUrl } from '../../../../core/config/api.config';

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  logo?: string;
  campus: string;
  active: boolean;
}

export interface Product {
  id: string;
  shopId?: string;
  shopName?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  photos?: string;
  paymentMethods: string;
  pixKey?: string;
  meetLocations?: string;
  campus: string;
  active: boolean;
  views: number;
  clicks: number;
  tsupdated?: string;
}

@Component({
  selector: 'app-loja-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './loja.page.html',
  styleUrl: './loja.page.css'
})
export class LojaPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected activeTab = signal<'compra' | 'venda'>('compra');

  protected readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  protected readonly currentUser = computed(() => this.authService.currentUser());

  protected products = signal<Product[]>([]);
  protected filterSearch = signal('');
  protected filterCampus = signal('Todos');
  protected filterCategory = signal('Todos');
  protected loadingProducts = signal(false);

  protected selectedProduct = signal<Product | null>(null);
  protected purchaseQuantity = 1;
  protected purchaseLocation = '';
  protected purchasePaymentMethod = 'Pix';
  protected showPurchaseModal = signal(false);

  protected myShop = signal<Shop | null>(null);
  protected myProducts = signal<Product[]>([]);
  protected loadingSellerData = signal(false);

  protected totalAds = computed(() => this.myProducts().length);
  protected totalViews = computed(() => this.myProducts().reduce((sum, p) => sum + (p.views || 0), 0));
  protected totalClicks = computed(() => this.myProducts().reduce((sum, p) => sum + (p.clicks || 0), 0));

  protected conversionRate = computed(() => {
    const views = this.totalViews();
    if (views === 0) return 0;
    return Math.round((this.totalClicks() / views) * 100);
  });

  protected averagePrice = computed(() => {
    const prods = this.myProducts();
    if (prods.length === 0) return 0;
    return prods.reduce((sum, p) => sum + p.price, 0) / prods.length;
  });

  protected totalStock = computed(() => {
    return this.myProducts().reduce((sum, p) => sum + p.stock, 0);
  });

  protected showShopModal = signal(false);
  protected shopFormName = '';
  protected shopFormDescription = '';
  protected shopFormLogo = '';
  protected shopFormCampus = 'Rio Tinto';
  protected shopFormActive = true;
  protected savingShop = signal(false);

  protected showProductModal = signal(false);
  protected editingProductId = signal<string | null>(null);
  protected productFormTitle = '';
  protected productFormDescription = '';
  protected productFormCategory = 'Alimentos';
  protected productFormPrice: number | null = null;
  protected productFormStock = 1;
  protected productFormPhotos = '';
  protected productFormPaymentMethods = 'Pix';
  protected productFormPixKey = '';
  protected productFormMeetLocations = '';
  protected productFormCampus = 'Rio Tinto';
  protected productFormActive = true;

  protected showShopSettings = signal(false);

  protected toggleShopSettings() {
    const shop = this.myShop();
    if (shop) {
      this.shopFormName = shop.name;
      this.shopFormDescription = shop.description || '';
      this.shopFormLogo = shop.logo || '';
      this.shopFormCampus = shop.campus;
      this.shopFormActive = shop.active;
      this.showShopSettings.set(!this.showShopSettings());
    } else {
      // If no shop, open the standard creation modal
      this.openCreateOrEditShop();
    }
  }
  protected savingProduct = signal(false);

  ngOnInit() {
    this.loadProducts();
    if (this.isLoggedIn()) {
      this.loadSellerData();
    }
  }

  loadProducts() {
    this.loadingProducts.set(true);
    let url = `${apiUrl}/marketplace/produtos`;
    const params: string[] = [];
    if (this.filterSearch()) {
      params.push(`search=${encodeURIComponent(this.filterSearch())}`);
    }
    if (this.filterCampus() !== 'Todos') {
      params.push(`campus=${encodeURIComponent(this.filterCampus())}`);
    }
    if (this.filterCategory() !== 'Todos') {
      params.push(`category=${encodeURIComponent(this.filterCategory())}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<Product[]>(url).subscribe({
      next: (data) => {
        this.products.set(data);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.toastService.showError('Não foi possível carregar os produtos.');
        this.loadingProducts.set(false);
      }
    });
  }

  loadSellerData() {
    this.loadingSellerData.set(true);
    this.http.get<Shop>(`${apiUrl}/marketplace/loja`).subscribe({
      next: (shop) => {
        this.myShop.set(shop);
      },
      error: () => this.myShop.set(null)
    });

    this.http.get<Product[]>(`${apiUrl}/marketplace/loja/dashboard`).subscribe({
      next: (products) => {
        this.myProducts.set(products);
        this.loadingSellerData.set(false);
      },
      error: () => {
        this.loadingSellerData.set(false);
      }
    });
  }

  setTab(tab: 'compra' | 'venda') {
    if (tab === 'venda' && !this.isLoggedIn()) {
      this.toastService.showWarning('Você precisa entrar na sua conta para vender.');
      return;
    }
    this.activeTab.set(tab);
    if (tab === 'compra') {
      this.loadProducts();
    } else {
      this.loadSellerData();
    }
  }

  openPurchaseModal(product: Product) {
    if (!this.isLoggedIn()) {
      this.toastService.showWarning('Por favor, entre na sua conta para iniciar uma compra.');
      return;
    }
    this.selectedProduct.set(product);
    this.purchaseQuantity = 1;
    const locations = product.meetLocations ? product.meetLocations.split(';').map(l => l.trim()) : [];
    this.purchaseLocation = locations.length > 0 ? locations[0] : '';
    this.http.get<Product>(`${apiUrl}/marketplace/produtos/${product.id}`).subscribe();
    this.showPurchaseModal.set(true);
  }

  closePurchaseModal() {
    this.showPurchaseModal.set(false);
    this.selectedProduct.set(null);
  }

  copyPixKey() {
    const key = this.selectedProduct()?.pixKey;
    if (key) {
      navigator.clipboard.writeText(key).then(() => {
        this.toastService.showSuccess('Chave Pix copiada com sucesso!');
      });
    }
  }

  checkoutWhatsApp() {
    const product = this.selectedProduct();
    if (!product) return;

    if (!this.purchaseLocation.trim()) {
      this.toastService.showWarning('Por favor, defina um local de encontro.');
      return;
    }

    this.http.post(`${apiUrl}/marketplace/produtos/${product.id}/click`, {}).subscribe();

    const buyer = this.currentUser();
    const buyerName = buyer?.nome || 'Comprador';
    const text = `Olá! Tenho interesse no produto "${product.title}".\nQuantidade: ${this.purchaseQuantity}\nLocal de encontro selecionado: ${this.purchaseLocation}\nMeu nome é: ${buyerName}.`;
    
    let phone = product.sellerPhone || '5583999999999';
    phone = phone.replace(/\D/g, '');
    if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    this.closePurchaseModal();
  }

  openCreateOrEditShop() {
    const shop = this.myShop();
    if (shop) {
      this.shopFormName = shop.name;
      this.shopFormDescription = shop.description || '';
      this.shopFormLogo = shop.logo || '';
      this.shopFormCampus = shop.campus;
      this.shopFormActive = shop.active;
    } else {
      this.shopFormName = '';
      this.shopFormDescription = '';
      this.shopFormLogo = '';
      this.shopFormCampus = 'Rio Tinto';
      this.shopFormActive = true;
    }
    this.showShopModal.set(true);
  }

  closeShopModal() {
    this.showShopModal.set(false);
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.compressImage(e.target.result).then(compressed => {
          this.shopFormLogo = compressed;
        });
      };
      reader.readAsDataURL(file);
    }
  }

  saveShop() {
    if (!this.shopFormName.trim()) {
      this.toastService.showWarning('Nome da loja é obrigatório.');
      return;
    }

    this.savingShop.set(true);
    const payload = {
      name: this.shopFormName.trim(),
      description: this.shopFormDescription.trim(),
      logo: this.shopFormLogo,
      campus: this.shopFormCampus,
      active: this.shopFormActive
    };

    this.http.post<Shop>(`${apiUrl}/marketplace/loja`, payload).subscribe({
      next: (shop) => {
        this.myShop.set(shop);
        this.savingShop.set(false);
        this.showShopModal.set(false);
        this.toastService.showSuccess('Lojinha atualizada com sucesso!');
        this.loadSellerData();
      },
      error: (err) => {
        this.savingShop.set(false);
        this.toastService.showError(err.error?.message || 'Erro ao salvar loja.');
      }
    });
  }

  quickToggleShopActive() {
    const shop = this.myShop();
    if (!shop) return;

    this.savingShop.set(true);
    const payload = {
      name: shop.name,
      description: shop.description || '',
      logo: shop.logo || '',
      campus: shop.campus,
      active: !shop.active
    };

    this.http.post<Shop>(`${apiUrl}/marketplace/loja`, payload).subscribe({
      next: (updatedShop) => {
        this.myShop.set(updatedShop);
        this.savingShop.set(false);
        this.toastService.showSuccess(`Lojinha agora está ${updatedShop.active ? 'Online 🟢' : 'Offline 🔴'}!`);
        this.loadSellerData();
      },
      error: (err) => {
        this.savingShop.set(false);
        this.toastService.showError(err.error?.message || 'Erro ao alterar status da lojinha.');
      }
    });
  }

  openCreateProduct() {
    this.editingProductId.set(null);
    this.productFormTitle = '';
    this.productFormDescription = '';
    this.productFormCategory = 'Alimentos';
    this.productFormPrice = null;
    this.productFormStock = 1;
    this.productFormPhotos = '';
    this.productFormPaymentMethods = 'Pix';
    this.productFormPixKey = '';
    this.productFormMeetLocations = '';
    this.productFormCampus = this.myShop()?.campus || 'Rio Tinto';
    this.productFormActive = true;
    this.showProductModal.set(true);
  }

  openEditProduct(product: Product) {
    this.editingProductId.set(product.id);
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
    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.editingProductId.set(null);
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
        this.productFormPhotos = compressedImages.join(';');
      });
    }
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
      shopId: shop ? shop.id : null,
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
        this.showProductModal.set(false);
        this.toastService.showSuccess(isEdit ? 'Anúncio atualizado!' : 'Anúncio cadastrado!');
        this.loadSellerData();
      },
      error: (err) => {
        this.savingProduct.set(false);
        this.toastService.showError(err.error?.message || 'Erro ao salvar anúncio.');
      }
    });
  }

  toggleProductActive(product: Product) {
    const payload = {
      shopId: product.shopId || null,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      photos: product.photos,
      paymentMethods: product.paymentMethods,
      pixKey: product.pixKey,
      meetLocations: product.meetLocations,
      campus: product.campus,
      active: !product.active
    };

    this.http.put(`${apiUrl}/marketplace/produtos/${product.id}`, payload).subscribe({
      next: () => {
        this.toastService.showSuccess(product.active ? 'Produto desativado.' : 'Produto ativado.');
        this.loadSellerData();
      },
      error: () => this.toastService.showError('Não foi possível alterar o status.')
    });
  }

  deleteProduct(productId: string) {
    if (confirm('Tem certeza que deseja remover este anúncio permanentemente?')) {
      this.http.delete(`${apiUrl}/marketplace/produtos/${productId}`).subscribe({
        next: () => {
          this.toastService.showSuccess('Anúncio removido.');
          this.loadSellerData();
        },
        error: () => this.toastService.showError('Erro ao deletar anúncio.')
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
}
