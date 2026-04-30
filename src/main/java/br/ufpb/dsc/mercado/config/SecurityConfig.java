package br.ufpb.dsc.mercado.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuração de segurança da aplicação usando Spring Security 6.
 *
 * <p><strong>Como o Spring Security funciona?</strong><br>
 * O Spring Security é baseado em uma cadeia de filtros (Filter Chain) que intercepta
 * todas as requisições HTTP antes de chegarem ao Controller. Cada filtro tem uma
 * responsabilidade específica (autenticação, autorização, CSRF, etc.).
 *
 * <p><strong>Principais conceitos:</strong>
 * <ul>
 *   <li><strong>Authentication</strong>: Verifica quem é o usuário (login/senha).</li>
 *   <li><strong>Authorization</strong>: Verifica o que o usuário pode fazer (roles/permissões).</li>
 *   <li><strong>CSRF</strong>: Proteção contra Cross-Site Request Forgery.</li>
 *   <li><strong>PasswordEncoder</strong>: Nunca armazene senhas em texto puro! BCrypt aplica um
 *       hash com salt aleatório a cada chamada.</li>
 * </ul>
 *
 * <p><strong>{@code @Configuration} + {@code @EnableWebSecurity}:</strong><br>
 * {@code @Configuration} marca a classe como fonte de definição de beans.
 * {@code @EnableWebSecurity} ativa a integração do Spring Security com o contexto do Spring MVC.
 *
 * @author DSC - UFPB Campus IV
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Define o serviço de usuários em memória.
     *
     * <p><strong>ATENÇÃO — APENAS PARA DESENVOLVIMENTO E DEMONSTRAÇÃO.</strong><br>
     * Em produção, substitua por um {@code UserDetailsService} que busca usuários do banco
     * de dados (ex.: via Spring Data JPA) e utilize senhas armazenadas com BCrypt.
     *
     * <p>{@code User.builder()} é um fluent builder do Spring Security para criar usuários.
     * O password DEVE ser codificado — nunca passe a senha em texto puro.
     *
     * @param encoder codificador de senhas (injetado automaticamente pelo Spring)
     * @return gerenciador de usuários em memória
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails admin = User.builder()
                .username("admin")
                // encode() aplica BCrypt na senha — o hash muda a cada chamada mas a verificação funciona
                .password(encoder.encode("admin123"))
                // ROLE_ADMIN é adicionado automaticamente; "roles" é um atalho para "authorities"
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

    /**
     * Define o algoritmo de codificação de senhas.
     *
     * <p><strong>Por que BCrypt?</strong><br>
     * BCrypt é um algoritmo de hash adaptativo — você pode aumentar o "cost factor"
     * conforme os computadores ficam mais rápidos, sem precisar re-hashear as senhas.
     * Ele também adiciona um salt aleatório automaticamente, impedindo ataques de
     * rainbow table (tabelas pré-computadas de hashes).
     *
     * <p>Nunca use MD5, SHA-1 ou SHA-256 simples para senhas!
     *
     * @return instância do BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura a cadeia de filtros de segurança HTTP.
     *
     * <p>Este é o método central da configuração do Spring Security.
     * A API fluente do {@code HttpSecurity} permite configurar:
     * <ul>
     *   <li>Quais URLs são públicas e quais exigem autenticação</li>
     *   <li>Como o login é feito (formulário, OAuth2, JWT, etc.)</li>
     *   <li>Como o logout funciona</li>
     *   <li>Configurações de CSRF, headers de segurança, etc.</li>
     * </ul>
     *
     * @param http construtor de configuração de segurança HTTP
     * @return cadeia de filtros configurada
     * @throws Exception se ocorrer erro na configuração
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // === AUTORIZAÇÃO DE REQUISIÇÕES ===
                .authorizeHttpRequests(auth -> auth
                        // Recursos estáticos e health check são públicos
                        // /webjars/** → Bootstrap, HTMX (servidos pelo Spring como recursos estáticos)
                        // /css/**, /js/** → arquivos estáticos personalizados
                        // /actuator/health → monitoramento sem autenticação
                        .requestMatchers("/webjars/**", "/css/**", "/js/**", "/actuator/health").permitAll()
                        // Qualquer outra requisição exige autenticação
                        .anyRequest().authenticated()
                )

                // === FORMULÁRIO DE LOGIN ===
                .formLogin(form -> form
                        // URL da página de login customizada (em vez da padrão do Spring Security)
                        .loginPage("/login")
                        // Após login bem-sucedido, redireciona para /produtos
                        // O segundo parâmetro (true) força sempre ir para esta URL,
                        // ignorando a URL que o usuário tentou acessar antes do login
                        .defaultSuccessUrl("/produtos", true)
                        // A página de login deve ser acessível sem autenticação
                        .permitAll()
                )

                // === LOGOUT ===
                .logout(logout -> logout
                        // Após logout, redireciona para a página de login com mensagem
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                )

                // === CSRF (Cross-Site Request Forgery) ===
                // CSRF é um ataque onde um site malicioso faz requisições em nome do usuário autenticado.
                // O Spring Security protege adicionando um token único em formulários.
                // Para HTMX funcionar com PUT/DELETE, precisamos de uma configuração especial.
                // Em produção real, considere usar o mecanismo de CSRF com SameSite cookies.
                .csrf(csrf -> csrf
                        // Desabilita CSRF apenas para os endpoints de produtos (usados pelo HTMX)
                        // ALTERNATIVA SEGURA: configure HTMX para enviar o token CSRF nos headers
                        .ignoringRequestMatchers("/produtos/**")
                );

        return http.build();
    }

    /**
     * Expõe o {@code AuthenticationManager} como bean do Spring.
     *
     * <p>Necessário quando você precisa injetar o {@code AuthenticationManager} em outras classes,
     * como em um controller de API REST que faz autenticação programática.
     * Para este projeto educacional, serve como exemplo de como expor o bean.
     *
     * @param config configuração de autenticação gerenciada pelo Spring Security
     * @return instância do AuthenticationManager
     * @throws Exception se ocorrer erro ao obter o manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
