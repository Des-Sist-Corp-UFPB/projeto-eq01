package br.ufpb.dsc.nexushub.controller;

import br.ufpb.dsc.nexushub.model.dto.ForgotPasswordRequest;
import br.ufpb.dsc.nexushub.model.dto.LoginRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioCadastroRequest;
import br.ufpb.dsc.nexushub.model.dto.UsuarioResponse;
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

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final IdentityService identityService;

    public UsuarioRestController(IdentityService identityService) {
        this.identityService = identityService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@Valid @RequestBody UsuarioCadastroRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(
                    identityService.registerUser(request.nome(), request.email(), request.senha(), request.cargo())
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return identityService.authenticate(request.email(), request.senha())
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(UsuarioResponse.from(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto("E-mail ou senha incorretos.")));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            identityService.changePasswordByEmail(request.email(), request.novaSenha());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> atualizarPerfil(@PathVariable UUID id, @Valid @RequestBody UsuarioCadastroRequest request) {
        try {
            return ResponseEntity.ok(UsuarioResponse.from(
                    identityService.updateUserProfile(id, request.nome(), request.email(), request.senha())
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorDto(e.getMessage()));
        }
    }

    public record ErrorDto(String message) {
    }
}


