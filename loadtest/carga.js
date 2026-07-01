import http from 'k6/http';
import { check, sleep, group } from 'k6';

// ─────────────────────────────────────────────────────────────────────────────
// Teste de carga e performance — k6
//
// IMPORTANTE: rode contra o SEU AMBIENTE LOCAL (suba o projeto com
// docker-compose antes). NÃO aponte para https://eqNN.dsc.rodrigor.com — o
// servidor e o PostgreSQL são compartilhados com as outras equipes.
// ─────────────────────────────────────────────────────────────────────────────

// URL base do seu ambiente local. Ajuste a PORTA conforme o seu docker-compose
// (ex.: 8080 para Spring Boot/Javalin, 8000 para FastAPI, 3000 para Next.js).
const BASE = __ENV.BASE_URL || 'http://localhost:8085';

// Nº de usuários virtuais simultâneos. Sobrescreva pela linha de comando:
//   k6 run -e VUS=20 -e BASE_URL=http://localhost:8085 loadtest/carga.js
const VUS = Number(__ENV.VUS || 10);

export const options = {
  stages: [
    { duration: '20s', target: VUS },   // sobe a carga gradualmente
    { duration: '1m',  target: VUS },   // mantém a carga
    { duration: '15s', target: 0 },     // desaquece
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // meta: menos de 1% de falhas
    http_req_duration: ['p(95)<500'],   // meta: 95% das respostas < 500 ms
  },
};

export default function () {
  // 1. Fluxo de Navegação Pública
  group('Navegação Pública', () => {
    const resGrupos = http.get(`${BASE}/api/grupos`);
    check(resGrupos, { 'status grupos ok (200)': (r) => r.status === 200 });

    const resProjetos = http.get(`${BASE}/api/projetos/quentes`);
    check(resProjetos, { 'status projetos quentes ok (200)': (r) => r.status === 200 });
  });

  sleep(1);

  // 2. Fluxo de Cadastro e Login
  group('Cadastro e Autenticação', () => {
    // Gerar um email pseudo-aleatório para evitar conflitos de restrição única no banco
    const randId = Math.floor(Math.random() * 1000000);
    const email = `user_${randId}_${__VU}@nexushub.com`;
    const payloadCadastro = JSON.stringify({
      nome: `User Teste ${randId}`,
      email: email,
      senha: 'SenhaSegura123',
      cargo: 'ESTUDANTE'
    });

    const headers = { 'Content-Type': 'application/json' };

    // Cadastrar
    const resCadastro = http.post(`${BASE}/api/usuarios/cadastro`, payloadCadastro, { headers });
    check(resCadastro, { 'cadastro com sucesso (211/201)': (r) => r.status === 201 || r.status === 200 });

    // Fazer login
    const payloadLogin = JSON.stringify({
      email: email,
      senha: 'SenhaSegura123'
    });
    const resLogin = http.post(`${BASE}/api/usuarios/login`, payloadLogin, { headers });
    check(resLogin, { 'login com sucesso (200)': (r) => r.status === 200 });
  });

  sleep(2);
}
