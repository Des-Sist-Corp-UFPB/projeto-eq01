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
const BASE = __ENV.BASE_URL || 'http://localhost:8080';

// Nº de usuários virtuais simultâneos. Sobrescreva pela linha de comando:
//   k6 run -e VUS=20 -e BASE_URL=http://localhost:3000 loadtest/carga.js
const VUS = Number(__ENV.VUS || 10);

export const options = {
  stages: [
    { duration: '30s', target: VUS },   // sobe a carga gradualmente
    { duration: '1m',  target: VUS },   // mantém a carga
    { duration: '20s', target: 0 },     // desaquece
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // meta: menos de 1% de falhas
    http_req_duration: ['p(95)<500'],   // meta: 95% das respostas < 500 ms
  },
};

export default function () {
  group('healthcheck', () => {
    const res = http.get(`${BASE}/ping`);
    check(res, { 'status 200': (r) => r.status === 200 });
  });

  // ── EXEMPLO: fluxo autenticado — descomente e adapte ao seu projeto ──
  // group('login + rota protegida', () => {
  //   const login = http.post(`${BASE}/login`, JSON.stringify({
  //     email: 'teste@exemplo.com', senha: 'senha123',
  //   }), { headers: { 'Content-Type': 'application/json' } });
  //   check(login, { 'login ok': (r) => r.status === 200 });
  //
  //   const token = login.json('token');
  //   const r = http.get(`${BASE}/api/recurso`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   check(r, { 'recurso 200': (x) => x.status === 200 });
  // });

  sleep(1);
}
