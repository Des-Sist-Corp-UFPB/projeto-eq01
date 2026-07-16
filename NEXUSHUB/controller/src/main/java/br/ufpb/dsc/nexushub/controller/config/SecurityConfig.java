package br.ufpb.dsc.nexushub.controller.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.userdetails.*;
import br.ufpb.dsc.nexushub.model.identity.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository users) {
        return email -> users.findByEmail(email.toLowerCase())
                .map(user -> User.withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().getName())
                        .disabled(user.getRecordStatus() == 0)
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado."));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        var csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
        csrfRequestHandler.setCsrfRequestAttributeName(null);

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(csrfRequestHandler)
                    .ignoringRequestMatchers("/api/pagamentos/webhook", "/api/usuarios/login", "/api/usuarios/cadastro", "/api/usuarios/login-google"))
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
            .headers(headers -> headers
                    .contentTypeOptions(Customizer.withDefaults())
                    .frameOptions(frame -> frame.deny()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                .requestMatchers("/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg",
                        "/*.woff", "/*.woff2", "/*.map", "/assets/**").permitAll()
                .requestMatchers("/", "/index.html", "/ping", "/actuator/health", "/health", "/api/health", "/api/usuarios/login",
                        "/api/usuarios/cadastro", "/api/usuarios/login-google", "/api/pagamentos/webhook",
                        "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/login", "/cadastro", "/esqueci-senha", "/perfil",
                        "/projetos/**", "/grupos", "/grupos/**", "/loja", "/admin",
                        "/privacidade").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/projetos/**", "/api/grupos/**",
                        "/api/oportunidades/**").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SYSADMIN")
                .anyRequest().authenticated()
            )
            .logout(logout -> logout.logoutUrl("/api/usuarios/logout").logoutSuccessHandler((req,res,auth)->res.setStatus(204)))
            .sessionManagement(session -> session.sessionFixation(fix -> fix.migrateSession()));
        return http.build();
    }
}
