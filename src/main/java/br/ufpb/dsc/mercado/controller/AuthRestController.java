package br.ufpb.dsc.mercado.controller;

import br.ufpb.dsc.mercado.domain.Usuario;
import br.ufpb.dsc.mercado.dto.LoginRequest;
import br.ufpb.dsc.mercado.dto.UsuarioResponse;
import br.ufpb.dsc.mercado.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticacao")
public class AuthRestController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthRestController(AuthenticationManager authenticationManager, UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autentica um usuario")
    public ResponseEntity<UsuarioResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.senha())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        Usuario usuario = usuarioService.buscarPorUsername(request.username());
        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @PostMapping("/logout")
    @Operation(summary = "Encerra a sessao atual")
    public ResponseEntity<Void> logout(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) {

        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.noContent().build();
    }
}
