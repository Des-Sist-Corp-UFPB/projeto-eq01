import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loja-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="store-wrapper animate-fade-in">
      <div class="store-card">
        <div class="lock-icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lock-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        
        <h2>Loja em Breve!</h2>
        
        <p class="funny-msg">
          Os produtos premium e as recompensas exclusivas estão trancados sob uma criptografia de 2048 bits. Nossos hackers éticos da comunidade estão tentando quebrar a senha (dica: descobrimos que não era <strong>'senha123'</strong>).
        </p>
        
        <p class="support-msg">
          Enquanto eles trabalham nisso, continue acumulando suas <strong>NexusCoins</strong> realizando missões acadêmicas e guarde-as em um lugar bem seguro — como em uma carteira de papel fria ou embaixo do colchão!
        </p>

        <button class="btn btn-primary" routerLink="/">Voltar ao Início</button>
      </div>
    </div>
  `,
  styles: [`
    .store-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      min-height: 70vh;
    }
    .store-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 48px 32px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .lock-icon-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(59, 110, 244, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      color: var(--color-primary);
    }
    .lock-icon {
      width: 40px;
      height: 40px;
      animation: nudge 2s infinite ease-in-out;
    }
    .store-card h2 {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 18px;
      letter-spacing: -0.5px;
    }
    .funny-msg {
      font-size: 15px;
      color: var(--color-text);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .support-msg {
      font-size: 13.5px;
      color: var(--color-muted);
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .store-card strong {
      color: var(--color-primary);
    }
    .btn {
      padding: 12px 28px;
      font-size: 14px;
      border-radius: var(--border-radius-sm);
    }
    @keyframes nudge {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  `]
})
export class LojaPageComponent {}
