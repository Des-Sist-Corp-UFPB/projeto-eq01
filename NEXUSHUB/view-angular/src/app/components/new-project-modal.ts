import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, ProjetoRequest } from '../services/project.service';

@Component({
  selector: 'app-new-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop animate-fade-in" (click)="close()">
      <div class="modal-card animate-scale-up" (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <header class="modal-header">
          <h2>Cadastrar Novo Projeto</h2>
          <button class="close-btn" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="close-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Stepper / Tabs Indicator -->
        <div class="stepper">
          <div class="step" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1">
            <span class="step-num">1</span>
            <span class="step-name">Info. Básica</span>
          </div>
          <div class="step-line" [class.active]="currentStep() > 1"></div>
          
          <div class="step" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2">
            <span class="step-num">2</span>
            <span class="step-name">Grupo & Visibilidade</span>
          </div>
          <div class="step-line" [class.active]="currentStep() > 2"></div>

          <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3">
            <span class="step-num">3</span>
            <span class="step-name">Capa</span>
          </div>
        </div>

        <!-- Modal Body / Form Steps -->
        <div class="modal-body">
          <form #projForm="ngForm" (ngSubmit)="submitForm()">
            
            <!-- STEP 1: Basic Info -->
            <div *ngIf="currentStep() === 1" class="step-content animate-fade-in">
              <div class="form-group">
                <label for="nome">Nome do Projeto *</label>
                <input type="text" id="nome" name="nome" [(ngModel)]="formModel.nome" required placeholder="Ex: Portal de Bolsas Acadêmicas" #nomeInput="ngModel" />
                <span class="error-msg" *ngIf="nomeInput.invalid && nomeInput.touched">O nome do projeto é obrigatório.</span>
              </div>

              <div class="form-group">
                <label for="resumo">Resumo Breve *</label>
                <textarea id="resumo" name="resumo" rows="2" [(ngModel)]="formModel.resumo" required placeholder="Uma descrição rápida de duas linhas para exibição nos cards." #resumoInput="ngModel"></textarea>
                <span class="error-msg" *ngIf="resumoInput.invalid && resumoInput.touched">O resumo do projeto é obrigatório.</span>
              </div>

              <div class="form-group">
                <label for="objetivos">Objetivos do Projeto</label>
                <textarea id="objetivos" name="objetivos" rows="3" [(ngModel)]="formModel.objetivos" placeholder="Descreva os objetivos de médio/longo prazo do projeto..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label for="categoria">Categoria</label>
                  <input type="text" id="categoria" name="categoria" [(ngModel)]="formModel.categoria" placeholder="Ex: Extensão, Pesquisa, Ensino" />
                </div>
                
                <div class="form-group col">
                  <label for="tipo">Tipo de Projeto *</label>
                  <select id="tipo" name="tipo" [(ngModel)]="formModel.tipo" required>
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Testes">Testes</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Gestão">Gestão</option>
                    <option value="Pesquisa">Pesquisa</option>
                    <option value="Extensão">Extensão</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="tags">Tags (separadas por vírgula)</label>
                <input type="text" id="tags" name="tags" [(ngModel)]="formModel.tags" placeholder="Ex: Angular, Spring Boot, Java" />
              </div>
            </div>

            <!-- STEP 2: Group & Visibility -->
            <div *ngIf="currentStep() === 2" class="step-content animate-fade-in">
              <div class="form-group">
                <label for="grupo">Grupo ou Iniciativa *</label>
                <select id="grupo" name="grupo" [(ngModel)]="formModel.grupoPertencente" required>
                  <option value="Laboratorio de Inovacao e Ideias">Laboratório de Inovação e Ideias (Seu Grupo)</option>
                  <option value="Núcleo de Robotica Aplicada">Núcleo de Robótica Aplicada</option>
                  <option value="Iniciativa Geral Nexus">Iniciativa Geral Nexus</option>
                </select>
                <p class="form-hint">Baseado nos grupos dos quais você participa no campus.</p>
              </div>

              <div class="form-group">
                <label>Nível de Visibilidade *</label>
                <div class="radio-group">
                  <label class="radio-card" [class.selected]="formModel.visibilidade === 'PUBLICO'">
                    <input type="radio" name="visibilidade" value="PUBLICO" [(ngModel)]="formModel.visibilidade" />
                    <div class="radio-info">
                      <span class="title">Público</span>
                      <span class="desc">Visível a toda a comunidade universitária.</span>
                    </div>
                  </label>

                  <label class="radio-card" [class.selected]="formModel.visibilidade === 'PUBLICO_ABERTO'">
                    <input type="radio" name="visibilidade" value="PUBLICO_ABERTO" [(ngModel)]="formModel.visibilidade" />
                    <div class="radio-info">
                      <span class="title">Público e Aberto</span>
                      <span class="desc">Visível e aberto a solicitações de novos membros.</span>
                    </div>
                  </label>

                  <label class="radio-card" [class.selected]="formModel.visibilidade === 'PRIVADO'">
                    <input type="radio" name="visibilidade" value="PRIVADO" [(ngModel)]="formModel.visibilidade" />
                    <div class="radio-info">
                      <span class="title">Privado</span>
                      <span class="desc">Visível apenas para membros aprovados.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- STEP 3: Capa do Projeto -->
            <div *ngIf="currentStep() === 3" class="step-content animate-fade-in">
              <div class="form-group">
                <label>Selecione uma imagem de capa padrão ou insira URLs customizadas</label>
                <div class="preset-covers">
                  <div class="preset-cover" *ngFor="let cover of presetCovers" (click)="selectPreset(cover)" [class.active]="formModel.imagemCardUrl === cover">
                    <img [src]="cover" alt="Pre-visualização" />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="imagemCardUrl">URL da Capa do Card *</label>
                <input type="text" id="imagemCardUrl" name="imagemCardUrl" [(ngModel)]="formModel.imagemCardUrl" required placeholder="Insira o link da imagem retangular (Card)" />
              </div>

              <div class="form-group">
                <label for="imagemLandingUrl">URL da Capa da Landing Page</label>
                <input type="text" id="imagemLandingUrl" name="imagemLandingUrl" [(ngModel)]="formModel.imagemLandingUrl" placeholder="Insira o link da imagem de banner (Landing Page)" />
              </div>

              <div class="upload-dropzone">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p class="dropzone-text">Arraste e solte arquivos aqui para simular o upload</p>
                <span class="dropzone-sub">Suporta PNG, JPG e WebP</span>
              </div>
            </div>

            <!-- Modal Footer Controls -->
            <footer class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="prevStep()" *ngIf="currentStep() > 1">
                Voltar
              </button>
              
              <button type="button" class="btn btn-primary" (click)="nextStep()" *ngIf="currentStep() < 3" [disabled]="!isStepValid()">
                Continuar
              </button>

              <button type="submit" class="btn btn-primary" *ngIf="currentStep() === 3" [disabled]="projForm.invalid">
                Salvar Projeto
              </button>
            </footer>

          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(19, 32, 51, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-card {
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      width: 100%;
      max-width: 600px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      font-size: 20px;
      color: var(--color-text);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--color-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: var(--color-danger);
    }

    .close-icon {
      width: 20px;
      height: 20px;
    }

    /* Stepper UI */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      background: #f8fafc;
      border-bottom: 1px solid var(--color-border);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e2e8f0;
      color: var(--color-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      transition: var(--transition);
    }

    .step-name {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-muted);
      transition: var(--transition);
    }

    .step.active .step-num {
      background: var(--color-primary);
      color: white;
      box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.15);
    }

    .step.active .step-name {
      color: var(--color-primary);
    }

    .step.completed .step-num {
      background: var(--color-secondary);
      color: white;
    }

    .step.completed .step-name {
      color: var(--color-secondary);
    }

    .step-line {
      flex-grow: 1;
      height: 2px;
      background: #e2e8f0;
      margin: -16px 12px 0;
      transition: var(--transition);
    }

    .step-line.active {
      background: var(--color-secondary);
    }

    /* Form Fields */
    .modal-body {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-group.col {
      flex: 1;
    }

    label {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }

    input[type="text"], select, textarea {
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      font-family: var(--font-secondary);
      font-size: 14px;
      color: var(--color-text);
      outline: none;
      transition: var(--transition);
      width: 100%;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(31, 122, 224, 0.1);
    }

    .error-msg {
      font-size: 11px;
      color: var(--color-danger);
      font-weight: 600;
    }

    .form-hint {
      font-size: 11px;
      color: var(--color-muted);
    }

    /* Radios Visibility */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 6px;
    }

    .radio-card {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: 14px 18px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
      cursor: pointer;
      transition: var(--transition);
    }

    .radio-card:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .radio-card.selected {
      border-color: var(--color-primary);
      background: rgba(31, 122, 224, 0.03);
    }

    .radio-card input[type="radio"] {
      margin-top: 4px;
      accent-color: var(--color-primary);
    }

    .radio-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .radio-info .title {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text);
    }

    .radio-info .desc {
      font-size: 11px;
      color: var(--color-muted);
    }

    /* Cover Upload Tab */
    .preset-covers {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      overflow-x: auto;
      padding: 4px 0;
    }

    .preset-cover {
      flex: 0 0 80px;
      height: 50px;
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: var(--transition);
    }

    .preset-cover:hover {
      transform: scale(1.05);
    }

    .preset-cover.active {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }

    .preset-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-dropzone {
      border: 2px dashed var(--color-border);
      border-radius: var(--border-radius);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: #f8fafc;
      transition: var(--transition);
      cursor: pointer;
      margin-top: 14px;
    }

    .upload-dropzone:hover {
      border-color: var(--color-primary);
      background: rgba(31, 122, 224, 0.02);
    }

    .upload-icon {
      width: 32px;
      height: 32px;
      color: var(--color-primary);
      margin-bottom: 8px;
    }

    .dropzone-text {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }

    .dropzone-sub {
      font-size: 11px;
      color: var(--color-muted);
    }

    /* Modal Footer */
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class NewProjectModalComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  private readonly projectService = inject(ProjectService);
  protected readonly currentStep = signal(1);

  protected readonly presetCovers = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500'
  ];

  protected formModel: ProjetoRequest = {
    nome: '',
    resumo: '',
    objetivos: '',
    categoria: '',
    tipo: 'Desenvolvimento',
    tags: '',
    visibilidade: 'PUBLICO_ABERTO',
    grupoPertencente: 'Laboratorio de Inovacao e Ideias',
    autor: 'Rodrigo Silva', // Simula o autor logado por padrão
    imagemCardUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    imagemLandingUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
    xpDistribuido: 250 // XP padrão
  };

  close() {
    this.onClose.emit();
  }

  nextStep() {
    if (this.currentStep() < 3 && this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  selectPreset(url: string) {
    this.formModel.imagemCardUrl = url;
    this.formModel.imagemLandingUrl = url;
  }

  isStepValid(): boolean {
    if (this.currentStep() === 1) {
      return this.formModel.nome.trim() !== '' && this.formModel.resumo.trim() !== '';
    }
    if (this.currentStep() === 2) {
      return !!this.formModel.grupoPertencente && !!this.formModel.visibilidade;
    }
    return true;
  }

  submitForm() {
    this.projectService.criar(this.formModel).subscribe({
      next: () => {
        this.onSaved.emit();
        this.close();
      },
      error: (err) => {
        console.error('Erro ao salvar projeto', err);
      }
    });
  }
}
