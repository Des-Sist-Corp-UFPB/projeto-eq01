import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>`;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
        if (container && container.childNodes.length === 0) {
          container.remove();
        }
      }, 300);
    }, 3000);
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'error');
  }

  showWarning(message: string) {
    this.show(message, 'info');
  }
}
