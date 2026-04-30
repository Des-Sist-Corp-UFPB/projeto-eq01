package br.ufpb.dsc.mercado.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller de autenticação — gerencia as rotas relacionadas a login/logout.
 *
 * <p>O Spring Security cuida automaticamente do processamento do formulário de login
 * (validação de credenciais, criação da sessão, etc.). Este controller apenas
 * serve a <strong>página</strong> de login — o Spring Security intercepta o POST.
 *
 * <p><strong>Fluxo do Spring Security Form Login:</strong>
 * <ol>
 *   <li>Usuário acessa uma rota protegida (ex.: {@code /produtos}).</li>
 *   <li>Spring Security detecta que não está autenticado e redireciona para {@code /login}.</li>
 *   <li>Este controller serve a página HTML de login.</li>
 *   <li>Usuário submete o formulário com username/password para {@code POST /login}.</li>
 *   <li>Spring Security intercepta o POST, valida as credenciais e redireciona para {@code /produtos}.</li>
 * </ol>
 *
 * <p>A URL de processamento do login ({@code POST /login}) é gerenciada <em>internamente</em>
 * pelo Spring Security — não precisamos (nem devemos) criar um método para ela aqui.
 *
 * @author DSC - UFPB Campus IV
 */
@Controller
public class AuthController {

    /**
     * Serve a página de login customizada.
     *
     * <p>O Spring Security redireciona automaticamente para esta URL quando
     * o usuário tenta acessar um recurso protegido sem estar autenticado.
     * Isso é configurado em {@link SecurityConfig} com {@code .loginPage("/login")}.
     *
     * <p>O Thymeleaf recebe parâmetros {@code ?error} e {@code ?logout} automaticamente
     * na URL quando há erro de autenticação ou logout bem-sucedido, respectivamente.
     * O template usa {@code th:if="${param.error}"} para exibir mensagens.
     *
     * @return nome do template Thymeleaf da página de login
     */
    @GetMapping("/login")
    public String login() {
        // Retorna o template em src/main/resources/templates/auth/login.html
        return "auth/login";
    }
}
