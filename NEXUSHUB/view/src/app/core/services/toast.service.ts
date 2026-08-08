import { Injectable } from '@angular/core';

export interface ToastAction {
  text: string;
  onClick: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', action?: ToastAction) {
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
    if (type === 'warning') icon = '⚠️';
    
    let actionBtnHtml = '';
    if (action) {
      actionBtnHtml = `<button class="toast-action-btn">${action.text}</button>`;
    }

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>${actionBtnHtml}`;
    container.appendChild(toast);

    if (action) {
      const btn = toast.querySelector('.toast-action-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick();
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        });
      }
    }

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 6 seconds if action is present, or 4 seconds
    const duration = action ? 6000 : 4000;
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
          if (container && container.childNodes.length === 0) {
            container.remove();
          }
        }, 300);
      }
    }, duration);
  }

  showSuccess(message: string, action?: ToastAction) {
    this.show(message, 'success', action);
  }

  showError(message: string, action?: ToastAction) {
    this.show(message, 'error', action);
  }

  showWarning(message: string, action?: ToastAction) {
    this.show(message, 'warning', action);
  }

  showInfo(message: string, action?: ToastAction) {
    this.show(message, 'info', action);
  }
}
