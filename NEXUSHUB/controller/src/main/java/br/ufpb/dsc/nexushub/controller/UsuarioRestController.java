package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
import br.ufpb.dsc.nexushub.model.administration.service.AuditService;
import br.ufpb.dsc.nexushub.model.identity.domain.User;
import br.ufpb.dsc.nexushub.model.identity.service.IdentityService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final IdentityService identityService;
    private final AuditService auditService;

    public UsuarioRestController(IdentityService identityService, AuditService auditService) {
        this.identityService = identityService;
        this.auditService = auditService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody UsuarioCadastroRequest request, HttpServletRequest httpRequest) {
        try {
            if (request.senha() == null || request.senha().trim().length() < 6) {
                throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres.");
            }
            User user = identityService.registerUser(request.nome(), request.email(), request.senha(), request.cargo(), request.fotoUrl());
            audit(user.getId(), "USER_REGISTERED", user.getId().toString(), "SUCCESS", httpRequest, "role=" + user.getRole().getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return identityService.authenticate(request.email(), request.senha())
                .<ResponseEntity<?>>map(user -> {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())));
                    var context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                    httpRequest.getSession(true).setAttribute(
                            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
                    audit(user.getId(), "LOGIN", user.getId().toString(), "SUCCESS", httpRequest, null);
                    return ResponseEntity.ok(UsuarioResponse.from(user));
                })
                .orElseGet(() -> {
                    audit(null, "LOGIN_FAILED", null, "DENIED", httpRequest, null);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto("E-mail ou senha incorretos."));
                });
    }

    @GetMapping("/sessao")
    public ResponseEntity<?> sessao(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(UsuarioResponse.from(identityService.findByEmail(principal.getName())));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        try {
            identityService.changePasswordByEmail(request.email(), request.novaSenha());
            User user = identityService.findByEmail(request.email());
            audit(user.getId(), "PASSWORD_CHANGED", user.getId().toString(), "SUCCESS", httpRequest, null);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> atualizarPerfil(@PathVariable UUID id, @Valid @RequestBody UsuarioCadastroRequest request,
                                             HttpServletRequest httpRequest) {
        try {
            User user = identityService.updateUserProfile(id, request.nome(), request.email(), request.senha(), request.fotoUrl());
            audit(id, "PROFILE_UPDATED", id.toString(), "SUCCESS", httpRequest, null);
            return ResponseEntity.ok(UsuarioResponse.from(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    public record ErrorDto(String message) {
    }

    private void audit(UUID actorId, String action, String entityId, String result,
                       HttpServletRequest request, String afterValue) {
        auditService.record(actorId, action, "USER", entityId, result, request.getRemoteAddr(),
                request.getHeader("X-Correlation-ID"), null, afterValue);
    }
}


